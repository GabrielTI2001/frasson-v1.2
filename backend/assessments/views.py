from django.shortcuts import render
from rest_framework.response import Response
from django.http import JsonResponse, FileResponse
from django.core.exceptions import ObjectDoesNotExist
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .models import Avaliacao_Colaboradores, Notas_Avaliacao, Questionario
from .serializers import *
from rest_framework import viewsets
from users.models import User
import os, json, uuid as libuuid, io
from datetime import date
from django.views.decorators.csrf import csrf_exempt
from django.db.models import Q, Count, Sum, Case, When, DecimalField
from reportlab.pdfgen import canvas
from reportlab.lib.units import mm
from .utilities import calcmedia

def my_assessments(request):
    myavaliacoes = []
    if request.method == 'GET':
        user = request.GET.get('user')
        if user:
            query_avaliacoes = Avaliacao_Colaboradores.objects.filter(is_active=True).filter(colaboradores=user)
            query_notas = Notas_Avaliacao.objects.values('avaliacao').filter(ponderador=user).annotate(total = Count('id')).filter(ponderador=user)
            for a in query_avaliacoes:
                colaboradores = a.colaboradores.all()
                total_necess = colaboradores.count() * Questionario.objects.all().count()
                try:
                    nota = next(query_notas for n in query_notas if n['avaliacao'] == a.id)
                    if nota.filter(avaliacao=a)[0]['total'] < total_necess:
                        myavaliacoes.append({
                            'uuid': a.uuid,
                            'descricao': a.description,
                            'data': a.data_ref.strftime("%d/%m/%Y") if a.data_ref else '-'
                        })
                except StopIteration:
                    myavaliacoes.append({
                        'uuid': a.uuid,
                        'descricao':a.description,
                        'data': a.data_ref.strftime("%d/%m/%Y") if a.data_ref else '-'
                    })
        else:
            myavaliacoes = []
    context = {
        'avaliacoes': myavaliacoes
    }
    return JsonResponse(context)

@csrf_exempt
def quiz(request, uuid):
    context = {}
    questions = []
    user = request.GET.get('user')
    if not user:
        return JsonResponse({'questions':[]})
    current_avaliacao = Avaliacao_Colaboradores.objects.get(uuid=uuid)
    if not current_avaliacao.is_active:
        return JsonResponse(status=404)
    perguntas = Questionario.objects.all().order_by('-type')
    avaliados = current_avaliacao.colaboradores.all()
    if request.method == "POST":
        for a in avaliados:
            fields_error = {}
            if str("av"+str(a.id)) in request.POST:
                total = Notas_Avaliacao.objects.filter(avaliacao=current_avaliacao).filter(avaliado=a).filter(ponderador=user)
                if total.count() >= perguntas.count():
                    return JsonResponse(status=404)
                contador = 0
                for q in perguntas:
                    idp = str(q.id)
                    if request.POST.get(idp):
                        contador+=1
                    else:
                        fields_error[idp] = "Campo obrigatório"
                if contador == perguntas.count():
                    for q in perguntas:
                        idp = str(q.id)
                        Notas_Avaliacao.objects.create(
                            avaliacao_id= current_avaliacao.id, nota= float(request.POST.get(idp)),
                            avaliado=a, ponderador_id= int(user), questionario=q
                        )
                else:
                    context['fields_error']=fields_error
                    return JsonResponse(context, status=400)
    for a in avaliados:
        total = Notas_Avaliacao.objects.filter(avaliacao=current_avaliacao).filter(avaliado=a).filter(ponderador=user)
        if total.count() >= perguntas.count():
            continue
        formsq = []
        formsn = []
        for q in perguntas:
            if q.type == 'Q':
                choices = [('1', 'Nunca'),('2', 'Algumas Vezes'),('3', 'Sempre')]
                formsq.append({
                    'id':f"{q.id}",
                    'value':None,
                    'category': "- "+q.category.description,
                    'pergunta': q.text,
                    'choices': choices
                })
            else:
                choices = [('0', '0'),('1', '1'),('2', '2'),('3', '3'),('4', '4'),('5', '5')]
                formsn.append({
                    'id':f"{q.id}",
                    'value':None,
                    'category': "- "+q.category.description,
                    'pergunta': q.text,
                    'choices': choices
                })
        questions.append({
            'avaliado': {'id':a.id, 'nome':a.first_name, 'nome_completo': a.first_name+' '+a.last_name, 'avatar':a.profile.avatar.name},
            'questionsq':formsq,
            'questionsn':formsn,
        })

    context = {'questions':questions}
    return JsonResponse(context)

def index_assessments(request):
    context = {}
    avaliacoes = Avaliacao_Colaboradores.objects.all().order_by('id')
    perguntas = Questionario.objects.all()
    notas = Notas_Avaliacao.objects.values('avaliacao', 'ponderador').annotate(
        tot_res=Count('id'),
    ).order_by('avaliacao')
    avaliacoes_template = [] 
    for i, a in enumerate(avaliacoes):
        colaboradores = a.colaboradores.all()
        total_necess = perguntas.count() * colaboradores.count()
        count_done = 0
        for n in notas:
            if n['avaliacao'] == a.id:
                for c in colaboradores:
                    if n['ponderador'] == c.id:
                        if n['tot_res'] == total_necess:
                            count_done+=1
        avaliacoes_template.append({
            'status': f"{count_done} / {colaboradores.count()}",
            'id': a.id,
            'uuid': a.uuid,
            'descricao': a.description,
            'data': a.data_ref.strftime("%d/%m/%Y") if a.data_ref else '-',
        })
    context = {
        'avaliacoes': avaliacoes_template,
        'perguntas': list(perguntas.values())
    }
    return JsonResponse(context)


def assessments_results(request, uuid):
    current_assessment = Avaliacao_Colaboradores.objects.get(uuid=uuid)
    colaboradores = current_assessment.colaboradores.all()
    opcoes = []
    pendentes_users = []
    quantitativo_outros = []
    quantitativo_auto = []
    qualitativo_outros = []
    qualitativo_auto = []

    notas = Notas_Avaliacao.objects.filter(avaliacao=current_assessment)
    total_done = notas.values('avaliado').annotate(
        total = Count('id')
    )
    pendent_ponderadores = notas.values('ponderador').annotate(
        total = Count('id')
    )
    total_necess = colaboradores.count() * Questionario.objects.all().count()

    for c in colaboradores:
        try:
            notacol = next(n for n in total_done if n['avaliado'] == c.id)
            if notacol['total'] >= Questionario.objects.all().count():
                opcoes.append({
                    'id':c.id,
                    'nome': c.first_name+" "+c.last_name
                })
        except StopIteration:
            None
        try:
            notacol2 = next(n for n in pendent_ponderadores if n['ponderador'] == c.id)
            if notacol2['total'] < total_necess:
                pendentes_users.append({
                    'id':c.id,
                    'nome': c.first_name+" "+c.last_name
                })
            None
        except StopIteration: 
            pendentes_users.append({
                'id':c.id,
                'nome': c.first_name+" "+c.last_name
            })
            None
    msg = ""
    if len(pendentes_users) > 0:
        users = ', '.join([user['nome'] for user in pendentes_users])
        msg = "A avaliação não está concluída!"+" Faltam responder: "+users
    
    search = request.GET.get('search') 
    if search:
        search = search
        for o in opcoes:
            if o['id'] == int(search):
                avaliado = o['id']
    else:
        if len(opcoes) == 0:
            return JsonResponse({}, status=404)
        else:
           search = '1'
           avaliado = opcoes[0]['id']
    
    done_pond = colaboradores.count() - len(pendentes_users) 
    pontos = notas.values('questionario__category', 'questionario__category__description', 'questionario__type').filter(
        avaliado=avaliado).annotate(
            totalna =Sum(Case(When(Q(questionario__type='N') & Q(ponderador=avaliado), then='nota'), default=0, output_field=DecimalField())),
            totalqa =Sum(Case(When(Q(questionario__type='Q') & Q(ponderador=avaliado), then='nota'), default=0, output_field=DecimalField())),        
            totalno =Sum(Case(When(Q(questionario__type='N'), then='nota'), default=0, output_field=DecimalField())),
            totalqo =Sum(Case(When(Q(questionario__type='Q'), then='nota'), default=0, output_field=DecimalField()))
        ).order_by('-totalqa', '-totalna', '-totalqo', '-totalno')
    for p in pontos:
        if p['questionario__type'] == 'Q':
            qualitativo_auto.append({
                'categoria': p['questionario__category__description'],
                'feito': float(p['totalqa']) or 0,
                'max': 3,
                'percentual': (float(p['totalqa'])/3) * 100
            })
            qualitativo_outros.append({
                'categoria': p['questionario__category__description'],
                'feito': float(p['totalqo']) or 0,
                'max': 3 * done_pond,
                'percentual': (float(p['totalqo'])/(3 * done_pond)) * 100
            })
        if p['questionario__type'] == 'N':
            quantitativo_auto.append({
                'categoria': p['questionario__category__description'],
                'feito': float(p['totalna']),
                'max': 5,
                'percentual': (float(p['totalna'])/5) * 100
            })
            quantitativo_outros.append({
                'categoria': p['questionario__category__description'],
                'feito': float(p['totalno']),
                'max': 5 * done_pond,
                'percentual': (float(p['totalno'])/(5 * done_pond)) * 100
            })
    # print(qualitativo_outros)
    soma_q = 0
    for q in qualitativo_outros:
        soma_q+=q['percentual']
    soma_n = 0
    for n in quantitativo_outros:
        soma_n+=n['percentual']
    geral = (soma_n+soma_q)/(len(qualitativo_outros)+len(quantitativo_outros)) if len(quantitativo_outros) > 0 or len(qualitativo_outros) > 0 else 0
    medias = [{'label':"Quantitativo",'value':f"{calcmedia(quantitativo_outros,'percentual'):.2f}"},
              {'label':"Qualitativo",'value':f"{calcmedia(qualitativo_outros,'percentual'):.2f}"},
              {'label':"Geral",'value':f"{geral:.2f}"}]
    context = {
        'options': opcoes,
        'auto_qualitativo': qualitativo_auto,
        'outros_qualitativo': qualitativo_outros,
        'auto_quantitativo': quantitativo_auto,
        'outros_quantitativo': quantitativo_outros,
        'msg': msg,
        'uuid': libuuid.uuid4(),
        'assessment': {'uuid': current_assessment.uuid},
        'medias': medias,
        'searched': int(search)
    }
    return JsonResponse(context)

def assessments_report(request):
    quantitativo_outros = []
    quantitativo_auto = []
    qualitativo_outros = []
    qualitativo_auto = []
    pendentes_users = []

    search = request.GET.get('search')
    avalia_uuid = request.GET.get('uuid') 
    try:
        current_assessment = Avaliacao_Colaboradores.objects.get(uuid=avalia_uuid)
        if search:
            avaliado = int(search)
        colaboradores = current_assessment.colaboradores.all()
        avaliadoobj = User.objects.get(id=avaliado)
        notas = Notas_Avaliacao.objects.filter(avaliacao=current_assessment)
        pendent_ponderadores = notas.values('ponderador').annotate(
            total = Count('id')
        )
        total_necess = colaboradores.count() * Questionario.objects.all().count()
        for c in colaboradores:
            try:
                notacol2 = next(n for n in pendent_ponderadores if n['ponderador'] == c.id)
                if notacol2['total'] < total_necess:
                    pendentes_users.append({
                        'id':c.id,
                        'nome': c.first_name+" "+c.last_name
                    })
                None
            except StopIteration: 
                pendentes_users.append({
                    'id':c.id,
                    'nome': c.first_name+" "+c.last_name
                })
                None

        done_pond = colaboradores.count() - len(pendentes_users)
        pontos = notas.values('questionario__category', 'questionario__category__description', 'questionario__type').filter(
            avaliado=avaliado).annotate(
                totalna =Sum(Case(When(Q(questionario__type='N') & Q(ponderador=avaliado), then='nota'), default=0, output_field=DecimalField())),
                totalqa =Sum(Case(When(Q(questionario__type='Q') & Q(ponderador=avaliado), then='nota'), default=0, output_field=DecimalField())),        
                totalno =Sum(Case(When(Q(questionario__type='N'), then='nota'), default=0, output_field=DecimalField())),
                totalqo =Sum(Case(When(Q(questionario__type='Q'), then='nota'), default=0, output_field=DecimalField()))
            ).order_by('-totalqa', '-totalna', '-totalqo', '-totalno')
        for p in pontos:
            if p['questionario__type'] == 'Q':
                qualitativo_auto.append({
                    'categoria': p['questionario__category__description'],
                    'feito': float(p['totalqa']) or 0,
                    'max': 3,
                    'percentual': (float(p['totalqa'])/3) * 100
                })

                qualitativo_outros.append({
                    'categoria': p['questionario__category__description'],
                    'feito': float(p['totalqo']) or 0,
                    'max': 3 * colaboradores.count(),
                    'percentual': (float(p['totalqo'])/(3 * done_pond)) * 100
                })

            if p['questionario__type'] == 'N':
                quantitativo_auto.append({
                    'categoria': p['questionario__category__description'],
                    'feito': float(p['totalna']),
                    'max': 5,
                    'percentual': (float(p['totalna'])/5) * 100
                })

                quantitativo_outros.append({
                    'categoria': p['questionario__category__description'],
                    'feito': float(p['totalno']),
                    'max': 5 * colaboradores.count(),
                    'percentual': (float(p['totalno'])/(5 * done_pond)) * 100
                })
        soma_q = 0
        for q in qualitativo_outros:
            soma_q+=q['percentual']
        soma_n = 0
        for n in quantitativo_outros:
            soma_n+=n['percentual']
        geral = (soma_n+soma_q)/(len(qualitativo_outros)+len(quantitativo_outros)) if len(quantitativo_outros) > 0 or len(qualitativo_outros) > 0 else 0
        medias = [{'label':"Quantitativo",'value':calcmedia(quantitativo_outros,'percentual')},
                {'label':"Qualitativo",'value':calcmedia(qualitativo_outros,'percentual')},
                {'label':"Geral",'value':geral}]
        dados = {
            'auto_qualitativo': qualitativo_auto,
            'outros_qualitativo': qualitativo_outros,
            'auto_quantitativo': quantitativo_auto,
            'outros_quantitativo': quantitativo_outros,
        }
        date_today = date.today().strftime('%d/%m/%Y')
        margin_top = 785
        margin_left = 50

        img_logo = 'static/media/various/logo-frasson-app2.png'

        buf = io.BytesIO()
        c = canvas.Canvas(buf, pagesize=(210*mm,300*mm))
        c.setTitle(f"Assessments Report - {date_today}")
        c.drawImage(img_logo, margin_left, 780, 70, 70, preserveAspectRatio=True)
        c.setFont("Helvetica-Bold", 12)
        c.drawString(200, 810, f"RELATÓRIO DE AVALIAÇÃO")
        c.setFont("Helvetica", 10)
        c.drawString(500, 810, date_today)
        c.setFont("Helvetica-Bold", 10)
        vertical_position = margin_top
        horizontal_position = margin_left
        c.setFont("Helvetica", 10)
        c.drawString(horizontal_position, vertical_position, "Avaliação:")
        c.drawString(horizontal_position + 50, vertical_position, f"{current_assessment.description}")
        c.drawString(horizontal_position + 430, vertical_position, "Data:")
        c.drawString(horizontal_position + 455, vertical_position, f"{current_assessment.data_ref.strftime('%d/%m/%Y')}")
        c.drawString(horizontal_position, vertical_position - 13, "Colaborador:")
        c.drawString(horizontal_position + 70, vertical_position - 13, f"{avaliadoobj.first_name} {avaliadoobj.last_name}")
        vertical_position = margin_top - 40

        c.setFont("Helvetica-Bold", 10)
        c.drawString(horizontal_position, vertical_position, "Avaliação Qualitativa")
        vertical_position-= 14

        c.drawString(horizontal_position, vertical_position, "Geral")
        c.line(horizontal_position, vertical_position -2, margin_left + 200, vertical_position -2)
        vertical_position-= 13
        c.setFont("Helvetica", 10)
        for qo in dados['outros_qualitativo']:
            c.drawString(horizontal_position, vertical_position, f"{qo['categoria']}")
            c.drawString(horizontal_position + 150, vertical_position, f"{qo['percentual']:.2f}%")
            c.line(horizontal_position, vertical_position -3, margin_left + 200, vertical_position -3)
            vertical_position-= 13

        vertical_position += (len(dados['outros_qualitativo'])*13) + 13
        horizontal_position = 300
        c.setFont("Helvetica-Bold", 10)
        c.drawString(horizontal_position, vertical_position, "Autoavaliação")
        c.setFont("Helvetica", 10)
        c.line(horizontal_position, vertical_position -2, horizontal_position + 200, vertical_position -2)
        vertical_position -= 13
        for qo in dados['auto_qualitativo']:
            c.drawString(horizontal_position, vertical_position, f"{qo['categoria']}")
            c.drawString(horizontal_position + 150, vertical_position, f"{qo['percentual']:.2f}%")
            c.line(horizontal_position, vertical_position -3, horizontal_position + 200, vertical_position -3)
            vertical_position-= 13
        horizontal_position = margin_left
        vertical_position-= 20

        c.setFont("Helvetica-Bold", 10)
        c.drawString(horizontal_position, vertical_position, "Avaliação Quantitativa")
        vertical_position-= 14
        c.drawString(horizontal_position, vertical_position, "Geral")
        c.line(horizontal_position, vertical_position -2, margin_left + 200, vertical_position -2)
        vertical_position-= 13
        c.setFont("Helvetica", 10)
        for qo in dados['outros_quantitativo']:
            c.drawString(horizontal_position, vertical_position, f"{qo['categoria']}")
            c.drawString(horizontal_position + 150, vertical_position, f"{qo['percentual']:.2f}%")
            c.line(horizontal_position, vertical_position -3, margin_left + 200, vertical_position -3)
            vertical_position-= 13

        vertical_position += (len(dados['outros_quantitativo'])*13) + 13
        horizontal_position = 300
        c.setFont("Helvetica-Bold", 10)
        c.drawString(horizontal_position, vertical_position, "Autoavaliação")
        c.setFont("Helvetica", 10)
        c.line(horizontal_position, vertical_position -2, horizontal_position + 200, vertical_position -2)
        vertical_position -= 13
        for qo in dados['auto_quantitativo']:
            c.drawString(horizontal_position, vertical_position, f"{qo['categoria']}")
            c.drawString(horizontal_position + 150, vertical_position, f"{qo['percentual']:.2f}%")
            c.line(horizontal_position, vertical_position -3, horizontal_position + 200, vertical_position -3)
            vertical_position-= 13
        horizontal_position = margin_left
        vertical_position-= 20

        c.setFont("Helvetica-Bold", 10)
        c.drawString(horizontal_position, vertical_position, "Média Final")
        vertical_position-= 14
        c.setFont("Helvetica", 10)
        for m in medias:
            c.drawString(horizontal_position, vertical_position, f"{m['label']}")
            c.drawString(horizontal_position + 70, vertical_position, f"{m['value']:.2f}%")
            c.line(horizontal_position, vertical_position -3, horizontal_position + 120, vertical_position -3)
            vertical_position-=13
        c.showPage()
        c.save()
        buf.seek(0)
        file_name = f"DRE_Consolidado_{date_today}.PDF"
        return FileResponse(buf, as_attachment=False, filename=file_name)
    except ObjectDoesNotExist:
        return JsonResponse({}, status=404)
    
class QuestionarioView(viewsets.ModelViewSet):
    lookup_field = 'uuid'
    queryset = Questionario.objects.all()
    serializer_class = serQuestionarios
    # permission_classes = [IsAuthenticated]

class AvaliacoesView(viewsets.ModelViewSet):
    lookup_field = 'uuid'
    queryset = Avaliacao_Colaboradores.objects.all()
    serializer_class = serAssessment
    # permission_classes = [IsAuthenticated]

class CategoryView(viewsets.ModelViewSet):
    queryset = Category_Avaliacao.objects.all()
    serializer_class = serCategory
    # permission_classes = [IsAuthenticated]
    def get_queryset(self):
        queryset = super().get_queryset()
        search_term = self.request.query_params.get('search', None)
        if search_term:
            queryset = queryset.filter(Q(description__icontains=search_term))
        return queryset
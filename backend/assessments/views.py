from django.shortcuts import render
from rest_framework.response import Response
from django.http import JsonResponse
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .models import Avaliacao_Colaboradores, Notas_Avaliacao, Questionario
from .serializers import *
from rest_framework import viewsets
from rest_framework.parsers import MultiPartParser, FormParser
import os, json
from django.views.decorators.csrf import csrf_exempt
from django.db.models import Q, Count

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
                            'data': a.data_ref.strftime("%d/%m/%Y")
                        })
                except StopIteration:
                    myavaliacoes.append({
                        'uuid': a.uuid,
                        'descricao':a.description,
                        'data': a.data_ref.strftime("%d/%m/%Y")
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
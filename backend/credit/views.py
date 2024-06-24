from django.shortcuts import render, HttpResponse
from rest_framework import permissions, viewsets, status
from rest_framework.response import Response
from django.http import JsonResponse
from django.db.models import Q
from rest_framework.permissions import IsAuthenticated
import requests, json, time
from backend.settings import TOKEN_PIPEFY_API, URL_PIFEFY_API
from .serializers import *
from .models import Operacoes_Contratadas
from credit.models import Operacoes_Contratadas
from io import BytesIO
from bs4 import BeautifulSoup
from openpyxl import Workbook
from openpyxl.styles import Alignment, NamedStyle
from django.views.decorators.csrf import csrf_exempt

class OperacoesContratadasView(viewsets.ModelViewSet):
    queryset = Operacoes_Contratadas.objects.all()
    serializer_class = detailOperacoes
    # permission_classes = [permissions.AllowAny]
    def get_queryset(self):
        queryset = super().get_queryset()
        search = self.request.query_params.get('search', None) 
        search_year = self.request.query_params.get('year', None)   
        search_month = self.request.query_params.get('month', None)  
        search_bank = self.request.query_params.get('bank', None)  
        query = Q()
        if search_year:
            query &= Q(data_emissao_cedula__year=search_year)
            if search_month:
                query &= Q(data_emissao_cedula__month=search_month)
        if search_bank:
            query &= Q(instituicao__instituicao_id=search_bank)      
        if search:
            query &= Q(beneficiario__razao_social__icontains=search)
        queryset = queryset.filter(query).order_by('beneficiario__razao_social', 'data_emissao_cedula')
        return queryset
    
    def get_serializer_class(self):
        if self.action == 'list':
            return listOperacoes
        else:
            return self.serializer_class


def creditData(request):
    anos_operacoes = [y['data_emissao_cedula__year'] for y in Operacoes_Contratadas.objects.values('data_emissao_cedula__year').distinct()]
    instituicoes = Operacoes_Contratadas.objects.values('instituicao__instituicao__id','instituicao__instituicao__razao_social').distinct()
    lista_instituicoes = [{
        'id': instituicao['instituicao__instituicao__id'],
        'instituicao': instituicao['instituicao__instituicao__razao_social']
    }for instituicao in instituicoes]

    data = {
        'anos': anos_operacoes,
        'instituicoes': lista_instituicoes,
    }
    return JsonResponse(data)

@csrf_exempt
def convert_html_table_to_excel(request):
    if request.method == "POST":
        time_now = int(time.time())
        file_name = f"report_{time_now}"
        request_data = json.loads(request.body)
        html_content = request_data.get('html_content', '')
        soup = BeautifulSoup(html_content, 'html.parser')
        table = soup.find('table')

        # Cria um Excel Workbook
        wb = Workbook()
        ws = wb.active  # Get active worksheet

        col_widths = {}  # A dictionary to hold the maximum length of each column
        center_aligned_style = Alignment(horizontal='center', vertical='center')
        for i, row in enumerate(table.find_all('tr')):
            for j, cell in enumerate(row.find_all(['td', 'th'])):
                cell_value = cell.get_text().strip()
                # Prrenche colunas do excel com valores da table
                current_cell = ws.cell(row=i+1, column=j+1, value=cell_value)
                current_cell.alignment = center_aligned_style 
                col_widths[j] = max(col_widths.get(j, 0), len(cell_value) + 2)

        # Apply column widths
        for idx, width in col_widths.items():
            col_letter = ws.cell(row=1, column=idx+1).column_letter
            ws.column_dimensions[col_letter].width = width

        # Create a BytesIO object and save the workbook to it
        excel_file = BytesIO()
        wb.save(excel_file)
        # Set the pointer of BytesIO object to the beginning
        excel_file.seek(0)

        response = HttpResponse(
            excel_file.read(),
            content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
        response['Content-Disposition'] = f'attachment; filename={file_name}.xlsx'
        excel_file.close()

        return response
    else:
        return HttpResponse(404)
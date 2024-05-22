from finances.models import Lancamentos_Automaticos_Pagamentos
from backend.frassonUtilities import TOKEN_PIPEFY_API
from backend.pipefy2 import Pipefy
from datetime import datetime, date

def createPagamentosPipefy():
    """Função que cria os pagamentos automáticos no Pipefy"""
    pipefy = Pipefy(token=TOKEN_PIPEFY_API) #instance of pipefy object
    current_date = datetime.today()
    pagamentos = Lancamentos_Automaticos_Pagamentos.objects.all()

    for pagamento in pagamentos:
        beneficiario = pagamento.beneficiario.id
        descricao = pagamento.descricao or None
        detalhamento = pagamento.detalhamento,
        categoria = pagamento.categoria_pagamento.id
        valor = float(pagamento.valor_pagamento)
        data = f"{pagamento.dia_vencimento}/{current_date.month}/{current_date.year}"

        fields_attributes = [
            {'field_id': 'benefici_rio_pagamento', 'field_value': beneficiario},
            {'field_id': 'descri_o', 'field_value': descricao},
            {'field_id': 'detalhamento', 'field_value': detalhamento},
            {'field_id': 'valor_pagamento', 'field_value': valor},
            {'field_id': 'categoria_pagamento', 'field_value': categoria},
            {'field_id': 'data_vencimento', 'field_value': data},
        ]

        #cria o card no Pipe Pagamentos
        pipefy.createCard(pipe_id=302757413, fields_attributes=fields_attributes)

    return "success"
export const columnsAutomPayments = [
  {
    accessor: 'str_beneficiario',
    Header: 'Beneficiário',
    headerProps: { className: 'text-900 p-1' }
  },
  {
    accessor: 'descricao',
    Header: 'Descrição',
    headerProps: { className: 'text-900 p-1' }
  },
  {
    accessor: 'str_categoria',
    Header: 'Categoria',
    headerProps: { className: 'text-900 p-1' }
  },
  {
    accessor: 'valor_pagamento',
    Header: 'Valor (R$)',
    headerProps: { className: 'text-900 p-1' }
  },
  {
    accessor: 'dia_vencimento',
    Header: 'Dia Venc.',
    headerProps: { className: 'text-900 p-1' }
  },
];

export const columnsTransfers = [
  {
    accessor: 'data',
    Header: 'Data',
    headerProps: { className: 'text-900 p-1' }
  },
  {
    accessor: 'str_caixa_origem',
    Header: 'Caixa Origem',
    headerProps: { className: 'text-900 p-1' },
    cellProps: {className: 'text-danger fw-bold p-1' }
  },
  {
    Header: ' ',
    cellProps: {value:'->'}
  },
  {
    accessor: 'str_caixa_destino',
    Header: 'Caixa Destino',
    headerProps: { className: 'text-900 p-1' },
    cellProps: {className: 'text-success fw-bold p-1' }
  },
  {
    accessor: 'valor',
    Header: 'Valor (R$)',
    headerProps: { className: 'text-900 p-1' }
  },
  {
    accessor: 'description',
    Header: 'Descrição',
    headerProps: { className: 'text-900 p-1' }
  }
];

export const columnsMovimentacao = [
  {
    accessor: 'data',
    Header: 'Data',
    headerProps: { className: 'text-900 p-1' }
  },
  {
    accessor: 'str_tipo',
    Header: 'Tipo',
    headerProps: { className: 'text-900 p-1' },
  },
  {
    accessor: 'str_caixa',
    Header: 'Caixa',
    headerProps: { className: 'text-900 p-1' },
  },
  {
    accessor: 'valor',
    Header: 'Valor (R$)',
    headerProps: { className: 'text-900 p-1' }
  },
  {
    accessor: 'description',
    Header: 'Descrição',
    headerProps: { className: 'text-900 p-1' }
  }
];

export const columnsReembolso = [
  {
    accessor: 'data',
    Header: 'Data',
    headerProps: { className: 'text-900 p-1' }
  },
  {
    accessor: 'str_cliente',
    Header: 'Cliente',
    headerProps: { className: 'text-900 p-1' }
  },
  {
    accessor: 'valor',
    Header: 'Valor (R$)',
    headerProps: { className: 'text-900 p-1' }
  },
  {
    accessor: 'description',
    Header: 'Descrição',
    headerProps: { className: 'text-900 p-1' }
  },
  {
    accessor: 'status',
    Header: 'Cobrança?',
    headerProps: { className: 'text-900 p-1' }
  }
];

export const columnsContratos = [
  {
    accessor: 'code',
    Header: 'Código',
    headerProps: { className: 'text-900 p-1' }
  },
  {
    accessor: 'str_contratante',
    Header: 'Contratante',
    headerProps: { className: 'text-900 p-1' }
  },
  {
    accessor: 'str_servicos',
    Header: 'Serviços',
    headerProps: { className: 'text-900 p-1' }
  },
  {
    accessor: 'valor',
    Header: 'Valor',
    headerProps: { className: 'text-900 p-1' }
  },
  {
    accessor: 'data_assinatura',
    Header: 'Data',
    headerProps: { className: 'text-900 p-1' }
  },
  {
    accessor: 'status',
    Header: 'Status',
    headerProps: { className: 'text-900 p-1' }
  }
];

export const fieldsCobranca = [
  {name:'cliente', label:'Cliente*', type:'select2', url:'register/pessoal', attr1:'razao_social', 
    attr2:'cpf_cnpj', string:'str_cliente'
  },
  {name:'detalhamento', label:'Detalhamento', type:'select2', url:'register/detalhamentos', attr1:'detalhamento_servico', 
    string:'str_detalhe'
  },
  {name:'valor_operacao', label:'Valor Operação (RS)', type:'text', is_number:true},
  {name:'percentual_contratado', label:'Percentual Contratado (%)', type:'text', is_number:true},
  {name:'saldo_devedor', label:'Saldo Devedor (R$)*', type:'text', is_number:true},
  {name:'status', label:'Status*', type:'select', string:'str_status', options:{
    'AD':'Aguardando Distribuição', 'NT':'Notificação', 'FT':'Faturamento', 'AG':'Agendado', 'PG':'Pago'
  }}, 
  {name:'data_previsao', label:'Data Previsão Pagamento*', type:'date'},
  {name:'caixa', label:'Caixa Entrada*', type:'select2', url:'finances/caixas', attr1:'nome', string:'str_caixa'},
  {name:'data_pagamento', label:'Data Pagamento', type:'date'},
  {name:'valor_faturado', label:'Valor Faturado (R$)', type:'text', is_number:true},
]

export const fieldsPagamentos = [
  {name:'beneficiario', label:'Beneficiário*', type:'select2', url:'register/pessoal', attr1:'razao_social', 
    attr2:'cpf_cnpj', string:'str_beneficiario'
  },
  {name:'descricao', label:'Descrição*', type:'text'},
  {name:'detalhamento', label:'Detalhamento', type:'text'},
  {name:'categoria', label:'Categoria*', type:'select2', url:'finances/category-payments', attr1:'category', attr2:'sub_category',
    string:'str_categoria'},
  {name:'status', label:'Status*', type:'select', string:'str_status', options:{'AD':'Aguardando Distribuição', 'AG':'Agendado', 'PG':'Pago'}}, 
  {name:'valor_pagamento', label:'Valor Pagamento (R$)*', type:'text', is_number:true},
  {name:'data_vencimento', label:'Data Vencimento*', type:'date'},
  {name:'data_pagamento', label:'Data Pagamento', type:'date'},
  {name:'caixa', label:'Caixa Saída*', type:'select2', url:'finances/caixas', attr1:'nome', string:'str_caixa'},
]

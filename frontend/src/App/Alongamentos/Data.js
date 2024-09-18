export const columnsAlongamento = [
  {
    accessor: 'numero_operacao',
    Header: 'N° Operação',
    headerProps: { className: 'text-900 p-1' }
  },
  {
    accessor: 'data',
    Header: 'Data Along.',
    headerProps: { className: 'text-900 p-1' }
  },
  {
    accessor: 'beneficiario',
    Header: 'Beneficiário',
    headerProps: { className: 'text-900 p-1' }
  },
  {
    accessor: 'cpf',
    Header: 'CPF',
    headerProps: { className: 'text-900 p-1' }
  },
  {
    accessor: 'instituicao',
    Header: 'Instituição',
    headerProps: { className: 'text-900 p-1' }
  },
  {
    accessor: 'produto',
    Header: 'Produto',
    headerProps: { className: 'text-900 p-1' }
  },
  {
    accessor: 'valor_operacao',
    Header: 'Valor Operação',
    headerProps: { className: 'text-900 p-1' }
  },
  {
    accessor: 'valor_total',
    Header: 'Valor Along',
    headerProps: { className: 'text-900 p-1' }
  },
];

export const columnsNext = [
  {
    accessor: 'numero_operacao',
    Header: 'N° Operação',
    headerProps: { className: 'text-900 p-1' }
  },
  {
    accessor: 'str_beneficiario',
    Header: 'Beneficiário',
    headerProps: { className: 'text-900 p-1' }
  },
  {
    accessor: 'name_item',
    Header: 'Item Financiado',
    headerProps: { className: 'text-900 p-1' }
  },
  {
    accessor: 'valor_operacao',
    Header: 'Valor (R$)',
    headerProps: { className: 'text-900 p-1' }
  },
  {
    accessor: 'data_prod_armazenado',
    Header: 'Prod. Armaz.',
    headerProps: { className: 'text-900 p-1' }
  },
  {
    accessor: 'data_primeiro_vencimento',
    Header: 'Primeiro Venc.',
    headerProps: { className: 'text-900 p-1' }
  },
  {
    accessor: 'data_limite',
    Header: 'Data Limite',
    headerProps: { className: 'text-900 p-1' }
  },
];

export const fieldsAlongamento = [
  {name:'percentual', label:'Percentual de Garantia*', type:'text', is_number:true},
  {name:'valor_unitario', label:'Valor Unitário (R$/Kg)*', type:'text', is_number:true},
  {name:'valor_total', label:'Valor Total (R$)*', type:'text', is_number:true},
  {name:'quant_penhor_kg', label:'Qtd. Penhor (kg)*', type:'text', is_number:true},
  {name:'quant_penhor_tons', label:'Qtd. Penhor (tons)*', type:'text', is_number:true},
  {name:'quant_sacas_60_kg', label:'Qtd. Sacas (60 kg)*', type:'text', is_number:true},
  
  {name:'data', label:'Data Alongamento*', type:'date'},
  {name:'agencia_bancaria', label:'Agência Bancária*', type:'select2', url:'register/instituicoes', attr1:'razao_social',string:'str_agencia'},
  {name:'tipo_armazenagem', label:'Tipo Armazenagem*', type:'select', string:'str_tipo_armazenagem'},
  {name:'fiel_depositario', label:'Fiel Depositário*', type:'select2', url:'register/pessoal', attr1:'razao_social', 
    attr2:'cpf_cnpj', string:'str_fiel_depositario' 
  },
  {name:'produto_agricola', label:'Tipo Armazenagem*', type:'select', string:'str_produto_agricola'},
  {name:'capacidade_estatica_sacas_60_kg', label:'Capacidade Estática (scs 60 kg)*', type:'text', is_number:true},
  {name:'tipo_classificacao', label:'Tipo Classificação*', type:'select', string:'str_tipo_classificacao'},
  {name:'testemunha01', label:'Testemunha 01*', type:'select2', url:'register/pessoal', attr1:'razao_social', 
    attr2:'cpf_cnpj', string:'str_testemunha02' 
  },
  {name:'testemunha02', label:'Testemunha 02*', type:'select2', url:'register/pessoal', attr1:'razao_social', 
    attr2:'cpf_cnpj', string:'str_testemunha01' 
  },
  {name:'propriedades', label:'Fazendas*', type:'select2', ismulti:true, url:'farms/farms', attr1:'nome', 
    attr2:'matricula', list:'str_propriedade', string:'label'
  },
]
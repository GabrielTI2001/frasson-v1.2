export const columnsLicenca = [
  {
    accessor: 'str_beneficiario',
    Header: 'Beneficiário',
    headerProps: { className: 'text-900 p-1' }
  },
  {
    accessor: 'cpf_cnpj',
    Header: 'CPF/CNPJ',
    headerProps: { className: 'text-900 p-1' }
  },
  {
    accessor: 'str_instituicao',
    Header: 'Instituição',
    headerProps: { className: 'text-900 p-1' }
  },
  {
    accessor: 'str_tipo_licenca',
    Header: 'Tipo Licença',
    headerProps: { className: 'text-900 p-1' }
  },
  {
    accessor: 'list_propriedades',
    Header: 'Propriedade',
    headerProps: { className: 'text-900 p-1' }
  },
  {
    accessor: 'data_emissao',
    Header: 'Data Emissão',
    headerProps: { className: 'text-900 p-1' }
  },
  {
    accessor: 'data_validade',
    Header: 'Data Validade',
    headerProps: { className: 'text-900 p-1' }
  },
  {
    accessor: 'status',
    Header: 'Status',
    headerProps: { className: 'text-900 p-1' }
  },
];

export const fieldsLicenca = [
  {name:'beneficiario', label:'Beneficiário*', type:'select2', url:'register/pessoal', attr1:'razao_social', attr2:'cpf_cnpj',
    string:'str_beneficiario'
  },
  {name:'instituicao', label:'Instituição*', type:'select2', url:'register/instituicoes-razaosocial', attr1:'razao_social',
    string:'str_instituicao'
  },
  {name:'tipo_licenca', label:'Tipo Licença*', type:'select2', url:'register/detalhamentos', attr1:'detalhamento_servico',
    string:'str_tipo_licenca'
  },
  {name:'propriedades', label:'Propriedades*', type:'select2', ismulti:true, url:'farms/farms', attr1:'nome',
    attr2:'matricula', list:'list_propriedades', string:'label'
  },
  {name:'detalhe_licenca', label:'Detalhe da Licença', type:'text'}, 
  {name:'numero_requerimento', label:'Número do Requerimento', type:'text'}, 
  {name:'numero_licenca', label:'Número da Licença', type:'text'},
  {name:'numero_processo', label:'Número do Processo', type:'text'},
  {name:'area_beneficiada', label:'Área Beneficiada', type:'text', is_number:true},
  {name:'data_emissao', label:'Data Emissão*', type:'date'},
  {name:'data_validade', label:'Data Validade*', type:'date'},
  {name:'dias_renovacao', label:'Prazo Renovação (dias)*', type:'number'},
  {name:'descricao', label:'Descrição da Licença', type:'textarea', rows:5},
]
export const columnsPontoOutorga = [
  {
    accessor: 'descricao_ponto',
    Header: 'Descrição Ponto',
    headerProps: { className: 'text-900 p-1' }
  },
  {
    accessor: 'latitude_gd',
    Header: 'Latitude (GD)',
    headerProps: { className: 'text-900 p-1' }
  },
  {
    accessor: 'longitude_gd',
    Header: 'Longitude (GD)',
    headerProps: { className: 'text-900 p-1' }
  },
  {
    accessor: 'vazao_m3_dia',
    Header: 'Vazão',
    headerProps: { className: 'text-900 p-1' }
  },
  {
    accessor: 'bombeamento_h',
    Header: 'Bombeamento',
    headerProps: { className: 'text-900 p-1' }
  },
];

export const columnsOutorga = [
  {
    accessor: 'nome_requerente',
    Header: 'Nome Requerente',
    headerProps: { className: 'text-900 p-1' }
  },
  {
    accessor: 'cpf_cnpj',
    Header: 'CPF/CNPJ',
    headerProps: { className: 'text-900 p-1' }
  },
  {
    accessor: 'numero_portaria',
    Header: 'Nº Portaria',
    headerProps: { className: 'text-900 p-1' }
  },
  {
      accessor: 'numero_processo',
      Header: 'Processo INEMA',
      headerProps: { className: 'text-900 p-1' }
  },
  {
      accessor: 'data_publicacao',
      Header: 'Data Publicação',
      headerProps: { className: 'text-900 p-1' }
  },
  {
      accessor: 'str_tipo_captacao',
      Header: 'Tipo Captação',
      headerProps: { className: 'text-900 p-1' }
  },
  {
      Header: 'Status',
      accessor: 'status',
      headerProps: { className: 'text-900 p-3' }
  },
];

export const columnsPontoASV = [
  {
    accessor: 'identificacao_area',
    Header: 'Identificação',
    headerProps: { className: 'text-900 p-1' }
  },
  {
    accessor: 'area_total',
    Header: 'Área (ha)',
    headerProps: { className: 'text-900 p-1' }
  }
];

export const columnsAPPO = [
  {
    accessor: 'nome_requerente',
    Header: 'Nome Requerente',
    headerProps: { className: 'text-900 p-1' }
  },
  {
    accessor: 'cpf_cnpj',
    Header: 'CPF/CNPJ',
    headerProps: { className: 'text-900 p-1' }
  },
  {
      accessor: 'numero_processo',
      Header: 'Processo INEMA',
      headerProps: { className: 'text-900 p-1' }
  },
  {
    accessor: 'nome_municipio',
    Header: 'Município',
    headerProps: { className: 'text-900 p-1' }
  },
  {
    accessor: 'qtd_pontos',
    Header: 'Qtd. Poços',
    headerProps: { className: 'text-900 p-1' }
  },
  {
      Header: 'Status',
      accessor: 'status',
      headerProps: { className: 'text-900 p-3' }
  },
];

export const columnsPontoAPPO = [
  {
    accessor: 'numero_poco',
    Header: 'Número Poço',
    headerProps: { className: 'text-900 p-1' }
  },
  {
    accessor: 'latitude_gd',
    Header: 'Latitude (GD)',
    headerProps: { className: 'text-900 p-1' }
  },
  {
    accessor: 'longitude_gd',
    Header: 'Longitude (GD)',
    headerProps: { className: 'text-900 p-1' }
  },
  {
    accessor: 'vazao_m3_dia',
    Header: 'Vazão',
    headerProps: { className: 'text-900 p-1' }
  },
  {
    accessor: 'str_finalidade',
    Header: 'Finalidade',
    headerProps: { className: 'text-900 p-1' }
  },
];


export const columnsASV = [
  {
    accessor: 'requerente',
    Header: 'Requerente',
    headerProps: { className: 'text-900 p-1' }
  },
  {
    accessor: 'cpf_cnpj',
    Header: 'CPF/CNPJ',
    headerProps: { className: 'text-900 p-1' }
  },
  {
    accessor: 'portaria',
    Header: 'Nº Portaria',
    headerProps: { className: 'text-900 p-1' }
  },
  {
    accessor: 'data_publicacao',
    Header: 'Data Publicação',
    headerProps: { className: 'text-900 p-1' }
  },
  {
    accessor: 'str_empresa',
    Header: 'Empresa Consultoria',
    headerProps: { className: 'text-900 p-1' }
  },
  {
    accessor: 'area_total',
    Header: 'Área (ha)',
    headerProps: { className: 'text-900 p-1' }
  },
  {
    Header: 'Status',
    headerProps: { className: 'text-900 p-3' }
  },
];

export const fieldsOutorga = [
  {name:'numero_portaria', label:'N° Portaria*', type:'text'},
  {name:'nome_requerente', label:'Requerente*', type:'text'},
  {name:'cpf_cnpj', label:'CPF/CNPJ*', type:'text'},
  {name:'data_publicacao', label:'Data Publicação*', type:'date'},
  {name:'data_validade', label:'Data Vencimento*', type:'date'},
  {name:'numero_processo', label:'N° Processo*', type:'text'},
  {name:'captacao', label:'Tipo Captação*', type:'select', string:'str_tipo_captacao'},
  {name:'nome_propriedade', label:'Localidade*', type:'text'},
  {name:'municipio', label:'Município*', type:'select2', url:'register/municipios', attr1:'nome_municipio', 
    attr2:'sigla_uf', string:'nome_municipio', params:'uf=BA'
  },
  {name:'finalidade', label:'Finalidade*', type:'select2', url:'environmental/inema/finalidade', attr1:'description', 
    string:'str_finalidade'
  }, 
  {name:'bacia_hidro', label:'Bacia Hidrográfica*', type:'text'},
  {name:'area_ha', label:'Área Outorgada (ha)', type:'text'},
  {name:'processo_frasson', label:'Conduzido Frasson?*', type:'select', string:'processo_frasson', boolean:true},
]

export const fieldsAPPO = [
  {name:'nome_requerente', label:'Nome Requerente*', type:'text'},
  {name:'cpf_cnpj', label:'CPF/CNPJ Requerente*', type:'text'},
  {name:'numero_processo', label:'N° Processo INEMA*', type:'text'},
  {name:'municipio', label:'Município Localização*', type:'select2', url:'register/municipios', attr1:'nome_municipio', 
    attr2:'sigla_uf', string:'nome_municipio', params:'uf=BA'
  },
  {name:'nome_fazenda', label:'Localidade*', type:'text'},
  {name:'aquifero', label:'Tipo Aquífero*', type:'select', string:'str_tipo_aquifero'},
  {name:'data_documento', label:'Data Publicação*', type:'date'},
  {name:'data_vencimento', label:'Data Vencimento*', type:'date'},
  {name:'processo_frasson', label:'Conduzido Frasson?*', type:'select', string:'processo_frasson', boolean:true},
  {name:'file', label:'Arquivo PDF', type:'file'}
]

export const fieldsASV = [
  {name:'portaria', label:'Portaria*', type:'text'},
  {name:'processo', label:'N° Processo INEMA*', type:'text'},
  {name:'requerente', label:'Nome Requerente*', type:'text'},
  {name:'area_total', label:'Área Total (ha)*', type:'text'}, 
  {name:'data_formacao', label:'Data Formação', type:'date'},
  {name:'data_publicacao', label:'Data Publicação*', type:'date'},
  {name:'data_vencimento', label:'Data Vencimento*', type:'date'},
  {name:'cpf_cnpj', label:'CPF/CNPJ Requerente*', type:'text'},
  {name:'localidade', label:'Localidade*', type:'text'},
  {name:'municipio', label:'Município*', type:'select2', url:'register/municipios', attr1:'nome_municipio', 
    attr2:'sigla_uf', string:'nome_municipio', params:'uf=BA'
  },
  {name:'empresa', label:'Empresa Consultoria*', type:'select2', url:'environmental/inema/empresas', attr1:'razao_social', 
    string:'str_empresa'
  },
  {name:'tecnico', label:'Nome do Técnico', type:'text'},
  {name:'rendimento', label:'Rendimento Lenhoso', medida:'m', potencia:'3', type:'text'},
  {name:'file', label:'Arquivo PDF', type:'file'}
]

export const fieldsPontoOutorga = [
  {name:'descricao_ponto', label:'Descrição Ponto*', type:'text', xl:3, sm:6},
  {name:'latitude_gd', label:'Latitude (GD)*', type:'text', iscoordenada:true, cat:'latitude', xl:4, sm:12},
  {name:'longitude_gd', label:'Longitude (GD)*', type:'text', iscoordenada:true, cat:'longitude', xl:4, sm:12},
  {name:'vazao_m3_dia', label_html:<>Vazão Máxima (m<sup>3</sup>/dia)*</>, type:'text', isnumber:true, xl:3, sm:6},
  {name:'bombeamento_h', label:'Horas Bombeamento*', type:'text', isnumber:true, xl:3, sm:6},
  {name:'vazao_m3_dia_jan', label_html:<>JAN (m<sup>3</sup>/dia)</>, type:'text', isnumber:true, xl:3, sm:6},
  {name:'vazao_m3_dia_fev', label_html:<>FEV (m<sup>3</sup>/dia)</>, type:'text', isnumber:true, xl:3, sm:6},
  {name:'vazao_m3_dia_mar', label_html:<>MAR (m<sup>3</sup>/dia)</>, type:'text', isnumber:true, xl:3, sm:6},
  {name:'vazao_m3_dia_abr', label_html:<>ABR (m<sup>3</sup>/dia)</>, type:'text', isnumber:true, xl:3, sm:6},
  {name:'vazao_m3_dia_mai', label_html:<>MAI (m<sup>3</sup>/dia)</>, type:'text', isnumber:true, xl:3, sm:6},
  {name:'vazao_m3_dia_jun', label_html:<>JUN (m<sup>3</sup>/dia)</>, type:'text', isnumber:true, xl:3, sm:6},
  {name:'vazao_m3_dia_jul', label_html:<>JUL (m<sup>3</sup>/dia)</>, type:'text', isnumber:true, xl:3, sm:6},
  {name:'vazao_m3_dia_ago', label_html:<>AGO (m<sup>3</sup>/dia)</>, type:'text', isnumber:true, xl:3, sm:6},
  {name:'vazao_m3_dia_set', label_html:<>SET (m<sup>3</sup>/dia)</>, type:'text', isnumber:true, xl:3, sm:6},
  {name:'vazao_m3_dia_out', label_html:<>OUT (m<sup>3</sup>/dia)</>, type:'text', isnumber:true, xl:3, sm:6},
  {name:'vazao_m3_dia_nov', label_html:<>NOV (m<sup>3</sup>/dia)</>, type:'text', isnumber:true, xl:3, sm:6},
  {name:'vazao_m3_dia_dez', label_html:<>DEZ (m<sup>3</sup>/dia)</>, type:'text', isnumber:true, xl:3, sm:6},
]

export const fieldsPontoAPPO = [
  {name:'numero_poco', label:'Número Poço*', type:'text', xl:3, sm:6},
  {name:'latitude_gd', label:'Latitude (GD)*', type:'text', iscoordenada:true, cat:'latitude', xl:4, sm:12},
  {name:'longitude_gd', label:'Longitude (GD)*', type:'text', iscoordenada:true, cat:'longitude', xl:4, sm:12},
  {name:'vazao_m3_dia', label_html:<>Expect. Vazão (m<sup>3</sup>/dia)*</>, type:'text', isnumber:true, xl:3, sm:6},
  {name:'finalidade', label:'Finalidade APPO*', type:'select2', url:'environmental/inema/finalidade', attr1:'description', 
    string:'str_finalidade', xl:4, sm:6
  },
  {name:'poco_perfurado', label:'Poço Perfurado?', type:'select', boolean:true, xl:3, sm:6},
  {name:'data_perfuracao', label:'Data Perfuração*', type:'date', xl:3, sm:6},
  {name:'profundidade_poco', label:'Prof. Poço (m)', type:'text', isnumber:true, xl:3, sm:6},
  {name:'nivel_estatico', label:'Nível Estático (m)', type:'text', isnumber:true, xl:3, sm:6},
  {name:'nivel_dinamico', label:'Nível Dinâmico (m)', type:'text', isnumber:true, xl:3, sm:6}
]
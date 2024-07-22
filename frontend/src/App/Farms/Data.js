export const columnsFarms = [
  {
    accessor: 'matricula',
    Header: 'Matrícula',
    headerProps: { className: 'text-900 p-1' }
  },
  {
    accessor: 'nome',
    Header: 'Nome Imóvel',
    headerProps: { className: 'text-900 p-1' }
  },
  {
    accessor: 'str_proprietarios',
    Header: 'Proprietário',
    headerProps: { className: 'text-900 p-1' }
  },
  {
    accessor: 'municipio_localizacao',
    Header: 'Município',
    headerProps: { className: 'text-900 p-1' }
  },
  {
      accessor: 'area_total',
      Header: 'Área Total (ha)',
      headerProps: { className: 'text-900 p-1' }
    }
];

export const fieldsRegime = [
  {name:'regime', label:'Regime de Exploração*', xl:4, sm:6, type:'select', string:'str_regime', options:{
    'PR':'Próprio', 'AR':'Arrendamento', 'CO':'Comodato', 'PA':'Parceria', 'AN':'Anuência', 'CCA':'Condomínio com Anuência', 'CSA':'Condomínio'
  }},
  {name:'imovel', label:'Imóvel Rural*', xl:4, sm:6, type:'select2', url:'farms/farms', attr1:'nome', attr2:'matricula',
    data:'farm_data', attr_data:'nome'
  },
  {name:'area', label:'Área (ha)*', xl:3, sm:6, type:'number'}, {name:'data_inicio', label:'Data Início*', xl:3, sm:6, type:'date'},
  {name:'data_termino', label:'Data Término', xl:3, sm:6, type:'date'},
  {name:'quem_explora', label:'Quem Explora?*', xl:4, sm:6, type:'select2', url:'register/pessoal', attr1:'razao_social', attr2:'cpf_cnpj',
    string:'str_quem_explora'
  },
  {name:'instituicao', label:'Instituição*', xl:4, sm:6, type:'select2', url:'register/instituicoes-razaosocial', attr1:'razao_social',
    string:'str_instituicao'
  },
  {name:'atividades', label:'Atividades Exploradas*', xl:4, sm:6, type:'select', string:'str_atividade', options:{
    'AGRI':'Agricultura', 'PEC':'Pecuária', 'AGP':'Agricultura e Pecuária', 'O':'Outras'
  }},
  {name:'instrumento_cessao', label:'Instrumento de Cessão', xl:3, sm:6, type:'file'},
  {name:'detalhamento', label:'Detalhamento', xl:12, sm:12, type:'textarea', rows:3},
  {name:'kml', label:'KML*', xl:3, sm:6, type:'file'},
]

export const fieldsFarm = [
  {name:'localizacao_reserva', label:'Localização da Reserva Legal*', xl:4, sm:6, type:'select', string:'str_localizacao_reserva', options:{
    'AM':'Mesma Matrícula', 'AE':'Área Externa', 'AP':'Área Externa Parcial',
  }}, 
  {name:'nome', label:'Nome*', xl:4, sm:6, type:'text'}, 
  {name:'matricula', label:'Matrícula*', xl:4, sm:6, type:'text'},
  {name:'municipio', label:'Município*', xl:4, sm:6, type:'select2', url:'register/municipios', attr1:'nome_municipio', attr2:'sigla_uf',
    string:'municipio_localizacao'
  },
  {name:'cartorio_registro', label:'Cartório Registro', xl:4, sm:6, type:'select2', url:'register/cartorios', attr1:'razao_social',
    string:'str_cartorio'
  },
  {name:'proprietarios', label:'Proprietário(s)*', xl:4, sm:6, type:'select2', ismulti:true, url:'register/pessoal', attr1:'razao_social',
    attr2:'cpf_cnpj', list:'str_proprietarios', string:'razao_social'
  },
  {name:'livro_registro', label:'Livro Registro', xl:4, sm:6, type:'text'}, 
  {name:'numero_registro', label:'Número Registro', xl:4, sm:6, type:'text'},
  {name:'cns', label:'CNS', xl:4, sm:6, type:'text'},  {name:'data_registro', label:'Data Registro', xl:3, sm:6, type:'date'},
  {name:'cep', label:'CEP', xl:3, sm:6, type:'text'}, {name:'endereco', label:'Endereço*', xl:6, sm:6, type:'text'},
  {name:'titulo_posse', label:'Título de Posse', xl:4, sm:6, type:'text'}, {name:'numero_nirf', label:'Número NIRF', xl:4, sm:6, type:'text'},
  {name:'codigo_imovel', label:'Código Imóvel', xl:4, sm:6, type:'text'}, 
  {name:'codigo_car', label:'Código CAR', xl:4, sm:6, type:'text'}, 
  {name:'area_total', label:'Área Total (ha)', xl:3, sm:6, type:'number'}, 
  {name:'area_explorada', label:'Área Explorada (ha)', xl:3, sm:6, type:'number'}, 
  {name:'modulos_fiscais', label:'Módulos Fiscais)', xl:3, sm:6, type:'number'}, 
  {name:'area_reserva', label:'Área Reserva (ha)', xl:3, sm:6, type:'number'},
  {name:'area_app', label:'Área APP (ha)', xl:3, sm:6, type:'number'}, 
  {name:'area_veg_nat', label:'Área Veg. Nativa (ha)', xl:3, sm:6, type:'number'},
  {name:'roteiro_acesso', label:'Roteiro de Acesso', xl:12, sm:12, type:'textarea', rows:3},
  {name:'kml', label:'KML*', xl:3, sm:6, type:'file'},
]
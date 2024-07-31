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
  {name:'regime', label:'Regime de Exploração*', type:'select', string:'str_regime', options:{
    'PR':'Próprio', 'AR':'Arrendamento', 'CO':'Comodato', 'PA':'Parceria', 'AN':'Anuência', 'CCA':'Condomínio com Anuência', 'CSA':'Condomínio'
  }},
  {name:'imovel', label:'Imóvel Rural*', type:'select2', url:'farms/farms', attr1:'nome', attr2:'matricula',
    data:'farm_data', attr_data:'nome'
  },
  {name:'area', label:'Área (ha)*', type:'text', is_number:true}, {name:'data_inicio', label:'Data Início*', type:'date'},
  {name:'data_termino', label:'Data Término', type:'date'},
  {name:'quem_explora', label:'Quem Explora?*', type:'select2', url:'register/pessoal', attr1:'razao_social', attr2:'cpf_cnpj',
    string:'str_quem_explora'
  },
  {name:'instituicao', label:'Instituição*', type:'select2', url:'register/instituicoes-razaosocial', attr1:'razao_social',
    string:'str_instituicao'
  },
  {name:'atividades', label:'Atividades Exploradas*', type:'select', string:'str_atividade', options:{
    'AGRI':'Agricultura', 'PEC':'Pecuária', 'AGP':'Agricultura e Pecuária', 'O':'Outras'
  }},
  {name:'instrumento_cessao', label:'Instrumento de Cessão', type:'file'},
  {name:'detalhamento', label:'Detalhamento', type:'textarea', rows:3},
  {name:'kml', label:'KML', type:'file'},
]

export const fieldsFarm = [
  {name:'nome', label:'Nome do Imóvel Rural*', type:'text'}, 
  {name:'matricula', label:'Matrícula*', type:'text'},
  {name:'proprietarios', label:'Proprietário(s)*', type:'select2', ismulti:true, url:'register/pessoal', attr1:'razao_social',
    attr2:'cpf_cnpj', list:'str_proprietarios', string:'razao_social'
  },
  {name:'municipio', label:'Município*', type:'select2', url:'register/municipios', attr1:'nome_municipio', attr2:'sigla_uf',
    string:'municipio_localizacao'
  },
  {name:'cep', label:'CEP', type:'text'}, {name:'endereco', label:'Endereço', type:'text'},
  {name:'cartorio_registro', label:'Cartório Registro', type:'select2', url:'register/cartorios', attr1:'razao_social',
    string:'str_cartorio'
  },
  {name:'livro_registro', label:'Livro Registro', type:'text'}, 
  {name:'numero_registro', label:'Número Registro', type:'text'},
  {name:'cns', label:'CNS', type:'text'}, 
  {name:'data_registro', label:'Data Registro', type:'date'},
  {name:'titulo_posse', label:'Título de Posse', type:'text'}, {name:'numero_nirf', label:'Número NIRF', type:'text'},
  {name:'codigo_imovel', label:'Código Imóvel', type:'text'}, 
  {name:'codigo_car', label:'Código CAR*', type:'text'}, 
  {name:'area_total', label:'Área Total (ha)*', type:'text', is_number:true}, 
  {name:'area_explorada', label:'Área Explorada (ha)', type:'text', is_number:true}, 
  {name:'modulos_fiscais', label:'Módulos Fiscais)', type:'text', is_number:true}, 
  {name:'area_reserva', label:'Área Reserva (ha)', type:'text', is_number:true},
  {name:'localizacao_reserva', label:'Localização da Reserva Legal', type:'select', string:'str_localizacao_reserva', options:{
    'AM':'Mesma Matrícula', 'AE':'Área Externa', 'AP':'Área Externa Parcial',
  }}, 
  {name:'area_app', label:'Área APP (ha)', type:'text', is_number:true}, 
  {name:'area_veg_nat', label:'Área Veg. Nativa (ha)', type:'text', is_number:true},
  {name:'roteiro_acesso', label:'Roteiro de Acesso', type:'textarea', rows:5},
  {name:'kml', label:'KML da Matrícula', type:'file'},
]
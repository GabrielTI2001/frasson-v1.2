export const columnsPivot = [
  {
    accessor: 'razao_social_proprietario',
    Header: 'Proprietário',
    headerProps: { className: 'text-900 p-1' }
  },
  {
    accessor: 'propriedade_localizacao',
    Header: 'Fazenda',
    headerProps: { className: 'text-900 p-1' }
  },
  {
    accessor: 'identificacao_pivot',
    Header: 'Identif. Pivot',
    headerProps: { className: 'text-900 p-1' }
  },
  {
    accessor: 'area_circular_ha',
    Header: 'Área (ha)',
    headerProps: { className: 'text-900 p-1' }
  },
  {
    accessor: 'lamina_bruta_21_h',
    Header: 'Lâmina 21h (mm)',
    headerProps: { className: 'text-900 p-1' }
  },
  {
    accessor: 'str_fabricante',
    Header: 'Fabricante',
    headerProps: { className: 'text-900 p-1' }
  },
  {
    accessor: 'str_municipio',
    Header: 'Município',
    headerProps: { className: 'text-900 p-1' }
  }
];

export const fieldsPivot = [
  {name:'razao_social_proprietario', label:'Razão Social Proprietário*', type:'text'},
  {name:'cpf_cnpj_proprietario', label:'CPF/CNPJ Proprietário*', type:'text'},
  {name:'propriedade_localizacao', label:'Propriedade Localização*', type:'text'},
  {name:'municipio_localizacao', label:'Município Localização*', type:'select2', url:'register/municipios', attr1:'nome_municipio', 
    attr2:'sigla_uf', string:'nome_municipio'
  },
  {name:'identificacao_pivot', label:'Identificação Pivot', type:'text'},
  {name:'fabricante_pivot', label:'Fabricante Pivot*', type:'select2', url:'irrigation/fabricantes-pivots', attr1:'nome_fabricante', 
    string:'nome_fabricante'
  },
  {name:'area_circular_ha', label:'Área Circular (ha)*', type:'text'},
  {name:'lat_center_gd', label:'Latitude (GD)*', type:'text', iscoordenada:true},
  {name:'long_center_gd', label:'Longitude (GD)*', type:'text', iscoordenada:true},
  {name:'lamina_bruta_21_h', label:'Lâmina Bruta 21h (mm/dia)*', type:'text'},
  {name:'periodo_rele_100', label:'Período de giro 100% (h)', type:'text'},
  {name:'comprimento_adutora_m', label:'Comprimento Adutora (m)', type:'text'},
  {name:'diametro_adutora_mm', label:'Diâmetro Adutora (mm)', type:'text'},
  {name:'fabricante_bomba', label:'Fabricante Bomba', type:'select2', url:'irrigation/fabricantes-bombas', attr1:'nome_fabricante', 
    string:'nome_fabricante_bomba'
  },
  {name:'modelo_bomba', label:'Modelo Bomba', type:'text'},
  {name:'pot_motor_cv', label:'Potência Motor (CV)', type:'text'},
  {name:'fabricante_motor', label:'Fabricante Motor', type:'text'},
  {name:'data_montagem_pivot', label:'Início Operação', type:'date'},
  {name:'file', label:'PDF Ficha', type:'file'}
]

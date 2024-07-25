export const columnsPessoal = [
  {
    accessor: 'razao_social',
    Header: 'Razão Social',
    headerProps: { className: 'text-900 p-1' }
  },
  {
    accessor: 'natureza',
    Header: 'Nat. Jurídica',
    headerProps: { className: 'text-900 p-1' }
  },
  {
    accessor: 'cpf_cnpj',
    Header: 'CPF/CNPJ',
    headerProps: { className: 'text-900 p-1' }
  },
  {
    accessor: 'numero_rg',
    Header: 'N° RG',
    headerProps: { className: 'text-900 p-1' }
  },
  {
    accessor: 'str_municipio',
    Header: 'Município',
    headerProps: { className: 'text-900 p-1' }
  },
  {
    accessor: 'grupo_info',
    Header: 'Grupo',
    headerProps: { className: 'text-900 p-1' }
  },
];

export const columnsCartorio = [
  {
    accessor: 'razao_social',
    Header: 'Nome',
    headerProps: { className: 'text-900 p-1' }
  },
  {
    accessor: 'cnpj',
    Header: 'CNPJ',
    headerProps: { className: 'text-900 p-1' }
  },
  {
    accessor: 'logradouro',
    Header: 'Logradouro',
    headerProps: { className: 'text-900 p-1' }
  },
  {
    accessor: 'str_municipio',
    Header: 'Município',
    headerProps: { className: 'text-900 p-1' }
  },
  {
    accessor: 'atendente',
    Header: 'Atendente',
    headerProps: { className: 'text-900 p-1' }
  },
];


export const columnsMachinery = [
  {
    accessor: 'proprietario',
    Header: 'Cliente',
    headerProps: { className: 'text-900 p-1' }
  },
  {
    accessor: 'modelo',
    Header: 'Máquina ou Equipamento',
    headerProps: { className: 'text-900 p-1' }
  },
  {
    accessor: 'fabricante',
    Header: 'Fabricante',
    headerProps: { className: 'text-900 p-1' }
  },
  {
    accessor: 'quantidade',
    Header: 'Qtd.',
    headerProps: { className: 'text-900 p-1' }
  },
  {
    accessor: '',
    Header: 'Fazenda de Localização',
    headerProps: { className: 'text-900 p-1' }
  },
  {
    accessor: 'ano_fabricacao',
    Header: 'Ano de Fabricação',
    headerProps: { className: 'text-900 p-1' }
  },
  {
    accessor: 'valor_total',
    Header: 'Valor',
    headerProps: { className: 'text-900 p-1' }
  },
];

export const columnsBenfeitorias = [
  {
    accessor: 'data_construcao',
    Header: 'Data',
    headerProps: { className: 'text-900 p-1' }
  },
  {
    accessor: 'name_type',
    Header: 'Tipo',
    headerProps: { className: 'text-900 p-1' }
  },
  {
    accessor: 'name_farm',
    Header: 'Fazenda de Localização',
    headerProps: { className: 'text-900 p-1' }
  },
  {
    accessor: 'tamanho',
    Header: 'Tamanho (m3)',
    headerProps: { className: 'text-900 p-1' }
  },
  {
    accessor: 'valor_estimado',
    Header: 'Valor Estimado',
    headerProps: { className: 'text-900 p-1' }
  }
];

export const columnsAnalisesSolo = [
  {
    accessor: 'data_coleta',
    Header: 'Data Coleta',
    headerProps: { className: 'text-900 p-1' }
  },
  {
    accessor: 'str_cliente',
    Header: 'Cliente',
    headerProps: { className: 'text-900 p-1' }
  },
  {
    accessor: 'localizacao',
    Header: 'Localização',
    headerProps: { className: 'text-900 p-1' }
  },
  {
    accessor: 'status',
    Header: 'Status',
    headerProps: { className: 'text-900 p-1' }
  }
];

export const fieldsPessoal = [
  {name:'categoria', label:'Categoria Cadastro*', type:'select', string:'str_categoria'},
  {name:'natureza', label:'Natureza Jurídica*', type:'select', string:'str_natureza', options:{'PF':'Pessoa Física', 'PJ':'Pessoa Jurídica'}},
  {name:'razao_social', label:'Nome ou Razão Social*', type:'text'}, 
  {name:'fantasia', label:'Nome Fantasia', type:'text'},
  {name:'cpf_cnpj', label:'CPF ou CNPJ*', type:'text'}, 
  {name:'numero_rg', label:'Número RG', type:'text'},
  {name:'municipio', label:'Município*', type:'select2', url:'register/municipios', attr1:'nome_municipio', 
    attr2:'sigla_uf', string:'str_municipio'
  },
  {name:'cep_logradouro', label:'CEP Logradouro*', type:'text'}, 
  {name:'logradouro', label:'Logradouro*', type:'text'},
  {name:'data_nascimento', label:'Data Nascimento', type:'date'},
  {name:'contato1', label:'Contato 01', type:'text'},
  {name:'contato2', label:'Contato 02', type:'text'},
  {name:'email1', label:'Email 01', type:'text'},
  {name:'email2', label:'Email 02', type:'text'},
  {name:'grupo', label:'Grupo', type:'select2', url:'register/grupos-clientes', attr1:'nome_grupo', string:'info_grupo'},
  {name:'avatar', label:'Avatar', type:'file'}
]


export const fieldsAnaliseSolo = [
  {name:'data_coleta', label:'Data Coleta*', type:'date'},
  {name:'fazenda', label:'Fazenda*', type:'select2', url:'farms/farms', attr1:'nome', attr2:'matricula', string:'localizacao'},
  {name:'cliente', label:'Cliente*', type:'select2', url:'register/pessoal', attr1:'razao_social', attr2:'cpf_cnpj', string:'str_cliente'},
  {name:'identificacao_amostra', label:'Identificação Amostra*', type:'text'}, 
  {name:'latitude_gd', label:'Latitude (GD)*', type:'number', iscoordenada:true, cat:'latitude'}, 
  {name:'longitude_gd', label:'Longitude (GD)*', type:'number', iscoordenada:true, cat:'longitude'},
  {name:'profundidade', label:'Profundidade (cm)*', type:'number'},
  {name:'numero_controle', label:'Número da Amostra', type:'text'},
  {name:'responsavel', label:'Responsável Pela Coleta*', type:'text'},
  {name:'laboratorio_analise', label:'Laboratório de Análise*', type:'text'},
  {name:'file', label:'Arquivo PDF', type:'file'},

  {name:'calcio_cmolc_dm3', label_html:<>Ca<sup>2+</sup> (cmolc/dm<sup>3</sup>)</>, type:'number', 
    tooltip:'Informe aqui o teor de Cálcio no resultado da amostra. Atente-se para a unidade de medida.'
  },
  {name:'magnesio_cmolc_dm3', label_html:<>Mg<sup>2+</sup> (cmolc/dm<sup>3</sup>)</>, type:'number', 
    tooltip:'Informe aqui o teor de Magnésio no resultado da amostra. Atente-se para a unidade de medida.'
  },
  {name:'potassio_cmolc_dm3', label_html:<>K<sup>2+</sup> (cmolc/dm<sup>3</sup>)</>, type:'number', 
    tooltip:'Informe aqui o teor de Potássio no resultado da amostra. Atente-se para a unidade de medida.'
  },
  {name:'fosforo', label_html:<>P (mg/dm<sup>3</sup>)</>, type:'number', 
    tooltip:'Informe aqui o teor de Fósforo no resultado da amostra (Estimado pelo extrator Mehlich-1). Atente-se para a unidade de medida.'
  },
  {name:'fosforo_rem', label_html:<>P-rem. (mg/dm<sup>3</sup>)</>, type:'number', 
    tooltip:'Informe aqui o teor de Fósforo Remanescente no resultado da amostra. O P-rem é a quantidade de fósforo adicionado que fica na solução de equilíbrio, '+ 
      'após certo tempo de contato com o solo, em resposta a uma aplicação de P. Atente-se para a unidade.'
  },
  {name:'aluminio_cmolc_dm3', label_html:<>Al<sup>3+</sup> (cmolc/dm<sup>3</sup>)</>, type:'number', 
    tooltip:'Informe aqui o teor de Alumínio no resultado da amostra. Atente-se para a unidade de medida.'
  },
  {name:'enxofre', label_html:<>S (cmolc/dm<sup>3</sup>)</>, type:'number', 
    tooltip:'Informe aqui o teor de Enxofre no resultado da amostra. Atente-se para a unidade de medida.'
  },
  {name:'zinco', label_html:<>Zn (cmolc/dm<sup>3</sup>)</>, type:'number', 
    tooltip:'Informe aqui o teor de Zinco no resultado da amostra. Atente-se para a unidade de medida.'
  },
  {name:'ferro', label_html:<>Fe (cmolc/dm<sup>3</sup>)</>, type:'number', 
    tooltip:'Informe aqui o teor de Ferro no resultado da amostra. Atente-se para a unidade de medida.'
  },
  {name:'cobre', label_html:<>Cu (cmolc/dm<sup>3</sup>)</>, type:'number', 
    tooltip:'Informe aqui o teor de Cobre no resultado da amostra. Atente-se para a unidade de medida.'
  },
  {name:'manganes', label_html:<>Mn (cmolc/dm<sup>3</sup>)</>, type:'number', 
    tooltip:'Informe aqui o teor de Manganês no resultado da amostra. Atente-se para a unidade de medida.'
  },
  {name:'boro', label_html:<>B (cmolc/dm<sup>3</sup>)</>, type:'number', 
    tooltip:'Informe aqui o teor de Boro no resultado da amostra. Atente-se para a unidade de medida.'
  },
  {name:'sodio', label_html:<>Na<sup>+</sup> (cmolc/dm<sup>3</sup>)</>, type:'number', 
    tooltip:'Informe aqui o teor de Sódio no resultado da amostra. Atente-se para a unidade de medida.'
  },
  {name:'h_mais_al', label:'H+Al', type:'number', 
    tooltip:'Informe aqui o teor total de Acidez Potencial no resultado da amostra. Atente-se para a unidade de medida.'
  },
  {name:'mat_org_dag_dm3', label_html:<>Matéria Orgânica (dag/dm<sup>3</sup>)</>, type:'number', 
    tooltip:'Informe aqui o teor Matéria Orgânica no resultado da amostra. Atente-se para a unidade de medida.'
  },
  {name:'ph_h2O', label_html:<>pH H<sub>2</sub>O</>, type:'number', tooltip:'Informe aqui o pH em Água.'},
  {name:'ph_cacl2', label_html:<>pH CaCl<sub>2</sub></>, type:'number', tooltip:'Informe aqui o pH em CaCl.'},
  {name:'argila_percentual', label:'Argila (%)', type:'number'},
  {name:'silte_percentual', label:'Silte (%)', type:'number'},
  {name:'areia_percentual', label:'Areia (%)', type:'number'},
]

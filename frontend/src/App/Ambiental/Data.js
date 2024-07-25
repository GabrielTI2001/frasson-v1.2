export const fetchFinalidade = async (inputValue) => {
    try {
      const apiUrl = `${process.env.REACT_APP_API_URL}/environmental/inema/finalidade?search=${inputValue}`;
      const response = await fetch(apiUrl);
      const dataapi = await response.json();
      const options = dataapi.length > 0 ? dataapi.map(b =>({
        value: b.id,
        label: b.description
      })) : []
      return options
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };

export const fetchMunicipio = async (inputValue) => {
    try {
      const apiUrl = `${process.env.REACT_APP_API_URL}/register/municipios/?search=${inputValue}&uf=BA`;
      const response = await fetch(apiUrl);
      const dataapi = await response.json();
      const options = dataapi.length > 0 ? dataapi.map(b =>({
        value: b.id,
        label: b.nome_municipio + " - " + b.sigla_uf,
      })) : []
      return options
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };

export const fetchAquifero = async () => {
    try {
      const apiUrl = `${process.env.REACT_APP_API_URL}/environmental/inema/aquifero`;
      const response = await fetch(apiUrl,{
        headers:{
            'Content-Type': 'application/json'
        }
       }
      );
      const dataapi = await response.json();
      if (response.status === 200){
        const options = dataapi.length > 0 ? dataapi.map(b =>({
            value: b.id,
            label: b.description
        })) : []
        return {dados: options, status: response.status}
      }
      else if (response.status === 401){
        localStorage.setItem("login", JSON.stringify(false));
        localStorage.setItem('token', "");
        return [];
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      return [];
    }
};

export const fetchEmpresa = async (inputValue) => {
  try {
    const apiUrl = `${process.env.REACT_APP_API_URL}/environmental/inema/empresas/?search=${inputValue}`;
    const response = await fetch(apiUrl);
    const dataapi = await response.json();
    const options = dataapi.length > 0 ? dataapi.map(d =>({
      value: d.id,
      label: d.razao_social,
    })) : []
    return options
  } catch (error) {
    console.error('Erro ao carregar dados:', error);
  }
};

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
    Header: 'Empresa Consultora',
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
  {name:'numero_portaria', label:'N° Portaria*', xl:3, sm:6, type:'text'},
  {name:'data_publicacao', label:'Data Publicação*', xl:3, sm:6, type:'date'},
  {name:'data_validade', label:'Data Vencimento*', xl:3, sm:6, type:'date'},
  {name:'processo_frasson', label:'Conduzido Frasson?*', xl:3, sm:6, type:'select', string:'processo_frasson', boolean:true},
  {name:'numero_processo', label:'N° Processo INEMA*', xl:4, sm:6, type:'text'},
  {name:'nome_requerente', label:'Nome Requerente*', xl:4, sm:6, type:'text'},
  {name:'cpf_cnpj', label:'CPF/CNPJ Requerente*', xl:3, sm:6, type:'text'},
  {name:'captacao', label:'Tipo Captação*', xl:3, sm:6, type:'select', string:'str_tipo_captacao'},
  {name:'nome_propriedade', label:'Localidade*', xl:5, sm:6, type:'text'},
  {name:'municipio', label:'Município Localização*', xl:4, sm:6, type:'select2', url:'register/municipios', attr1:'nome_municipio', 
    attr2:'sigla_uf', string:'nome_municipio', params:'uf=BA'
  },
  {name:'finalidade', label:'Finalidade Outorga*', xl:4, sm:6, type:'select2', url:'environmental/inema/finalidade', attr1:'description', 
    string:'str_finalidade'
  },
  {name:'area_ha', label:'Área Outorgada (ha)', xl:3, sm:6, type:'number'}, 
  {name:'bacia_hidro', label:'Bacia Hidrográfica*', xl:5, sm:6, type:'text'},
]

export const fieldsAPPO = [
  {name:'nome_requerente', label:'Nome Requerente*', xl:4, sm:6, type:'text'},
  {name:'cpf_cnpj', label:'CPF/CNPJ Requerente*', xl:4, sm:6, type:'text'},
  {name:'numero_processo', label:'N° Processo INEMA*', xl:4, sm:6, type:'text'},
  {name:'municipio', label:'Município Localização*', xl:4, sm:6, type:'select2', url:'register/municipios', attr1:'nome_municipio', 
    attr2:'sigla_uf', string:'nome_municipio', params:'uf=BA'
  },
  {name:'nome_fazenda', label:'Localidade*', xl:4, sm:6, type:'text'},
  {name:'aquifero', label:'Tipo Aquífero*', xl:4, sm:6, type:'select', string:'str_tipo_aquifero'},
  {name:'data_documento', label:'Data Publicação*', xl:3, sm:6, type:'date'},
  {name:'data_vencimento', label:'Data Vencimento*', xl:3, sm:6, type:'date'},
  {name:'processo_frasson', label:'Conduzido Frasson?*', xl:3, sm:6, type:'select', string:'processo_frasson', boolean:true},
  {name:'file', label:'Arquivo PDF', xl:3, sm:6, type:'file'}
]

export const fieldsASV = [
  {name:'portaria', label:'Portaria*', xl:4, sm:6, type:'text'},
  {name:'processo', label:'N° Processo INEMA*', xl:4, sm:6, type:'text'},
  {name:'requerente', label:'Nome Requerente*', xl:4, sm:6, type:'text'},
  {name:'area_total', label:'Área Total (ha)*', xl:3, sm:6, type:'number'}, 
  {name:'data_formacao', label:'Data Formação', xl:3, sm:6, type:'date'},
  {name:'data_publicacao', label:'Data Publicação*', xl:3, sm:6, type:'date'},
  {name:'data_vencimento', label:'Data Vencimento*', xl:3, sm:6, type:'date'},
  {name:'cpf_cnpj', label:'CPF/CNPJ Requerente*', xl:4, sm:6, type:'text'},
  {name:'localidade', label:'Localidade*', xl:5, sm:6, type:'text'},
  {name:'municipio', label:'Município*', xl:4, sm:6, type:'select2', url:'register/municipios', attr1:'nome_municipio', 
    attr2:'sigla_uf', string:'str_municipio', params:'uf=BA'
  },
  {name:'empresa', label:'Empresa Consultoria*', xl:4, sm:6, type:'select2', url:'environmental/inema/empresas', attr1:'razao_social', 
    string:'str_empresa'
  },
  {name:'tecnico', label:'Nome do Técnico', xl:4, sm:6, type:'text'},
  {name:'rendimento', label:'Rendimento Lenhoso', medida:'m', potencia:'3', xl:3, sm:6, type:'number'},
  {name:'file', label:'Arquivo PDF', xl:3, sm:6, type:'file'}
]

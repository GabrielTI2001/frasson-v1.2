
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

export const fetchCaptacao = async () => {
  try {
    const apiUrl = `${process.env.REACT_APP_API_URL}/environmental/inema/captacao`;
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
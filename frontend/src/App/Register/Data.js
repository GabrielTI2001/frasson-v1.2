export const fetchProprietario = async (inputValue) => {
  const token = localStorage.getItem("token")
  try {
    const apiUrl = `${process.env.REACT_APP_API_URL}/pipefy/pessoal/?search=${inputValue}`;
    const response = await fetch(apiUrl, {
      headers:{
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
      }
    });
    const dataapi = await response.json();
    const options = dataapi.length > 0 ? dataapi.map(b =>({
      value: b.id,
      label: b.razao_social
    })) : []
    return options
  } catch (error) {
    console.error('Erro ao carregar dados:', error);
  }
};

export const fetchTipoBenfeitoria = async () => {
  try {
    const apiUrl = `${process.env.REACT_APP_API_URL}/register/types-farm-assets/`;
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

export const fetchTipoEquipamento = async (inputValue) => {
  try {
    const apiUrl = `${process.env.REACT_APP_API_URL}/pipefy/pessoal/?search=${inputValue}`;
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

export const fetchBenfeitorias = async () => {
  const token = localStorage.getItem("token")
  try {
    const apiUrl = `${process.env.REACT_APP_API_URL}/register/farm-assets/?all=1`;
    const response = await fetch(apiUrl, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });
    const dataapi = await response.json();
    const options = dataapi.length > 0 ? dataapi.map(b =>({
      value: b.id,
      label: b.str_farm
    })) : []
    return options
  } catch (error) {
    console.error('Erro ao carregar dados:', error);
  }
};

export const FetchAnaliseSolo = async (inputValue) => {
  const token = localStorage.getItem("token")
  const params = inputValue ? `search=${inputValue}` : 'all=1'
  try {
    const apiUrl = `${process.env.REACT_APP_API_URL}/register/analysis-soil/?${params}`;
    const response = await fetch(apiUrl, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });
    const dataapi = await response.json();
    const options = dataapi.length > 0 ? dataapi.map(b =>({
      value: b.id,
      label: b.str_fazenda
    })) : []
    return options
  } catch (error) {
    console.error('Erro ao carregar dados:', error);
  }
};

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
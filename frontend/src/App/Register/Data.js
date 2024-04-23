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

export const fetchImoveisRurais = async (inputValue) => {
  const token = localStorage.getItem("token")
  try {
    const apiUrl = `${process.env.REACT_APP_API_URL}/pipefy/farms?search=${inputValue}`;
    const response = await fetch(apiUrl,{
      headers:{
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
      }
    });

    const dataapi = await response.json();
    if (response.status === 200){
      const options = dataapi.length > 0 ? dataapi.map(b =>({
          value: b.id,
          label: b.nome_imovel
      })) : []
      return options
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
    accessor: 'type',
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

export const fetchPessoal = async (inputValue) => {
  const token = localStorage.getItem("token")
  const params = inputValue ? `search=${inputValue}` : 'all=1'
  try {
    const apiUrl = `${process.env.REACT_APP_API_URL}/pipefy/pessoal/?${params}`;
    const response = await fetch(apiUrl, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
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

export const fetchStatus = async () => {
  const token = localStorage.getItem("token")
  try {
    const apiUrl = `${process.env.REACT_APP_API_URL}/processes/status-acompanhamento/`;
    const response = await fetch(apiUrl, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });
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


export const columnsFollowup = [
  {
    accessor: 'id',
    Header: 'Processo',
    headerProps: { className: 'text-900 p-1' }
  },
  {
    accessor: 'beneficiario',
    Header: 'Beneficiário',
    headerProps: { className: 'text-900 p-1' }
  },
  {
    accessor: 'detalhamento',
    Header: 'Detalhamento',
    headerProps: { className: 'text-900 p-1' }
  },
  {
    accessor: 'instituicao',
    Header: 'Instituição',
    headerProps: { className: 'text-900 p-1' }
  },
  {
    accessor: 'current_phase',
    Header: 'Fase Atual',
    headerProps: { className: 'text-900 p-1' }
  },
  {
    accessor: 'last_status',
    Header: 'Status',
    headerProps: { className: 'text-900 p-1' }
  },
];

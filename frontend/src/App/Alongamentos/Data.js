
export const fetchProdutoAgricola = async (inputValue) => {
  const token = localStorage.getItem("token")
  const params = inputValue ? `search=${inputValue}` : ''
  try {
    const apiUrl = `${process.env.REACT_APP_API_URL}/alongamentos/produtos-agricolas/?${params}`;
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

export const fetchAgenciasBancarias = async (inputValue) => {
  const token = localStorage.getItem("token")
  const params = inputValue ? `search=${inputValue}` : ''
  try {
    const apiUrl = `${process.env.REACT_APP_API_URL}/register/agencias-bancarias/?${params}`;
    const response = await fetch(apiUrl, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });
    const dataapi = await response.json();
    const options = dataapi.length > 0 ? dataapi.map(b =>({
      value: b.id,
      label: b.descricao_agencia
    })) : []
    return options
  } catch (error) {
    console.error('Erro ao carregar dados:', error);
  }
};

export const columnsAlongamento = [
  {
    accessor: 'numero_operacao',
    Header: 'N° Operação',
    headerProps: { className: 'text-900 p-1' }
  },
  {
    accessor: 'data',
    Header: 'Data Along.',
    headerProps: { className: 'text-900 p-1' }
  },
  {
    accessor: 'beneficiario',
    Header: 'Beneficiário',
    headerProps: { className: 'text-900 p-1' }
  },
  {
    accessor: 'cpf',
    Header: 'CPF',
    headerProps: { className: 'text-900 p-1' }
  },
  {
    accessor: 'instituicao',
    Header: 'Instituição',
    headerProps: { className: 'text-900 p-1' }
  },
  {
    accessor: 'produto',
    Header: 'Produto',
    headerProps: { className: 'text-900 p-1' }
  },
  {
    accessor: 'valor_operacao',
    Header: 'Valor Operação',
    headerProps: { className: 'text-900 p-1' }
  },
  {
    accessor: 'valor_total',
    Header: 'Valor Along',
    headerProps: { className: 'text-900 p-1' }
  },
];
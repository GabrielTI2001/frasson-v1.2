
export const fetchPessoal = async () => {
  const token = localStorage.getItem("token")
  try {
    const apiUrl = `${process.env.REACT_APP_API_URL}/pipefy/pessoal/?all=1`;
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

export const columnsPessoal = [
  {
    accessor: 'id',
    Header: 'Código',
    headerProps: { className: 'text-900 p-1' }
  },
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
    accessor: 'municipio',
    Header: 'Município',
    headerProps: { className: 'text-900 p-1' }
  },
  {
    accessor: 'grupo_info',
    Header: 'Grupo',
    headerProps: { className: 'text-900 p-1' }
  },
];

export const columnsPessoaProcesso = [
  {
    accessor: 'info_detalhamento.produto',
    Header: 'Produto',
    headerProps: { className: 'text-900 p-1' }
  },
  {
    accessor: 'info_detalhamento.detalhamento_servico',
    Header: 'Detalhamento',
    headerProps: { className: 'text-900 p-1' }
  },
  {
    accessor: 'info_instituicao.razao_social',
    Header: 'Instituição',
    headerProps: { className: 'text-900 p-1' }
  },
  {
    accessor: 'valor_operacao',
    Header: 'Valor Operação',
    headerProps: { className: 'text-900 p-1' }
  },
  {
    accessor: 'phase_name',
    Header: 'Fase Atual',
    headerProps: { className: 'text-900 p-1' }
  },
  {
    accessor: 'created_at',
    Header: 'Aberto em',
    headerProps: { className: 'text-900 p-1' }
  },
];

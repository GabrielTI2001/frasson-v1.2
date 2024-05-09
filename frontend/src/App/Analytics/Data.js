export const fetchCreditData = async () => {
  try {
    const apiUrl = `${process.env.REACT_APP_API_URL}/analytics/credit-data`;
    const response = await fetch(apiUrl, {
      headers: {
        'Content-Type': 'application/json'
      },
    });
    const dataapi = await response.json();
    return dataapi
  } catch (error) {
    console.error('Erro ao carregar dados:', error);
  }
};

export const columnsFarms = [
  {
    accessor: 'matricula_imovel',
    Header: 'Matrícula',
    headerProps: { className: 'text-900 p-1' }
  },
  {
    accessor: 'nome_imovel',
    Header: 'Nome Imóvel',
    headerProps: { className: 'text-900 p-1' }
  },
  {
    accessor: 'str_proprietario',
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
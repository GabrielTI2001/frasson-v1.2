export const columnsAutomPayments = [
  {
    accessor: 'str_beneficiario',
    Header: 'Beneficiário',
    headerProps: { className: 'text-900 p-1' }
  },
  {
    accessor: 'descricao',
    Header: 'Descrição',
    headerProps: { className: 'text-900 p-1' }
  },
  {
    accessor: 'str_categoria',
    Header: 'Categoria',
    headerProps: { className: 'text-900 p-1' }
  },
  {
    accessor: 'valor_pagamento',
    Header: 'Valor (R$)',
    headerProps: { className: 'text-900 p-1' }
  },
  {
    accessor: 'dia_vencimento',
    Header: 'Dia Venc.',
    headerProps: { className: 'text-900 p-1' }
  },
];

export const columnsTransfers = [
  {
    accessor: 'data',
    Header: 'Data',
    headerProps: { className: 'text-900 p-1' }
  },
  {
    accessor: 'str_caixa_origem',
    Header: 'Caixa Origem',
    headerProps: { className: 'text-900 p-1' },
    cellProps: {className: 'text-danger fw-bold p-1' }
  },
  {
    Header: ' ',
    cellProps: {value:'->'}
  },
  {
    accessor: 'str_caixa_destino',
    Header: 'Caixa Destino',
    headerProps: { className: 'text-900 p-1' },
    cellProps: {className: 'text-success fw-bold p-1' }
  },
  {
    accessor: 'valor',
    Header: 'Valor (R$)',
    headerProps: { className: 'text-900 p-1' }
  },
  {
    accessor: 'description',
    Header: 'Descrição',
    headerProps: { className: 'text-900 p-1' }
  }
];

export const columnsMovimentacao = [
  {
    accessor: 'data',
    Header: 'Data',
    headerProps: { className: 'text-900 p-1' }
  },
  {
    accessor: 'str_tipo',
    Header: 'Tipo',
    headerProps: { className: 'text-900 p-1' },
  },
  {
    accessor: 'str_caixa',
    Header: 'Caixa',
    headerProps: { className: 'text-900 p-1' },
  },
  {
    accessor: 'valor',
    Header: 'Valor (R$)',
    headerProps: { className: 'text-900 p-1' }
  },
  {
    accessor: 'description',
    Header: 'Descrição',
    headerProps: { className: 'text-900 p-1' }
  }
];

export const columnsReembolso = [
  {
    accessor: 'data',
    Header: 'Data',
    headerProps: { className: 'text-900 p-1' }
  },
  {
    accessor: 'str_caixa_destino',
    Header: 'Caixa',
    headerProps: { className: 'text-900 p-1' },
    cellProps: {className: 'text-primary fw-bold p-1' }
  },
  {
    accessor: 'valor',
    Header: 'Valor (R$)',
    headerProps: { className: 'text-900 p-1' }
  },
  {
    accessor: 'description',
    Header: 'Descrição',
    headerProps: { className: 'text-900 p-1' }
  }
];
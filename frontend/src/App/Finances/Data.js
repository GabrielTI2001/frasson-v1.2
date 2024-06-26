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
    accessor: 'str_cliente',
    Header: 'Cliente',
    headerProps: { className: 'text-900 p-1' }
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
  },
  {
    accessor: 'status',
    Header: 'Cobrança?',
    headerProps: { className: 'text-900 p-1' }
  }
];

export const columnsContratos = [
  {
    accessor: 'str_produto',
    Header: 'Produtos',
    headerProps: { className: 'text-900 p-1' }
  },
  {
    accessor: 'str_contratante',
    Header: 'Contratante',
    headerProps: { className: 'text-900 p-1' }
  },
  {
    accessor: 'str_servicos',
    Header: 'Serviços',
    headerProps: { className: 'text-900 p-1' }
  },
  {
    accessor: 'percentual',
    Header: '% GC',
    headerProps: { className: 'text-900 p-1' }
  },
  {
    accessor: 'valor',
    Header: 'Valor GAI',
    headerProps: { className: 'text-900 p-1' }
  },
  {
    accessor: 'data_assinatura',
    Header: 'Data',
    headerProps: { className: 'text-900 p-1' }
  },
  {
    accessor: 'status',
    Header: 'Status',
    headerProps: { className: 'text-900 p-1' }
  }
];
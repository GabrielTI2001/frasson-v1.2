
// export const fetchPessoal = async (inputValue) => {
//   const token = localStorage.getItem("token")
//   const params = inputValue ? `search=${inputValue}` : 'all=1'
//   try {
//     const apiUrl = `${process.env.REACT_APP_API_URL}/pipefy/pessoal/?${params}`;
//     const response = await fetch(apiUrl, {
//       headers: {
//         'Content-Type': 'application/json',
//         'Authorization': `Bearer ${token}`
//       },
//     });
//     const dataapi = await response.json();
//     const options = dataapi.length > 0 ? dataapi.map(b =>({
//       value: b.id,
//       label: b.razao_social
//     })) : []
//     return options
//   } catch (error) {
//     console.error('Erro ao carregar dados:', error);
//   }
// };

// export const fetchDetalhamentoServicos = async (inputValue) => {
//   const token = localStorage.getItem("token")
//   const params = inputValue ? `search=${inputValue}` : 'all=1'
//   try {
//     const apiUrl = `${process.env.REACT_APP_API_URL}/pipefy/detalhamentos/?${params}`;
//     const response = await fetch(apiUrl, {
//       headers: {
//         'Content-Type': 'application/json',
//         'Authorization': `Bearer ${token}`
//       },
//     });
//     const dataapi = await response.json();
//     const options = dataapi.length > 0 ? dataapi.map(b =>({
//       value: b.id,
//       label: b.detalhamento_servico
//     })) : []
//     return options
//   } catch (error) {
//     console.error('Erro ao carregar dados:', error);
//   }
// };


// export const FetchImoveisRurais = async (inputValue) => {
//   const token = localStorage.getItem("token")
//   // const navigate = useNavigate()
//   try {
//     const apiUrl = `${process.env.REACT_APP_API_URL}/analytics/farms?search=${inputValue}`;
//     const response = await fetch(apiUrl,{
//       headers:{
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${token}`
//       }
//     });

//     const dataapi = await response.json();
//     if (response.status === 200){
//       const options = dataapi.length > 0 ? dataapi.map(b =>({
//           value: b.id,
//           label: b.nome_imovel
//       })) : []
//       return options
//     }
//     else if (response.status === 401){
//       localStorage.setItem("login", JSON.stringify(false));
//       localStorage.setItem('token', "");
//       // navigate("/auth/login")
//       return [];
//     }
//   } catch (error) {
//     console.error('Erro ao carregar dados:', error);
//     return [];
//   }
// };

// export const fetchInstituicoesRazaoSocial = async (inputValue) => {
//   const token = localStorage.getItem("token")
//   const params = inputValue ? `search=${inputValue}` : 'all=1'
//   try {
//     const apiUrl = `${process.env.REACT_APP_API_URL}/register/instituicoes-razaosocial/?${params}`;
//     const response = await fetch(apiUrl, {
//       headers: {
//         'Content-Type': 'application/json',
//         'Authorization': `Bearer ${token}`
//       },
//     });
//     const dataapi = await response.json();
//     const options = dataapi.length > 0 ? dataapi.map(b =>({
//       value: b.id,
//       label: b.razao_social
//     })) : []
//     return options
//   } catch (error) {
//     console.error('Erro ao carregar dados:', error);
//   }
// };

// export const columnsPessoaProcesso = [
//   {
//     accessor: 'info_detalhamento.produto',
//     Header: 'Produto',
//     headerProps: { className: 'text-900 p-1' }
//   },
//   {
//     accessor: 'info_detalhamento.detalhamento_servico',
//     Header: 'Detalhamento',
//     headerProps: { className: 'text-900 p-1' }
//   },
//   {
//     accessor: 'info_instituicao.razao_social',
//     Header: 'Instituição',
//     headerProps: { className: 'text-900 p-1' }
//   },
//   {
//     accessor: 'valor_operacao',
//     Header: 'Valor Operação',
//     headerProps: { className: 'text-900 p-1' }
//   },
//   {
//     accessor: 'phase_name',
//     Header: 'Fase Atual',
//     headerProps: { className: 'text-900 p-1' }
//   },
//   {
//     accessor: 'created_at',
//     Header: 'Aberto em',
//     headerProps: { className: 'text-900 p-1' }
//   },
// ];

// export const columnsCardProspects = [
//   {
//     accessor: 'id',
//     Header: 'N° Prospect',
//     headerProps: { className: 'text-900 p-1' }
//   },
//   {
//     accessor: 'str_prospect',
//     Header: 'Prospect',
//     headerProps: { className: 'text-900 p-1' }
//   },
//   {
//     accessor: 'produto',
//     Header: 'Produto Interesse',
//     headerProps: { className: 'text-900 p-1' }
//   },
//   {
//     accessor: 'responsaveis_list',
//     Header: 'Responsável',
//     headerProps: { className: 'text-900 p-1' }
//   },
//   {
//     accessor: 'phase_name',
//     Header: 'Fase Atual',
//     headerProps: { className: 'text-900 p-1' }
//   },
//   {
//     accessor: 'data_vencimento',
//     Header: 'Vencimento',
//     headerProps: { className: 'text-900 p-1' }
//   },
//   {
//     accessor: 'status',
//     Header: 'Status',
//     headerProps: { className: 'text-900 p-1' }
//   },
// ];

// export const columnsCardProdutos = [
//   {
//     accessor: 'id',
//     Header: 'Processo',
//     headerProps: { className: 'text-900 p-1' }
//   },
//   {
//     accessor: 'list_beneficiarios',
//     Header: 'Beneficiários',
//     headerProps: { className: 'text-900 p-1' }
//   },
//   {
//     accessor: 'detalhe',
//     Header: 'Detalhe',
//     headerProps: { className: 'text-900 p-1' }
//   },
//   {
//     accessor: 'str_instituicao',
//     Header: 'Instituição',
//     headerProps: { className: 'text-900 p-1' }
//   },
//   {
//     accessor: 'phase_name',
//     Header: 'Fase Atual',
//     headerProps: { className: 'text-900 p-1' }
//   }
// ];

// export const columnsContratos = [
//   {
//     accessor: 'id',
//     Header: 'Código',
//     headerProps: { className: 'text-900 p-1' }
//   },
//   {
//     accessor: 'str_produto',
//     Header: 'Produtos',
//     headerProps: { className: 'text-900 p-1' }
//   },
//   {
//     accessor: 'str_contratante',
//     Header: 'Contratante',
//     headerProps: { className: 'text-900 p-1' }
//   },
//   {
//     accessor: 'str_servicos',
//     Header: 'Serviços',
//     headerProps: { className: 'text-900 p-1' }
//   },
//   {
//     accessor: 'percentual_gc',
//     Header: '% GC',
//     headerProps: { className: 'text-900 p-1' }
//   },
//   {
//     accessor: 'valor_gai',
//     Header: 'Valor GAI',
//     headerProps: { className: 'text-900 p-1' }
//   },
//   {
//     accessor: 'data_assinatura',
//     Header: 'Data',
//     headerProps: { className: 'text-900 p-1' }
//   },
//   {
//     accessor: 'status',
//     Header: 'Status',
//     headerProps: { className: 'text-900 p-1' }
//   }
// ];

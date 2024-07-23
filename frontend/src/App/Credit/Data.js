export const fetchCreditData = async () => {
  try {
    const apiUrl = `${process.env.REACT_APP_API_URL}/credit/credit-data`;
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

export const ApiCedula = async (dadosform, id, type) => {
  const token = localStorage.getItem("token")
  const link = `${process.env.REACT_APP_API_URL}/credit/operacoes-cedulas/${type === 'edit' ?id+'/':''}` 
  const method = type === 'edit' ? 'PUT' : 'POST'
  try {
      const response = await fetch(link, {
        method: method,
        headers: {
            'Authorization': `Bearer ${token}`
        },
        body: dadosform
      });
      if (response.status === 401){
        localStorage.setItem("login", JSON.stringify(false));
        localStorage.setItem('token', "");
      }
      return response
  } catch (error) {
      console.error('Erro:', error);
  }
};

export const fieldsOperacoes = [
  {name:'numero_operacao', label:'Número da Operação*', xl:3, sm:6, type:'text'},
  {name:'item_financiado', label:'Item Financiado*', xl:4, sm:6, type:'select2', url:'credit/itens-financiados', attr1:'item',
    string:'str_item_financiado'
  },
  {name:'beneficiario', label:'Beneficiário*', xl:4, sm:6, type:'select2', url:'register/pessoal', attr1:'razao_social', attr2:'cpf_cnpj',
    string:'str_beneficiario'
  },
  {name:'instituicao', label:'Instituição*', xl:4, sm:6, type:'select2', url:'register/instituicoes', attr1:'razao_social',
    string:'str_instituicao'
  },
  {name:'valor_operacao', label:'Valor da Operação (R$)*', xl:3, sm:6, type:'number'}, 
  {name:'imoveis_beneficiados', label:'Imóveis Beneficiados*', xl:5, sm:6, type:'select2', ismulti:true, url:'farms/farms', attr1:'nome',
    attr2:'matricula', list:'list_imoveis', string:'nome'
  },
  {name:'area_beneficiada', label:'Área Total Beneficiada (ha)*', xl:3, sm:6, type:'number'}, 
  {name:'quantidade_kg', label:'Quantidade (Kg)', xl:3, sm:6, type:'number'},
  {name:'varidade_semente', label:'Variedade Semente', xl:3, sm:6, type:'text'}, 
  {name:'prod_esperada_kg_ha', label:'Produtividade Esperada (Kg/ha)', xl:3, sm:6, type:'number'},
  {name:'adubacao_total', label:'Adubação Total', xl:6, sm:6, type:'text'}, 
  {name:'fonte_recurso', label:'Fonte Recurso', xl:4, sm:6, type:'text'}, 
  {name:'data_emissao_cedula', label:'Data Emissão Cédula*', xl:3, sm:6, type:'date'},
  {name:'data_primeiro_vencimento', label:'Data Primeiro Vencimento', xl:3, sm:6, type:'date'},
  {name:'data_prod_armazenado', label:'Data Prod. Armazenado', xl:3, sm:6, type:'date'},
  {name:'data_vencimento', label:'Data Vencimento*', xl:3, sm:6, type:'date'},
  {name:'taxa_juros', label:'Taxa Juros (%)', xl:3, sm:6, type:'number'}, 
  {name:'safra', label:'Safra', xl:4, sm:6, type:'text'}, {name:'garantia', label:'Garantia', xl:12, sm:12, type:'text'}, 
  {name:'file', label:'PDFs Cédulas', xl:3, sm:6, type:'file', ismulti:true},
  {name:'kml', label:'KML*', xl:3, sm:6, type:'file'},
]

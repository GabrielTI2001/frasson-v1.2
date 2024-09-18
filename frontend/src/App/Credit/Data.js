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
  {name:'numero_operacao', label:'Número da Operação*', type:'text'},
  {name:'item_financiado', label:'Item Financiado*', type:'select2', url:'credit/itens-financiados', attr1:'item',
    string:'str_item_financiado'
  },
  {name:'beneficiario', label:'Beneficiário*', type:'select2', url:'register/pessoal', attr1:'razao_social', attr2:'cpf_cnpj',
    string:'str_beneficiario'
  },
  {name:'instituicao', label:'Instituição*', type:'select2', url:'register/instituicoes', attr1:'razao_social',
    string:'str_instituicao'
  },
  {name:'valor_operacao', label:'Valor da Operação (R$)*', type:'text', is_number:true}, 
  {name:'imoveis_beneficiados', label:'Imóveis Beneficiados*', type:'select2', ismulti:true, url:'farms/farms', attr1:'nome',
    attr2:'matricula', list:'list_imoveis', string:'nome'
  },
  {name:'area_beneficiada', label:'Área Total Beneficiada (ha)*', type:'text', is_number:true}, 
  {name:'quantidade_kg', label:'Quantidade (Kg)', type:'text', is_number:true},
  {name:'varidade_semente', label:'Variedade Semente', type:'text', is_number:true}, 
  {name:'prod_esperada_kg_ha', label:'Produtividade Esperada (Kg/ha)', type:'text', is_number:true},
  {name:'adubacao_total', label:'Adubação Total', type:'text'}, 
  {name:'fonte_recurso', label:'Fonte Recurso', type:'text'}, 
  {name:'data_emissao_cedula', label:'Data Emissão Cédula*', type:'date'},
  {name:'data_primeiro_vencimento', label:'Data Primeiro Vencimento', type:'date'},
  {name:'data_prod_armazenado', label:'Data Prod. Armazenado', type:'date'},
  {name:'data_vencimento', label:'Data Vencimento*', type:'date'},
  {name:'taxa_juros', label:'Taxa Juros (%)', type:'text', is_number:true}, 
  {name:'safra', label:'Safra', type:'text'}, {name:'garantia', label:'Garantia', type:'text'}, 
  {name:'file', label:'PDFs Cédulas', type:'file', ismulti:true},
  {name:'kml', label:'KML*', type:'file'},
]

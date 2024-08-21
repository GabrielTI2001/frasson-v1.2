export const fieldsProspect = [
  {name:'cliente', label:'Cliente*', type:'select2', url:'register/pessoal', attr1:'razao_social', 
    attr2:'cpf_cnpj', data:'info_cliente'
  },
  {name:'produto', label:'Produto de Interesse*', type:'select2', url:'register/produtos', attr1:'description', 
    attr2:'acronym', data:'info_produto'
  },
  {name:'classificacao', label:'Classificação*', type:'text'},
  {name:'origem', label:'Origem*', type:'text'},
  {name:'proposta_inicial', label:'Proposta Inicial', type:'text', isnumber:true},
  {name:'percentual_inicial', label:'Percentual Inicial', type:'text', isnumber:true},
  {name:'proposta_aprovada', label:'Proposta Aprovada', type:'text', isnumber:true},
  {name:'percentual_aprovado', label:'Percentual Aprovado', type:'text', isnumber:true},
]

export const fieldsFluxoGAI = [
  {name:'prioridade', label:'Prioridade*', type:'select', string:'prioridade', options:
   {'Alta':'Alta', 'Media':'Média', 'Baixa':'Baixa'}
  },
  {name:'beneficiario', label:'Beneficiário*', type:'select2', url:'register/pessoal', attr1:'razao_social', 
    attr2:'cpf_cnpj', data:'list_beneficiario'
  },
  {name:'detalhamento', label:'Detalhamento da Demanda*', type:'select2', url:'register/detalhamentos', attr1:'detalhamento_servico', 
    attr2:'str_produto', data:'info_detalhamento'
  },
  {name:'valor_operacao', label:'Valor da Operação', type:'text', isnumber:true},
  {name:'instituicao', label:'Instituição Vinculada*', type:'select2', url:'register/instituicoes', attr1:'razao_social',
    attr2:'identificacao', data:'info_instituicao'
  },
  {name:'contrato', label:'Contrato Vinculado*', type:'select2', url:'finances/contratos-ambiental', attr1:'str_contratante',
    attr2:'str_produto', data:'info_contrato'
  }
]
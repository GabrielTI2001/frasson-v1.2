const style = {width:'15px', height:'15px'}

export const fieldsProspect = [
  {name:'prioridade', label:'Prioridade*', type:'dropdown', direction:'up', string:'str_prioridade', options:
    {'A':'Alta', 'M':'Média', 'B':'Baixa'},
    icon:{
      'A':<div className={`rounded-circle d-inline-block me-1 bg-danger`} style={style}></div>,
      'M':<div className={`rounded-circle d-inline-block me-1 bg-warning`} style={style}></div>,
      'B':<div className={`rounded-circle d-inline-block me-1 bg-success`} style={style}></div>
    }
  },
  {name:'nome', label:'Nome Prospect*', type:'text'},
  {name:'produto', label:'Produto de Interesse*', type:'select', attr1:'description', 
    attr2:'acronym', data:'info_produto'
  },
  {name:'classificacao', label:'Classificação*', type:'select', options:
    {'Cliente Novo':'Cliente Novo', 'Cliente Carteira':'Cliente Carteira'}, 
  },
  {name:'descricao', label:'Descrição*', type:'textarea', rows:4},
  {name:'proposta_inicial', label:'Proposta Inicial', type:'text', isnumber:true},
  {name:'percentual_inicial', label:'Percentual Inicial', type:'text', isnumber:true},
  {name:'proposta_aprovada', label:'Proposta Aprovada', type:'text', isnumber:true},
  {name:'percentual_aprovado', label:'Percentual Aprovado', type:'text', isnumber:true},
]

export const fieldsFluxoGAI = [
  {name:'prioridade', label:'Prioridade*', type:'select', string:'str_prioridade', options:
   {'Alta':'Alta', 'Media':'Média', 'Baixa':'Baixa'}
  },
  {name:'beneficiario', label:'Beneficiário*', type:'select2', url:'register/pessoal', attr1:'razao_social', 
    attr2:'cpf_cnpj', data:'list_beneficiario', urlapi:'register/pessoal', attr_data:'razao_social'
  },
  {name:'detalhamento', label:'Detalhamento da Demanda*', type:'select2', url:'register/detalhamentos', attr1:'detalhamento_servico', 
    attr2:'str_produto', data:'info_detalhamento', params:'produto=GAI', attr_data:'detalhamento_servico'
  },
  {name:'instituicao', label:'Instituição Vinculada*', type:'select2', url:'register/instituicoes', attr1:'razao_social',
    attr2:'identificacao', data:'info_instituicao', attr_data:'razao_social'
  },
  {name:'contrato', label:'Contrato Vinculado*', type:'select2', url:'finances/contracts/environmental', attr1:'str_contratante',
    attr2:'str_produto', data:'info_contrato', urlapi:'finances/contratos-ambiental', attr_data:'str_contratante'
  },
  {name:'valor_operacao', label:'Valor da Operação', type:'text', isnumber:true},
]
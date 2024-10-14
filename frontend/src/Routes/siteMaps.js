import { faGear, faMoneyBill, faLeaf, faChartLine, faDatabase, faDroplet, faLocationDot, faFaucetDrip, faMap, faWheatAwn, faCannabis,
faFilePen, faFilePdf, faScrewdriverWrench, faFileSignature, faCartShopping, faHandshake, faCartPlus, faFilter, faCircleNotch,
faMagnifyingGlass, faMoneyBillWheat, faMoneyBillTrendUp, faArrowTrendUp, faSatellite, faMapLocationDot,faGlobe, faChartSimple, 
faUser, faChartColumn, faComments, faBullseye, faCoins, faRobot,
faListCheck,
faHourglassHalf} from "@fortawesome/free-solid-svg-icons";

const user = JSON.parse(localStorage.getItem("user"));

export const dashboardRoutes = {
  label: 'Dashboards',
  labelDisable: true,
  icon: faChartLine,
  children: [
    {
      name: 'Operações de Crédito',
      active: true,
      children: [
        {
          name: 'Dashboard Oper. Contratadas',
          to: '/dashboard/credit',
          icon2:'Speedometer',
          exact: true,
          active: true
        },
        {
          name: 'Dashboard Oper. em Andamento',
          to: '/dashboard/credit/progress',
          icon2:'Speedometer',
          active: true,
          // badge: {
          //   type: 'success',
          //   text: 'New'
          // }
        }
      ]
    },
    {
      name: 'Fluxos',
      active: true,
      children: [
        {
          name: 'Dashboard Prospects',
          to: '/dashboard/prospects',
          icon: faChartColumn,
          exact: true,
          active: true
        },
        {
          name: 'Dashboard Produtos',
          to: '/dashboard/products',
          icon: faChartColumn,
          active: true,
        }
      ]
    },
    {
      name: 'Ambiental',
      active: true,
      children: [
        {
          name: 'Dashboard Ambiental',
          to: '/dashboard/ambiental',
          icon: faChartSimple,
          exact: true,
          active: true
        }
      ]
    },
    {
      name: 'Financeiro',
      active: true,
      children: [
        {
          name: 'Dashboard Pagamentos',
          to: '/dashboard/finances/billings',
          icon: faChartSimple,
          exact: true,
          active: true
        },
        {
          name: 'Dashboard Cobranças',
          to: '/dashboard/finances/revenues',
          icon: faChartSimple,
          exact: true,
          active: true
        }
      ]
    }
  ]
};

export const ComercialRoutes = {
  label: 'Comercial',
  labelDisable: true,
  icon: faCartPlus,
  children: [
    {
      name: '',
      active: true,
      children: [
        {
          name: 'PVTEC',
          icon: faFilter,
          to: '/comercial/pvtec',
          exact: true,
          active: true
        },
        {
          name: 'Prospects',
          icon: faHandshake,
          to: '/pipeline/518984924',
          exact: true,
          active: true
        },
      ]
    },
  ],  
};



export const operacionalRoutes = {
  label: 'Operacional',
  labelDisable: true,
  icon: faGear,
  children: [
    {
      name: 'Análise e Processamento',
      active: true,
      children: [
        {
          name: 'Cadastros Gerais',
          icon: faDatabase,
          to: '/databases/',
          exact: true,
          active: true
        },
        {
          name: 'Acompanhamento GAI',
          icon2: 'CalendarCheck',
          to: '/processes/followup',
          exact: true,
          active: true
        }
      ]
    },
    {
      name: 'Fluxos Operacionais',
      active: true,
      children: [
        {
          name: 'Gestão de Crédito',
          icon: faCartShopping,
          to: '/pipeline/518984721',
          exact: true,
          active: true
        },
        {
          name: 'Gestão Ambiental e Irrigação',
          icon: faCartShopping,
          to: '/pipeline/518984721',
          exact: true,
          active: true
        },
      ]
    },
    {
      name: 'LITEC',
      active: true,
      children: [
        {
          name: 'Produção Agrícola e Pecuária',
          icon: faWheatAwn,
          to: '/litec/glebas',
          exact: true,
          active: true
        },
      ]
    },
    {
      name: 'Comprovações e Alongamentos',
      active: true,
      children: [
        {
          name: 'Comprovações',
          icon2: 'PencilSquare',
          to: '/comprovacoes',
          exact: true,
          active: true
        },
        {
          name: 'Operações Alongadas',
          icon: faMoneyBillWheat,
          to: '/alongamentos/done',
          exact: true,
          active: true
        },
        {
          name: 'Próximos Alongamentos',
          icon: faHourglassHalf,
          to: '/alongamentos/next',
          exact: true,
          active: true
        },
      ]
    }
  ],  
};

export const pipelineRoutes = {
  label: 'Fluxos',
  labelDisable: true,
  icon: faGear,
  children: [
    {
      name: 'Prospects',
      icon: faHandshake,
      to: '/pipeline/518984924',
      exact: true,
      active: true
    },
    {
      name: 'Gestão de Crédito',
      icon: faCartShopping,
      to: '/pipeline/518984721',
      exact: true,
      active: true
    },
    {
      name: 'Gestão Ambiental e Irrigação',
      icon: faCartShopping,
      to: '/pipeline/518984721',
      exact: true,
      active: true
    },
  ] 
};


export const creditoRoutes = {
  label: 'Crédito Rural',
  labelDisable: true,
  icon: faMoneyBill,
  children: [
    {
      name: 'Operações de Crédito',
      active: true,
      children: [
        {
          name: 'Operações Contratadas',
          to: '/credit/operations',
          icon2: 'CashCoin',
          exact: true,
          active: true
        },
      ]
    }
  ]
};

export const ambientalRoutes = {
  name: 'Ambiental',
  active: true,
  icon: faLeaf,
  children: [
    {
      name: 'INEMA - BA',
      active: true,
      children: [
        user && ((user.permissions && user.permissions.indexOf("view_processos_outorga") !== -1) || user.is_superuser) ? {
          name: 'Processos Outorga',
          to: '/ambiental/inema/outorgas',
          icon: faDroplet,
          active: true
        } : null,
        user && ((user.permissions && user.permissions.indexOf("view_processos_appo") !== -1) || user.is_superuser) ? {
          name: 'Processos APPO',
          to: '/ambiental/inema/appos',
          icon: faLocationDot,
          active: true
        } : null,
        {
          name: 'Processos ASV',
          to: '/ambiental/inema/asv',
          icon: faCannabis,
          active: true
        },
        {
          name: 'Requerimentos APPO',
          to: '/ambiental/inema/requerimentos/appo',
          icon: faFilePen,
          active: true
        }
      ].filter(Boolean)
    },
    {
      name: 'LICENCIAMENTO AMBIENTAL',
      active: true,
      children: [
        {
          name: 'Cadastro Licenças',
          to: '/licenses',
          icon: faFaucetDrip,
          active: true
        },
        {
          name: 'Outorgas ANA',
          to: '/external-api/ana/outorgas',
          icon: faDroplet,
          active: true
        },
        {
          name: 'Outorgas SEMAD GO',
          to: '',
          icon: faDroplet,
          active: true
        }
      ]
    },
    {
      name: 'IRRIGAÇÃO',
      active: true,
      children: [
        {
          name: 'Pivots',
          to: '/irrigation/pivots',
          icon: faCircleNotch,
          active: true
        },
        {
          name: 'Projetos de Irrigação',
          to: '/irrigation/project',
          icon: faScrewdriverWrench,
          active: true
        },

      ]
    },
  ]
};

export const financeiroRoutes = {
  label: 'Adm & Financeiro',
  labelDisable: true,
  children: [
    {
      name: 'Financeiro',
      active: true,
      children: [
        {
          name: 'Pagamentos',
          to: '/finances/billings',
          icon: faMoneyBill,
          exact: true,
          active: true
        },
        {
          name: 'Cobranças',
          to: '/finances/revenues',
          icon: faMoneyBill,
          exact: true,
          active: true
        },
        {
          name: 'DRE Consolidado',
          to: '/finances/dre/actual',
          icon: faCoins,
          exact: true,
          active: true
        },
        {
          name: 'DRE Provisionado',
          to: '/finances/dre/forecast',
          icon: faChartLine,
          exact: true,
          active: true
        },
        {
          name: 'Automação de Pagamentos',
          to: '/finances/automation/payments',
          icon: faRobot,
          exact: true,
          active: true
        },
        {
          name: 'Contratos Serviços Ambiental',
          to: '/finances/contracts/environmental',
          icon: faFileSignature,
          exact: true,
          active: true
        },
        {
          name: 'Contratos Serviços Crédito',
          to: '/finances/contracts/credit',
          icon: faFileSignature,
          exact: true,
          active: true
        }
      ]
    },
    {
      name: 'Fluxo de Caixa',
      active: true,
      children: [
        {
          name: 'Saldos Bancários',
          to: '/finances/accounts',
          icon2: 'Cash',
          exact: true,
          active: true
        },
        {
          name: 'Transferências Bancárias',
          to: '/finances/transfers',
          icon2: 'CurrencyExchange',
          exact: true,
          active: true
        },
        {
          name: 'Movimentações Financeiras',
          to: '/finances/financial',
          icon2: 'CurrencyDollar',
          exact: true,
          active: true
        },
        {
          name: 'Reembolsos Clientes',
          to: '/finances/refunds',
          icon2: 'ArrowClockwise',
          exact: true,
          active: true
        },
      ]
    },
    {
      name: 'Financeiro Reports',
      active: true,
      children: [
        {
          name: 'Report Saldos Contas',
          to: `${process.env.REACT_APP_API_URL}/finances/balances/bank-accounts/pdf`,
          icon: faFilePdf,
          exact: true,
          active: true
        }
      ]
    },
    {
      name: 'Outras Ferramentas',
      active: true,
      children: [
        {
          name: 'Indicadores Frasson',
          to: '/kpi/indicators',
          icon: faBullseye,
          exact: true,
          active: true
        },
      ]
    }
  ]
};

export const servicosRoutes = {
  name: 'Servicos',
  active: true,
  children: [
    {
      name: 'Geral',
      active: true,
      children: [
        {
          name: 'Registrar Feedback',
          to: '/databases/feedback/new',
          icon: faComments,
          exact: true,
          active: true
        },
        {
          name: 'Mapas',
          to: '/services/maps',
          icon: faMap,
          exact: true,
          active: true
        },
        {
          name: 'Meus Indicadores',
          to: '/kpi/myindicators',
          icon2: 'Speedometer',
          exact: true,
          active: true
        },
        {
          name: 'Questionários Pendentes',
          to: '/assessments/my',
          icon: faBullseye,
          exact: true,
          active: true
        },
      ]
    },
    {
      name: 'APIs de Terceiros',
      active: true,
      children: [
        {name:'Consulta CNPJ', to:'/external-api/cnpj', icon:faMagnifyingGlass, descricao:'Receita Federal'},
        {name:'Cotações Agrícolas', to:'/external-api/currency/commodity', icon:faMoneyBillWheat, 
          descricao:'Commodities Agrícolas e Pecuárias'
        },
        {name:'Moedas Estrangeiras', to:'/external-api/currency/exchange', icon:faMoneyBillTrendUp, descricao:'BRL, USD, BTC'},
        {name:'Cotações de Ativos', to:'/external-api/404', icon:faArrowTrendUp, descricao:'B3'},
        {name:'Map Biomas', to:'/external-api/404', icon:faSatellite, descricao:'Alerta Desmatamento'},
      ]
    },
    {
      name: 'Ferramentas Frasson',
      active: true,
      children: [
        {name:'Extrair Coordenadas', to:'tools/kml-to-coordinates', icon:faMapLocationDot, descricao:'Arquivo KML'},
        {name:'Coordenadas Pivot', to:'tools/pivot', icon:faLocationDot, descricao:'Limites do Pivot'},
        {name:'Lançar Coordenadas', to:'tools/LatLong', icon:faGlobe, descricao:'KML Pontos ou Polígono'},
        {name:'Google Countours', to:'tools', icon:faGlobe, descricao:'Curvas de Elevação'},
        {name:'KML CAD -> KML Corrigido', to:'tools/kml/polygon', icon:faMap, descricao:'KML Pontos ou Polígono'},
      ]
    },
  
  ]
};

export const adminRoutes = {
  name: 'Admin',
  active: true,
  children: [
    {name:'Geral', children:[
      {
        name: 'Django Admin',
        to: `${process.env.REACT_APP_API_URL}/admin/`,
        icon2: 'WrenchAdjustable',
        exact: true,
        active: true
      },
      {
        name: 'Usuários',
        to: '/admin/users',
        icon: faUser,
        exact: true,
        active: true
      },
    ]},
    {
      name: 'Administrator Panel',
      children:[
        {name: 'Feedbacks', to: '/databases/feedbacks',icon: faComments},
        {name: 'Avaliação 360', to: '/assessments',icon: faListCheck},
      ]
    },
  ]
};

const functions = [
  operacionalRoutes,
  dashboardRoutes,
  ambientalRoutes,
  financeiroRoutes,
  servicosRoutes,
  adminRoutes
];

// Filtrar e retornar apenas os objetos válidos
export default functions.filter(route => {
  // Verifique se há permissões ou superusuário para incluir o roteamento
  return route.children && route.children.length > 0 && route.children[0].children && route.children[0].children.some(child => {
    return child.name === 'Processos APPO';
  });
});


import { faGear, faMoneyBill, faLeaf, faChartLine, faDatabase, faPersonArrowUpFromLine, faDroplet, faLocationDot, faFaucetDrip, 
faMap, faWheatAwn, faCannabis, faFilePen} 
from "@fortawesome/free-solid-svg-icons";
import { faChartSimple, faUser, faChartColumn, faComments, faToolbox, faBullseye, faCoins } 
from "@fortawesome/free-solid-svg-icons";
const user = JSON.parse(localStorage.getItem("user"));

export const dashboardRoutes = {
  label: 'Dashboard',
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
      name: 'Fluxos Pipefy',
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

export const PipefyRoutes = {
  label: 'Pipefy',
  labelDisable: true,
  icon2: 'Kanban',
  children: [
    {
      name: 'Databases',
      active: true,
      children: [
        {
          name: 'Regimes de Exploração',
          icon: faPersonArrowUpFromLine,
          to: '/analytics/regime',
          exact: true,
          active: true
        },
        {
          name: 'Imóveis Rurais',
          icon: faMap,
          to: '/analytics/farms',
          exact: true,
          active: true
        },
        {
          name: 'Operações Contratadas',
          to: '/analytics/credit',
          icon2: 'CashCoin',
          exact: true,
          active: true
        }
      ]
    },
    {
      name: 'Pipes',
      active: true,
      children: [
        {
          name: 'Processos Prospects',
          icon2: 'FunnelFill',
          to: '/pipefy/pipes/301573049',
          exact: true,
          active: true
        },
        {
          name: 'Processos Produtos',
          icon2: 'GearFill',
          to: '/pipefy/pipes/301573538',
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
          to: '/register/',
          exact: true,
          active: true
        },
      ]
    },
    {
      name: 'Processos Operacionais',
      active: true,
      children: [
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
          name: 'Alongamentos',
          icon2: 'Calendar2Check',
          to: '/alongamentos',
          exact: true,
          active: true
        },
      ]
    }
  ],  
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
          name: 'Teste',
          to: '/',
          icon2: 'CashCoin',
          exact: true,
          active: true
        }
      ]
    }
  ]
};

export const ambientalRoutes = {
  label: 'Ambiental',
  labelDisable: true,
  icon: faLeaf,
  children: [
    {
      name: 'Ambiental',
      active: true,
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
              name: 'Requerimentos',
              to: '/ambiental/inema/requerimentos',
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
          name: 'Outras Aplicações',
          active: true,
          children: [
            
            {
              name: 'Irrigação',
              to: '/irrigation',
              icon: faFaucetDrip,
              active: true
            },
          ]
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
      ]
    }
  ]
};

export const servicosRoutes = {
  label: 'Serviços',
  labelDisable: true,
  children: [
    {
      name: 'servicos',
      active: true,
      children: [
        {
          name: 'Registrar Feedback',
          to: '/register/feedback/new',
          icon: faComments,
          exact: true,
          active: true
        },
        {
          name: 'APIs de Terceiros',
          to: '/external-api',
          icon: faChartSimple,
          exact: true,
          active: true
        },
        {
          name: 'Ferramentas Frasson',
          to: '/services/tools',
          icon: faToolbox,
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
    }
  ]
};

export const adminRoutes = {
  label: 'Admin',
  labelDisable: true,
  children: [
    {
      name: 'Admin',
      active: true,
      children: [
        {
          name: 'Usuários',
          to: '/admin/users',
          icon: faUser,
          exact: true,
          active: true
        },
      ]
    }
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


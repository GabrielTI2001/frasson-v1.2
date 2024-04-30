import { faGear, faMoneyBill, faLeaf, faChartLine, faDatabase, faPersonArrowUpFromLine, faDroplet, faLocationDot, faFaucetDrip, 
faMap } 
from "@fortawesome/free-solid-svg-icons";
import { faChartSimple, faUser } 
from "@fortawesome/free-solid-svg-icons";
import { } from 'react-bootstrap-icons';
const user = JSON.parse(localStorage.getItem("user"));

export const dashboardRoutes = {
  label: 'Dashboard',
  labelDisable: true,
  icon: faChartLine,
  children: [
    {
      name: 'Dashboard',
      active: true,
      children: [
        {
          name: 'Default',
          to: '/',
          exact: true,
          active: true
        },
        {
          name: 'Support desk',
          to: '/dashboard/support-desk',
          active: true,
          badge: {
            type: 'success',
            text: 'New'
          }
        }
      ]
    }
  ]
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
      ]
    },
    {
      name: 'Processos Operacionais',
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
        {
          name: 'Acompanhamento GAI',
          icon2: 'CalendarCheck',
          to: '/processes/followup',
          exact: true,
          active: true
        }
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
      name: 'Teste',
      active: true,
      children: [
        {
          name: 'Sub1',
          to: '/',
          exact: true,
          active: true
        },
        {
          name: 'Sub2',
          to: '/',
          exact: true,
          active: true
        },
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
            } : null
          ].filter(Boolean)
        },
        {
          name: 'Outras Aplicações',
          active: true,
          children: [
            
            {
              name: 'Irrigação',
              to: '',
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
      name: 'Teste',
      active: true,
      children: [
        {
          name: 'Sub1',
          to: '/',
          exact: true,
          active: true
        },
        {
          name: 'Sub2',
          to: '/',
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
          name: 'Cotações',
          to: '/services/currency',
          icon: faChartSimple,
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


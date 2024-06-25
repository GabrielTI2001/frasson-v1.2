import React from 'react';
import NavbarDropdown from './NavbarDropdown';
import {
  operacionalRoutes,
  ComercialRoutes,
  dashboardRoutes,
  ambientalRoutes,
  creditoRoutes,
  servicosRoutes,
  financeiroRoutes,
  adminRoutes
} from '../../../Routes/siteMaps';
import { Dropdown } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import NavbarDropdownAmbiental from './NavbarDropdownAmbiental';
import { useAppContext } from '../../../Main';
import NavbarDropdownOperacional from './NavbarDropdownOperacional';
import NavbarDropdownCredito from './NavbarDropdownCredito';
import NavbarDropdownServicos from './NavbarDropdownServicos';
import NavbarDropdownFinanceiro from './NavbarDropdownFinanceiro';
import NavbarDropdownAdmin from './NavbarDropdownAdmin';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Flex from '../../common/Flex';
import NavbarDropdownComercial from './NavbarDropdownComercial';
import { Kanban } from 'react-bootstrap-icons';

const NavbarTopDropDownMenus = () => {
  const {
    config: { navbarCollapsed, showBurgerMenu },
    setConfig
  } = useAppContext();

  const user = JSON.parse(localStorage.getItem("user"))

  const handleDropdownItemClick = () => {
    if (navbarCollapsed) {
      setConfig('navbarCollapsed', !navbarCollapsed);
    }
    if (showBurgerMenu) {
      setConfig('showBurgerMenu', !showBurgerMenu);
    }
  };
  return (
    <>
    {user && ((user.permissions && user.permissions.indexOf("ver_menu_operacional") !== -1) || user.is_superuser) &&
      <Flex>
        <span className="nav-link-icon d-flex align-items-center">
          <FontAwesomeIcon icon={operacionalRoutes.icon} className='fs--3'/>
        </span>
        <NavbarDropdown title="Operacional">
          <NavbarDropdownOperacional items={operacionalRoutes.children}/>
        </NavbarDropdown>
      </Flex>
    }
    <Flex>
      <span className="nav-link-icon d-flex align-items-center">
        <Kanban/>
      </span>
      <NavbarDropdown title="Comercial">
        <NavbarDropdownComercial items={ComercialRoutes.children}/>
      </NavbarDropdown>
    </Flex>
    {user && ((user.permissions && user.permissions.indexOf("ver_menu_credito") !== -1) || user.is_superuser) &&
      <Flex>
        <span className="nav-link-icon d-flex align-items-center">
          <FontAwesomeIcon icon={creditoRoutes.icon} />
        </span>
        <NavbarDropdown title="Crédito Rural">
          <NavbarDropdownCredito items={creditoRoutes.children} key={1}/>
        </NavbarDropdown>
      </Flex>
    }
    {user && ((user.permissions && user.permissions.indexOf("ver_menu_ambiental") !== -1) || user.is_superuser) &&
      <Flex>
        <span className="nav-link-icon d-flex align-items-center">
          <FontAwesomeIcon icon={ambientalRoutes.icon} />
        </span>
        <NavbarDropdown title="Ambiental">
          <NavbarDropdownAmbiental items={ambientalRoutes.children} />
        </NavbarDropdown>
      </Flex>
    }
      <Flex>
        <span className="nav-link-icon d-flex align-items-center">
          <FontAwesomeIcon icon={dashboardRoutes.icon} />
        </span>
        <NavbarDropdown title="Dashboards">
          <NavbarDropdownCredito items={dashboardRoutes.children} key={2}/>
        </NavbarDropdown>
      </Flex>
      <NavbarDropdown title="Serviços">
        <NavbarDropdownServicos items={servicosRoutes.children} />
      </NavbarDropdown>
      {user && ((user.permissions && user.permissions.indexOf("ver_menu_financeiro") !== -1) || user.is_superuser) &&
        <NavbarDropdown title="Adm & Fin">
          <NavbarDropdownFinanceiro items={financeiroRoutes.children} />
        </NavbarDropdown>
      }
      {user.is_superuser && 
        <NavbarDropdown title="Admin">
          <NavbarDropdownAdmin items={adminRoutes.children} />
        </NavbarDropdown>
      }
    </>
  );
};

export default NavbarTopDropDownMenus;

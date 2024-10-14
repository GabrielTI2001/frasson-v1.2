import React, { useState } from 'react';
// import NavbarDropdown from './NavbarDropdown';
import {
  operacionalRoutes,
  // ComercialRoutes,
  dashboardRoutes,
  ambientalRoutes,
  creditoRoutes,
  // servicosRoutes,
  // financeiroRoutes,
  // adminRoutes
} from '../../../Routes/siteMaps';
// import NavbarDropdownAmbiental from './NavbarDropdownAmbiental';
// import { useAppContext } from '../../../Main';
// import NavbarDropdownOperacional from './NavbarDropdownOperacional';
// import NavbarDropdownCredito from './NavbarDropdownCredito';
// import NavbarDropdownServicos from './NavbarDropdownServicos';
// import NavbarDropdownFinanceiro from './NavbarDropdownFinanceiro';
// import NavbarDropdownAdmin from './NavbarDropdownAdmin';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Flex from '../../common/Flex';
// import NavbarDropdownComercial from './NavbarDropdownComercial';
import { faCartPlus, faDatabase, faKaaba } from '@fortawesome/free-solid-svg-icons';
// import { useAppContext } from '../../../Main';
import NavbarNavLink from './NavbarNavLink';

const NavbarTopDropDownMenus = () => {
  // const {
  //   config: { navbarCollapsed, showBurgerMenu },
  //   setConfig
  // } = useAppContext();
  
  const [selected, setSelected] = useState({})

  const user = JSON.parse(localStorage.getItem("user"))

  // const handleDropdownItemClick = () => {
  //   if (navbarCollapsed) {
  //     setConfig('navbarCollapsed', !navbarCollapsed);
  //   }
  //   if (showBurgerMenu) {
  //     setConfig('showBurgerMenu', !showBurgerMenu);
  //   }
  // };

  return (
    <>
    {user && ((user.permissions && user.permissions.indexOf("ver_menu_operacional") !== -1) || user.is_superuser) &&
      <Flex>
        <NavbarNavLink title="Cadastros" route={{to:'/databases'}} icon={faDatabase} 
          click={() => {setSelected({Cadastros:true})}} selected={selected.Cadastros}
        />
      </Flex>
    }
    {user && ((user.permissions && user.permissions.indexOf("ver_menu_operacional") !== -1) || user.is_superuser) &&
      <Flex>
        {/* <span className="nav-link-icon text-400 d-flex align-items-center">
          <FontAwesomeIcon icon={operacionalRoutes.icon} className='fs--3'/>
        </span> */}
        <NavbarNavLink title="Operacional" route={{to:'/operational'}} icon={operacionalRoutes.icon} 
          click={() => {setSelected({Operacional:true})}} selected={selected.Operacional}
        />
        {/* <NavbarDropdown title="Operacional">
          <NavbarDropdownOperacional items={operacionalRoutes.children}/>
        </NavbarDropdown> */}
      </Flex>
    }
    {user && ((user.permissions && user.permissions.indexOf("ver_menu_operacional") !== -1) || user.is_superuser) &&
      <Flex>
        <NavbarNavLink title="Pipeline" route={{to:'/pipeline'}} icon={faKaaba} 
          click={() => {setSelected({Pipeline:true})}} selected={selected.Pipeline}
        />
      </Flex>
    }
    <Flex>
      <NavbarNavLink title="Comercial" icon={faCartPlus} route={{to:'/comercial'}} selected={selected.Comercial} 
        click={() => {setSelected({Comercial:true})}}
      />
      {/* <span className="nav-link-icon text-400 d-flex align-items-center">
        <FontAwesomeIcon icon={faCartPlus} />
      </span>
      <NavbarDropdown title="Comercial">
        <NavbarDropdownComercial items={ComercialRoutes.children}/>
      </NavbarDropdown> */}
    </Flex>
    {user && ((user.permissions && user.permissions.indexOf("ver_menu_credito") !== -1) || user.is_superuser) &&
      <Flex>
        <NavbarNavLink title="Crédito Rural" icon={creditoRoutes.icon} selected={selected.CreditoRural}
          click={() => {setSelected({CreditoRural:true})}} route={{to:'/credit'}}
        />
        {/* <span className="nav-link-icon text-400 d-flex align-items-center">
          <FontAwesomeIcon icon={creditoRoutes.icon} />
        </span>
        <NavbarDropdown title="Crédito Rural">
          <NavbarDropdownCredito items={creditoRoutes.children} key={1}/>
        </NavbarDropdown> */}
      </Flex>
    }
    {user && ((user.permissions && user.permissions.indexOf("ver_menu_ambiental") !== -1) || user.is_superuser) &&
      <Flex>
        <NavbarNavLink title="Ambiental" icon={ambientalRoutes.icon} icon2={ambientalRoutes.icon2} selected={selected.Ambiental}
          click={() => {setSelected({Ambiental:true})}} route={{to:'/ambiental'}}
        />
        {/* <span className="nav-link-icon text-400 d-flex align-items-center">
          <FontAwesomeIcon icon={ambientalRoutes.icon} />
        </span>
        <NavbarDropdown title="Ambiental">
          <NavbarDropdownAmbiental items={ambientalRoutes.children} />
        </NavbarDropdown> */}
      </Flex>
    }
    <Flex>
      <NavbarNavLink title="Dashboards" icon={dashboardRoutes.icon} selected={selected.Dashboards}
        click={() => {setSelected({Dashboards:true})}} route={{to:'/dashboard'}}
      />
      {/* <span className="nav-link-icon text-400 d-flex align-items-center">
        <FontAwesomeIcon icon={dashboardRoutes.icon} />
      </span>
      <NavbarDropdown title="Dashboards">
        <NavbarDropdownCredito items={dashboardRoutes.children} key={2}/>
      </NavbarDropdown> */}
    </Flex>
    <Flex>
      <NavbarNavLink title="Serviços" selected={selected.Servicos} click={() => {setSelected({Servicos:true})}} route={{to:'/services'}}/>
    </Flex>
    {/* <NavbarDropdown title="Serviços">
      <NavbarDropdownServicos items={servicosRoutes.children} />
    </NavbarDropdown> */}
    {user && ((user.permissions && user.permissions.indexOf("ver_menu_financeiro") !== -1) || user.is_superuser) &&
      <Flex>
        <NavbarNavLink title="Adm & Fin" selected={selected.AdmFin} click={() => {setSelected({AdmFin:true})}} route={{to:'/finances'}}/>
      </Flex>
      // <NavbarDropdown title="Adm & Fin">
      //   <NavbarDropdownFinanceiro items={financeiroRoutes.children} />
      // </NavbarDropdown>
    }
    {user.is_superuser && 
      <Flex>
        <NavbarNavLink title="Admin" selected={selected.Admin} click={() => {setSelected({Admin:true})}} route={{}}/>
      </Flex>
      // <NavbarDropdown title="Admin">
      //   <NavbarDropdownAdmin items={adminRoutes.children} />
      // </NavbarDropdown>
    }
    </>
  );
};

export default NavbarTopDropDownMenus;

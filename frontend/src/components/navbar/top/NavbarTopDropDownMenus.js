import React, { useState } from 'react';
import { operacionalRoutes, dashboardRoutes, ambientalRoutes, creditoRoutes } from '../../../Routes/siteMaps';
import Flex from '../../common/Flex';
import { faCartPlus, faDatabase, faKaaba } from '@fortawesome/free-solid-svg-icons';
import NavbarNavLink from './NavbarNavLink';

const NavbarTopDropDownMenus = () => {
  const [selected, setSelected] = useState({})
  const user = JSON.parse(localStorage.getItem("user"))

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
        <NavbarNavLink title="Operacional" route={{to:'/operational'}} icon={operacionalRoutes.icon} 
          click={() => {setSelected({Operacional:true})}} selected={selected.Operacional}
        />
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
    </Flex>
    {user && ((user.permissions && user.permissions.indexOf("ver_menu_credito") !== -1) || user.is_superuser) &&
      <Flex>
        <NavbarNavLink title="Crédito Rural" icon={creditoRoutes.icon} selected={selected.CreditoRural}
          click={() => {setSelected({CreditoRural:true})}} route={{to:'/credit'}}
        />
      </Flex>
    }
    {user && ((user.permissions && user.permissions.indexOf("ver_menu_ambiental") !== -1) || user.is_superuser) &&
      <Flex>
        <NavbarNavLink title="Ambiental" icon={ambientalRoutes.icon} icon2={ambientalRoutes.icon2} selected={selected.Ambiental}
          click={() => {setSelected({Ambiental:true})}} route={{to:'/ambiental'}}
        />
      </Flex>
    }
    <Flex>
      <NavbarNavLink title="Dashboards" icon={dashboardRoutes.icon} selected={selected.Dashboards}
        click={() => {setSelected({Dashboards:true})}} route={{to:'/dashboard'}}
      />
    </Flex>
    <Flex>
      <NavbarNavLink title="Serviços" selected={selected.Servicos} click={() => {setSelected({Servicos:true})}} route={{to:'/services'}}/>
    </Flex>
    {user && ((user.permissions && user.permissions.indexOf("ver_menu_financeiro") !== -1) || user.is_superuser) &&
      <Flex>
        <NavbarNavLink title="Adm & Fin" selected={selected.AdmFin} click={() => {setSelected({AdmFin:true})}} route={{to:'/finances'}}/>
      </Flex>
    }
    {user.is_superuser && 
      <Flex>
        <NavbarNavLink title="Admin" selected={selected.Admin} click={() => {setSelected({Admin:true})}} route={{to:'/admin'}}/>
      </Flex>
    }
    </>
  );
};

export default NavbarTopDropDownMenus;

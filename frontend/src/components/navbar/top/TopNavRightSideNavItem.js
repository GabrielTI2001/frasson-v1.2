import React from 'react';
import NotificationDropdown from '../../../components/navbar/top/NotificationDropdown';
import ProfileDropdown from '../../../components/navbar/top/ProfileDropdown';
import { Nav } from 'react-bootstrap';
import ThemeControlDropdown from './ThemeControlDropdown';
import { useAppContext } from '../../../Main';
import '../../../assets/css/home_style.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSliders } from '@fortawesome/free-solid-svg-icons';


const TopNavRightSideNavItem = () => {
  const { setConfig } = useAppContext();
  const handleClick = () => {
    setConfig('showSettingPanel', true);
  };

  return (
    <Nav
      navbar
      className="navbar-nav-icons ms-auto flex-row align-items-center"
      as="ul"
    >
      <ThemeControlDropdown />
      <NotificationDropdown />
      <ProfileDropdown />
    </Nav>
  );
};

export default TopNavRightSideNavItem;

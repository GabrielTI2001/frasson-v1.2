import React from 'react';
import NotificationDropdown from '../../../components/navbar/top/NotificationDropdown';
import ProfileDropdown from '../../../components/navbar/top/ProfileDropdown';
import { Nav } from 'react-bootstrap';
import '../../../assets/css/home_style.css'


const TopNavRightSideNavItem = () => {
  return (
    <Nav
      navbar
      className="navbar-nav-icons ms-auto flex-row align-items-center"
      as="ul"
    >
      <NotificationDropdown />
      <ProfileDropdown />
    </Nav>
  );
};

export default TopNavRightSideNavItem;

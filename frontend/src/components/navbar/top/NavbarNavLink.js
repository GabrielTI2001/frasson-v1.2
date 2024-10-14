import React from 'react';
import PropTypes from 'prop-types';
import { Nav } from 'react-bootstrap';
import classNames from 'classnames';
import { Link } from 'react-router-dom';
import { useAppContext } from '../../../Main';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as icons from 'react-bootstrap-icons';

const NavbarNavLink = ({ title, route, icon, icon2, click, selected }) => {
  const {
    config: { navbarCollapsed, showBurgerMenu },
    setConfig
  } = useAppContext();

  const BootstrapIcon = icon2 ? icons[icon2] : '';

  const handleClick = () => {
    if (route.name === 'Modal') {
      setConfig('openAuthModal', true);
    }
    if (navbarCollapsed) {
      setConfig('navbarCollapsed', !navbarCollapsed);
    }
    if (showBurgerMenu) {
      setConfig('showBurgerMenu', !showBurgerMenu);
    }
    click()
  };
  return (
    <Nav.Link as={Link}
      className={classNames('text-hover-black nav-not-hover', {
        'text-800': !selected, 'text-black': selected,
        // 'opacity-50': !route?.active,
        // 'mb-0 fw-bold opacity-100': title,
        // 'py-1': !title,
        // '': !title && route?.active,
        // 'px-0':true,
        // 'submenu-a': true,
        // 'nav-not-hover': true
      })}
      to={route?.to}
      onClick={handleClick}
    >
      {icon && <FontAwesomeIcon icon={icon} className='me-1 d-xl-inline d-sm-none'/>}
      {icon2 && <BootstrapIcon className='me-1 d-xl-inline d-sm-none'/>}
      {title ? title : route.name}
    </Nav.Link>
  );
};

NavbarNavLink.propTypes = {
  title: PropTypes.string,
  route: PropTypes.shape({
    // name: PropTypes.string.isRequired,
    // to: PropTypes.string.isRequired,
    active: PropTypes.bool
  })
};

export default NavbarNavLink;

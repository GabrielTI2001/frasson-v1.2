import React from 'react';
import PropTypes from 'prop-types';
import { Nav, Row, Col } from 'react-bootstrap';
import { getFlatRoutes } from '../../../helpers/utils';
import NavbarNavLink from './NavbarNavLink';

const NavbarDropdownAdmin = ({ items }) => {
  const routes = getFlatRoutes(items);
  return (
    <Row>{routes.admin && (
      <Col xs={12} md={12}>
        <Nav className="flex-column">
          {routes.admin.map(route => (
            <NavbarNavLink key={route.name} route={route} icon={route.icon}/>
          ))}
        </Nav>
      </Col>
      )}
    </Row>
  );
};

NavbarDropdownAdmin.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      icon: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
      name: PropTypes.string.isRequired,
      to: PropTypes.string,
      children: PropTypes.array
    }).isRequired
  ).isRequired
};

export default NavbarDropdownAdmin;

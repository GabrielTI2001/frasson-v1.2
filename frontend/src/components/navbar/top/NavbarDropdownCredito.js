import React from 'react';
import PropTypes from 'prop-types';
import { Nav, Row, Col } from 'react-bootstrap';
import { getFlatRoutes } from '../../../helpers/utils';
import NavbarNavLink from './NavbarNavLink';

const NavbarDropdownCredito = ({ items }) => {
  const routes = getFlatRoutes(items);
  
  return (
    <Row>{routes.teste && (
      <Col xs={12} md={12}>
        <Nav className="flex-column">
          <NavbarNavLink label="Teste" title="Teste"/>
          {routes.teste.slice(0,2).map(route => (
            <NavbarNavLink key={route.name} route={route} />
          ))}
        </Nav>
      </Col>
      )}
    </Row>
  );
};

NavbarDropdownCredito.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      icon: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
      name: PropTypes.string.isRequired,
      to: PropTypes.string,
      children: PropTypes.array
    }).isRequired
  ).isRequired
};

export default NavbarDropdownCredito;

import React from 'react';
import PropTypes from 'prop-types';
import { Nav, Row, Col } from 'react-bootstrap';
import NavbarNavLink from './NavbarNavLink';

const NavbarDropdownAdmin = ({ items }) => {
  return (
    <Row>
      <Col xs={12} md={12}>
        <Nav className="flex-column">
          {items[0].children.map(item=>(
              <NavbarNavLink key={item.name} route={item} icon={item.icon} icon2={item.icon2}/>
          ))}
        </Nav>
      </Col>
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

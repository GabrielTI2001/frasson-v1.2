import React from 'react';
import PropTypes from 'prop-types';
import { Nav, Row, Col } from 'react-bootstrap';
import { getFlatRoutes } from '../../../helpers/utils';
import NavbarNavLink from './NavbarNavLink';

const NavbarDropdownCredito = ({ items }) => {
  return (
    <Row>
      <Col xs={12} md={12}>
        <Nav className="flex-column">
          {items.map(filho=>(
            <React.Fragment key={filho.name}>
              <NavbarNavLink key={filho.name} title={filho.name}/>
              {filho.children.map((item) =>(
                <NavbarNavLink key={item.name} route={item} icon={item.icon} icon2={item.icon2} />
              ))}
            </React.Fragment>
          ))}
        </Nav>
      </Col>
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

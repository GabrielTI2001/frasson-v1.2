import React from 'react';
import PropTypes from 'prop-types';
import { Nav, Row, Col } from 'react-bootstrap';
import { getFlatRoutes } from '../../../helpers/utils';
import NavbarNavLink from './NavbarNavLink';

const NavbarDropdownFinanceiro = ({ items, closeDropdown }) => {
  const routes = getFlatRoutes(items);
  return (
    <Row>
      <Col xs={12} md={12}>
        <Nav className="flex-column">
          {items.map(item=>(
            <React.Fragment key={item.name}>
              <NavbarNavLink key={item.name} title={item.name}/>
              {item.children.map((li) =>(
                <NavbarNavLink key={li.name} route={li} icon={li.icon} icon2={li.icon2} click={closeDropdown}/>
              ))}
            </React.Fragment>
          ))}
        </Nav>
      </Col>
    </Row>
  );
};

NavbarDropdownFinanceiro.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      icon: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
      name: PropTypes.string.isRequired,
      to: PropTypes.string,
      children: PropTypes.array
    }).isRequired
  ).isRequired
};

export default NavbarDropdownFinanceiro;

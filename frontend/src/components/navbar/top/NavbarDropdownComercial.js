import React from 'react';
import { Nav, Row, Col } from 'react-bootstrap';
import NavbarNavLink from './NavbarNavLink';

const NavbarDropdownComercial = ({ items, closeDropdown}) => {
  return (
    <Row>
      <Col xs={12} md={12}>
        <Nav className="flex-column">
          {items.map(item=>(
            <React.Fragment key={item.name}>
              {/* <NavbarNavLink key={item.name} title={item.name}/> */}
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

export default NavbarDropdownComercial;

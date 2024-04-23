import React from 'react';
import { Nav, Row, Col } from 'react-bootstrap';
import NavbarNavLink from './NavbarNavLink';

const NavbarDropdownAmbiental = ({ items }) => {
  return (
    <Row>
      <Col xs={12} md={12}>
        <Nav className="flex-column">
          {items[0].children.map(filho=>(
            <React.Fragment key={filho.name}>
              <NavbarNavLink key={filho.name} title={filho.name}/>
              {filho.children.map((item) =>(
                <NavbarNavLink key={item.name} route={item} icon={item.icon} />
              ))}
            </React.Fragment>
          ))}
        </Nav>
      </Col>
    </Row>
  );
};

export default NavbarDropdownAmbiental;

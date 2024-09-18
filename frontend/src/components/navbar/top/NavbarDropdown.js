import React, { useState } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Link } from 'react-router-dom';
import { Card, Dropdown } from 'react-bootstrap';
// import AuthCornerImage from 'assets/img/illustrations/authentication-corner.png';
import { capitalize } from '../../../helpers/utils';

const NavbarDropdown = ({ title, children }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const closeDropdown = () => setDropdownOpen(false);
  return (
    <Dropdown
      show={dropdownOpen}
      onToggle={() => setDropdownOpen(!dropdownOpen)}
      className="me-3"
    >
      <Dropdown.Toggle as={Link} className="nav-link ps-1 fw-semi-bold text-body nav-not-hover dropdown-caret-none">
        {capitalize(title)}
      </Dropdown.Toggle>
      <Dropdown.Menu className="dropdown-menu-card mt-0">
        {/* {children} */}
        <Card
          className={classNames('shadow-none dark__bg-1000', {
            'navbar-card-app': title === 'app',
            'navbar-card-pages': title === 'pages',
            'navbar-card-components': title === 'modules'
          })}
        >
          <Card.Body
            className={classNames('scrollbar max-h-dropdown', {
              'p-0 py-2': title === 'dashboard' || title === 'documentation'
            })}
          >
            {/* {title !== 'dashboard' && title !== 'documentation' && (
              <img
                src={AuthCornerImage}
                alt=""
                className="img-dropdown"
                width={130}
              />
            )} */}
            {React.cloneElement(children, { closeDropdown })}
          </Card.Body>
        </Card>
      </Dropdown.Menu>
    </Dropdown>
  );
};

NavbarDropdown.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node
};

export default NavbarDropdown;

import React from 'react';
import { Link } from 'react-router-dom';
import { Dropdown } from 'react-bootstrap';
import Avatar from '../../common/Avatar';
import { useContext } from 'react';
import { ProfileContext } from '../../../context/Context';

const ProfileDropdown = () => {
  const {profileState:{perfil}} = useContext(ProfileContext)
  return (
    <Dropdown navbar={true} as="li">
      <Dropdown.Toggle
        bsPrefix="toggle"
        as={Link}
        className="pe-0 ps-2 nav-link"
      >
        {perfil.avatar && <Avatar src={`${process.env.REACT_APP_API_URL}/${perfil.avatar}`} size={'l'}></Avatar>}
      </Dropdown.Toggle>

      <Dropdown.Menu className="dropdown-caret dropdown-menu-card  dropdown-menu-end">
        <div className="bg-white rounded-2 py-2 dark__bg-1000">
          <Dropdown.Item href="#!">Set status</Dropdown.Item>
          <Dropdown.Item as={Link} to="/user/profile">
            Profile &amp; account
          </Dropdown.Item>
          <Dropdown.Item href="#!">Feedback</Dropdown.Item>
          <Dropdown.Divider />
          <Dropdown.Item as={Link} to="/user/settings">
            Settings
          </Dropdown.Item>
          <Dropdown.Item as={Link} to="/auth/logout">
            Logout
          </Dropdown.Item>
        </div>
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default ProfileDropdown;

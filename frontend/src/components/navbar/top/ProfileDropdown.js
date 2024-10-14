import React from 'react';
import { Link } from 'react-router-dom';
import { Dropdown } from 'react-bootstrap';
import Avatar from '../../common/Avatar';
import { useContext } from 'react';
import { ProfileContext } from '../../../context/Context';

const ProfileDropdown = () => {
  const {profileState:{perfil}} = useContext(ProfileContext)
  return (perfil &&
    <Dropdown navbar={true} as="li">
      <Dropdown.Toggle
        bsPrefix="toggle"
        as={Link}
        className="px-1 text-800 d-flex align-items-center"
      >
        {perfil.avatar && <Avatar src={`${perfil.avatar}`} size={'l'}></Avatar>}
      </Dropdown.Toggle>

      <Dropdown.Menu className="dropdown-caret dropdown-menu-card  dropdown-menu-end">
        <div className="bg-white rounded-2 py-2 dark__bg-1000">
          <div className='text-center pt-3'>
            {perfil.avatar && <Avatar src={`${perfil.avatar}`} size={'2xl'}></Avatar>}
            <h6 className='fw-bold mb-1'>{perfil.first_name} {perfil.last_name}</h6>
            <h6 className='text-600 fs--2'>{perfil.job_function || perfil.email}</h6>
          </div>
          <Dropdown.Divider />
          <Dropdown.Item as={Link} to="/profile">
            Editar Perfil
          </Dropdown.Item>
          <Dropdown.Divider />
          <Dropdown.Item as={Link} to="/auth/logout">
            Logout
          </Dropdown.Item>
        </div>
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default ProfileDropdown;

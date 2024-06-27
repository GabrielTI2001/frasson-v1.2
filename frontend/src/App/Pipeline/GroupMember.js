import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Avatar from '../../components/common/Avatar';
import { Dropdown, Form, Nav, OverlayTrigger, Tooltip } from 'react-bootstrap';
import classNames from 'classnames';
import { useAppContext } from '../../Main';

const GroupMember = ({
  avatarSize = 'l',
  users,
  showMember = 4,
  addMember,
  className
}) => {
  const {
    config: { isRTL }
  } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className={className}>
      {users.slice(0, showMember).map((user, index) => (
        <nav
          key={user.id}
          disabled
          className={classNames('d-inline p-0', {
            'ms-n2': index > 0
          })}
          data-bs-toggle="tooltip" title={user.nome}
        >
          <Avatar src={`${process.env.REACT_APP_API_URL}/${user.avatar}`} size={avatarSize} 
            className='rounded-circle border border-2 border-white'/>
        </nav>
      ))}
    </div>
  );
};

GroupMember.propTypes = {
  avatarSize: PropTypes.string,
  users: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      name: PropTypes.string,
      img: PropTypes.string,
      role: PropTypes.string
    })
  ).isRequired,
  showMember: PropTypes.number,
  addMember: PropTypes.bool,
  className: PropTypes.string
};

export default GroupMember;

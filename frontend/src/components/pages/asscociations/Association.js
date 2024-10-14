import React from 'react';
import PropTypes from 'prop-types';
import Flex from '../../common/Flex';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link } from 'react-router-dom';
import * as icons from 'react-bootstrap-icons';

const Association = ({ image, title, description, icon, to, icon2 }) => {
  const BootstrapIcon = icon2 ? icons[icon2] : '';

  return (<Flex alignItems="center" className="position-relative mb-2">
    {image && <img className="me-2 rounded-3" src={image} width={50} alt="" />}
    {icon && <FontAwesomeIcon icon={icon} className='fa-3x me-2'/>}
    {icon2 && <BootstrapIcon className='me-2 fs-4'/>}
    <div>
      <h6 className="fs-0 mb-0">
        <Link className="stretched-link fs--1" to={to}>
          {title}
        </Link>
      </h6>
      <div className="mb-1 text-800">{description}</div>
    </div>
  </Flex>)
};

Association.propTypes = {
  title: PropTypes.string.isRequired,
};

export default Association;

import React, { useState } from 'react';
import { Nav } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link } from 'react-router-dom';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faCopy, faArrowRight, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
library.add(faCopy, faArrowRight, faTrashAlt);
const ModalSidebar = () => {
  // const [addToCardMenu] = useState([
  //   { icon: 'user', title: 'Members', link: '#!' },
  //   { icon: 'tag', title: 'Label', link: '#!' },
  //   { icon: 'paperclip', title: 'Attachments', link: '#!' },
  //   { icon: 'check', title: 'Checklists', link: '#!' }
  // ]);

  const [actionMenu] = useState([
    { icon: faCopy, title: 'Copy', link: '#!' },
    { icon: faArrowRight, title: 'Move', link: '#!' },
    { icon: faTrashAlt, title: 'Remove', link: '#!' }
  ]);
  return (
    <>
      <h6 className="mt-3">Actions</h6>
      {actionMenu.map(menu => (
        <Nav key={menu.title} className="flex-lg-column fs--1">
          <Nav.Item className="me-2 me-lg-0">
            <Nav.Link as={Link} to="#!" className="nav-link-card-details">
              <FontAwesomeIcon icon={menu.icon} className="me-2" />
              {menu.title}
            </Nav.Link>
          </Nav.Item>
        </Nav>
      ))}
    </>
  );
};

export default ModalSidebar;

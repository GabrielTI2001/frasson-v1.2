import React, { useContext, useState } from 'react';
import { Dropdown} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import AppContext from '../../context/Context';
import { faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import ModalDeleteCard from '../../components/Custom/ModalDeleteCard';

export const DropMenu = ({ record, reducer }) => {
  const [modaldel, setModaldel] = useState({show:false})
  const navigate = useNavigate()

  const {
    config: { isRTL }
  } = useContext(AppContext);

  const handledelete = (type, uuid) =>{
    navigate(`/glebas/`)
    reducer(type, uuid)
  }

  return (
    <Dropdown
      onClick={e => e.stopPropagation()}
      align="end"
      className="font-sans-serif"
    >
      <Dropdown.Toggle
        variant="falcon-default"
        size="sm"
        className="kanban-item-dropdown-btn btn-circle hover-actions dropdown-caret-none d-flex flex-center py-2 px-3 shadow-none"
      >
        <FontAwesomeIcon icon={faEllipsisV} transform="shrink-2" className='fs-2'/>
      </Dropdown.Toggle>
      <Dropdown.Menu className="py-0" align={isRTL ? 'start' : 'end'}>
        <Dropdown.Item onClick={() => {setModaldel({show:true, link:`${process.env.REACT_APP_API_URL}/glebas/index/${record.uuid}/`})}}>
          Excluir Gleba
        </Dropdown.Item>
      </Dropdown.Menu>
      <ModalDeleteCard name='registro' show={modaldel.show} link={modaldel.link} update={handledelete} close={() => setModaldel({show:false})}/>
    </Dropdown>
  );
};

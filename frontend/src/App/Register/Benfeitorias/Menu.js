import React, { useContext, useState } from 'react';
// import PropTypes from 'prop-types';
import { Card, Dropdown} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import SoftBadge from 'components/common/SoftBadge';
import { Draggable } from '@hello-pangea/dnd';
import AppContext from '../../../context/Context';
// import api from 'data/kanban2';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faEllipsisH, faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import SubtleBadge from '../../../components/common/SubtleBadge';
import { useNavigate, useParams } from 'react-router-dom';
import ModalDelete from '../../../components/Custom/ModalDelete';
import api from '../../../context/data';
import { toast } from 'react-toastify';
import ModalDeleteCard from '../../../components/Custom/ModalDeleteCard';

// Adicione os ícones à biblioteca
library.add(faEllipsisH);

const options = {
  month: "short",
  day: "numeric",
  timeZone: 'UTC'
};

export const calcdif = (data) => {
  const dif = (new Date(data) - new Date())/(24 * 60 * 60 * 1000)
  return dif
};

export const DropMenu = ({ record, reducer }) => {
  const [modaldel, setModaldel] = useState({show:false})
  const navigate = useNavigate()

  const {
    config: { isRTL }
  } = useContext(AppContext);

  const handledelete = (type, uuid) =>{
    navigate(`/register/pessoal`)
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
        <Dropdown.Item onClick={() => {setModaldel({show:true, link:`${process.env.REACT_APP_API_URL}/register/pessoal/${record.uuid}/`})}}>
          Excluir Análise
        </Dropdown.Item>
      </Dropdown.Menu>
      <ModalDeleteCard name='registro' show={modaldel.show} link={modaldel.link} update={handledelete} close={() => setModaldel({show:false})}/>
    </Dropdown>
  );
};

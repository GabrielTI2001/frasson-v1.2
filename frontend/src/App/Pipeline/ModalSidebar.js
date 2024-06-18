import React, { useContext, useState } from 'react';
import { Nav } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link, useNavigate } from 'react-router-dom';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faCopy, faArrowRight, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { PipeContext } from '../../context/Context';
import ModalDelete from '../../components/Custom/ModalDelete';
import api from '../../context/data';
import { toast } from 'react-toastify';

const ModalSidebar = ({code, id, pipe}) => {
  const {kanbanState: {kanbanModal}, kanbanDispatch} = useContext(PipeContext);
  const token = localStorage.getItem("token")
  const [modaldel, setModaldel] = useState({show:false})
  const navigate = useNavigate()

  const handleClose = () => {
    navigate(`/pipeline/${pipe}`)
    kanbanDispatch({ type: 'TOGGLE_KANBAN_MODAL' });
  };

  const handledelete = () =>{
    api.delete(`pipeline/cards/${pipe}/${code}/`, { headers: {Authorization: `bearer ${token}`} })
    .then((response) => {
      kanbanDispatch({
        type: 'REMOVE_TASK_CARD',
        payload: {idcard: id}
      });
      toast.success("Card Deletado com Sucesso!")
      handleClose()
    })
    .catch((erro) => {
      console.error('erro: '+erro);
    })
  }
  const [actionMenu] = useState([
    { icon: faCopy, title: 'Copy', link: '#!' },
    { icon: faArrowRight, title: 'Move', link: '#!' },
    { icon: faTrashAlt, title: 'Remove', link: '#!', 
      click:() => {setModaldel({show:true, link:`${process.env.REACT_APP_API_URL}/pipeline/cards/${pipe}/${code}/`})}
    }
  ]);
  return (
    <>
      <h6 className="mt-3">Actions</h6>
      {actionMenu.map(menu => (
        <Nav key={menu.title} className="flex-lg-column fs--1">
          <Nav.Item className="me-2 me-lg-0">
            <Nav.Link as={Link} className="nav-link-card-details" onClick={menu.click}>
              <FontAwesomeIcon icon={menu.icon} className="me-2" />
              {menu.title}
            </Nav.Link>
          </Nav.Item>
        </Nav>
      ))}
      <ModalDelete />
      <ModalDelete show={modaldel.show} link={modaldel.link} update={handledelete} close={() => setModaldel({show:false})}/>
    </>
  );
};

export default ModalSidebar;

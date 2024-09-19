import React, { useContext, useEffect, useState } from 'react';
import { CloseButton, Modal, Nav } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link, useNavigate } from 'react-router-dom';
import { faArrowLeft, faArrowRight, faGear } from '@fortawesome/free-solid-svg-icons';
import { PipeContext } from '../../context/Context';
import ModalDelete from '../../components/Custom/ModalDelete';
import api from '../../context/data';
import { toast } from 'react-toastify';
import ConfigMoverCard from './ConfigMover';
import { GetRecord } from '../../helpers/Data';
import { RedirectToLogin } from '../../Routes/PrivateRoute';

const SOCKET_SERVER_URL = `${process.env.REACT_APP_WS_URL}/pipeline/`;

const ModalSidebar = ({card, pipe, move}) => {
  const {kanbanState, kanbanDispatch} = useContext(PipeContext);
  const link = card.pipe_code === 518984924 ? 'prospects' : card.pipe_code === 518984721 ? 'gestao-ambiental' : 'gestao-credito';
  const token = localStorage.getItem("token")
  const user = JSON.parse(localStorage.getItem("user"))
  const [socket, setSocket] = useState()
  const [modaldel, setModaldel] = useState({show:false})
  const [modal, setModal] = useState({show:false})
  const navigate = useNavigate()
  const [actionMenu, setActionMenu] = useState();

  const handleClose = () => {
    navigate(`/pipeline/${pipe}`)
    kanbanDispatch({ type: 'TOGGLE_KANBAN_MODAL' });
  };

  const handleMove = (id) => {
    const result = {destination: {droppableId: id, index: 0}, source: {index: 0, droppableId: card.phase}, code:card.code}
    api.put(`pipeline/fluxos/${link}/${card.code}/`, {'phase':id, 'user':user.id}, {headers: {Authorization: `Bearer ${token}`}})
    .then((response) => {
      move("movecardproduto", result, response.data.code)
      toast.success(`Card movido com sucesso para ${response.data.str_fase}`)
      kanbanDispatch({
        type: 'SET_DATA',
        payload: {
          fases:null, pipe:null
        }
      })
      navigate(`/pipeline/${pipe}`)
      kanbanDispatch({ type: 'TOGGLE_KANBAN_MODAL' });
    })
    .catch((erro) => {
      if (erro.response.status === 400){
        toast.error(erro.response.data.phase[0])
      }
      if (erro.response.status === 401){
        localStorage.setItem("login", JSON.stringify(false));
        localStorage.setItem('token', "");
        RedirectToLogin(navigate)
      }
      console.error('erro: '+erro);
    })
  };

  const handledelete = () =>{
    kanbanDispatch({
      type: 'REMOVE_TASK_CARD',
      payload: {idcard: card.id}
    });
    toast.success("Card Deletado com Sucesso!")
    handleClose()
  }
  
  const update = (type, data) =>{
    setActionMenu([...data.map(f => ({ title: f.descricao, id:f.id, click:() => handleMove(f.id)}))])
    setModal({show:false})
  }

  useEffect(() =>{
    const getfase = async () => {
      const fase = await GetRecord(card.phase, 'pipeline/fases')
      if (fase === null){
        RedirectToLogin(navigate)
      }
      else{
        setActionMenu([...fase.list_destinos.map(f => ({ title: f.descricao, id:f.id, click:() => handleMove(f.id)}))])
      }
    }
    getfase()
  }, [card])
  useEffect(() =>{
    setSocket(new WebSocket(SOCKET_SERVER_URL));
  }, [])

  return (
    <>
      <h6 className="mt-4 fs-0 fw-bold">Mover Para Fase</h6>
      {actionMenu && actionMenu.map(menu => (
        <Nav key={menu.id} className="flex-lg-column fs--2">
          <Nav.Item className={`me-2 me-lg-0`}>
            {card.phase === menu.id ?
              <hr className='my-1'></hr>
            :
            <Nav.Link className={`px-2 ${card.phase > menu.id ? 'nav-link-secondary nav-not-hover' : ''}`} onClick={menu.click}
            >
              <FontAwesomeIcon icon={card.phase > menu.id ? faArrowLeft : faArrowRight} className="me-2" />
              {menu.title.length > 16 ? menu.title.slice(0, 17)+'...' : menu.title}
            </Nav.Link>
            }
          </Nav.Item>
        </Nav>
      ))}

      {user.is_superuser &&
        <Nav className='fs--1'>
          <Nav.Item>
            <Nav.Link className='nav-not-hover px-2 link-secondary' onClick={() => setModal({show:true})}>
              <FontAwesomeIcon icon={faGear}/> Configurar mover cards
            </Nav.Link>
          </Nav.Item>
        </Nav>
      }

      <Modal show={modal.show} onHide={() => setModal({show:false})} className="align-items-center"
        dialogClassName="p-3" backdrop={false}
      >
        <Modal.Header className='border-bottom-0 pb-1'>
          <CloseButton onClick={() => setModal({show:false})} className='btn btn-sm btn-circle p-0'/>
        </Modal.Header>
        <Modal.Body className='p-3 pt-0'>
          <div className='mb-2 fs--1'>
            <h5 className='fw-bold'>Configurar mover cards</h5>
            <p>Os cards podem ser movidos da fase <b>{card.str_fase}</b> para as fases que você selecionar a seguir.</p>
          </div>
          <ConfigMoverCard card={card} type='edit' submit={update}/>
        </Modal.Body>
      </Modal>

      <ModalDelete show={modaldel.show} link={modaldel.link} update={handledelete} close={() => setModaldel({show:false})}/>
    </>
  );
};

export default ModalSidebar;

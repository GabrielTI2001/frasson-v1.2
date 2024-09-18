import React, { useEffect, useState } from 'react';
import { Nav } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useNavigate } from 'react-router-dom';
import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import api from '../../../context/data';
import { toast } from 'react-toastify';
import { RedirectToLogin } from '../../../Routes/PrivateRoute';

export const ModalSidebarCobranca = ({card, move, reducer}) => {
  const token = localStorage.getItem("token")
  const user = JSON.parse(localStorage.getItem("user"))
  const navigate = useNavigate()
  const [actionMenu, setActionMenu] = useState();
  const fases = {'AD':'Aguardando Distribuição', 'NT':'Notificação', 'FT':'Faturamento', 'AG':'Agendado', 'PG':'Pago'}

  const handleMove = (value, title) => {
    api.put(`finances/revenues/${card.uuid}/`, {'status':value, 'user':user.id}, {headers: {Authorization: `Bearer ${token}`}})
    .then((response) => {
      toast.success(`Status alterado com sucesso para ${title}`)
      reducer('edit', response.data)
      navigate(`/finances/revenues`)
    })
    .catch((erro) => {
      if (erro.response.status === 400){
        toast.error(erro.response.data.status[0])
      }
      if (erro.response.status === 401){
        localStorage.setItem("login", JSON.stringify(false));
        localStorage.setItem('token', "");
        RedirectToLogin(navigate)
      }
      console.error('erro: '+erro);
    })
  };

  useEffect(() =>{
    const getfase = async () => {
      setActionMenu(Object.keys(fases).map((key, index) => ({index:index, title: fases[key], value:key, 
        click:() => handleMove(key, fases[key])
      })))
    }
    getfase()
  }, [])

  return (
    <>
      <h6 className="mt-1 fs-0 fw-bold">Ações</h6>
      {card && actionMenu && actionMenu.map(menu => (
        <Nav key={menu.value} className="flex-lg-column fs--2">
          <Nav.Item className={`me-2 me-lg-0`}>
            {card.status === menu.value ?
              <hr className='my-1'></hr>
            : Math.abs(actionMenu.find(m => m.value === card.status).index - menu.index) === 1 &&
            <>
              <Nav.Link className={`px-2 ${actionMenu.find(m => m.value === card.status).index > menu.index 
                ? 'nav-link-secondary nav-not-hover' : ''}`} onClick={menu.click}
              >
                <FontAwesomeIcon icon={actionMenu.find(m => m.value === card.status).index > menu.index ? faArrowLeft : faArrowRight} 
                  className="me-2" 
                />
              {menu.title.length > 16 ? menu.title.slice(0, 17)+'...' : menu.title}
            </Nav.Link></>
            }
          </Nav.Item>
        </Nav>
      ))}
    </>
  );
};


const ModalSidebarPagamentos = ({card, move, reducer}) => {
  const token = localStorage.getItem("token")
  const user = JSON.parse(localStorage.getItem("user"))
  const navigate = useNavigate()
  const [actionMenu, setActionMenu] = useState();
  const fases = {'AD':'Aguardando Distribuição', 'AG':'Agendado', 'PG':'Pago'}

  const handleMove = (value, title) => {
    api.put(`finances/billings/${card.uuid}/`, {'status':value, 'user':user.id}, {headers: {Authorization: `Bearer ${token}`}})
    .then((response) => {
      toast.success(`Status alterado com sucesso para ${title}`)
      reducer('edit', response.data)
      navigate(`/finances/billings`)
    })
    .catch((erro) => {
      if (erro.response.status === 400){
        toast.error(erro.response.data.status[0])
      }
      if (erro.response.status === 401){
        localStorage.setItem("login", JSON.stringify(false));
        localStorage.setItem('token', "");
        RedirectToLogin(navigate)
      }
      console.error('erro: '+erro);
    })
  };

  useEffect(() =>{
    const getfase = async () => {
      setActionMenu(Object.keys(fases).map((key, index) => ({index:index, title: fases[key], value:key, 
        click:() => handleMove(key, fases[key])
      })))
    }
    getfase()
  }, [])

  return (
    <>
      <h6 className="mt-1 fs-0 fw-bold">Ações</h6>
      {card && actionMenu && actionMenu.map(menu => (
        <Nav key={menu.value} className="flex-lg-column fs--2">
          <Nav.Item className={`me-2 me-lg-0`}>
            {card.status === menu.value ?
              <hr className='my-1'></hr>
            : Math.abs(actionMenu.find(m => m.value === card.status).index - menu.index) === 1 &&
            <>
              <Nav.Link className={`px-2 ${actionMenu.find(m => m.value === card.status).index > menu.index 
                ? 'nav-link-secondary nav-not-hover' : ''}`} onClick={menu.click}
              >
                <FontAwesomeIcon icon={actionMenu.find(m => m.value === card.status).index > menu.index ? faArrowLeft : faArrowRight} 
                  className="me-2" 
                />
              {menu.title.length > 16 ? menu.title.slice(0, 17)+'...' : menu.title}
            </Nav.Link></>
            }
          </Nav.Item>
        </Nav>
      ))}
    </>
  );
};

export default ModalSidebarPagamentos;

import React, { useEffect, useState } from 'react';
import { Nav } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link, useNavigate } from 'react-router-dom';
import { faArrowLeft, faArrowRight, faCheck, faGear } from '@fortawesome/free-solid-svg-icons'
import ModalDelete from '../../../components/Custom/ModalDelete';
import api from '../../../context/data';
import { toast } from 'react-toastify';
import { GetRecord } from '../../../helpers/Data';

const ModalSidebar = ({card, reducer}) => {
  const token = localStorage.getItem("token")
  const user = JSON.parse(localStorage.getItem("user"))
  const navigate = useNavigate()

  const handleClose = () => {
    navigate(`/pvtec/${card.uuid}`)
  };

  const handleConcluir = (id) => {
    const formDataToSend = new FormData();
    formDataToSend.append('status', 'OK')
    formDataToSend.append('user', user.id)
    api.put(`pipeline/pvtec/${card.uuid}/`, formDataToSend, {headers: {Authorization: `bearer ${token}`}})
    .then((response) => {
      reducer(response.data)
      toast.success(`PVTEC concluída com sucesso`)
    })
    .catch((erro) => {
      if (erro.response.status === 400){
        toast.error(erro.response.data.phase[0])
      }
      console.error('erro: '+erro);
    })
  };

  useEffect(() =>{
  }, [])

  return (
    <>
      <h6 className="mt-1 fs-0 fw-bold">Ações</h6>
      <Nav className="flex-lg-column fs--1">
        {card.status !== 'OK' && 
          <Nav.Item className={`me-2 me-lg-0`}>
            <Nav.Link className={`px-2 nav-link link-success`} 
              onClick={handleConcluir}
            >
              <FontAwesomeIcon icon={faCheck} className="me-2" />Concluir PVTEC
            </Nav.Link>
          </Nav.Item>
        }
      </Nav>
    </>
  );
};

export default ModalSidebar;

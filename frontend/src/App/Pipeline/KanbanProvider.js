import React, { useReducer, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PipeContext } from '../../context/Context';
import { kanbanReducer } from '../../reducers/pipeproductReducer';

const KanbanProvider = ({ children, code }) => {
  const token = localStorage.getItem("token")
  const navigate = useNavigate();
  const [kanbanState, kanbanDispatch] = useReducer(kanbanReducer, {
    pipe: {},
    kanbanModal: {
      show: false,
      modalContent: {}
    }
  });

  const currentUser = {
    name: 'Emma',
    // avatarSrc: currentUserAvatar,
    profileLink: '/user/profile',
    institutionLink: '#!'
  };

  const fetchData = async () => {
    try {
      //Faça a solicitação com o token
      const apiUrl = `${process.env.REACT_APP_API_URL}/pipeline/pipes/${code}/`;
      const response = await fetch(apiUrl, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 401) {
        // Token inválido, redirecione para a página de login
        navigate('/authentication/login');
        return;
      }
      else if (response.status === 200){
        const data = await response.json();
        kanbanDispatch({
          type: 'SET_DATA',
          payload: {
            fases: data.fase_set,
            pipe: data,
            kanbanModal: {show: false, modalContent: {}}
            // ... outras propriedades conforme necessário
          }
        });
      }
      else if (response.status === 404){
        navigate("/errors/404")
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <PipeContext.Provider
      value={{ kanbanState, kanbanDispatch, currentUser }}
    >
      {children}
    </PipeContext.Provider>
  );
};

export default KanbanProvider;


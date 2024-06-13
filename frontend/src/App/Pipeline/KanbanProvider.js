import React, { useReducer, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PipeContext } from '../../context/Context';
import { kanbanReducer } from '../../reducers/pipeproductReducer';

const KanbanProvider = ({ children, id }) => {
  // const {uuid} = useParams();
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
      const apiUrl = `http://localhost:8000/pipeline/pipes/${id}/`;
      const response = await fetch(apiUrl, {
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 401) {
        // Token inválido, redirecione para a página de login
        navigate('/authentication/login');
        return;
      }

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
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };

  useEffect(() => {
    // Execute a função fetchData apenas se ainda não estiver inicializado
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


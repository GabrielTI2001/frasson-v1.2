import React, { useReducer, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PipeContext } from '../../context/Context';
import { kanbanReducer } from '../../reducers/pipeproductReducer';
import { RedirectToLogin } from '../../Routes/PrivateRoute';

const KanbanProvider = ({ children, code }) => {
  const token = localStorage.getItem("token")
  const item = code === 518984924 ? 'fluxo_prospects_set' : code === 518984721 ? 'fluxo_gestao_ambiental_set' : 'fluxo_gestao_credito_set';
  const navigate = useNavigate();
  const [kanbanState, kanbanDispatch] = useReducer(kanbanReducer, {
    pipe: {},
    kanbanModal: {
      show: false,
      modalContent: {}
    }
  });

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
        RedirectToLogin(navigate)
      }
      else if (response.status === 200){
        const data = await response.json();
        kanbanDispatch({
          type: 'SET_DATA',
          payload: {
            fases: data.fase_set.map(f => ({...f, card_set:f[item]})),
            pipe: {code:data.code, pessoas:data.pessoas, descricao:data.descricao, id:data.id},
            kanbanModal: {show: false, modalContent: {}},
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
    if (!kanbanState.fases){
      fetchData();
    }
  }, [kanbanState]);

  return (
    <PipeContext.Provider
      value={{ kanbanState, kanbanDispatch}}
    >
      {children}
    </PipeContext.Provider>
  );
};

export default KanbanProvider;


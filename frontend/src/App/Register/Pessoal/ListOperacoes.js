import React, { useEffect, useState } from 'react';
import {Spinner} from 'react-bootstrap';
import { useAppContext } from "../../../Main";
import { useNavigate } from 'react-router-dom';
import CardInfo from '../../Pipeline/CardInfo';
import { RedirectToLogin } from '../../../Routes/PrivateRoute';

const ListOperacoes = ({record}) => {
    const {config: {theme}} = useAppContext();
    const [operacoes, setOperacoes] = useState()
    const token = localStorage.getItem("token")
    const navigate = useNavigate();

    useEffect(() =>{
        const getOperacoes = async (params) =>{
            try{
                const response = await fetch(`${process.env.REACT_APP_API_URL}/credit/operacoes-contratadas/?${params}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                });
                if (response.status === 401){
                    localStorage.setItem("login", JSON.stringify(false));
                    RedirectToLogin(navigate);
                }
                else if (response.status === 200){
                    const data = await response.json();
                    setOperacoes(data)
                }
            } catch (error){
                console.error("Erro: ",error)
            }            
        }
        if (!operacoes && record){
            getOperacoes(`beneficiario=${record.id}`)
        }
    },[])


    return (
        <>
        <div className="mb-2"><span className="fw-bold text-info-emphasis">{record.razao_social} tem {operacoes && operacoes.length} operações em andamento</span></div>
        {operacoes ? 
            operacoes.map(o => 
                <div className="rounded-top-lg pt-1 pb-0 mb-2" key={o.id}>
                    <CardInfo 
                        data={o}
                        title={Number(o.valor_operacao).toLocaleString('pt-br', {style:'currency', currency:'BRL'})} 
                        attr2='data_emissao_cedula'
                        title2={new Date(o.data_emissao_cedula).toLocaleDateString('pt-br', {timeZone:'UTC'})}
                    />
                </div>
            ) 
        : <div className="text-center"><Spinner></Spinner></div>}
        </>
    );
  };
  
  export default ListOperacoes;
  
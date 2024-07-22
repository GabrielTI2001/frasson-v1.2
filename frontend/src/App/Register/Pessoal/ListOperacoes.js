import React, { useEffect, useState } from 'react';
import {Spinner} from 'react-bootstrap';
import { useAppContext } from "../../../Main";
import {Table} from "react-bootstrap";
import { useNavigate } from 'react-router-dom';
import CardInfo from '../../Pipeline/CardInfo';

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
                    navigate("/auth/login");
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
                    <CardInfo data={o} title2='Data: ' attr1='valor_operacao' attr2='data_emissao_cedula'/>
                </div>
            )
        // <Table responsive hover>
        //     <thead className="bg-300">
        //         <tr>
        //             <th scope="col" className="text-center">Data</th>
        //             <th scope="col" className="text-center">N° Operação</th>
        //             <th scope="col" className="text-center">Instituição</th>
        //             <th scope="col" className="text-center">Item</th>
        //             <th scope="col" className="text-center">Taxa Juros (%)</th>
        //             <th scope="col" className="text-center">Valor Operação (R$)</th>
        //             <th scope="col" className="text-center">Data Vencimento</th>
        //         </tr>
        //     </thead>
        //     {/* #d8e2ef */}
        //     <tbody className={`${theme === 'light' ? 'bg-light': 'bg-200'}`}>
        //     {operacoes.map(operacao =>(
        //     <tr key={operacao.id} className={`${theme === 'light' ? 'hover-table-light': 'hover-table-dark'}`}>
        //         <td className="text-center">{new Date(operacao.data_emissao_cedula).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</td>
        //         <td className="text-center">{operacao.numero_operaco}</td>
        //         <td className="text-center">{operacao.name_instituicao}</td>
        //         <td className="text-center">{operacao.name_item}</td>
        //         <td className="text-center">{operacao.taxa_juros ? Number(operacao.taxa_juros).toLocaleString('pt-BR',
        //          {minimumFractionDigits: 2, maximumFractionDigits:2}): '-'}</td>
        //         <td className="text-center">{operacao.taxa_juros ? Number(operacao.valor_operacao).toLocaleString('pt-BR',
        //          {minimumFractionDigits: 2, maximumFractionDigits:2}): '-'}</td>
        //         <td className="text-center">{new Date(operacao.data_vencimento).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</td>
        //     </tr>
        //     ))}
        //     </tbody>
        // </Table>  
        : <div className="text-center"><Spinner></Spinner></div>}
        </>
    );
  };
  
  export default ListOperacoes;
  
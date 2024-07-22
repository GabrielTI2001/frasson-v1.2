import React, { useEffect, useState } from 'react';
import {Spinner} from 'react-bootstrap';
import { useAppContext } from "../../../Main";
import {Table} from "react-bootstrap";
import { useNavigate } from 'react-router-dom';
import CardInfo from '../../Pipeline/CardInfo';

const ListProcessos = ({record}) => {
    const {config: {theme}} = useAppContext();
    const [processos, setProcessos] = useState()
    const token = localStorage.getItem("token")
    const navigate = useNavigate();

    useEffect(() =>{
        const getProcessos = async (params) =>{
            try{
                const response = await fetch(`${process.env.REACT_APP_API_URL}/pipeline/fluxos/gestao-ambiental/?${params}`, {
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
                    setProcessos(data)
                }
            } catch (error){
                console.error("Erro: ",error)
            }            
        }
        if (!processos && record){
            getProcessos(`beneficiario=${record.id}`)
        }
    },[])


    return (
        <>
        <div className="mb-2"><span className="fw-bold text-info-emphasis">{record.razao_social} tem {processos && processos.length} processo(s) em andamento</span></div>
        {processos ? 
            processos.map(p => 
                <div className="rounded-top-lg pt-1 pb-0 mb-2" key={p.id}>
                    <CardInfo data={p} title2='Em: ' attr1='str_detalhamento' attr2='str_fase' url='pipeline/518984721/processo' pk='code'/>
                </div>
            )
        // <Table responsive hover>
        //     <thead className="bg-300">
        //         <tr>
        //             <th scope="col" className="text-center">Produto</th>
        //             <th scope="col" className="text-center">Detalhamento</th>
        //             <th scope="col" className="text-center">Instituição</th>
        //             <th scope="col" className="text-center">Valor Operação</th>
        //             <th scope="col" className="text-center">Fase Atual</th>
        //             <th scope="col" className="text-center">Aberto Em</th>
        //         </tr>
        //     </thead>
        //     <tbody className={`${theme === 'light' ? 'bg-light': 'bg-200'}`}>
        //     {processos.map(processo =>(
        //     <tr key={processo.id} className={`${theme === 'light' ? 'hover-table-light': 'hover-table-dark'}`}>
        //         <td className="text-center">{processo.info_detalhamento.produto}</td>
        //         <td className="text-center">{processo.info_detalhamento.detalhamento_servico}</td>
        //         <td className="text-center">{processo.info_instituicao.razao_social}</td>
        //         <td className="text-center">{processo.valor_operacao ? Number(processo.valor_operacao).toLocaleString('pt-BR',
        //          {minimumFractionDigits: 2, maximumFractionDigits:2}): '-'}</td>
        //         <td className="text-center">{processo.phase_name}</td>
        //         <td className="text-center">{new Date(processo.created_at).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</td>
        //     </tr>
        //     ))}
        //     </tbody>
        // </Table>  
        : <div className="text-center"><Spinner></Spinner></div>}
        </>
    );
  };
  
  export default ListProcessos;
  
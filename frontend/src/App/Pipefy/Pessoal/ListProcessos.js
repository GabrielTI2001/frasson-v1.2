import { useState} from "react";
import React from 'react';
import {Spinner} from 'react-bootstrap';
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { useAppContext } from "../../../Main";
import {Table} from "react-bootstrap";

const ListProcessos = ({processos, nome_pessoa}) => {
    const token = localStorage.getItem("token")
    const navigate = useNavigate();
    const [showmodal, setShowModal] = useState(false)
    const {config: {theme}} = useAppContext();

    const onClick = (id, uuid) =>{
        const url = `/pipefy/pessoal/${uuid}`
        navigate(url)
    }

    return (
        <>
        <div className="mb-2"><span className="fw-bold text-info-emphasis">{nome_pessoa} tem {processos.length} processo(s) em andamento</span></div>
        {processos ? 
        <Table responsive hover>
            <thead className="bg-300">
                <tr>
                    <th scope="col" className="text-center">Produto</th>
                    <th scope="col" className="text-center">Detalhamento</th>
                    <th scope="col" className="text-center">Instituição</th>
                    <th scope="col" className="text-center">Valor Operação</th>
                    <th scope="col" className="text-center">Fase Atual</th>
                    <th scope="col" className="text-center">Aberto Em</th>
                </tr>
            </thead>
            <tbody className={`${theme === 'light' ? 'bg-light': 'bg-200'}`}>
            {processos.map(processo =>(
            <tr key={processo.id} className={`${theme === 'light' ? 'hover-table-light': 'hover-table-dark'}`}>
                <td className="text-center">{processo.info_detalhamento.produto}</td>
                <td className="text-center">{processo.info_detalhamento.detalhamento_servico}</td>
                <td className="text-center">{processo.info_instituicao.razao_social}</td>
                <td className="text-center">{processo.valor_operacao ? Number(processo.valor_operacao).toLocaleString('pt-BR',
                 {minimumFractionDigits: 2, maximumFractionDigits:2}): '-'}</td>
                <td className="text-center">{processo.phase_name}</td>
                <td className="text-center">{new Date(processo.created_at).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</td>
            </tr>
            ))}
            </tbody>
        </Table>  : <div className="text-center"><Spinner></Spinner></div>}
        </>
    );
  };
  
  export default ListProcessos;
  
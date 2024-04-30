import React from 'react';
import {Spinner} from 'react-bootstrap';
import { useAppContext } from "../../../Main";
import {Table} from "react-bootstrap";

const ListOperacoes = ({operacoes, nome_pessoa}) => {
    const {config: {theme}} = useAppContext();

    return (
        <>
        <div className="mb-2"><span className="fw-bold text-info-emphasis">{nome_pessoa} tem {operacoes.length} operações em andamento</span></div>
        {operacoes ? 
        <Table responsive hover>
            <thead className="bg-300">
                <tr>
                    <th scope="col" className="text-center">Data</th>
                    <th scope="col" className="text-center">N° Operação</th>
                    <th scope="col" className="text-center">Instituição</th>
                    <th scope="col" className="text-center">Item</th>
                    <th scope="col" className="text-center">Taxa Juros (%)</th>
                    <th scope="col" className="text-center">Valor Operação (R$)</th>
                    <th scope="col" className="text-center">Data Vencimento</th>
                </tr>
            </thead>
            {/* #d8e2ef */}
            <tbody className={`${theme === 'light' ? 'bg-light': 'bg-200'}`}>
            {operacoes.map(operacao =>(
            <tr key={operacao.id} className={`${theme === 'light' ? 'hover-table-light': 'hover-table-dark'}`}>
                <td className="text-center">{new Date(operacao.data_emissao_cedula).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</td>
                <td className="text-center">{operacao.numero_operaco}</td>
                <td className="text-center">{operacao.name_instituicao}</td>
                <td className="text-center">{operacao.name_item}</td>
                <td className="text-center">{operacao.taxa_juros ? Number(operacao.taxa_juros).toLocaleString('pt-BR',
                 {minimumFractionDigits: 2, maximumFractionDigits:2}): '-'}</td>
                <td className="text-center">{operacao.taxa_juros ? Number(operacao.valor_operacao).toLocaleString('pt-BR',
                 {minimumFractionDigits: 2, maximumFractionDigits:2}): '-'}</td>
                <td className="text-center">{new Date(operacao.data_vencimento).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</td>
            </tr>
            ))}
            </tbody>
        </Table>  : <div className="text-center"><Spinner></Spinner></div>}
        </>
    );
  };
  
  export default ListOperacoes;
  
import React from 'react';
import {Spinner} from 'react-bootstrap';
import { useAppContext } from "../../../Main";
import {Table} from "react-bootstrap";

const ListContas = ({contas}) => {
    const {config: {theme}} = useAppContext();
    return (
        <>
        {contas ? 
        <Table responsive style={{width: '450px'}}>
            <thead className="bg-300">
                <tr>
                    <th scope="col" className="text-center">Banco</th>
                    <th scope="col" className="text-center">Nome Agência</th>
                    <th scope="col" className="text-center">N° Agência</th>
                    <th scope="col" className="text-center">N° Conta</th>
                </tr>
            </thead>
            <tbody className={`${theme === 'light' ? 'bg-light': 'bg-200'}`}>
            {contas.map(conta =>(
            <tr key={conta.id} style={{cursor:'auto'}}>
                <td className="text-center">{conta.banco}</td>
                <td className="text-center">{conta.identificacao}</td>
                <td className="text-center">{conta.agencia}</td>
                <td className="text-center">{conta.conta}</td>
            </tr>
            ))}
            </tbody>
        </Table>  : <div className="text-center"><Spinner></Spinner></div>}
        </>
    );
  };
  
  export default ListContas;
  
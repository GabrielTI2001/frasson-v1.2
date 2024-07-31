import { useState, useEffect} from "react";
import React from 'react';
import {Spinner, Table} from 'react-bootstrap';
import { Link, useNavigate } from "react-router-dom";
import { useAppContext } from "../../../Main";
import { HandleSearch } from "../../../helpers/Data";
import { RedirectToLogin } from "../../../Routes/PrivateRoute";

const produtos = {
    'gc': {'desc':'Gestão de Crédito', 'id':864795372},
    'gai': {'desc':'Gestão Ambiental e Irrigação', 'id':864795466},
    'ava': {'desc':'Avaliação de Imóvel', 'id':864795628},
    'tec': {'desc':'Tecnologia e Inovação', 'id':864795734}
}

const Invoices = ({produto}) => {
    const [cobrancas, setCobrancas] = useState();
    const user = JSON.parse(localStorage.getItem("user"))
    const {config: {theme}} = useAppContext();
    const navigate = useNavigate();

    const setter = (responsedata) => {
        setCobrancas(responsedata)
    }

    const click = (url) =>{
        window.open(url,'_blank') 
    }
   
    useEffect(()=>{
        const getdata = async () =>{
            const params = `?produto=${produtos[produto].id}`
            const status = await HandleSearch('', 'finances/revenues-invoices', setter, params)
            if (status === 401) RedirectToLogin(navigate)
        }
        if ((user.permissions && user.permissions.indexOf("view_cobrancas_pipefy") === -1) && !user.is_superuser){
            navigate("/error/403")
        }
        if (!cobrancas && (produto)){
            getdata()
        }
    },[])

    return (
        <>
        <ol className="breadcrumb breadcrumb-alt fs-xs mb-3">  
            <li className="breadcrumb-item fw-bold">
                <Link className="link-fx text-primary" to={'/finances/revenues'}>Cobranças</Link>
            </li>
            <li className="breadcrumb-item fw-bold" aria-current="page">
               Faturamento {new Date().getFullYear()}
            </li> 
            <li className="breadcrumb-item fw-bold" aria-current="page">
               {produto ? produtos[produto].desc : ''}
            </li>  
        </ol>
        {cobrancas ? 
        <Table responsive className="mt-3">
            <thead className="bg-300">
                <tr>
                    <th scope="col" className="text-center text-middle">ID</th>
                    <th scope="col" className="text-center text-middle">Cliente</th>
                    <th scope="col" className="text-center text-middle">Produto</th>
                    <th scope="col" className="text-center text-middle">Detalhe Demanda</th>
                    <th scope="col" className="text-center text-middle">Status</th>
                    <th scope="col" className="text-center text-middle">Data Referência</th>
                    <th scope="col" className="text-center text-middle">Valor (R$)</th>
                </tr>
            </thead>
            <tbody className={`${theme === 'light' ? 'bg-light': 'bg-200'}`}>
            {cobrancas.map(registro =>
            <tr key={registro.id} style={{cursor:'pointer'}} onClick={() => click(registro.card_url)} 
                className={`${theme === 'light' ? 'hover-table-light': 'hover-table-dark'} py-0`}
            >
                <td className="text-center text-middle fs--2">{registro.id}</td>
                <td className="text-center text-middle fs--2">{registro.str_cliente}</td>
                <td className="text-center text-middle fs--2">{registro.str_produto}</td>
                <td className="text-center text-middle fs--2">{registro.str_detalhe || '-'}</td>
                <td className="text-center text-middle fs--2 text-primary">{registro.phase_name}</td>
                <td className="text-center text-middle fs--2">
                    {registro.data_pagamento ? new Date(registro.data_pagamento).toLocaleDateString('pt-BR', {timeZone:'UTC'}) : '-'}
                </td>
                <td className="text-center text-middle"> 
                    {registro.valor_faturado ? Number(registro.valor_faturado).toLocaleString('pt-BR', 
                        {minimumFractionDigits:2, maximumFractionDigits:2}) : '-'}
                </td> 
            </tr>
            )} 
            </tbody>
        </Table>
        : <div className="text-center"><Spinner /></div>
        }
        </>
    );
  };
  
  export default Invoices;
  
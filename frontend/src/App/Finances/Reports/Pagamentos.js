import { useState, useEffect} from "react";
import React from 'react';
import {Row, Col, Spinner, Table, Form} from 'react-bootstrap';
import { Link, useNavigate } from "react-router-dom";
import { useAppContext } from "../../../Main";
import { HandleSearch } from "../../../helpers/Data";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilePdf } from "@fortawesome/free-solid-svg-icons";
import { RedirectToLogin } from "../../../Routes/PrivateRoute";

const InitData = {
    'urlapilist':'finances/billings', 
    'urlview':'/finances/billings', 'title': 'Report Pagamentos'
}

const meses = [
    {'number': 1, 'name': 'JAN', 'description':'JANEIRO'}, {'number': 2, 'name': 'FEV', 'description':'FEVEREIRO'}, 
    {'number': 3, 'name': 'MAR', 'description':'MARÇO'}, {'number': 4, 'name': 'ABR', 'description':'ABRIL'},
    {'number': 5, 'name': 'MAI', 'description':'MAIO'}, {'number': 6, 'name': 'JUN', 'description':'JUNHO'}, 
    {'number': 7, 'name': 'JUL', 'description':'JULHO'}, {'number': 8, 'name': 'AGO', 'description':'AGOSTO'},
    {'number': 9, 'name': 'SET', 'description':'SETEMBRO'}, {'number': 10, 'name': 'OUT', 'description':'OUTUBRO'}, 
    {'number': 11, 'name': 'NOV', 'description':'NOVEMBRO'}, {'number': 12, 'name': 'DEZ', 'description':'DEZEMBRO'}
];


const ReportPagamentos = () => {
    const [anos, setAnos] = useState();
    const [pagamentos, setPagamentos] = useState();
    const [formData, setFormData] = useState({});
    const user = JSON.parse(localStorage.getItem("user"))
    const {config: {theme}} = useAppContext();
    const navigate = useNavigate();

    const setter = (responsedata) => {
        setAnos(responsedata.anos)
        setPagamentos(responsedata.pagamentos)
    }
    
    if (formData && (formData.ano && formData.mes)){
        if(!pagamentos){
            const params = `?year=${formData.ano}&month=${formData.mes}`
            HandleSearch(formData.search || '', 'finances/billings', setter, params)
        }
    }

    const handleFieldChange = e => {
        setFormData({
          ...formData,
          [e.target.name]: e.target.value
        });
        setPagamentos(null)
    };

    const click = (url) =>{
        window.open(url,'_blank') 
    }
   
    useEffect(()=>{
        const getdata = async () =>{
            const status = await HandleSearch('', 'finances/billings', setter)
            if (status === 401) RedirectToLogin(navigate)
        }
        if ((user.permissions && user.permissions.indexOf("view_pagamentos_pipefy") === -1) && !user.is_superuser){
            navigate("/error/403")
        }
        if (!pagamentos || !anos){
            getdata()
        }
        setFormData({...formData, ano:new Date().getFullYear(), mes:new Date().getMonth()+1})
    },[])

    return (
        <>
        <ol className="breadcrumb breadcrumb-alt fs-xs mb-3">
            <li className="breadcrumb-item fw-bold" aria-current="page">
               {InitData.title}
            </li>  
        </ol>
        <Row>
            <Form.Group className="mb-1" as={Col} xl={2} sm={3}>
                <Form.Select name='ano' onChange={handleFieldChange} value={formData ? formData.ano : ''}>
                    {anos && anos.map(ano =>(
                        <option key={ano} value={ano}>{ano}</option>
                    ))}
                </Form.Select>
            </Form.Group>
            <Form.Group className="mb-1" as={Col} xl={2} sm={3}>
                <Form.Select name='mes' onChange={handleFieldChange} value={formData ? formData.mes : ''}>
                    {meses && meses.map( m =>(
                        <option key={m.number} value={m.number}>{m.name}</option>
                    ))}
                </Form.Select>
            </Form.Group>
            <Form.Group className="mb-1" as={Col} xl={3} sm={6}>
                <Form.Control 
                    name="search"
                    value={formData.search || ''}
                    onChange={handleFieldChange}
                    type='text'
                    placeholder="Beneficiário, Fase, Categoria ou Classificação..."
                />
            </Form.Group>
            {formData.ano && formData.mes &&
            <Form.Group className="mb-1" as={Col} xl={3} sm={6}>
                <Link className="btn btn-sm bg-danger-subtle text-danger" 
                    to={`${process.env.REACT_APP_API_URL}/finances/billings-report/?month=${formData.mes}&year=${formData.ano}&search${formData.search || ''}`}
                >
                    <FontAwesomeIcon icon={faFilePdf} className="me-1"/>PDF Report
                </Link>
            </Form.Group>
            }
        </Row>
        {pagamentos ? 
        <Table responsive className="mt-3">
            <thead className="bg-300">
                <tr>
                    <th scope="col" className="text-center text-middle">ID</th>
                    <th scope="col" className="text-center text-middle">Beneficiário</th>
                    <th scope="col" className="text-center text-middle">Categoria</th>
                    <th scope="col" className="text-center text-middle">Classificação</th>
                    <th scope="col" className="text-center text-middle">Fase Atual</th>
                    <th scope="col" className="text-center text-middle">Data Ref.</th>
                    <th scope="col" className="text-center text-middle">Valor (R$)</th>
                </tr>
            </thead>
            <tbody className={`${theme === 'light' ? 'bg-light': 'bg-200'}`}>
            {pagamentos.map(registro =>
            <tr key={registro.id} style={{cursor:'pointer'}} onClick={() => click(registro.card_url)} 
                className={`${theme === 'light' ? 'hover-table-light': 'hover-table-dark'} py-0`}
            >
                <td className="text-center text-middle fs--2">{registro.id}</td>
                <td className="text-center text-middle fs--2">{registro.str_beneficiario}</td>
                <td className="text-center text-middle fs--2">{registro.str_categoria}</td>
                <td className="text-center text-middle fs--2">{registro.str_classificacao || '-'}</td>
                <td className="text-center text-middle fs--2 text-primary">{registro.phase_name}</td>
                <td className="text-center text-middle fs--2">
                    {registro.data ? new Date(registro.data).toLocaleDateString('pt-BR', {timeZone:'UTC'}) : '-'}
                </td>
                <td className="text-center text-middle"> 
                    {registro.valor_pagamento ? Number(registro.valor_pagamento).toLocaleString('pt-BR', 
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
  
  export default ReportPagamentos;
  
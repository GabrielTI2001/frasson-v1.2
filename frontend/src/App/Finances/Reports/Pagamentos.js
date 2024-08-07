import { useState, useEffect} from "react";
import React from 'react';
import {Row, Col, Spinner, Table, Form, Modal, CloseButton} from 'react-bootstrap';
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAppContext } from "../../../Main";
import { HandleSearch } from "../../../helpers/Data";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilePdf } from "@fortawesome/free-solid-svg-icons";
import { RedirectToLogin } from "../../../Routes/PrivateRoute";
import { ModalPagamento } from "./Modal";
import { PagamentoForm } from "./Form";
import CustomBreadcrumb from "../../../components/Custom/Commom";

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
    const [formData, setFormData] = useState({ano:new Date().getFullYear(), mes:new Date().getMonth()+1});
    const user = JSON.parse(localStorage.getItem("user"))
    const {config: {theme}} = useAppContext();
    const navigate = useNavigate();
    const {uuid} = useParams()
    const [modal, setModal] = useState({show:false});
    const [showmodal, setShowModal] = useState(false);

    const setter = (responsedata) => {
        setAnos(responsedata.anos)
        setPagamentos(responsedata.pagamentos)
    }
    const submit = (type, data) => {
        if (type === 'add') setPagamentos([data, ...pagamentos])
        else if (type === 'edit' && pagamentos) setPagamentos([...pagamentos.map(reg => reg.uuid === data.uuid ? data : reg)])
        else if (type === 'delete' && pagamentos) setPagamentos(pagamentos.filter(r => r.uuid !== data))
        setShowModal(false)
    }

    const handleFieldChange = e => {
        setFormData({
          ...formData,
          [e.target.name]: e.target.value
        });
        setPagamentos(null)
    };

    const click = (url) =>{
        navigate('/finances/billings/'+url)
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
    useEffect(()=>{
        if ((user.permissions && user.permissions.indexOf("view_cobrancas_pipefy") === -1) && !user.is_superuser){
            navigate("/error/403")
        }
    },[])
    useEffect(() => {
        const search = async () => {
            if (formData && (formData.ano && formData.mes)){
                if(!pagamentos){
                    const params = `?year=${formData.ano}&month=${formData.mes}`
                    HandleSearch(formData.search || '', 'finances/billings', setter, params)
                }
            }
        }
        if (uuid){
            setModal({show:true})
        }
        else{
            setModal({show:false})
            search()
        }
    },[uuid, formData])

    return (
        <>
        <CustomBreadcrumb>
            <span className="breadcrumb-item fw-bold" aria-current="page">
               {InitData.title}
            </span>  
        </CustomBreadcrumb>
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
            <Form.Group className="mb-1" as={Col} xl='auto' sm='auto'>
                <Link className="btn btn-sm bg-danger-subtle text-danger" 
                    to={`${process.env.REACT_APP_API_URL}/finances/billings-report/?month=${formData.mes}&year=${formData.ano}&search${formData.search || ''}`}
                >
                    <FontAwesomeIcon icon={faFilePdf} className="me-1"/>PDF Report
                </Link>
            </Form.Group>
            }
            <Col xl={'auto'} sm='auto' xs={'auto'}>
                <Link className="text-decoration-none btn btn-primary shadow-none fs--1"
                    style={{padding: '2px 8px'}} onClick={() =>{setShowModal({show:true})}}
                >Novo Pagamento</Link>
            </Col>
        </Row>
        {pagamentos ? 
        <Table responsive className="mt-3">
            <thead className="bg-300">
                <tr>
                    <th scope="col" className="text-center text-middle">ID</th>
                    <th scope="col" className="text-center text-middle">Beneficiário</th>
                    <th scope="col" className="text-center text-middle">Categoria</th>
                    <th scope="col" className="text-center text-middle">Classificação</th>
                    <th scope="col" className="text-center text-middle">Status</th>
                    <th scope="col" className="text-center text-middle">Data Ref.</th>
                    <th scope="col" className="text-center text-middle">Valor (R$)</th>
                </tr>
            </thead>
            <tbody className={`${theme === 'light' ? 'bg-light': 'bg-200'}`}>
            {pagamentos.map(registro =>
            <tr key={registro.id} style={{cursor:'pointer'}} onClick={() => click(registro.uuid)} 
                className={`${theme === 'light' ? 'hover-table-light': 'hover-table-dark'} py-0`}
            >
                <td className="text-center text-middle fs--2">{registro.id}</td>
                <td className="text-center text-middle fs--2">{registro.str_beneficiario}</td>
                <td className="text-center text-middle fs--2">{registro.str_categoria}</td>
                <td className="text-center text-middle fs--2">{registro.str_classificacao || '-'}</td>
                <td className="text-center text-middle fs--2 text-primary">{registro.str_status}</td>
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
        <ModalPagamento show={modal.show} reducer={submit} />
        <Modal
            size="md"
            show={showmodal.show}
            onHide={() => setShowModal({show:false})}
            aria-labelledby="example-modal-sizes-title-lg"
            scrollable
        >
            <Modal.Header>
                <Modal.Title id="example-modal-sizes-title-lg" style={{fontSize: '16px'}}>
                    {showmodal && showmodal.data ? 'Editar' : 'Adicionar'} Pagamento
                </Modal.Title>
                <CloseButton onClick={() => setShowModal({show:false})}/>
            </Modal.Header>
            <Modal.Body className="pb-0">
                <PagamentoForm type='add' hasLabel submit={submit} />
            </Modal.Body>
        </Modal>
        </>
    );
  };
  
  export default ReportPagamentos;
  
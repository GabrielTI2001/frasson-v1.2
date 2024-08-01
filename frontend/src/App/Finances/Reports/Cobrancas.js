import { useState, useEffect} from "react";
import React from 'react';
import {Row, Col, Spinner, Table, Form} from 'react-bootstrap';
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAppContext } from "../../../Main";
import { HandleSearch } from "../../../helpers/Data";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilePdf } from "@fortawesome/free-solid-svg-icons";
import { RedirectToLogin } from "../../../Routes/PrivateRoute";
import ModalRecord from "./Modal";

const InitData = {
    'title': 'Report Cobranças'
}

const meses = [
    {'number': 1, 'name': 'JAN', 'description':'JANEIRO'}, {'number': 2, 'name': 'FEV', 'description':'FEVEREIRO'}, 
    {'number': 3, 'name': 'MAR', 'description':'MARÇO'}, {'number': 4, 'name': 'ABR', 'description':'ABRIL'},
    {'number': 5, 'name': 'MAI', 'description':'MAIO'}, {'number': 6, 'name': 'JUN', 'description':'JUNHO'}, 
    {'number': 7, 'name': 'JUL', 'description':'JULHO'}, {'number': 8, 'name': 'AGO', 'description':'AGOSTO'},
    {'number': 9, 'name': 'SET', 'description':'SETEMBRO'}, {'number': 10, 'name': 'OUT', 'description':'OUTUBRO'}, 
    {'number': 11, 'name': 'NOV', 'description':'NOVEMBRO'}, {'number': 12, 'name': 'DEZ', 'description':'DEZEMBRO'}
];


const ReportCobrancas = () => {
    const [anos, setAnos] = useState();
    const [cobrancas, setCobrancas] = useState();
    const [formData, setFormData] = useState({ano:new Date().getFullYear(), mes:new Date().getMonth()+1, status:0});
    const user = JSON.parse(localStorage.getItem("user"))
    const {config: {theme}} = useAppContext();
    const navigate = useNavigate();
    const {uuid} = useParams()
    const [modal, setModal] = useState({show:false});
    const [showmodal, setShowModal] = useState(false);

    const setter = (responsedata) => {
        setAnos(responsedata.anos)
        setCobrancas(responsedata.cobrancas)
    }
    const submit = (type, data) => {
        if (type === 'add') setCobrancas([data, ...cobrancas])
        else if (type === 'edit' && cobrancas) setCobrancas([...cobrancas.map(reg => reg.uuid === data.uuid ? data : reg)])
        else if (type === 'delete' && cobrancas) setCobrancas(cobrancas.filter(r => r.uuid !== data))
        setShowModal(false)
    }

    const handleFieldChange = e => {
        setFormData({
          ...formData,
          [e.target.name]: e.target.value
        });
        setCobrancas(null)
    };

    const click = (url) =>{
        navigate('/finances/revenues/'+url) 
    }
   
    useEffect(()=>{
        if ((user.permissions && user.permissions.indexOf("view_cobrancas_pipefy") === -1) && !user.is_superuser){
            navigate("/error/403")
        }
    },[])
    useEffect(() => {
        const search = async () => {
            if (formData && (formData.ano && formData.mes)){
                if(!cobrancas){
                    const params = `?year=${formData.ano}&month=${formData.mes}&status=${formData.status}`
                    const status = await HandleSearch(formData.search || '', 'finances/revenues', setter, params)
                    if (status === 401){
                        RedirectToLogin(navigate)
                    }
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
        <ol className="breadcrumb breadcrumb-alt fs-xs mb-3">
            <li className="breadcrumb-item fw-bold" aria-current="page">
               {InitData.title}
            </li>  
        </ol>
        <Row className="gx-sm-1 gx-xl-3">
            <Form.Group className="mb-1" as={Col} xl={2} sm={2}>
                <Form.Select name='ano' onChange={handleFieldChange} value={formData ? formData.ano : ''}>
                    {anos && anos.map(ano =>(
                        <option key={ano} value={ano}>{ano}</option>
                    ))}
                </Form.Select>
            </Form.Group>
            <Form.Group className="mb-1" as={Col} xl={2} sm={2}>
                <Form.Select name='mes' onChange={handleFieldChange} value={formData ? formData.mes : ''}>
                    {meses && meses.map( m =>(
                        <option key={m.number} value={m.number}>{m.name}</option>
                    ))}
                </Form.Select>
            </Form.Group>
            <Form.Group className="mb-1" as={Col} xl={2} sm={2}>
                <Form.Select name='status' onChange={handleFieldChange} value={formData ? formData.status : ''}>
                    <option value="0">Em Aberto</option>
                    <option value="1">Pago</option>
                </Form.Select>
            </Form.Group>
            <Form.Group className="mb-1" as={Col} xl={3} sm={3}>
                <Form.Control 
                    name="search"
                    value={formData.search || ''}
                    onChange={handleFieldChange}
                    type='text'
                    placeholder="Beneficiário, Fase ou Detalhamento..."
                />
            </Form.Group>
            {formData.ano && formData.mes &&
            <Form.Group className="mb-1" as={Col} xl={3} sm={3}>
                <Link className="btn btn-sm bg-danger-subtle text-danger" 
                    to={`${process.env.REACT_APP_API_URL}/finances/revenues-report/?month=${formData.mes}&year=${formData.ano}&status=${formData.status}&search${formData.search || ''}`}
                >
                    <FontAwesomeIcon icon={faFilePdf} className="me-1"/>PDF Report
                </Link>
            </Form.Group>
            }
        </Row>
        {cobrancas ? 
        <Table responsive className="mt-3">
            <thead className="bg-300">
                <tr>
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
            <tr key={registro.id} style={{cursor:'pointer'}} onClick={() => click(registro.uuid)} 
                className={`${theme === 'light' ? 'hover-table-light': 'hover-table-dark'} py-0`}
            >
                <td className="text-center text-middle fs--2">{registro.str_cliente}</td>
                <td className="text-center text-middle fs--2">{registro.str_produto || '-'}</td>
                <td className="text-center text-middle fs--2">{registro.str_detalhe || '-'}</td>
                <td className="text-center text-middle fs--2 text-primary">{registro.str_status}</td>
                <td className="text-center text-middle fs--2">
                    {registro.data ? new Date(registro.data).toLocaleDateString('pt-BR', {timeZone:'UTC'}) : '-'}
                </td>
                <td className="text-center text-middle"> 
                    {registro.valor ? Number(registro.valor).toLocaleString('pt-BR', 
                        {minimumFractionDigits:2, maximumFractionDigits:2}) : '-'}
                </td> 
            </tr>
            )} 
            </tbody>
        </Table>
        : <div className="text-center"><Spinner /></div>
        }
        <ModalRecord show={modal.show} reducer={submit} />
        </>
    );
  };
  
  export default ReportCobrancas;
  
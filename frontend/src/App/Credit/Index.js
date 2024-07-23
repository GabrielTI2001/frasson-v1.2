import { useState, useEffect} from "react";
import React from 'react';
import {Row, Col, Table, Form, Button, Placeholder, Modal, CloseButton} from 'react-bootstrap';
import { Link, useNavigate, useParams} from "react-router-dom";
import { useAppContext } from "../../Main";
import { fetchCreditData } from "./Data";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileExcel } from "@fortawesome/free-solid-svg-icons";
import OperacoesForm from "./Form";
import ModalRecord from "./Modal";

const InitData = {
    'urlapilist':'credit/operacoes-contratadas', 
    'urlview':'/credit', 'title': 'Operações de Crédito'
}

const meses = [{'number': 1, 'name': 'JAN'}, {'number': 2, 'name': 'FEV'}, {'number': 3, 'name': 'MAR'}, {'number': 4, 'name': 'ABR'},
    {'number': 5, 'name': 'MAI'}, {'number': 6, 'name': 'JUN'}, {'number': 7, 'name': 'JUL'}, {'number': 8, 'name': 'AGO'},
    {'number': 9, 'name': 'SET'}, {'number': 10, 'name': 'OUT'}, {'number': 11, 'name': 'NOV'}, {'number': 12, 'name': 'DEZ'}
];

const IndexCredit = ({mes, ano}) => {
    const [searchResults, setSearchResults] = useState();
    const [formData, setFormData] = useState({loaded:false});
    const [somaDosValores, setSomadosValores] = useState()
    const [metadata, setMetaData] = useState();
    const [dataexcel, setDataexcel] = useState();
    const [showmodal, setShowModal] = useState({show:false})
    const user = JSON.parse(localStorage.getItem("user"))
    const {config: {theme}} = useAppContext();
    const navigate = useNavigate();
    const {uuid} = useParams()
    const [modal, setModal] = useState({show:false})

    const Search = async (urlapi) => {
        const token = localStorage.getItem("token")
        let query = '';
        if (formData.ano) query = query + 'year='+formData.ano+'&'
        if (formData.mes) query = query + 'month='+formData.mes+'&'
        if (mes) query = query + 'month='+mes+'&'
        if (ano) query = query + 'year='+ano+'&'
        if (formData.search) query = query + 'search='+formData.search+'&'
        if (formData.banco) query = query + 'bank='+formData.banco+'&'

        const url = `${process.env.REACT_APP_API_URL}/${urlapi}/?${query}`
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
            });
            const data = await response.json();
            if (response.status === 401) {
                localStorage.setItem("login", JSON.stringify(false));
                localStorage.setItem('token', "");
                navigate("/auth/login")
            } else if (response.status === 200) {
                setSearchResults(data)
                setFormData({...formData, loaded:true})
                setSomadosValores(null)
            }
            return response.status
        } catch (error) {
            console.error('Erro:', error);
        }
    };
    
    if(!formData.loaded){
        if (formData.ano || formData.banco || formData.search){
            Search(InitData.urlapilist, formData.cliente , formData.instituicao)
        }
        else{
            setFormData({...formData, loaded:true})
        }
    }

    const click = (id) =>{
        navigate(InitData.urlview+"/"+id)
    }

    const submit = (type, data, id) => {
        if (type == 'add'){
            setSearchResults([...searchResults, data])
            setShowModal({show:false})
        }
        else if (type === 'edit' && searchResults){
            setSearchResults([...searchResults.map(reg =>(
                reg.id === data.id ? data : reg
            ))])
        }
        else if (type === 'delete'){
            setSearchResults(searchResults.filter(r => r.uuid !== data))
        }
    }

    const handleFieldChange = e => {
        setFormData({
          ...formData,
          [e.target.name]: e.target.value,
          loaded: false
        });
    };

    const submitExcel = async e => {
        e.preventDefault()
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/credit/convert-to-xls`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dataexcel)
            });
            const blob = await response.blob();
            const url = window.URL.createObjectURL(new Blob([blob]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${new Date().getTime()}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        } catch (error) {
            console.error('Erro:', error);
        }
    };
   
    useEffect(()=>{
        if ((user.permissions && user.permissions.indexOf("view_operacoes_contratadas") === -1) && !user.is_superuser){
            navigate("/error/403")
        }
    },[])

    useEffect(() => {
        const getdata = async () =>{
            Search(InitData.urlapilist)
        }
        const getmetadata = async () =>{
            const data = await fetchCreditData()
            setMetaData(data)
        }
        if (uuid){
            setModal({show:true})
        }
        else{
            setModal({show:false})
            if (!metadata){
                getmetadata()
            }
            if (searchResults) {
                setDataexcel({html_content:document.querySelector("table").outerHTML})
                if (searchResults.length > 0){
                    const soma = searchResults.reduce((total, objeto) => total + Number(objeto.valor_operacao), 0);
                    setSomadosValores(soma);
                }
            } else {
                getdata()
                setSomadosValores(0);
            }
        }
    },[uuid, searchResults])

    return (
        <>
        <ol className="breadcrumb breadcrumb-alt fs-xs mb-3">
            <li className="breadcrumb-item fw-bold" aria-current="page">
               {InitData.title}
            </li>  
        </ol>
        <Row className="mb-2">
            {metadata && (!mes && !ano) && <>
                <Form.Group className="mb-1" as={Col} lg='auto'>
                    <Form.Select name='ano' onChange={handleFieldChange} value={formData.ano || ''}>
                        <option value=''>----</option>
                        {metadata.anos && metadata.anos.map( item =>(
                            <option key={item} value={item}>{item}</option>
                        ))}
                    </Form.Select>
                </Form.Group>
                <Form.Group className="mb-1" as={Col} lg='auto'>
                    <Form.Select name='mes' onChange={handleFieldChange} value={formData.mes || ''}>
                        <option value=''>----</option>
                        {meses && meses.map( m =>(
                            <option key={m.number} value={m.number}>{m.name}</option>
                        ))}
                    </Form.Select>
                </Form.Group>
                <Form.Group className="mb-1" as={Col} lg={3}>
                    <Form.Select name='banco' onChange={handleFieldChange} value={formData.banco || ''}>
                        <option value=''>----</option>
                        {metadata.instituicoes && metadata.instituicoes.map( item =>(
                            <option key={item.id} value={item.id}>{item.instituicao}</option>
                        ))}
                    </Form.Select>
                </Form.Group>
                <Form.Group className="mb-1" as={Col} lg={3}>
                    <Form.Control
                        value={formData.search || ''}
                        name="search"
                        onChange={handleFieldChange}
                        type="text"
                    />
                </Form.Group>
                <Col xl={'auto'} sm='auto' xs={'auto'}>
                    <Link className="text-decoration-none btn btn-primary shadow-none fs--1"
                        style={{padding: '2px 8px'}} onClick={() =>{setShowModal({show:true})}}
                    >Novo Cadastro</Link>
                </Col>
            </>}
            <Col className={`mb- d-flex align-items-center ${mes || ano ? 'justify-content-start' : 'justify-content-end'}`} lg={2}>
                <span className="fw-bold fs-0 text-primary">{somaDosValores ? Number(somaDosValores).toLocaleString('pt-BR', 
                    {style: 'currency', currency: 'BRL'}) : ''}
                </span>
            </Col>
            <Col xl='auto'>
                <Form action={`${process.env.REACT_APP_API_URL}/teste`} method="POST" onSubmit={submitExcel}>
                    <Form.Control type="hidden" id="html_content" name="html_content" value={dataexcel || ''} />
                    <Button type="submit" className="btn btn-sm btn-success shadow-none fs--2 fw-normal py-0 px-2" disabled={searchResults && searchResults.length === 0}>
                        <FontAwesomeIcon icon={faFileExcel} className="me-2" />Download Excel</Button>
                </Form>
            </Col>
        </Row>
        {searchResults && formData.loaded ? 
        <Table responsive>
            <thead className="bg-300">
                <tr>
                    <th scope="col" className="text-center">Data Cédula</th>
                    <th scope="col" className="text-center">N° Operação</th>
                    <th scope="col" className="text-center">Safra</th>
                    <th scope="col" className="text-center">Nome Beneficiário</th>
                    <th scope="col" className="text-center">Inst. Financeira</th>
                    <th scope="col" className="text-center">Item Financiado</th>
                    <th scope="col" className="text-center">Primeiro Venc.</th>
                    <th scope="col" className="text-center">Data Venc.</th>
                    <th scope="col" className="text-center">Tx. Juros (%)</th>
                    <th scope="col" className="text-center">Valor Operação</th>
                </tr>
            </thead>
            <tbody className={`${theme === 'light' ? 'bg-light': 'bg-200'}`}>
                {searchResults.map(oper =>(
                    <tr key={oper.id} style={{cursor:'pointer'}} onClick={() => click(oper.uuid)} 
                    className={`${theme === 'light' ? 'hover-table-light': 'hover-table-dark'}`}>
                        <td className="text-center">
                            {oper.data_emissao_cedula ? new Date(oper.data_emissao_cedula).toLocaleDateString('pt-BR', {timeZone:'UTC'}) : '-'}
                        </td>
                        <td className="text-center">{oper.numero_operacao}</td>
                        <td className="text-center">{oper.safra ? oper.safra : '-' }</td>
                        <td className="text-center">{oper.str_beneficiario ? oper.str_beneficiario : '-' }</td>
                        <td className="text-center">{oper.name_instituicao ? oper.name_instituicao : '-' }</td>
                        <td className="text-center">{oper.name_item ? oper.name_item : '-' }</td>
                        <td className="text-center">
                            {oper.data_primeiro_vencimento ? new Date(oper.data_primeiro_vencimento).toLocaleDateString('pt-BR', {timeZone:'UTC'}) : '-'}
                        </td>
                        <td className="text-center">
                            {oper.data_vencimento ? new Date(oper.data_vencimento).toLocaleDateString('pt-BR', {timeZone:'UTC'}) : '-'}
                        </td>
                        <td className="text-center">
                            {oper.taxa_juros ? Number(oper.taxa_juros).toLocaleString('pt-BR') : '-'}
                        </td>
                        <td className="text-center">
                            {oper.valor_operacao ? Number(oper.valor_operacao).toLocaleString('pt-BR', {minimumFractionDigits:2}) : '-'}
                        </td>
                    </tr>
                ))} 
            </tbody>
        </Table>
        : 
        <div>
            <Placeholder animation="glow">
                <Placeholder xs={7} /> <Placeholder xs={4} /> 
                <Placeholder xs={4} />
                <Placeholder xs={6} /> <Placeholder xs={8} />
            </Placeholder>    
        </div>   
        }
        <ModalRecord show={modal.show} reducer={submit}/>
        <Modal
            size="xl"
            show={showmodal.show}
            onHide={() => setShowModal({show:false})}
            aria-labelledby="example-modal-sizes-title-lg"
            scrollable
        >
            <Modal.Header>
            <Modal.Title id="example-modal-sizes-title-lg" style={{fontSize: '16px'}}>
                {showmodal && showmodal.data ? 'Editar' : 'Adicionar'} Operação
            </Modal.Title>
                <CloseButton onClick={() => setShowModal({show:false})}/>
            </Modal.Header>
            <Modal.Body>
                <OperacoesForm type='add' hasLabel submit={submit}/>
            </Modal.Body>
        </Modal>
        </>
    );
  };
  
  export default IndexCredit;
  
import { useState, useEffect} from "react";
import React from 'react';
import {Row, Col, Table, Form, Placeholder, Modal, CloseButton} from 'react-bootstrap';
import { Link, useNavigate, useParams } from "react-router-dom";
import AsyncSelect from 'react-select/async';
import customStyles, {customStylesDark} from '../../../components/Custom/SelectStyles';
import { useAppContext } from "../../../Main";
import { fetchPessoal, fetchInstituicoesRazaoSocial } from "../../Pipefy/Data";
import { SelectSearchOptions } from "../../../helpers/Data";
import RegimeForm from "./Form";
import ModalRecord from "./Modal";

const InitData = {
    'urlapilist':'farms/regime', 
    'urlview':'/farms/regime', 'title': 'Regimes de Exploração'
}

const IndexRegimes = () => {
    const [searchResults, setSearchResults] = useState();
    const [formData, setFormData] = useState({loaded:false});
    const [showmodal, setShowModal] = useState({show:false})
    const [modal, setModal] = useState({show:false})
    const user = JSON.parse(localStorage.getItem("user"))
    const {config: {theme}} = useAppContext();
    const navigate = useNavigate();
    const {uuid} = useParams()

    const submit = (type, data) => {
        if (type == 'add'){
            setSearchResults([...searchResults, data])
            setShowModal({show:false})
        }
        else if (type === 'edit'){
            setFormData({...formData, loaded:false})
            setSearchResults()
        }
        else if (type === 'delete'){
            setSearchResults(searchResults.filter(r => r.uuid !== data))
        }
        
    }

    const Search = async (urlapi, cliente, instituicao) => {
        const token = localStorage.getItem("token")
        const params = cliente && instituicao ? `?cliente=${cliente}&instituicao=${instituicao}` : '';
        const url = `${process.env.REACT_APP_API_URL}/${urlapi}/${params}`
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
            }
            return response.status
        } catch (error) {
            console.error('Erro:', error);
        }
    };
    
    if(formData.cliente && formData.instituicao && !formData.loaded){
        Search(InitData.urlapilist, formData.cliente , formData.instituicao)
    }

    const click = (uuid) =>{
        navigate(InitData.urlview+"/"+uuid)
    }
   
    useEffect(()=>{
        if ((user.permissions && user.permissions.indexOf("view_regimes_exploracao") === -1) && !user.is_superuser){
            navigate("/error/403")
        }
    },[])
    useEffect(() => {
        if (uuid){
            setModal({show:true})
        }
        else{
            setModal({show:false})
            if (!searchResults && !formData.loaded){
                Search(InitData.urlapilist)
            }
        }
    },[uuid])

    return (
        <>
        <ol className="breadcrumb breadcrumb-alt fs-xs mb-3">
            <li className="breadcrumb-item fw-bold">
                <Link className="link-fx text-primary" to={'/farms'}>Cadastros Fazendas</Link>
            </li>
            <li className="breadcrumb-item fw-bold" aria-current="page">
               {InitData.title}
            </li>  
        </ol>
        <Row>
            <Form.Group className="mb-2" as={Col} lg={4}>
                <Form.Label className='fw-bold mb-1'>Nome Cliente</Form.Label>
                <AsyncSelect loadOptions={(v) => SelectSearchOptions(v, 'register/pessoal', 'razao_social')} name='cliente' 
                    styles={theme === 'light'? customStyles : customStylesDark} classNamePrefix="select"
                    onChange={(selected) => {
                    setFormData((prevFormData) => ({
                        ...prevFormData,
                        cliente: selected.value, loaded: !formData.instituicao
                    }));
                }} />
            </Form.Group>
            <Form.Group className="mb-2" as={Col} lg={4}>
                <Form.Label className='fw-bold mb-1'>Instituição Financeira ou Ambiental</Form.Label>
                <AsyncSelect loadOptions={(v) => SelectSearchOptions(v, 'register/instituicoes-razaosocial', 'razao_social')} name='instituicao' 
                    styles={theme === 'light'? customStyles : customStylesDark} classNamePrefix="select"
                    onChange={(selected) => {
                    setFormData((prevFormData) => ({
                        ...prevFormData,
                        instituicao: selected.value, loaded: !formData.cliente
                    }));
                }} />
            </Form.Group>
            <Form.Group className="mb-2 d-flex align-items-end" as={Col} lg={4}>
                <Link className="text-decoration-none btn btn-primary shadow-none fs--1"
                    style={{padding: '2px 8px'}} onClick={() =>{setShowModal({show:true})}}
                >Novo Cadastro</Link>
            </Form.Group>
        </Row>
        {searchResults && formData.loaded ? 
        <Table responsive>
            <thead className="bg-300">
                <tr>
                    <th scope="col" className="text-center">Matrícula</th>
                    <th scope="col" className="text-center">Nome Propriedade</th>
                    <th scope="col" className="text-center">Regime Exploração</th>
                    <th scope="col" className="text-center">Atividade Explorada</th>
                    <th scope="col" className="text-center">Data Início</th>
                    <th scope="col" className="text-center">Data Término</th>
                    <th scope="col" className="text-center">Área Cedida (ha)</th>
                </tr>
            </thead>
            <tbody className={`${theme === 'light' ? 'bg-light': 'bg-200'}`}>
            {searchResults.map(regime =>(
            <tr key={regime.id} style={{cursor:'pointer'}} onClick={() => click(regime.uuid)} 
            className={`${theme === 'light' ? 'hover-table-light': 'hover-table-dark'}`}>
                <td className="text-center">{regime.matricula_imovel}</td>
                <td className="text-center">{regime.nome_imovel}</td>
                <td className="text-center">{regime.regime}</td>
                <td className="text-center">{regime.atividade_display}</td>
                <td className="text-center">
                    {regime.data_inicio ? new Date(regime.data_inicio).toLocaleDateString('pt-BR', {timeZone:'UTC'}) : '-'}
                </td>
                <td className="text-center">
                    {regime.data_termino ? new Date(regime.data_termino).toLocaleDateString('pt-BR', {timeZone:'UTC'}) : '-'}
                </td>
                <td className="text-center"> 
                    {regime.area ? Number(regime.area).toLocaleString('pt-BR', 
                        {minimumFractionDigits:2, maximumFractionDigits:2}) : '-'}
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
            centered
            scrollable
            aria-labelledby="example-modal-sizes-title-lg"
        >
            <Modal.Header>
                <Modal.Title id="example-modal-sizes-title-lg" style={{fontSize: '16px'}}>
                    {showmodal.data ? 'Editar' : 'Adicionar' } Imóvel Rural
                </Modal.Title>
                    <CloseButton onClick={() => setShowModal({show:false})}/>
                </Modal.Header>
                <Modal.Body>
                    <Row className="flex-center sectionform">
                        {showmodal.data
                           ? null
                           : <RegimeForm type='add' hasLabel submit={submit}/>
                        } 
                    </Row>
            </Modal.Body>
        </Modal>
        </>
    );
  };
  
  export default IndexRegimes;
  
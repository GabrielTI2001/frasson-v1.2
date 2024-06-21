import { useEffect, useState } from "react";
import React from 'react';
import { useParams, useNavigate } from "react-router-dom";
import { Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";
import {Tabs, Tab} from "react-bootstrap";
import Avatar from '../../../components/common/Avatar';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLocationDot, faLocationArrow, faMapPin, faCakeCandles, faBriefcase, faUsersLine } from "@fortawesome/free-solid-svg-icons";
import ListProcessos from "./ListProcessos";
import ListOperacoes from "./ListOperacoes";
import ListContas from "./ListContas";
import { RetrieveRecord } from "../../../helpers/Data";

const ViewPessoal = () => {
    const {uuid} = useParams()
    const [pessoa, setPessoa] = useState()
    const [processos, setProcessos] = useState()
    const [operacoes, setOperacoes] = useState()
    const user = JSON.parse(localStorage.getItem("user"))
    const token = localStorage.getItem("token")
    const navigate = useNavigate();

    const calcIdade = (data_nasc) =>{
        const idade = new Date() - new Date(data_nasc)
        return Math.floor(idade/((1000 * 3600 * 24 * 365)))
    }

    useEffect(() =>{
        const getProcessos = async (params) =>{
            try{
                const response = await fetch(`${process.env.REACT_APP_API_URL}/pipeline/cards/produtos/?${params}`, {
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

        const getOperacoes = async (params) =>{
            try{
                const response = await fetch(`${process.env.REACT_APP_API_URL}/credit/operacoes-contratadas/?${params}`, {
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
                    setOperacoes(data)
                }
            } catch (error){
                console.error("Erro: ",error)
            }            
        }


        const getData = async () => {
            const status = RetrieveRecord(uuid, 'register/pessoal', (data) => {setPessoa(data); data.data_nascimento && calcIdade(data.data_nascimento)})
            if (status === 401){
                navigate("/auth/login");
            }
        }
        if ((user.permissions && user.permissions.indexOf("view_cadastro_pessoal") === -1) && !user.is_superuser){
            navigate("/error/403")
        }
        if (!pessoa){
            getData()
        }
        else{
            if (!processos){
                getProcessos(`beneficiario=${pessoa.id}`)
            }
            if (!operacoes){
                getOperacoes(`beneficiario=${pessoa.id}`)
            }
        }
    },[pessoa])

    return (
    <>
        <ol className="breadcrumb breadcrumb-alt mb-1">
            <li className="breadcrumb-item fw-bold">
                <Link className="link-fx text-primary" to={'/register'}>Cadastros Gerais</Link>
            </li>
            <li className="breadcrumb-item fw-bold">
                <Link className="link-fx text-primary" to={'/register/pessoal'}>Cadastro Pessoal</Link>
            </li>
            {pessoa && (
               <li className="breadcrumb-item fw-bold" aria-current="page">
                   {pessoa.razao_social}
               </li>             
            )}
        </ol>
        <Tabs defaultActiveKey="cadastro" id="uncontrolled-tab-example">
            <Tab eventKey="cadastro" title="Cadastro" className='border-bottom border-x p-3'>
                <Row className="mb-3 gx-0">
                    <Col lg={'auto'} sm='auto' className="px-0 me-2">
                        <Avatar src={`${process.env.REACT_APP_API_URL}/media/avatars/clients/default-avatar.jpg`} size={'3xl'}/>
                    </Col>
                    <Col lg={4} sm={4} className="mx-2">
                        <Row className="mx-0 fw-bold">{pessoa && pessoa.razao_social}</Row>
                        <Row className="mx-0 fw-bold my-1">{pessoa && pessoa.cpf_cnpj}</Row>
                        <Row className="mx-0">{pessoa && pessoa.numero_rg}</Row>
                    </Col>
                </Row>
                <address className="row mx-0 gx-0 mb-3">
                    <div className="mb-1"><FontAwesomeIcon icon={faLocationDot} className="me-2"/>{(pessoa && pessoa.endereco) || '-'}</div>
                    <div className="mb-1"><FontAwesomeIcon icon={faLocationArrow} className="me-2"/>{pessoa && pessoa.municipio}</div>
                    <div className="mb-1"><FontAwesomeIcon icon={faMapPin} className="me-2"/>{pessoa && pessoa.cep}</div>
                </address>
                <Row className="mb-3">
                    <div><FontAwesomeIcon icon={faCakeCandles} className="me-2"/>
                        {pessoa && pessoa.data_nascimento ? `${new Date(pessoa.data_nascimento).toLocaleDateString('pt-BR', {timeZone: 'UTC'})} (${calcIdade(pessoa.data_nascimento)} anos)` :'-'}
                    </div>
                    <div><FontAwesomeIcon icon={faBriefcase} className="me-2"/>{pessoa && pessoa.profissao ? pessoa.profissao :'-'}</div>
                    <div><FontAwesomeIcon icon={faUsersLine} className="me-2"/>{pessoa && pessoa.grupo_info ? pessoa.grupo_info :'-'}</div>
                </Row>
            </Tab>
            {processos && processos.length > 0 &&
                <Tab eventKey="processos" title="Processos" className='border-bottom border-x p-3'>
                    <ListProcessos processos={processos} nome_pessoa={pessoa.razao_social}/>
                </Tab>
            }
            {operacoes && operacoes.length > 0 &&
                <Tab eventKey="operacoes" title="Operações de Crédito" className='border-bottom border-x p-3'>
                    <ListOperacoes operacoes={operacoes} nome_pessoa={pessoa.razao_social}/>
                </Tab>            
            }
            {pessoa && pessoa.contas_bancarias && pessoa.contas_bancarias.length > 0 &&
                <Tab eventKey="contas" title="Contas Bancárias" className='border-bottom border-x p-3'>
                    <ListContas contas={pessoa.contas_bancarias} />
                </Tab>            
            }
        </Tabs>
    </>
    );
  };
  
  export default ViewPessoal;
  
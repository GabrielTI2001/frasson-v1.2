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
import { RedirectToLogin } from "../../../Routes/PrivateRoute";
import CustomBreadcrumb from "../../../components/Custom/Commom";

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
        const getData = async () => {
            const status = RetrieveRecord(uuid, 'register/pessoal', (data) => {setPessoa(data); data.data_nascimento && calcIdade(data.data_nascimento)})
            if (status === 401){
                RedirectToLogin(navigate);
            }
        }
        if ((user.permissions && user.permissions.indexOf("view_cadastro_pessoal") === -1) && !user.is_superuser){
            navigate("/error/403")
        }
        if (!pessoa){
            getData()
        }
    },[])

    return (
    <>
        <CustomBreadcrumb>
            <span className="breadcrumb-item fw-bold">
                <Link className="link-fx text-primary" to={'/databases'}>Cadastros Gerais</Link>
            </span>
            <span className="breadcrumb-item fw-bold">
                <Link className="link-fx text-primary" to={'/databases/pessoal'}>Cadastro Pessoal</Link>
            </span>
            {pessoa && (
               <span className="breadcrumb-item fw-bold" aria-current="page">
                   {pessoa.razao_social}
               </span>             
            )}
        </CustomBreadcrumb>
        <Row className="mb-3">
            <div><FontAwesomeIcon icon={faCakeCandles} className="me-2"/>
                {pessoa && pessoa.data_nascimento ? `${new Date(pessoa.data_nascimento).toLocaleDateString('pt-BR', {timeZone: 'UTC'})} (${calcIdade(pessoa.data_nascimento)} anos)` :'-'}
            </div>
            <div><FontAwesomeIcon icon={faBriefcase} className="me-2"/>{pessoa && pessoa.profissao ? pessoa.profissao :'-'}</div>
            <div><FontAwesomeIcon icon={faUsersLine} className="me-2"/>{pessoa && pessoa.grupo_info ? pessoa.grupo_info :'-'}</div>
        </Row>
    </>
    );
  };
  
  export default ViewPessoal;
  
import { useEffect, useState } from "react";
import React from 'react';
import { RetrieveRecord } from "../../helpers/Data";
import {useNavigate, Link } from "react-router-dom";
import { Row, Col, Button } from "react-bootstrap";
import { Placeholder } from "react-bootstrap";
import FormAlongamento from "./Form";

const Edit = ({id, update, operacao}) => {
    const token = localStorage.getItem("token")
    const user = JSON.parse(localStorage.getItem("user"))
    const [alongamento, setAlongamento] = useState()
    const navigate = useNavigate();

    const setter = (data) =>{
        setAlongamento(data)
    }

    const submit = (data) => {
        setAlongamento(data)
        update('edit', data)
    }

    useEffect(() =>{
        const getData = async () => {
            const status = await RetrieveRecord(id, 'alongamentos/index', setter)
            if(status === 401){
                navigate("/auth/login")
            }
        }
        if ((user.permissions && user.permissions.indexOf("change_operacoes_credito") === -1) && !user.is_superuser){
            navigate("/error/403")
        }
        if (!alongamento){
            getData()
        }
    }, [])

    return (
    <>
    {alongamento && (
        <>
        <div><span className='fw-bold text-primary mb-1'>Informações da Operação</span></div>
        <Row xl={4} sm={3} xs={1} className="mt-1">
            <Col className='mb-2'>
                <strong className='me-1 d-block'>Beneficiário</strong>
                <span className='my-1'>{alongamento.info_operacao.beneficiario}</span>
            </Col>
            <Col className='mb-2'>
                <strong className='me-1 d-block'>CPF/CNPJ</strong>
                <span className='my-1'>{alongamento.info_operacao.cpf}</span>
            </Col>
            <Col className='mb-2'>
                <strong className='me-1 d-block'>N° Operação</strong>
                <span className='my-1'>{alongamento.info_operacao.numero_operacao}</span>
            </Col>
            <Col className='mb-2'>
                <strong className='me-1 d-block'>Valor Operação</strong>
                <span className='my-1'>
                    {alongamento.info_operacao.valor_operacao ? Number(alongamento.info_operacao.valor_operacao).toLocaleString(
                        'pt-BR', {minimumFractionDigits:2, maximumFractionDigits:2}
                    ) : '-'}
                </span>
            </Col>
            <Col className='mb-2'>
                <strong className='me-1 d-block'>Taxa Juros (%)</strong>
                <span className='my-1'>{alongamento.info_operacao.taxa_juros ? alongamento.info_operacao.taxa_juros : '-'}</span>
            </Col>
            <Col className='mb-2'>
                <strong className='me-1 d-block'>Nome Propriedade</strong>
                <span className='my-1'>{alongamento.info_operacao.imovel ? alongamento.info_operacao.imovel : '-'}</span>
            </Col>
            <Col className='mb-2'>
                <strong className='me-1 d-block'>N° Matrícula</strong>
                <span className='my-1'>{alongamento.info_operacao.matricula ? alongamento.info_operacao.matricula : '-'}</span>
            </Col>
            <Col className='mb-2'>
                <strong className='me-1 d-block'>Safra</strong>
                <span className='my-1'>{alongamento.info_operacao.safra ? alongamento.info_operacao.safra : '-'}</span>
            </Col>
            <Col className='mb-2'>
                <strong className='me-1 d-block'>1° Vencimento</strong>
                <span className='my-1'>
                    {alongamento.info_operacao.primeiro_vencimento ? new Date(alongamento.info_operacao.primeiro_vencimento).toLocaleDateString(
                        'pt-BR', {timeZone: 'UTC'}
                    ) : '-'}
                </span>
            </Col>
            <Col className='mb-2'>
                <strong className='me-1 d-block'>Item Financiado</strong>
                <span className='my-1 text-info'>{alongamento.info_operacao.item_financiado ? alongamento.info_operacao.item_financiado : '-'}</span>
            </Col>
            
        </Row>
        <div style={{fontSize: '11px'}}>Qualquer alteração nas informações da operação deverá ser realizada no Pipefy. 
            <Link className="fw-bold text-info" to={alongamento.info_operacao.url} target="__blank"> Clique Aqui</Link> para alterar esta operação.
        </div>
        <hr className="my-1"></hr>
        <FormAlongamento hasLabel type='edit' data={alongamento} submit={submit}/>
        </>
    )}
    </>
    );
  };
  
  export default Edit;
  
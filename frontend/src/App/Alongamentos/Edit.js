import { useEffect, useState } from "react";
import React from 'react';
import { RetrieveRecord } from "../../helpers/Data";
import {useNavigate, Link } from "react-router-dom";
import { Row, Col, OverlayTrigger, Tooltip } from "react-bootstrap";
import FormAlongamento from "./Form";
import { RedirectToLogin } from "../../Routes/PrivateRoute";
import ModalDelete from "../../components/Custom/ModalDelete";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCloudArrowDown, faFilePdf, faPen, faTrashCan } from "@fortawesome/free-solid-svg-icons";

const Edit = ({update, uuid}) => {
    const user = JSON.parse(localStorage.getItem("user"))
    const [alongamento, setAlongamento] = useState()
    const navigate = useNavigate();
    const [modaldelete, setModalDelete] = useState({show:false, link:null})

    const Click = (dados, type) =>{
        if (type === 'download'){
            const downloadFile = async (url) => {
                const response = await fetch(url.url);
                const blob = await response.blob();
                const filename = url.name;
                const link = document.createElement('a');
                link.href = window.URL.createObjectURL(blob);
                link.download = filename;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
            const filesToDownload = [
                {url:`${process.env.REACT_APP_API_URL}/alongamentos/pdf/download/${dados}/1`, 
                    name:`${alongamento.info_operacao.beneficiario} ${alongamento.info_operacao.numero_operacao} - page 1.pdf`},
                {url:`${process.env.REACT_APP_API_URL}/alongamentos/pdf/download/${dados}/2`, 
                    name:`${alongamento.info_operacao.beneficiario} ${alongamento.info_operacao.numero_operacao} - page 2.pdf`}
            ];
            if (alongamento.str_tipo_armazenagem === 'Silo Bag'){
                filesToDownload.push({url:`${process.env.REACT_APP_API_URL}/alongamentos/pdf/download/${dados}/3`, 
                name:`${alongamento.info_operacao.beneficiario} ${alongamento.info_operacao.numero_operacao} - page 3.pdf`})
            }
            // Itera sobre cada URL de arquivo e abre uma nova janela do navegador para fazer o download
            filesToDownload.forEach(url => {
                downloadFile(url)
            });
        }
        if (type === 'delete'){
            if ((user.permissions && user.permissions.indexOf("delete_operacoes_credito") !== -1) || user.is_superuser){
                setModalDelete({show:true, link:`${process.env.REACT_APP_API_URL}/alongamentos/done/${dados}/`})
            }
        }
    }

    const setter = (data) =>{
        setAlongamento(data)
    }

    const submit = (data) => {
        setAlongamento(data)
        update('edit', data)
    }

    useEffect(() =>{
        const getData = async () => {
            const status = await RetrieveRecord(uuid, 'alongamentos/done', setter)
            if(status === 401){
                RedirectToLogin(navigate)
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
        <Row xl={2} sm={1} xs={1} className="mt-1">
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
            <Col className='mb-2' xl={12}>
                <strong className='me-1 d-block' style={{fontSize:'12px'}}>Nome Propriedade</strong>
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
        <div>
            <OverlayTrigger overlay={
                <Tooltip id="overlay-trigger-example">PDF Alongamento</Tooltip>
            }>
                <Link to={`${process.env.REACT_APP_API_URL}/alongamentos/pdf/${uuid}`}>
                <FontAwesomeIcon icon={faFilePdf} className='text-danger me-2 cursor-pointer'/>
                </Link>
            </OverlayTrigger>

            <OverlayTrigger overlay={
                <Tooltip className='tooltip-a'>Download Páginas PDF</Tooltip>
            }>
                <FontAwesomeIcon icon={faCloudArrowDown} className='text-primary me-2 cursor-pointer' onClick={()=>{ Click(uuid, 'download')}}/>
            </OverlayTrigger>
            <FontAwesomeIcon icon={faTrashCan} className='text-danger me-2 cursor-pointer' onClick={()=>{ Click(uuid, 'delete')}}/>
        </div>
        <hr className="my-1"></hr>
        <FormAlongamento hasLabel type='edit' data={alongamento} submit={submit}/>
        <ModalDelete show={modaldelete.show} link={modaldelete.link} close={() => setModalDelete({...modaldelete, show:false})} update={update} />
        </>
    )}

    </>
    );
  };
  
  export default Edit;
  
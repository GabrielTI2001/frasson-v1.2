import React,{useEffect, useState} from 'react';
import { useParams, useNavigate } from "react-router-dom";
import { RetrieveRecord } from '../../../helpers/Data';
import { Link } from 'react-router-dom';
import { Button, Col, Row } from 'react-bootstrap';
import {Spinner} from 'react-bootstrap';
import KMLMap from '../../../components/map/KMLMap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload, faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';

const ViewCredit = () => {
    const {id} = useParams()
    const navigate = useNavigate()
    const user = JSON.parse(localStorage.getItem("user"))
    const [operacao, setOperacao] = useState()

    const setter = (data) =>{
        setOperacao(data)
    }

    useEffect(() =>{
        const getdata = async () =>{
            const status = await RetrieveRecord(id, 'pipefy/operacoes-contratadas', setter)
            if(status === 401){
                navigate("/auth/login")
            }
        }
        if ((user.permissions && user.permissions.indexOf("view_operacoes_contratadas") === -1) && !user.is_superuser){
            navigate("/error/403")
        }
        if (!operacao){
            getdata()
        }
    },[])

    return (
    <>
    <ol className="breadcrumb breadcrumb-alt fs-xs">
        <li className="breadcrumb-item fw-bold">
            <Link className="link-fx text-primary" to={'/analytics/credit'}>Operações Contratadas</Link>
        </li>
        <li className="breadcrumb-item fw-bold" aria-current="page">
            {operacao && operacao.beneficiario}
        </li>  
    </ol>
    {operacao ? <>
    <Row className='mt-2 mb-2'>
        <Col xl={4}>
            <strong className='d-block my-1'>Município Localização</strong>
            <span className='d-block my-1 text-info'>{farm.municipio_localizacao ? farm.municipio_localizacao : '-'}</span>
        </Col>
        <Col xl={2}>
            <strong className='d-block my-1'>Área Total (ha)</strong>
            <span className='d-block my-1 text-info'>
                {Number(farm.area_total).toLocaleString('pt-BR', {minimumFractionDigits:2, maximumFractionDigits:2})}
            </span>
        </Col>
        <Col xl={2}>
            <strong className='d-block my-1'>Data Registro</strong>
            <span className='d-block my-1 text-info'>
                {farm.data_registro ? new Date(farm.data_registro).toLocaleDateString('pt-BR', {timeZone:'UTC'}) : '-'}
            </span>
        </Col>
        <div className='d-block w-100'>
            {operacao.url_record &&
                <Link to={operacao.url_record} className='btn btn-primary py-0 px-2 me-2' target="_blank">
                    <FontAwesomeIcon icon={faMagnifyingGlass} className='me-1'/>Pipefy
                </Link>
            }
            {operacao.kml &&
                <Link className='btn btn-secondary py-0 px-2' to={operacao.kml}>
                    <FontAwesomeIcon icon={faDownload} className='me-1' />KML
                </Link>
            }   
        </div>
    </Row>
    <KMLMap
        mapStyle="Default"
        className="rounded-soft mt-0 google-maps-s container-map-l"
        token_api={operacao.token_apimaps}
        mapTypeId='satellite'
        urls={[operacao.kml]}
    />
    </>
    :<div className='text-center'><Spinner /></div>}
    </>
    );
};
  
export default ViewCredit;
  


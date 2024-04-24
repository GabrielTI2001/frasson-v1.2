import React,{useEffect, useState} from 'react';
import { useParams, useNavigate } from "react-router-dom";
import { RetrieveRecord } from '../../../helpers/Data';
import { Link } from 'react-router-dom';
import { Col, Row } from 'react-bootstrap';
import {Spinner} from 'react-bootstrap';
import { format } from 'date-fns';
import ResultAnaliseSolo from './SoloResults';
import GoogleMap from '../../../components/map/GoogleMap';
import MapInfo from './MapInfo';

const ViewAnaliseSolo = () => {
    const {uuid} = useParams()
    const navigate = useNavigate()
    const [analise, setAnalise] = useState()

    const setter = (data) =>{
        setAnalise(data)
    }

    useEffect(() =>{
        const getdata = async () =>{
            const status = await RetrieveRecord(uuid, 'register/analysis-soil-results', setter)
            if(status === 401){
                navigate("/auth/login")
            }
        }
        if (!analise){
            getdata()
        }
    },[analise])

    return (
    <>
    <ol className="breadcrumb breadcrumb-alt fs-xs mb-1">
        <li className="breadcrumb-item fw-bold">
            <Link className="link-fx text-primary" to={'/register/analysis/soil'}>Análises Solo</Link>
        </li>
        <li className="breadcrumb-item fw-bold" aria-current="page">
            {analise && analise.localizacao}
        </li>  
    </ol>
    {analise ? <>
    <Row className='mt-2' xs={1} lg={2} xxl={2}>
        <Col className='d-flex flex-column justify-content-between'>
            <div>
                <div className='mb-1'><strong>Cliente: </strong>{analise.str_cliente}</div>
                <div className='mb-1'><strong>Localização: </strong>{analise.localizacao}</div>
                <div className='mb-1'><strong>Data Coleta: </strong>{format(analise.data_coleta, 'dd/MM/yyyy')}</div>
                <div className='mb-1'><strong>Identificação Amostra: </strong>{analise.identificacao_amostra}</div>
                <div className='mb-1'><strong>Responsável Coleta: </strong>{analise.responsavel}</div>
                <div className='mb-1'><strong>Laboratório da Análise: </strong>{analise.laboratorio_analise}</div>
                <div className='mb-1'><strong>Número da Amostra: </strong>{analise.numero_controle ? analise.numero_controle : '-'}</div>
                <div className='mb-1'><strong>Profundidade (cm): </strong>{Number(analise.profundidade).toLocaleString('pt-BR',
                 {minimumFractionDigits: 2, maximumFractionDigits:2})}</div>
                <div className='mb-1'>Criado por <span class="fw-semibold text-primary">{analise.creation.created_by} </span> 
                {format(analise.creation.created_at, 'dd/MM/yyyy HH:mm')}</div>
            </div>
            <hr className="mb-1 mt-2 d-flex" style={{height: '1px', color: 'black', opacity: '.2'}}></hr>
        </Col>
        <ResultAnaliseSolo dados={analise.results} />
    </Row>
    <Row xxl={2} lg={2}>
        <Col>
            <GoogleMap
                initialCenter={{
                    lat: Number(analise.latitude_gd),
                    lng: Number(analise.longitude_gd)
                }}
                mapStyle="Default"
                className="rounded-soft mt-2 google-maps container-map"
                token_api={analise.token_apimaps}
                mapTypeId='satellite'
                coordenadas={[{id: analise.id,latitude_gd:analise.latitude_gd, longitude_gd:analise.longitude_gd}]}
            >
                <MapInfo/>
            </GoogleMap>
        </Col>
        <Col></Col>
    </Row></>
    :<div className='text-center'><Spinner /></div>}
    </>
    );
};
  
export default ViewAnaliseSolo;
  


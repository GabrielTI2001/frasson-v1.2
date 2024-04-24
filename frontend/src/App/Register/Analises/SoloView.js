import React,{useEffect, useState} from 'react';
import { useParams, useNavigate } from "react-router-dom";
import { RetrieveRecord } from '../../../helpers/Data';
import { Link } from 'react-router-dom';
import { Col, Row } from 'react-bootstrap';
import {Spinner} from 'react-bootstrap';
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
                <div className='mb-1'><strong>Data Coleta: </strong>{new Date(analise.data_coleta).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</div>
                <div className='mb-1'><strong>Identificação Amostra: </strong>{analise.identificacao_amostra}</div>
                <div className='mb-1'><strong>Responsável Coleta: </strong>{analise.responsavel}</div>
                <div className='mb-1'><strong>Laboratório da Análise: </strong>{analise.laboratorio_analise}</div>
                <div className='mb-1'><strong>Número da Amostra: </strong>{analise.numero_controle ? analise.numero_controle : '-'}</div>
                <div className='mb-1'><strong>Profundidade (cm): </strong>{Number(analise.profundidade).toLocaleString('pt-BR',
                 {minimumFractionDigits: 2, maximumFractionDigits:2})}</div>
                <div className='mb-1'>Criado por <span className="fw-semibold text-primary">{analise.creation.created_by} </span> 
                {new Date(analise.creation.created_at).toLocaleDateString('pt-BR', {timeZone: 'UTC'})+' '+new Date(analise.creation.created_at).toLocaleTimeString('pt-BR')}</div>
            </div>
            <hr className="mb-1 mt-2 d-flex" style={{height: '1px', color: 'black', opacity: '.2'}}></hr>
        </Col>
        <ResultAnaliseSolo dados={analise.results} />
    </Row>
    <Row xxl={2} lg={2} xs={1}>
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
        <Col>
            <div className='row gy-1'>
                <h4 className='mb-1' style={{fontSize:'14px'}}>Outras Informações</h4>
                <Col xxl={12} lg={12}><strong>CTC Total (cmolc/dm<sup>3</sup>):</strong>
                    <span className='mx-2 fw-bold'>{analise.other_info.capacidade_troca_cations}</span>
                </Col>
                <Col xxl={12} lg={12}><strong>Soma de Bases (cmolc/dm<sup>3</sup>):</strong>
                    <span className='mx-2 fw-bold'>{analise.other_info.soma_bases}</span>
                </Col>
                <Col xxl={12} lg={12}><strong>Saturação de Bases (V%):</strong>
                    <span className='mx-2 fw-bold'>{analise.other_info.saturacao_bases}</span>
                </Col>
                <Col xxl={12} lg={12}><strong>Relação Ca/Mg:</strong>
                {analise.other_info.rel_calcio_magnesio ? 
                    <>
                    <span className='mx-2 fw-bold'>
                        {Number(analise.other_info.rel_calcio_magnesio.value).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits:2})}
                    </span>
                    <span className={`badge bg-${analise.other_info.rel_calcio_magnesio.color} text-white fw-normal px-2`} style={{fontSize: '.75em'}}>
                        {analise.other_info.rel_calcio_magnesio.level}
                    </span>
                    </> 
                : <span className='mx-2 fw-bold'>-</span>}  
                </Col>
                <Col xxl={12} lg={12}><strong>Relação Ca/K:</strong>
                {analise.other_info.rel_calcio_potassio ? 
                    <>
                    <span className='mx-2 fw-bold'>
                        {Number(analise.other_info.rel_calcio_potassio.value).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits:2})}
                    </span>
                    <span className={`badge bg-${analise.other_info.rel_calcio_potassio.color} text-white fw-normal px-2`} style={{fontSize: '.75em'}}>
                        {analise.other_info.rel_calcio_potassio.level}
                    </span>
                    </> 
                : <span className='mx-2 fw-bold'>-</span>}  
                </Col>
                <Col xxl={12} lg={12}><strong>Relação Mg/K:</strong>
                {analise.other_info.rel_magnesio_potassio ? 
                    <>
                    <span className='mx-2 fw-bold'>
                        {Number(analise.other_info.rel_magnesio_potassio.value).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits:2})}
                    </span>
                    <span className={`badge bg-${analise.other_info.rel_magnesio_potassio.color} text-white fw-normal px-2`} style={{fontSize: '.75em'}}>
                        {analise.other_info.rel_magnesio_potassio.level}
                    </span>
                    </> 
                : <span className='mx-2 fw-bold'>-</span>}  
                </Col>
                <Col xxl={12} lg={12}><strong>Necessidade de Calagem (ton/ha):</strong>
                    <span className='mx-2 fw-bold'>{analise.other_info.calagem}</span>
                </Col>
                <div className="mt-4 fw-normal" style={{fontSize: '11px'}}>
                    <span>* Níveis ideais de nutrientes no solo conforme interpretação da Embrapa Cerrados.</span>
                </div>
            </div>
        </Col>
    </Row></>
    :<div className='text-center'><Spinner /></div>}
    </>
    );
};
  
export default ViewAnaliseSolo;
  


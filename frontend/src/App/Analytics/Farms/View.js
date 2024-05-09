import React,{useEffect, useState} from 'react';
import { useParams, useNavigate } from "react-router-dom";
import { RetrieveRecord } from '../../../helpers/Data';
import { Link } from 'react-router-dom';
import { Button, Col, Row } from 'react-bootstrap';
import {Spinner} from 'react-bootstrap';
import KMLMap from '../../../components/map/KMLMap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload, faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';

const ViewFarm = () => {
    const {id} = useParams()
    const navigate = useNavigate()
    const user = JSON.parse(localStorage.getItem("user"))
    const [farm, setFarm] = useState()

    const setter = (data) =>{
        setFarm(data)
    }

    useEffect(() =>{
        const getdata = async () =>{
            const status = await RetrieveRecord(id, 'analytics/farms', setter)
            if(status === 401){
                navigate("/auth/login")
            }
        }
        if ((user.permissions && user.permissions.indexOf("view_imoveis_rurais") === -1) && !user.is_superuser){
            navigate("/error/403")
        }
        if (!farm){
            getdata()
        }
    },[])

    return (
    <>
    <ol className="breadcrumb breadcrumb-alt fs-xs">
        <li className="breadcrumb-item fw-bold">
            <Link className="link-fx text-primary" to={'/analytics/farms'}>Imóveis Rurais</Link>
        </li>
        <li className="breadcrumb-item fw-bold" aria-current="page">
            {farm && farm.nome_imovel}
        </li>  
    </ol>
    {farm ? <>
    <Row className='mt-2 mb-2'>
        <Col className='d-flex flex-column'>
            <div className='col'>
                <Row>
                    <Col xl={4}>
                        <strong className='d-block my-1'>Nome da Fazenda</strong>
                        <span className='d-block my-1 text-info'>{farm.nome_imovel ? farm.nome_imovel : '-'}</span>
                    </Col>
                    <Col xl={2}>
                        <strong className='d-block my-1'>Matrícula</strong>
                        <span className='d-block my-1 text-info'>{farm.matricula_imovel ? farm.matricula_imovel : '-'}</span>
                    </Col>
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
                    <Col xl={4}>
                        <strong className='d-block my-1'>Nome Proprietário</strong>
                        <span className='d-block my-1 text-info'>{farm.str_proprietario ? farm.str_proprietario : '-'}</span>
                    </Col>
                    <Col xl={2}>
                        <strong className='d-block my-1'>Livro Registro</strong>
                        <span className='d-block my-1 text-info'>{farm.livro_registro ? farm.livro_registro : '-'}</span>
                    </Col>
                    <Col xl={4}>
                        <strong className='d-block my-1'>Número Registro</strong>
                        <span className='d-block my-1 text-info'>{farm.numero_registro ? farm.numero_registro : ''}</span>
                    </Col>
                    <Col xl={2}>
                        <strong className='d-block my-1'>Data Registro</strong>
                        <span className='d-block my-1 text-info'>
                            {farm.data_registro ? new Date(farm.data_registro).toLocaleDateString('pt-BR', {timeZone:'UTC'}) : '-'}
                        </span>
                    </Col>
                    <Col xl={2}>
                        <strong className='d-block my-1'>Área Veg. Nativa (ha)</strong>
                        <span className='d-block my-1 text-info'>
                            {farm.area_veg_nat ? Number(farm.area_total).toLocaleString('pt-BR', {minimumFractionDigits:2, maximumFractionDigits:2}) : '-'}
                        </span>
                    </Col>
                    <Col xl={2}>
                        <strong className='d-block my-1'>Área APP (ha)</strong>
                        <span className='d-block my-1 text-info'>
                            {farm.area_app ? Number(farm.area_app).toLocaleString('pt-BR', {minimumFractionDigits:2, maximumFractionDigits:2}) : '-'}
                        </span>
                    </Col>
                    <Col xl={2}>
                        <strong className='d-block my-1'>Área RL (ha)</strong>
                        <span className='d-block my-1 text-info'>
                            {farm.area_reserva ? Number(farm.area_reserva).toLocaleString('pt-BR', {minimumFractionDigits:2, maximumFractionDigits:2}) : '-'}
                        </span>
                    </Col>
                    <Col xl={4}>
                        <strong className='d-block my-1'>Área Explorada (ha)</strong>
                        <span className='d-block my-1 text-info'>
                            {farm.area_explorada ? Number(farm.area_explorada).toLocaleString('pt-BR', {minimumFractionDigits:2, maximumFractionDigits:2}) : '-'}
                        </span>
                    </Col>
                    <Col xl={2}>
                        <strong className='d-block my-1'>Módulos Fiscais</strong>
                        <span className='d-block my-1 text-info'>
                            {farm.modulos_fiscais ? Number(farm.modulos_fiscais).toLocaleString('pt-BR', {minimumFractionDigits:2, maximumFractionDigits:2}) : '-'}
                        </span>
                    </Col>
                    <Col xl={6}>
                        <strong className='d-block my-1'>N° CAR</strong>
                        <span className='d-block my-1 text-info'>{farm.car ? farm.car : '-'}</span>
                    </Col>
                    <Col xl={4}>
                        <strong className='d-block my-1'>N° CCIR</strong>
                        <span className='d-block my-1 text-info'>{farm.ccir ? farm.ccir : '-'}</span>
                    </Col>
                    <Col xl={2}>
                        <strong className='d-block my-1'>N° NIRF</strong>
                        <span className='d-block my-1 text-info'>{farm.nirf ? farm.nirf : '-'}</span>
                    </Col>
                    <Col xl={12}>
                        <strong className='d-block my-1'>Roteiro Acesso</strong>
                        <span className='d-block my-1 text-info'>{farm.roteiro_acesso ? farm.roteiro_acesso : '-'}</span>
                    </Col>
                </Row>
            </div>
            <div className='d-block w-100'>
                {farm.url_record &&
                    <Link to={farm.url_record} className='btn btn-primary py-0 px-2 me-2' target="_blank">
                        <FontAwesomeIcon icon={faMagnifyingGlass} className='me-1'/>Pipefy
                    </Link>
                }
                {farm.kml &&
                    <Link className='btn btn-secondary py-0 px-2' to={farm.kml}>
                        <FontAwesomeIcon icon={faDownload} className='me-1' />KML
                    </Link>
                }   
            </div>
        </Col>
    </Row>
    <KMLMap
        mapStyle="Default"
        className="rounded-soft mt-0 google-maps-s container-map-l"
        token_api={farm.token_apimaps}
        mapTypeId='satellite'
        urls={[farm.kml]}
    />
    </>
    :<div className='text-center'><Spinner /></div>}
    </>
    );
};
  
export default ViewFarm;
  


import React,{useEffect, useState} from 'react';
import { useParams, useNavigate } from "react-router-dom";
import { RetrieveRecord } from '../../../helpers/Data';
import { Link } from 'react-router-dom';
import { CloseButton, Col, Modal, Placeholder, Row } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilePdf, faGlobeAmericas, faPen, faTrash } from '@fortawesome/free-solid-svg-icons';
import PolygonMap from '../../../components/map/PolygonMap';
import ModalDelete from '../../../components/Custom/ModalDelete';
import RegimeForm from './Form';

const ViewRegime = () => {
    const {uuid} = useParams()
    const navigate = useNavigate()
    const user = JSON.parse(localStorage.getItem("user"))
    const [regime, setRegime] = useState()
    const [showmodal, setShowModal] = useState({show:false})
    const [modalDelete, setModalDelete] = useState({show:false, link:''})

    const setter = (data) =>{
        setRegime(data)
    }

    const submit = (type, data, id) => {
        if (type === 'edit'){
            setRegime(data)
        }
        if (type === 'delete'){
            navigate('/farms/regime')
        }
        setShowModal({show:false})
    }

    useEffect(() =>{
        const getdata = async () =>{
            const status = await RetrieveRecord(uuid, 'farms/regime', setter)
            if(status === 401){
                navigate("/auth/login")
            }
        }
        if ((user.permissions && user.permissions.indexOf("view_regimes_exploracao") === -1) && !user.is_superuser){
            navigate("/error/403")
        }
        if (!regime){
            getdata()
        }
    },[regime])

    return (
    <>
    <ol className="breadcrumb breadcrumb-alt fs-xs">
        <li className="breadcrumb-item fw-bold">
            <Link className="link-fx text-primary" to={'/farms/regime'}>Regimes de Exploração</Link>
        </li>
        <li className="breadcrumb-item fw-bold" aria-current="page">
            {regime && regime.farm_data.nome}
        </li>  
    </ol>
    {regime ? <>
    <Row className='mt-2 mb-2' xs={1} lg={2} xxl={2}>
        <Col className='d-flex flex-column'>
            <div className='col'>
                <h4 className='fw-bold' style={{fontSize:'12px'}}>Informações do Regime de Exploração</h4>
                <hr className="mb-1 mt-0 d-flex" style={{height: '1px', color: 'black', opacity: '.2'}}></hr>
                <Row xxl={4} xl={2} sm={2} xs={1}>
                    <Col>
                        <strong className='d-block my-1'>Quem Explora?</strong>
                        <span className='d-block my-1 text-info'>{regime.str_quem_explora}</span>
                    </Col>
                    <Col>
                        <strong className='d-block my-1'>Instituição Vinculada</strong>
                        <span className='d-block my-1 text-info'>{regime.str_instituicao}</span>
                    </Col>
                    <Col>
                        <strong className='d-block my-1'>Regime de Exploração</strong>
                        <span className='d-block my-1 text-info'>{regime.str_regime}</span>
                    </Col>
                    <Col>
                        <strong className='d-block my-1'>Data Início</strong>
                        <span className='d-block my-1 text-info'>
                            {regime.data_inicio ? new Date(regime.data_inicio).toLocaleDateString('pt-BR', {timeZone:'UTC'}): '-'}
                        </span>
                    </Col>
                    <Col>
                        <strong className='d-block my-1'>Data Término</strong>
                        <span className='d-block my-1 text-info'>
                            {regime.data_termino ? new Date(regime.data_termino).toLocaleDateString('pt-BR', {timeZone:'UTC'}): '-'}
                        </span>
                    </Col>
                    <Col>
                        <strong className='d-block my-1'>Área Cedida (ha)</strong>
                        <span className='d-block my-1 text-info'>
                            {regime.area ? Number(regime.area).toLocaleString('pt-BR', {minimumFractionDigits:2, maximumFractionDigits:2}) : '-'}
                        </span>
                    </Col>
                    <Col>
                        <strong className='d-block my-1'>Atividades Exploradas</strong>
                        <span className='d-block my-1 text-info'>{regime.str_atividade || '-'}</span>
                    </Col>
                </Row>
            </div>
            <div className='d-block w-100'>
                <Link to={`${process.env.REACT_APP_API_URL}/farms/kml/regime/${regime.uuid}`} className='btn btn-secondary py-0 px-2 me-2'>
                    <FontAwesomeIcon icon={faGlobeAmericas} className='me-1'/> KML
                </Link>
                <Link className="btn btn-primary shadow-none py-0 px-2 me-2"
                    style={{padding: '2px 8px'}} onClick={() =>{setShowModal({show:true, data:regime})}}
                ><FontAwesomeIcon icon={faPen}/> Editar</Link>
                <Link className="btn btn-danger shadow-none py-0 px-2"
                    style={{padding: '2px 8px'}} 
                    onClick={() =>{setModalDelete({show:true, link:`${process.env.REACT_APP_API_URL}/farms/regime/${regime.uuid}/`})}}
                ><FontAwesomeIcon icon={faTrash}/> Excluir</Link>
            </div>
        </Col>
        <Col className='d-flex flex-column'>
            <h4 className='fw-bold' style={{fontSize:'12px'}}>Informações do Imóvel Rural</h4>
            <hr className="mb-1 mt-0 d-flex" style={{height: '1px', color: 'black', opacity: '.2'}}></hr>
            <Row xl={2} xs={1}>
                <Col>
                    <strong className='d-block my-1'>Nome Imóvel</strong>
                    <span className='d-block my-1 text-info'>{regime.farm_data.nome}</span>
                </Col>
                <Col>
                    <strong className='d-block my-1'>Matrícula</strong>
                    <span className='d-block my-1 text-info'>{regime.farm_data.matricula}</span>
                </Col>
                <Col>
                    <strong className='d-block my-1'>Nome Proprietário</strong>
                    <span className='d-block my-1 text-info'>{regime.farm_data.proprietarios}</span>
                </Col>
                <Col>
                    <strong className='d-block my-1'>Área Total (ha)</strong>
                    <span className='d-block my-1 text-info'>
                        {regime.farm_data.area_total ? Number(regime.farm_data.area_total).toLocaleString('pt-BR', {minimumFractionDigits:2, maximumFractionDigits:2}): '-'}
                    </span>
                </Col>
                <Col>
                    <strong className='d-block my-1'>Área Expl. (ha)</strong>
                    <span className='d-block my-1 text-info'>
                        {regime.farm_data.area_explorada ? Number(regime.farm_data.area_explorada).toLocaleString('pt-BR', {minimumFractionDigits:2, maximumFractionDigits:2}): '-'}
                    </span>
                </Col>
                <Col>
                    <strong className='d-block my-1'>Área RL (ha)</strong>
                    <span className='d-block my-1 text-info'>
                        {regime.farm_data.area_rl ? Number(regime.farm_data.area_rl).toLocaleString('pt-BR', {minimumFractionDigits:2, maximumFractionDigits:2}): '-'}
                    </span>
                </Col>
                <Col>
                    <strong className='d-block my-1'>Área APP (ha)</strong>
                    <span className='d-block my-1 text-info'>
                        {regime.farm_data.area_app ? Number(regime.farm_data.area_app).toLocaleString('pt-BR', {minimumFractionDigits:2, maximumFractionDigits:2}): '-'}
                    </span>
                </Col>     
                <Col>
                    <strong className='d-block my-1'>Área Veg. Nativa (ha)</strong>
                    <span className='d-block my-1 text-info'>
                        {regime.farm_data.area_veg_nat ? Number(regime.farm_data.area_veg_nat).toLocaleString('pt-BR', {minimumFractionDigits:2, maximumFractionDigits:2}): '-'}
                    </span>
                </Col>     
                <Col xl={12}>
                    <strong className='d-block my-1'>N° CAR</strong>
                    <span className='d-block my-1 text-info'>{regime.farm_data.codigo_car || '-'}</span>
                </Col> 
                <Col>
                    <strong className='d-block my-1'>Código do Imóvel
                    </strong>
                    <span className='d-block my-1 text-info'>{regime.farm_data.codigo_imovel || '-'}</span>
                </Col> 
                <Col>
                    <strong className='d-block my-1'>Módulos Fiscais</strong>
                    <span className='d-block my-1 text-info'>
                        {regime.farm_data.modulos_fiscais ? Number(regime.farm_data.modulos_fiscais).toLocaleString('pt-BR',{minimumFractionDigits:4}): '-'}
                    </span>
                </Col>   
            </Row>
        </Col>
    </Row>
    <PolygonMap
        initialCenter={{
            lat: regime.coordenadas.length > 0 ? Number(regime.coordenadas[0]['lat']) : -13.7910,
            lng: regime.coordenadas.length > 0 ? Number(regime.coordenadas[0]['lng']) : -45.6814
        }}
        mapStyle="Default"
        className="rounded-soft mt-2 google-maps-l container-map"
        token_api={regime.token_apimaps}
        mapTypeId='satellite'
        polygons={[{path:regime.coordenadas}]}
        zoom={11}
    />
    </>
    :
    <div>
        <Placeholder animation="glow">
            <Placeholder xs={7} /> <Placeholder xs={4} /> 
            <Placeholder xs={4} />
            <Placeholder xs={6} /> <Placeholder xs={8} />
        </Placeholder>    
    </div>   
    }
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
                {showmodal.data ? 'Editar' : 'Adicionar' } Regime de Exploração
            </Modal.Title>
                <CloseButton onClick={() => setShowModal({show:false})}/>
        </Modal.Header>
        <Modal.Body>
            <Row className="flex-center sectionform">
                {showmodal.data
                    ? <RegimeForm type='edit' hasLabel submit={submit} data={regime}/>
                    : null
                } 
            </Row>
        </Modal.Body>
    </Modal>
    <ModalDelete show={modalDelete.show} link={modalDelete.link} close={() => setModalDelete({show: false, link:''})} update={submit}/>
    </>
    );
};
  
export default ViewRegime;
  


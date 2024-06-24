import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Tabs, Tab, Row, Col, Placeholder, Modal, CloseButton } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass, faDownload, faPenAlt, faPen, faTrash } from '@fortawesome/free-solid-svg-icons';
import KMLMap from '../../../components/map/KMLMap';
import PolygonMap from '../../../components/map/PolygonMap';
import { HandleSearch, RetrieveRecord } from '../../../helpers/Data';
import ModalDelete from '../../../components/Custom/ModalDelete';
import FarmForm from './Form';

const ViewFarm = () => {
    const { uuid } = useParams();
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user"));
    const [farm, setFarm] = useState();
    const [car, setCar] = useState();
    const [sigef, setSigef] = useState();
    const [activeTab, setActiveTab] = useState('cadastro');
    const [showmodal, setShowModal] = useState({show:false})
    const [modalDelete, setModalDelete] = useState({show:false, link:''})

    const setter = (data) => {
        setFarm(data);
    }

    const handleTabSelect = async (key) => {
        if (key === 'car'){
            HandleSearch('', 'farms/car', (data) => {setCar(data)}, `?imovel=${farm.id}`)
        }
        if (key === 'sigef'){
            HandleSearch('', 'farms/parcelas-sigef', (data) => {setSigef(data)}, `?imovel=${farm.id}`)
        }
    }

    const submit = (type, data, id) => {
        if (type === 'edit'){
            setFarm(data)
        }
        if (type === 'delete'){
            navigate('/farms/farms')
        }
        setShowModal({show:false})
    }

    useEffect(() => {
        const getData = async () => {
            const status = await RetrieveRecord(uuid, 'farms/farms', setter);
            if (status === 401) {
                navigate("/auth/login");
            }
        }

        if ((user.permissions && user.permissions.indexOf("view_imoveis_rurais") === -1) && !user.is_superuser) {
            navigate("/error/403");
        }

        if (!farm) {
            getData();
        }
    }, []);

    return (
    <>
    <ol className="breadcrumb breadcrumb-alt fs-xs text-body">
        <li className="breadcrumb-item fw-bold">
            <Link className="link-fx text-primary" to={'/farms/farms'}>Imóveis Rurais</Link>
        </li>
        <li className="breadcrumb-item fw-bold" aria-current="page">
            {farm && farm.nome}
        </li>  
    </ol>
    {farm ? <>
        <Tabs defaultActiveKey="cadastro" id="uncontrolled-tab-example" onSelect={handleTabSelect}>
            <Tab eventKey="cadastro" title="Cadastro Imóvel" className='border-bottom border-x p-3'>
                <Row className='mt-2 mb-2'>
                    <Col className='d-flex flex-column'>
                        <div className='col'>
                            <Row>
                                <Col xl={4} sm={6}>
                                    <strong className='d-block my-1'>Nome da Fazenda</strong>
                                    <span className='d-block my-1 text-info'>{farm.nome ? farm.nome : '-'}</span>
                                </Col>
                                <Col xl={2} sm={6}>
                                    <strong className='d-block my-1'>Matrícula</strong>
                                    <span className='d-block my-1 text-info'>{farm.matricula ? farm.matricula : '-'}</span>
                                </Col>
                                <Col xl={4} sm={6}>
                                    <strong className='d-block my-1'>Município Localização</strong>
                                    <span className='d-block my-1 text-info'>{farm.municipio_localizacao ? farm.municipio_localizacao : '-'}</span>
                                </Col>
                                <Col xl={2} sm={6}>
                                    <strong className='d-block my-1'>Área Total (ha)</strong>
                                    <span className='d-block my-1 text-info'>
                                        {Number(farm.area_total).toLocaleString('pt-BR', {minimumFractionDigits:2, maximumFractionDigits:2})}
                                    </span>
                                </Col>
                                <Col xl={4} sm={6}>
                                    <strong className='d-block my-1'>Proprietários</strong>
                                    <span className='d-block my-1 text-info'>
                                        {farm.str_proprietarios.map(p => p.razao_social).join(', ')}
                                    </span>
                                </Col>
                                <Col xl={2} sm={6}>
                                    <strong className='d-block my-1'>Livro Registro</strong>
                                    <span className='d-block my-1 text-info'>{farm.livro_registro ? farm.livro_registro : '-'}</span>
                                </Col>
                                <Col xl={4} sm={6}>
                                    <strong className='d-block my-1'>Número Registro</strong>
                                    <span className='d-block my-1 text-info'>{farm.numero_registro ? farm.numero_registro : ''}</span>
                                </Col>
                                <Col xl={4} sm={6}>
                                    <strong className='d-block my-1'>CNS</strong>
                                    <span className='d-block my-1 text-info'>{farm.cns ? farm.cns : ''}</span>
                                </Col>
                                <Col xl={2} sm={6}>
                                    <strong className='d-block my-1'>Data Registro</strong>
                                    <span className='d-block my-1 text-info'>
                                        {farm.data_registro ? new Date(farm.data_registro).toLocaleDateString('pt-BR', {timeZone:'UTC'}) : '-'}
                                    </span>
                                </Col>
                                <Col xl={2} sm={6}>
                                    <strong className='d-block my-1'>CEP</strong>
                                    <span className='d-block my-1 text-info'>{farm.cep ? farm.cep : ''}</span>
                                </Col>
                                <Col xl={4} sm={6}>
                                    <strong className='d-block my-1'>Endereço</strong>
                                    <span className='d-block my-1 text-info'>{farm.endereco ? farm.endereco : ''}</span>
                                </Col>
                                <Col xl={4} sm={6}>
                                    <strong className='d-block my-1'>Título Posse</strong>
                                    <span className='d-block my-1 text-info'>{farm.titulo_posse ? farm.titulo_posse : ''}</span>
                                </Col>
                                <Col xl={2} sm={6}>
                                    <strong className='d-block my-1'>Área Veg. Nativa (ha)</strong>
                                    <span className='d-block my-1 text-info'>
                                        {farm.area_veg_nat ? Number(farm.area_total).toLocaleString('pt-BR', {minimumFractionDigits:2, maximumFractionDigits:2}) : '-'}
                                    </span>
                                </Col>
                                <Col xl={2} sm={6}>
                                    <strong className='d-block my-1'>Área APP (ha)</strong>
                                    <span className='d-block my-1 text-info'>
                                        {farm.area_app ? Number(farm.area_app).toLocaleString('pt-BR', {minimumFractionDigits:2, maximumFractionDigits:2}) : '-'}
                                    </span>
                                </Col>
                                <Col xl={2} sm={6}>
                                    <strong className='d-block my-1'>Área RL (ha)</strong>
                                    <span className='d-block my-1 text-info'>
                                        {farm.area_reserva ? Number(farm.area_reserva).toLocaleString('pt-BR', {minimumFractionDigits:2, maximumFractionDigits:2}) : '-'}
                                    </span>
                                </Col>
                                <Col xl={4} sm={6}>
                                    <strong className='d-block my-1'>Área Explorada (ha)</strong>
                                    <span className='d-block my-1 text-info'>
                                        {farm.area_explorada ? Number(farm.area_explorada).toLocaleString('pt-BR', {minimumFractionDigits:2, maximumFractionDigits:2}) : '-'}
                                    </span>
                                </Col>
                                <Col xl={2} sm={6}>
                                    <strong className='d-block my-1'>Módulos Fiscais</strong>
                                    <span className='d-block my-1 text-info'>
                                        {farm.modulos_fiscais ? Number(farm.modulos_fiscais).toLocaleString('pt-BR', {minimumFractionDigits:2, maximumFractionDigits:2}) : '-'}
                                    </span>
                                </Col>
                                <Col xl={2} sm={6}>
                                    <strong className='d-block my-1'>Localização Reserva</strong>
                                    <span className='d-block my-1 text-info'>{farm.str_localizacao_reserva ? farm.str_localizacao_reserva : ''}</span>
                                </Col>
                                <Col xl={4} sm={6}>
                                    <strong className='d-block my-1'>N° CAR</strong>
                                    <span className='d-block my-1 text-info'>{farm.car ? farm.car : '-'}</span>
                                </Col>
                                <Col xl={4} sm={6}>
                                    <strong className='d-block my-1'>N° CCIR</strong>
                                    <span className='d-block my-1 text-info'>{farm.ccir ? farm.ccir : '-'}</span>
                                </Col>
                                <Col xl={2} sm={6}>
                                    <strong className='d-block my-1'>N° NIRF</strong>
                                    <span className='d-block my-1 text-info'>{farm.numero_nirf ? farm.numero_nirf : '-'}</span>
                                </Col>
                                <Col xl={4} sm={6}>
                                    <strong className='d-block my-1'>Cartório</strong>
                                    <span className='d-block my-1 text-info'>{farm.str_cartorio ? farm.str_cartorio : '-'}</span>
                                </Col>
                                <Col xl={12} sm={12}>
                                    <strong className='d-block my-1'>Roteiro Acesso</strong>
                                    <span className='d-block my-1 text-info'>{farm.roteiro_acesso ? farm.roteiro_acesso : '-'}</span>
                                </Col>
                            </Row>
                        </div>
                    </Col>
                    <Row>
                        <Col xl={'auto'} sm='auto' xs={'auto'} className='pe-0'>
                            <Link className="text-decoration-none btn btn-primary shadow-none fs--1"
                                style={{padding: '2px 8px'}} onClick={() =>{setShowModal({show:true, data:farm})}}
                            ><FontAwesomeIcon icon={faPen}/> Editar</Link>
                        </Col>
                        <Col xl={'auto'} sm='auto' xs={'auto'} className='pe-0'>
                            <Link className="text-decoration-none btn btn-danger shadow-none fs--1"
                                style={{padding: '2px 8px'}} 
                                onClick={() =>{setModalDelete({show:true, link:`${process.env.REACT_APP_API_URL}/farms/farms/${farm.uuid}/`})}}
                            ><FontAwesomeIcon icon={faTrash}/> Excluir</Link>
                        </Col>
                    </Row>
                </Row>
                <hr className='my-1'></hr>
                <div>
                    <div className='mb-2 mt-2'>
                        <strong className='me-2'>Sincronização CAR</strong>
                        {farm.coordenadas_car.length > 0 
                            ? <span className='badge bg-success fs--2'>Concluída</span> 
                            : <span className='badge bg-danger fs--2'>Pendente</span> 
                        }
                    </div>
                    <div>
                        <strong className='me-2'>Sincronização SIGEF</strong>
                        {farm.parcelas_sigef.length > 0 
                            ? <span className='badge bg-success fs--2'>Concluída</span> 
                            : <span className='badge bg-danger fs--2'>Pendente</span> 
                        }
                    </div>
                </div>
            </Tab>
        {farm && farm.coordenadas_matricula.length > 0 &&
            <Tab eventKey="kml" title="Coordenadas Matrícula" className='border-bottom border-x p-3'>
                <div className='d-flex justify-content-between'>
                    <strong className='mb-1'>KML da Matrícula {farm.matricula_imovel}</strong>   
                    <Link className='btn btn-secondary fs--2 py-0 px-2' to={`${process.env.REACT_APP_API_URL}/farms/kml/${farm.uuid}`}>
                        <FontAwesomeIcon icon={faDownload} className='me-1' />KML
                    </Link>
                </div>
                <PolygonMap
                    initialCenter={{
                        lat: farm.coordenadas_matricula.length > 0 ? Number(farm.coordenadas_matricula[0]['lat']) : -13.7910,
                        lng: farm.coordenadas_matricula.length > 0 ? Number(farm.coordenadas_matricula[0]['lng']) : -45.6814
                    }}
                    mapStyle="Default"
                    className="rounded-soft mt-2 google-maps-l container-map"
                    token_api={farm.token_apimaps}
                    mapTypeId='satellite'
                    polygons={[{path:farm.coordenadas_matricula}]}
                    zoom={11}
                />
            </Tab>
        }
        {farm.coordenadas_car &&
            <Tab eventKey="car" title="CAR" className='border-bottom border-x p-3'>
                {car ? 
                    <>
                        <div><strong>CAR: </strong><span>{farm.car}</span></div>
                        <PolygonMap
                            initialCenter={{
                                lat: car[0].coordenadas.length > 0 ? Number(car[0].coordenadas[0]['lat']) : -13.7910,
                                lng: car[0].coordenadas.length > 0 ? Number(car[0].coordenadas[0]['lng']) : -45.6814
                            }}
                            mapStyle="Default"
                            className="rounded-soft mt-2 google-maps-l container-map"
                            token_api={farm.token_apimaps}
                            mapTypeId='satellite'
                            polygons={[{path:car[0].coordenadas}]}
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
            </Tab>
        }
        {farm && farm.parcelas_sigef &&
            <Tab eventKey="sigef" title="SIGEF" className='border-bottom border-x p-3'>
                {sigef ?
                    <>
                    <div><strong>CCIR: </strong><span>{farm.ccir}</span></div>
                    <PolygonMap
                        initialCenter={{
                            lat: sigef[0].coordenadas.length > 0 ? Number(sigef[0].coordenadas[0]['lat']) : -13.7910,
                            lng: sigef[0].coordenadas.length > 0 ? Number(sigef[0].coordenadas[0]['lng']) : -45.6814
                        }}
                        mapStyle="Default"
                        className="rounded-soft mt-2 google-maps-l container-map"
                        token_api={farm.token_apimaps}
                        mapTypeId='satellite'
                        polygons={sigef.map(p => ({path:p.coordenadas}))}
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
            </Tab>
        }
        </Tabs>
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
                {showmodal.data ? 'Editar' : 'Adicionar' } Imóvel Rural
            </Modal.Title>
                <CloseButton onClick={() => setShowModal({show:false})}/>
        </Modal.Header>
        <Modal.Body>
            <Row className="flex-center sectionform">
                {showmodal.data
                    ? <FarmForm type='edit' hasLabel submit={submit} data={farm}/>
                    : null
                } 
            </Row>
        </Modal.Body>
    </Modal>
    <ModalDelete show={modalDelete.show} link={modalDelete.link} close={() => setModalDelete({show: false, link:''})} update={submit}/>
    </>
    );
};
  
export default ViewFarm;
  


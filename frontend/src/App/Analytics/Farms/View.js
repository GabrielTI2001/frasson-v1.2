import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Tabs, Tab, Row, Col, Placeholder } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass, faDownload } from '@fortawesome/free-solid-svg-icons';
import KMLMap from '../../../components/map/KMLMap';
import PolygonMap from '../../../components/map/PolygonMap';
import { HandleSearch, RetrieveRecord } from '../../../helpers/Data';

const ViewFarm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user"));
    const [farm, setFarm] = useState();
    const [car, setCar] = useState();
    const [sigef, setSigef] = useState();
    const [activeTab, setActiveTab] = useState('cadastro');

    const setter = (data) => {
        setFarm(data);
    }

    useEffect(() => {
        const getData = async () => {
            const status = await RetrieveRecord(id, 'analytics/farms', setter);
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

    const handleTabSelect = async (key) => {
        if (key === 'car'){
            HandleSearch('', 'analytics/car', (data) => {setCar(data)}, `?imovel=${farm.id}`)
        }
        if (key === 'sigef'){
            HandleSearch('', 'analytics/parcelas-sigef', (data) => {setSigef(data)}, `?imovel=${farm.id}`)
        }
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
    <ol className="breadcrumb breadcrumb-alt fs-xs text-body">
        <li className="breadcrumb-item fw-bold">
            <Link className="link-fx text-primary" to={'/analytics/farms'}>Imóveis Rurais</Link>
        </li>
        <li className="breadcrumb-item fw-bold" aria-current="page">
            {farm && farm.nome_imovel}
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
                                    <span className='d-block my-1 text-info'>{farm.nome_imovel ? farm.nome_imovel : '-'}</span>
                                </Col>
                                <Col xl={2} sm={6}>
                                    <strong className='d-block my-1'>Matrícula</strong>
                                    <span className='d-block my-1 text-info'>{farm.matricula_imovel ? farm.matricula_imovel : '-'}</span>
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
                                    <strong className='d-block my-1'>Nome Proprietário</strong>
                                    <span className='d-block my-1 text-info'>{farm.str_proprietario ? farm.str_proprietario : '-'}</span>
                                </Col>
                                <Col xl={2} sm={6}>
                                    <strong className='d-block my-1'>Livro Registro</strong>
                                    <span className='d-block my-1 text-info'>{farm.livro_registro ? farm.livro_registro : '-'}</span>
                                </Col>
                                <Col xl={4} sm={6}>
                                    <strong className='d-block my-1'>Número Registro</strong>
                                    <span className='d-block my-1 text-info'>{farm.numero_registro ? farm.numero_registro : ''}</span>
                                </Col>
                                <Col xl={2} sm={6}>
                                    <strong className='d-block my-1'>Data Registro</strong>
                                    <span className='d-block my-1 text-info'>
                                        {farm.data_registro ? new Date(farm.data_registro).toLocaleDateString('pt-BR', {timeZone:'UTC'}) : '-'}
                                    </span>
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
                                <Col xl={6} sm={6}>
                                    <strong className='d-block my-1'>N° CAR</strong>
                                    <span className='d-block my-1 text-info'>{farm.car ? farm.car : '-'}</span>
                                </Col>
                                <Col xl={4} sm={6}>
                                    <strong className='d-block my-1'>N° CCIR</strong>
                                    <span className='d-block my-1 text-info'>{farm.ccir ? farm.ccir : '-'}</span>
                                </Col>
                                <Col xl={2} sm={6}>
                                    <strong className='d-block my-1'>N° NIRF</strong>
                                    <span className='d-block my-1 text-info'>{farm.nirf ? farm.nirf : '-'}</span>
                                </Col>
                                <Col xl={12} sm={12}>
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
                        </div>
                    </Col>
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
        {farm && farm.kml &&
            <Tab eventKey="kml" title="KML" className='border-bottom border-x p-3'>
                <div className='d-flex justify-content-between'>
                    <strong className='mb-1'>KML da Matrícula {farm.matricula_imovel}</strong>   
                    <Link className='btn btn-secondary fs--2 py-0 px-2' to={farm.kml}>
                        <FontAwesomeIcon icon={faDownload} className='me-1' />KML
                    </Link>
                </div>
                <KMLMap
                    mapStyle="Default"
                    className="rounded-soft mt-1 google-maps-l container-map-l"
                    token_api={farm.token_apimaps}
                    mapTypeId='satellite'
                    urls={[farm.kml]}
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
    </>
    );
};
  
export default ViewFarm;
  


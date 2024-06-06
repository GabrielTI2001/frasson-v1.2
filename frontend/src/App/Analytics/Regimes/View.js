import React,{useEffect, useState} from 'react';
import { useParams, useNavigate } from "react-router-dom";
import { RetrieveRecord } from '../../../helpers/Data';
import { Link } from 'react-router-dom';
import { Col, Placeholder, Row } from 'react-bootstrap';
import KMLMap from '../../../components/map/KMLMap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilePdf, faGlobeAmericas, faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';

const ViewRegime = () => {
    const {id} = useParams()
    const navigate = useNavigate()
    const user = JSON.parse(localStorage.getItem("user"))
    const [regime, setRegime] = useState()

    const setter = (data) =>{
        setRegime(data)
    }

    useEffect(() =>{
        const getdata = async () =>{
            const status = await RetrieveRecord(id, 'analytics/regime', setter)
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
            <Link className="link-fx text-primary" to={'/analytics/regime'}>Regimes de Exploração</Link>
        </li>
        <li className="breadcrumb-item fw-bold" aria-current="page">
            {regime && regime.farm_data.o_qu}
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
                        <span className='d-block my-1 text-info'>{regime.regime_data.quem_explora}</span>
                    </Col>
                    <Col>
                        <strong className='d-block my-1'>Instituição Vinculada</strong>
                        <span className='d-block my-1 text-info'>{regime.regime_data.institui_o_vinculada}</span>
                    </Col>
                    <Col>
                        <strong className='d-block my-1'>Regime de Exploração</strong>
                        <span className='d-block my-1 text-info'>{regime.regime_data.regime_de_explora_o}</span>
                    </Col>
                    <Col>
                        <strong className='d-block my-1'>Data Início</strong>
                        <span className='d-block my-1 text-info'>
                            {regime.data_inicio ? new Date(regime.data_inicio).toLocaleDateString('pt-BR', {timeZone:'UTC'}): '-'}
                        </span>
                    </Col>
                    <Col>
                        <strong className='d-block my-1'>Data Início</strong>
                        <span className='d-block my-1 text-info'>
                            {regime.data_termino ? new Date(regime.data_termino).toLocaleDateString('pt-BR', {timeZone:'UTC'}): '-'}
                        </span>
                    </Col>
                    <Col>
                        <strong className='d-block my-1'>Área Cedida (ha)</strong>
                        <span className='d-block my-1 text-info'>
                            {Number(regime.regime_data.rea_cedida).toLocaleString('pt-BR', {minimumFractionDigits:2, maximumFractionDigits:2})}
                        </span>
                    </Col>
                    <Col>
                        <strong className='d-block my-1'>Atividades Exploradas</strong>
                        <span className='d-block my-1 text-info'>{regime.regime_data.atividades_exploradas}</span>
                    </Col>
                </Row>
            </div>
            <div className='d-block w-100'>
                <Link className='btn btn-warning py-0 px-2 me-2'><FontAwesomeIcon icon={faFilePdf} className='me-1' />PDF</Link>
                <Link className='btn btn-secondary py-0 px-2 me-2'><FontAwesomeIcon icon={faGlobeAmericas} className='me-1' />KML</Link>
                <Link to={regime.regime_data.url} className='btn btn-primary py-0 px-2' target="_blank">
                    <FontAwesomeIcon icon={faMagnifyingGlass} className='me-1'/>Pipefy
                </Link>
            </div>
        </Col>
        <Col className='d-flex flex-column'>
            <h4 className='fw-bold' style={{fontSize:'12px'}}>Informações do Imóvel Rural</h4>
            <hr className="mb-1 mt-0 d-flex" style={{height: '1px', color: 'black', opacity: '.2'}}></hr>
            <Row xl={2} xs={1}>
                <Col>
                    <strong className='d-block my-1'>Nome Imóvel</strong>
                    <span className='d-block my-1 text-info'>{regime.farm_data.o_qu}</span>
                </Col>
                <Col>
                    <strong className='d-block my-1'>Matrícula</strong>
                    <span className='d-block my-1 text-info'>{regime.farm_data.matr_cula}</span>
                </Col>
                <Col>
                    <strong className='d-block my-1'>Nome Proprietário</strong>
                    <span className='d-block my-1 text-info'>{regime.farm_data.propriet_rio_do_im_vel}</span>
                </Col>
                <Col>
                    <strong className='d-block my-1'>Área Total (ha)</strong>
                    <span className='d-block my-1 text-info'>
                        {regime.farm_data.rea_total_do_im_vel ? Number(regime.farm_data.rea_total_do_im_vel).toLocaleString('pt-BR', {minimumFractionDigits:2, maximumFractionDigits:2}): '-'}
                    </span>
                </Col>
                <Col>
                    <strong className='d-block my-1'>Área Expl. (ha)</strong>
                    <span className='d-block my-1 text-info'>
                        {regime.farm_data.rea_explorada ? Number(regime.farm_data.rea_explorada).toLocaleString('pt-BR', {minimumFractionDigits:2, maximumFractionDigits:2}): '-'}
                    </span>
                </Col>
                <Col>
                    <strong className='d-block my-1'>Área RL (ha)</strong>
                    <span className='d-block my-1 text-info'>
                        {regime.farm_data.rea_de_reserva_legal ? Number(regime.farm_data.rea_de_reserva_legal).toLocaleString('pt-BR', {minimumFractionDigits:2, maximumFractionDigits:2}): '-'}
                    </span>
                </Col>
                <Col>
                    <strong className='d-block my-1'>Área APP (ha)</strong>
                    <span className='d-block my-1 text-info'>
                        {regime.farm_data.rea_de_app ? Number(regime.farm_data.rea_de_app).toLocaleString('pt-BR', {minimumFractionDigits:2, maximumFractionDigits:2}): '-'}
                    </span>
                </Col>     
                <Col>
                    <strong className='d-block my-1'>Área Veg. Nativa (ha)</strong>
                    <span className='d-block my-1 text-info'>
                        {regime.farm_data.rea_de_vegeta_o_nativa ? Number(regime.farm_data.rea_de_vegeta_o_nativa).toLocaleString('pt-BR', {minimumFractionDigits:2, maximumFractionDigits:2}): '-'}
                    </span>
                </Col>     
                <Col xl={12}>
                    <strong className='d-block my-1'>N° CAR</strong>
                    <span className='d-block my-1 text-info'>{regime.farm_data.registro_car}</span>
                </Col> 
                <Col>
                    <strong className='d-block my-1'>N° CCIR</strong>
                    <span className='d-block my-1 text-info'>{regime.farm_data.n_mero_ccir}</span>
                </Col> 
                <Col>
                    <strong className='d-block my-1'>Módulos Fiscais</strong>
                    <span className='d-block my-1 text-info'>
                        {regime.farm_data.m_dulos_fiscais ? Number(regime.farm_data.m_dulos_fiscais).toLocaleString('pt-BR',{minimumFractionDigits:4}): '-'}
                    </span>
                </Col>   
            </Row>
            <div className='d-block w-100'>
                <Link to={regime.farm_data.kml_da_matr_cula}  className='btn btn-secondary py-0 px-2 me-2'><FontAwesomeIcon icon={faGlobeAmericas} className='me-1' />KML</Link>
                <Link to={regime.regime_data.url} className='btn btn-primary py-0 px-2' target="_blank">
                    <FontAwesomeIcon icon={faMagnifyingGlass} className='me-1'/>Pipefy
                </Link>
            </div>
        </Col>
    </Row>
    <KMLMap
        mapStyle="Default"
        className="rounded-soft mt-0 google-maps-s container-map-l"
        token_api={regime.token_apimaps}
        mapTypeId='satellite'
        urls={[regime.farm_data.kml_da_matr_cula]}
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
    </>
    );
};
  
export default ViewRegime;
  


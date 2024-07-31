import { faGlobeAmericas, faInfoCircle } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Col, Nav, Row } from "react-bootstrap"
import { Link } from "react-router-dom"

const NavModal = ({record}) =>{
    return (
    <Nav variant="pills" className="flex-row fs--2">
        <Nav.Item>
            <Nav.Link className="text-secondary px-1 py-0 border-1 border me-2 mb-2 link-primary" eventKey="main">
                <FontAwesomeIcon icon={faInfoCircle} className="me-1"/>Regime
            </Nav.Link>
        </Nav.Item>
        <Nav.Item>
            <Nav.Link className="text-secondary px-1 py-0 border-1 border me-2 custom-tab mb-2 link-primary" eventKey="farm">
                <FontAwesomeIcon icon={faInfoCircle} className="me-1"/>Imóvel Rural
            </Nav.Link>
        </Nav.Item>
    </Nav>
    )
}
export default NavModal;

export const Fazenda = ({record}) =>{
    return (
        record &&
        <>
            <h5 className="mb-1 fs-0 fw-bold">Informações do Imóvel Rural</h5>
            <Row xl={1} xs={1} className="gx-1 gy-2">
                <Col>
                    <strong className='d-block mt-2 mb-0 fs--1'>Nome Imóvel</strong>
                    <span className='d-block text-info fs--1 mb-1'>{record.farm_data.nome}</span>
                </Col>
                <Col>
                    <strong className='d-block fs--1'>Matrícula</strong>
                    <span className='d-block text-info fs--1 mb-1'>{record.farm_data.matricula}</span>
                </Col>
                <Col>
                    <strong className='d-block fs--1'>Nome Proprietário</strong>
                    <span className='d-block text-info fs--1 mb-1'>{record.farm_data.proprietarios}</span>
                </Col>
                <Col>
                    <strong className='d-block fs--1'>Área Total (ha)</strong>
                    <span className='d-block text-info fs--1 mb-1'>
                        {record.farm_data.area_total ? Number(record.farm_data.area_total).toLocaleString('pt-BR', {minimumFractionDigits:2, maximumFractionDigits:2}): '-'}
                    </span>
                </Col>
                <Col>
                    <strong className='d-block fs--1'>Área Expl. (ha)</strong>
                    <span className='d-block text-info fs--1 mb-1'>
                        {record.farm_data.area_explorada ? Number(record.farm_data.area_explorada).toLocaleString('pt-BR', {minimumFractionDigits:2, maximumFractionDigits:2}): '-'}
                    </span>
                </Col>
                <Col>
                    <strong className='d-block fs--1'>Área RL (ha)</strong>
                    <span className='d-block text-info fs--1 mb-1'>
                        {record.farm_data.area_rl ? Number(record.farm_data.area_rl).toLocaleString('pt-BR', {minimumFractionDigits:2, maximumFractionDigits:2}): '-'}
                    </span>
                </Col>
                <Col>
                    <strong className='d-block fs--1'>Área APP (ha)</strong>
                    <span className='d-block text-info fs--1 mb-1'>
                        {record.farm_data.area_app ? Number(record.farm_data.area_app).toLocaleString('pt-BR', {minimumFractionDigits:2, maximumFractionDigits:2}): '-'}
                    </span>
                </Col>     
                <Col>
                    <strong className='d-block fs--1'>Área Veg. Nativa (ha)</strong>
                    <span className='d-block mb-1 text-info fs--1 mb-1'>
                        {record.farm_data.area_veg_nat ? Number(record.farm_data.area_veg_nat).toLocaleString('pt-BR', {minimumFractionDigits:2, maximumFractionDigits:2}): '-'}
                    </span>
                </Col>     
                <Col>
                    <strong className='d-block fs--1'>N° CAR</strong>
                    <span className='d-block text-info fs--1 mb-1'>{record.farm_data.codigo_car || '-'}</span>
                </Col> 
                <Col>
                    <strong className='d-block fs--1'>Código do Imóvel
                    </strong>
                    <span className='d-block text-info fs--1 mb-1'>{record.farm_data.codigo_imovel || '-'}</span>
                </Col> 
                <Col>
                    <strong className='d-block fs--1'>Módulos Fiscais</strong>
                    <span className='d-block text-info fs--1 mb-1'>
                        {record.farm_data.modulos_fiscais ? Number(record.farm_data.modulos_fiscais).toLocaleString('pt-BR',{minimumFractionDigits:4}): '-'}
                    </span>
                </Col>  
                <div>
                    <Link to={`${process.env.REACT_APP_API_URL}/farms/kml/${record.farm_data.uuid}`} className='btn btn-secondary py-0 px-2 me-2 fs--1'>
                        <FontAwesomeIcon icon={faGlobeAmericas} className='me-1'/>KML
                    </Link>
                </div> 
            </Row>
        </>  
    )
}
import { faCow, faDownload, faInfoCircle, faMapLocation, faMapLocationDot, faWheatAwn } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useEffect, useState } from "react"
import { Col, Nav, Placeholder } from "react-bootstrap"
import { HandleSearch } from "../../helpers/Data"
import PolygonMap from "../../components/map/PolygonMap"
import { Link } from "react-router-dom"

const NavModal = ({record}) =>{
    return (
    <Nav variant="pills" className="flex-row fs--2">
        <Nav.Item>
            <Nav.Link className="text-secondary px-1 py-0 border-1 border me-2 mb-2 link-primary" eventKey="main">
                <FontAwesomeIcon icon={faInfoCircle} className="me-1"/>Gleba
            </Nav.Link>
        </Nav.Item>
    </Nav>
    )
}
export default NavModal;

export const NavModal2 = ({record}) =>{
    return (
    <Nav variant="pills" className="flex-row fs--2">
        <Nav.Item>
            <Nav.Link className="text-secondary px-1 py-0 border-1 border me-2 custom-tab mb-2 link-primary" eventKey="coordenadas">
                <FontAwesomeIcon icon={faMapLocationDot} className="me-1"/>Coordenadas
            </Nav.Link>
        </Nav.Item>
        <Nav.Item>
            <Nav.Link className="text-secondary px-1 py-0 border-1 border me-2 custom-tab mb-2 link-primary" eventKey="agricola">
                <FontAwesomeIcon icon={faWheatAwn} className="me-1"/>Produção Agrícola
            </Nav.Link>
        </Nav.Item>
        <Nav.Item>
            <Nav.Link className="text-secondary px-1 py-0 border-1 border me-2 custom-tab mb-2 link-primary" eventKey="pecuaria">
                <FontAwesomeIcon icon={faCow} className="me-1"/>Produção Pecuária
            </Nav.Link>
        </Nav.Item>
    </Nav>
    )
}

export const Coordenadas = ({record}) =>{
    return (<>
        <div className='align-items-center justify-content-between p-2 py-1 rounded-top d-flex' style={{backgroundColor: '#cee9f0'}}>
            {record.coordenadas.length > 0 ? <>  
                <Link className='fs-0'
                    to={`${process.env.REACT_APP_API_URL}/farms/kml/regime/${record.uuid}`}
                >
                    <FontAwesomeIcon icon={faDownload} />
                </Link>
                </>
                : <strong className="fs--1">Sem KML</strong>
            }
        </div>
        {record && record.coordenadas ? 
            <PolygonMap
                initialCenter={{
                    lat: record.coordenadas.length > 0 ? Number(record.coordenadas[0]['lat']) : -13.7910,
                    lng: record.coordenadas.length > 0 ? Number(record.coordenadas[0]['lng']) : -45.6814
                }}
                mapStyle="Default"
                className="rounded-soft google-maps container-map"
                token_api={record.token_apimaps}
                mapTypeId='satellite'
                polygons={[{path:record.coordenadas.map(c=> ({lat:c.lat, lng:c.lng}))}]}
            >
            </PolygonMap>
        :    
            <div>
                <Placeholder animation="glow">
                    <Placeholder xs={7} /> <Placeholder xs={4} /> 
                    <Placeholder xs={4} />
                    <Placeholder xs={6} /> <Placeholder xs={8} />
                </Placeholder>    
            </div>  
        }   
    </>)
}
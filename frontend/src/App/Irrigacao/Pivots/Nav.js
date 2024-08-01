import { faDownload, faInfoCircle, faMapLocation, faMapLocationDot } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useEffect, useState } from "react"
import { Nav, Placeholder } from "react-bootstrap"
import { HandleSearch } from "../../../helpers/Data"
import PolygonMap from "../../../components/map/PolygonMap"
import { Link } from "react-router-dom"
import CircleMap from "../../../components/map/CircleMap"

const NavModal = ({record}) =>{
    return (
    <Nav variant="pills" className="flex-row fs--2">
        <Nav.Item>
            <Nav.Link className="text-secondary px-1 py-0 border-1 border me-2 mb-2 link-primary" eventKey="main">
                <FontAwesomeIcon icon={faInfoCircle} className="me-1"/>Pivot
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
            <Nav.Link className="text-secondary px-1 py-0 border-1 border me-2 custom-tab mb-2 link-primary" eventKey="matricula">
                <FontAwesomeIcon icon={faMapLocationDot} className="me-1"/>Mapa
            </Nav.Link>
        </Nav.Item>
    </Nav>
    )
}

export const Coordenadas = ({record}) =>{
    return (
        record ?
        <>
            <div className='align-items-center justify-content-between p-2 py-1 rounded-top d-flex' style={{backgroundColor: '#cee9f0'}}>
                <Link className='fs--1 py-0 px-2 btn btn-secondary' to={`${process.env.REACT_APP_API_URL}/irrigation/pivot/kml/${record.id}`}>
                    <FontAwesomeIcon icon={faDownload} /> Baixar KML
                </Link>
            </div>
            <CircleMap
                initialCenter={{
                    lat: Number(record.lat_center_gd) || -13.7910,
                    lng: Number(record.long_center_gd) || -45.6814
                }}
                mapStyle="Default"
                className="rounded-soft google-maps container-map"
                token_api={record.token_apimaps}
                mapTypeId='satellite'
                circles={[{center:{lat:Number(record.lat_center_gd), lng:Number(record.long_center_gd)}, 
                    radius:Number(record.raio_irrigado_m)}]}
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
    )
}

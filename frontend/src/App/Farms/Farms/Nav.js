import { faDownload, faInfoCircle, faMapLocation, faMapLocationDot } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useEffect, useState } from "react"
import { Nav, Placeholder } from "react-bootstrap"
import { HandleSearch } from "../../../helpers/Data"
import PolygonMap from "../../../components/map/PolygonMap"
import { Link } from "react-router-dom"

const NavModal = ({record}) =>{
    return (
    <Nav variant="pills" className="flex-row fs--2">
        <Nav.Item>
            <Nav.Link className="text-secondary px-1 py-0 border-1 border me-2 mb-2 link-primary" eventKey="main">
                <FontAwesomeIcon icon={faInfoCircle} className="me-1"/>Imóvel Rural
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
                <FontAwesomeIcon icon={faMapLocationDot} className="me-1"/>Coordenadas Matrícula
            </Nav.Link>
        </Nav.Item>
        {record.coordenadas_car && 
            <Nav.Item>
                <Nav.Link className="text-secondary px-1 py-0 border-1 border me-2 custom-tab mb-2 link-primary" eventKey="car">
                    <FontAwesomeIcon icon={faMapLocation} className="me-1"/>Coordenadas CAR
                </Nav.Link>
            </Nav.Item>
        }
        {record.coordenadas_sigef && 
            <Nav.Item>
                <Nav.Link className="text-secondary px-1 py-0 border-1 border me-2 custom-tab mb-2 link-primary" eventKey="sigef">
                    <FontAwesomeIcon icon={faMapLocation} className="me-1"/>Coordenadas SIGEF
                </Nav.Link>
            </Nav.Item>
        }
    </Nav>
    )
}

export const Coordenadas = ({record}) =>{
    return (
        record ?
        <>
            <div className='align-items-center justify-content-between p-2 py-1 rounded-top d-flex' style={{backgroundColor: '#cee9f0'}}>
            {record.coordenadas_matricula.length > 0 ? <>
                <strong className='fs--1'>KML da Matrícula {record.matricula}</strong>  
                <Link className='fs-0'
                    to={`${process.env.REACT_APP_API_URL}/farms/kml/${record.uuid}`}
                >
                    <FontAwesomeIcon icon={faDownload} />
                </Link>
                </>
                : <strong className="fs--1">Sem KML</strong>
            }
            </div>
            <PolygonMap
                initialCenter={{
                    lat: record.coordenadas_matricula.length > 0 ? Number(record.coordenadas_matricula[0]['lat']) : -13.7910,
                    lng: record.coordenadas_matricula.length > 0 ? Number(record.coordenadas_matricula[0]['lng']) : -45.6814
                }}
                mapStyle="Default"
                className="rounded-soft google-maps-l container-map"
                token_api={record.token_apimaps}
                mapTypeId='satellite'
                polygons={[{path:record.coordenadas_matricula}]}
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
    )
}

export const Car = ({record}) =>{
    const [car, setCar] = useState()
    useEffect(() => {
        HandleSearch('', 'farms/car', (data) => {setCar(data)}, `?imovel=${record.id}`)
    }, [])
    return (
        car ? 
        <>
            <div><strong>CAR: </strong><span>{record.car}</span></div>
            <PolygonMap
                initialCenter={{
                    lat: car[0].coordenadas.length > 0 ? Number(car[0].coordenadas[0]['lat']) : -13.7910,
                    lng: car[0].coordenadas.length > 0 ? Number(car[0].coordenadas[0]['lng']) : -45.6814
                }}
                mapStyle="Default"
                className="rounded-soft mt-2 google-maps-l container-map"
                token_api={record.token_apimaps}
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
    )
}

export const Sigef = ({record}) =>{
    const [sigef, setSigef] = useState()
    useEffect(() => {
        HandleSearch('', 'farms/parcelas-sigef', (data) => {setSigef(data)}, `?imovel=${record.id}`)
    }, [])
    return (
        sigef && sigef.length > 0 ?
        <>
        <div><strong>CCIR: </strong><span>{record.ccir}</span></div>
        <PolygonMap
            initialCenter={{
                lat: sigef[0].coordenadas.length > 0 ? Number(sigef[0].coordenadas[0]['lat']) : -13.7910,
                lng: sigef[0].coordenadas.length > 0 ? Number(sigef[0].coordenadas[0]['lng']) : -45.6814
            }}
            mapStyle="Default"
            className="rounded-soft mt-2 google-maps-l container-map"
            token_api={record.token_apimaps}
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
    )
}
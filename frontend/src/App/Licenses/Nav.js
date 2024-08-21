import { faCow, faDownload, faInfoCircle, faMapLocation, faMapLocationDot, faPaperclip, faWheatAwn } from "@fortawesome/free-solid-svg-icons"
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
                <FontAwesomeIcon icon={faInfoCircle} className="me-1"/>Licença
            </Nav.Link>
        </Nav.Item>
        <Nav.Item>
            <Nav.Link className="text-secondary px-1 py-0 border-1 border me-2 mb-2 link-primary" eventKey="anexos">
                <FontAwesomeIcon icon={faPaperclip} className="me-1"/>Anexos
            </Nav.Link>
        </Nav.Item>
    </Nav>
    )
}
export default NavModal;

export const Coordenadas = ({record}) =>{
    return (<>
    </>)
}
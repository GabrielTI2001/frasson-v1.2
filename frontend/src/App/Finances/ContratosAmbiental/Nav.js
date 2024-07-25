import { faFilter, faInfoCircle, faMoneyBill, faPaperclip } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Nav } from "react-bootstrap"

const NavContract = ({record}) =>{
    return (
    <Nav variant="pills" className="flex-row fs--2">
        <Nav.Item>
            <Nav.Link className="text-secondary px-1 py-0 border-1 border me-2 mb-2 link-primary" eventKey="main">
                <FontAwesomeIcon icon={faInfoCircle} className="me-1"/>Contrato
            </Nav.Link>
        </Nav.Item>
        <Nav.Item>
            <Nav.Link className="text-secondary px-1 py-0 border-1 border me-2 custom-tab mb-2 link-primary" eventKey="anexo">
                <FontAwesomeIcon icon={faPaperclip} className="me-1"/>Anexos
            </Nav.Link>
        </Nav.Item>
        <Nav.Item>
            <Nav.Link className="text-secondary px-1 py-0 border-1 border me-2 custom-tab mb-2 link-primary" eventKey="formas_pagamento">
                <FontAwesomeIcon icon={faMoneyBill} className="me-1"/>Formas Pagamento
            </Nav.Link>
        </Nav.Item>
        <Nav.Item>
            <Nav.Link className="text-secondary px-1 py-0 border-1 border me-2 custom-tab mb-2 link-primary" eventKey="processos_vinculados">
                <FontAwesomeIcon icon={faFilter} className="me-1"/>Processos Vinculados
            </Nav.Link>
        </Nav.Item>
    </Nav>
    )
}

export default NavContract
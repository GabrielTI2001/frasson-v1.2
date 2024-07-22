import { faFilter, faInfoCircle, faMoneyBill } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Nav } from "react-bootstrap"

const NavModal = ({record}) =>{
    return (
    <Nav variant="pills" className="flex-row fs--2">
        <Nav.Item>
            <Nav.Link className="text-secondary px-1 py-0 border-1 border me-2 mb-2 link-primary" eventKey="main">
                <FontAwesomeIcon icon={faInfoCircle} className="me-1"/>Pessoa
            </Nav.Link>
        </Nav.Item>
        <Nav.Item>
            <Nav.Link className="text-secondary px-1 py-0 border-1 border me-2 custom-tab mb-2 link-primary" eventKey="processos">
                <FontAwesomeIcon icon={faFilter} className="me-1"/>Processos
            </Nav.Link>
        </Nav.Item>
        <Nav.Item>
            <Nav.Link className="text-secondary px-1 py-0 border-1 border me-2 custom-tab mb-2 link-primary" eventKey="operacoes">
                <FontAwesomeIcon icon={faMoneyBill} className="me-1"/>Operações
            </Nav.Link>
        </Nav.Item>
        {record.contas_bancarias.length > 0 && 
        <Nav.Item>
            <Nav.Link className="text-secondary px-1 py-0 border-1 border me-2 custom-tab mb-2 link-primary" eventKey="contas">
                <FontAwesomeIcon icon={faMoneyBill} className="me-1"/>Contas
            </Nav.Link>
        </Nav.Item>
        }
    </Nav>
    )
}

export default NavModal;
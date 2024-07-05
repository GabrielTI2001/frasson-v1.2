import { faComment, faFilter, faMoneyBill, faPaperclip } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Nav } from "react-bootstrap"

const NavGai = ({card}) =>{
    return (
    <Nav variant="pills" className="flex-row fs--2">
        <Nav.Item>
            <Nav.Link className="text-secondary px-1 py-0 border-1 border me-2 mb-2" eventKey="processo">
                <FontAwesomeIcon icon={faFilter} className="me-1"/>Processo
            </Nav.Link>
        </Nav.Item>
        <Nav.Item>
            <Nav.Link className="text-secondary px-1 py-0 border-1 border me-2 custom-tab" eventKey="comments">
                <FontAwesomeIcon icon={faComment} className="me-1"/>Comentários
            </Nav.Link>
        </Nav.Item>
        <Nav.Item>
            <Nav.Link className="text-secondary px-1 py-0 border-1 border me-2 custom-tab" eventKey="anexos">
                <FontAwesomeIcon icon={faPaperclip} className="me-1"/>Anexos
            </Nav.Link>
        </Nav.Item>
        <Nav.Item>
            <Nav.Link className="text-secondary px-1 py-0 border-1 border me-2 custom-tab" eventKey="pvtec">
                <FontAwesomeIcon icon={faFilter} className="me-1"/>PVTEC
            </Nav.Link>
        </Nav.Item>
        <Nav.Item>
            <Nav.Link className="text-secondary px-1 py-0 border-1 border me-2 custom-tab mb-2" eventKey="prospects">
                <FontAwesomeIcon icon={faFilter} className="me-1"/>Prospects
            </Nav.Link>
        </Nav.Item>
        <Nav.Item>
            <Nav.Link className="text-secondary px-1 py-0 border-1 border me-2 custom-tab" eventKey="cobrancas">
                <FontAwesomeIcon icon={faMoneyBill} className="me-1"/>Cobranças
            </Nav.Link>
        </Nav.Item>
        <Nav.Item>
            <Nav.Link className="text-secondary px-1 py-0 border-1 border me-2 custom-tab" eventKey="analise">
                <FontAwesomeIcon icon={faFilter} className="me-1"/>Análise e Processamento
            </Nav.Link>
        </Nav.Item>
        <Nav.Item>
            <Nav.Link className="text-secondary px-1 py-0 border-1 border me-2 custom-tab mb-2" eventKey="litec">
                <FontAwesomeIcon icon={faFilter} className="me-1"/>LITEC
            </Nav.Link>
        </Nav.Item>
        <Nav.Item>
            <Nav.Link className="text-secondary px-1 py-0 border-1 border me-2 custom-tab" eventKey="template">
                <FontAwesomeIcon icon={faFilter} className="me-1"/>Template
            </Nav.Link>
        </Nav.Item>
        <Nav.Item>
            <Nav.Link className="text-secondary px-1 py-0 border-1 border me-2 custom-tab" eventKey="protocolo">
                <FontAwesomeIcon icon={faFilter} className="me-1"/>Protocolo
            </Nav.Link>
        </Nav.Item>
        <Nav.Item>
            <Nav.Link className="text-secondary px-1 py-0 border-1 border me-2 custom-tab" eventKey="followup">
                <FontAwesomeIcon icon={faFilter} className="me-1"/>Follow Up
            </Nav.Link>
        </Nav.Item>
        <Nav.Item>
            <Nav.Link className="text-secondary px-1 py-0 border-1 border me-2 custom-tab" eventKey="encerramento">
                <FontAwesomeIcon icon={faFilter} className="me-1"/>Encerramento
            </Nav.Link>
        </Nav.Item>
    </Nav>
    )
}

export default NavGai
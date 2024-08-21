import { faComment, faFilter, faPaperclip } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Nav } from "react-bootstrap"

const NavGai = ({card}) =>{
    return (
    <Nav variant="pills" className="flex-row fs--2 mb-2">
        <Nav.Item>
            <Nav.Link className="text-secondary px-1 py-0 border-1 border me-2 mb-2 link-primary" eventKey="processo">
                <FontAwesomeIcon icon={faFilter} className="me-1"/>Processo
            </Nav.Link>
        </Nav.Item>
        <Nav.Item>
            <Nav.Link className="text-secondary px-1 py-0 border-1 border me-2 custom-tab link-primary" eventKey="comments">
                <FontAwesomeIcon icon={faComment} className="me-1"/>Comentários
            </Nav.Link>
        </Nav.Item>
        <Nav.Item>
            <Nav.Link className="text-secondary px-1 py-0 border-1 border me-2 mb-2 custom-tab link-primary" eventKey="anexos">
                <FontAwesomeIcon icon={faPaperclip} className="me-1"/>Anexos
            </Nav.Link>
        </Nav.Item>
        <Nav.Item>
            <Nav.Link className="text-secondary px-1 py-0 border-1 border me-2 custom-tab link-primary" eventKey="analise">
                <FontAwesomeIcon icon={faFilter} className="me-1"/>Análise e Processamento
            </Nav.Link>
        </Nav.Item>
        <Nav.Item>
            <Nav.Link className="text-secondary px-1 py-0 border-1 border me-2 custom-tab mb-2 link-primary" eventKey="litec">
                <FontAwesomeIcon icon={faFilter} className="me-1"/>LITEC
            </Nav.Link>
        </Nav.Item>
        <Nav.Item>
            <Nav.Link className="text-secondary px-1 py-0 border-1 border me-2 custom-tab link-primary mb-2" eventKey="template">
                <FontAwesomeIcon icon={faFilter} className="me-1"/>Template
            </Nav.Link>
        </Nav.Item>
        <Nav.Item>
            <Nav.Link className="text-secondary px-1 py-0 border-1 border me-2 custom-tab link-primary" eventKey="protocolo">
                <FontAwesomeIcon icon={faFilter} className="me-1"/>Protocolo
            </Nav.Link>
        </Nav.Item>
        <Nav.Item>
            <Nav.Link className="text-secondary px-1 py-0 border-1 border me-2 custom-tab link-primary" eventKey="followup">
                <FontAwesomeIcon icon={faFilter} className="me-1"/>Follow Up
            </Nav.Link>
        </Nav.Item>
        <Nav.Item>
            <Nav.Link className="text-secondary px-1 py-0 border-1 border me-2 custom-tab link-primary" eventKey="encerramento">
                <FontAwesomeIcon icon={faFilter} className="me-1"/>Encerramento
            </Nav.Link>
        </Nav.Item>
    </Nav>
    )
}

export default NavGai
import { faComment, faFilter, faMoneyBill, faPaperclip } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Nav } from "react-bootstrap"

const NavPVTEC = ({record}) =>{
    return (
    <Nav variant="pills" className="flex-row fs--2">
        <Nav.Item>
            <Nav.Link className="text-secondary px-1 py-0 border-1 border me-2 mb-2 link-primary" eventKey="main">
                <FontAwesomeIcon icon={faFilter} className="me-1"/>Principal
            </Nav.Link>
        </Nav.Item>
        <Nav.Item>
            <Nav.Link className="text-secondary px-1 py-0 border-1 border me-2 custom-tab mb-2 link-primary" eventKey="anexosrequest">
                <FontAwesomeIcon icon={faPaperclip} className="me-1"/>Anexos Solicitação
            </Nav.Link>
        </Nav.Item>
        <Nav.Item>
            <Nav.Link className="text-secondary px-1 py-0 border-1 border me-2 custom-tab mb-2 link-primary" eventKey="anexosresponse">
                <FontAwesomeIcon icon={faPaperclip} className="me-1"/>Anexos Resposta
            </Nav.Link>
        </Nav.Item>
        <Nav.Item>
            <Nav.Link className="text-secondary px-1 py-0 border-1 border me-2 custom-tab mb-2 link-primary" eventKey="comments">
                <FontAwesomeIcon icon={faComment} className="me-1"/>Comentários
            </Nav.Link>
        </Nav.Item>
    </Nav>
    )
}

export default NavPVTEC
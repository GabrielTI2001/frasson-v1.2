import { faComment, faFilter, faPaperclip, faPlus } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { CloseButton, Modal, Nav, Row } from "react-bootstrap"
import { PipeContext } from "../../../context/Context"
import { useContext, useState } from "react"
import ProductForm from "../GAI/Form"
import ProspectForm from "./Form"

const NavGai = ({card}) =>{
    return (
    <Nav variant="pills" className="flex-row fs--2 mb-2">
        <Nav.Item>
            <Nav.Link className="text-secondary px-1 py-0 border-1 border me-2 mb-2 link-primary" eventKey="processo">
                <FontAwesomeIcon icon={faFilter} className="me-1"/>Prospect
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
            <Nav.Link className="text-secondary px-1 py-0 border-1 border me-2 custom-tab link-primary" eventKey="analiseprocess">
                <FontAwesomeIcon icon={faFilter} className="me-1"/>Análise e Processamento
            </Nav.Link>
        </Nav.Item>
        <Nav.Item>
            <Nav.Link className="text-secondary px-1 py-0 border-1 border me-2 custom-tab mb-2 link-primary" eventKey="analisetec">
                <FontAwesomeIcon icon={faFilter} className="me-1"/>Análise Técnica
            </Nav.Link>
        </Nav.Item>
        {card.phase >= 90 &&
            <Nav.Item>
                <Nav.Link className="text-secondary px-1 py-0 border-1 border me-2 custom-tab link-primary" eventKey="minutacontrato">
                    <FontAwesomeIcon icon={faFilter} className="me-1"/>Minuta de Contrato
                </Nav.Link>
            </Nav.Item>
        }
        {card.phase >= 92 &&
            <Nav.Item>
                <Nav.Link className="text-secondary px-1 py-0 border-1 border me-2 custom-tab link-primary" eventKey="encerramento">
                    <FontAwesomeIcon icon={faFilter} className="me-1"/>Encerramento
                </Nav.Link>
            </Nav.Item>
        }
    </Nav>
    )
}
export default NavGai;

export const AddCard = ({onclick}) =>{
    const {kanbanState, kanbanDispatch } = useContext(PipeContext);
    const [modalform, setModalForm] = useState({show:false})
    return (<>
    <div className="add-card-toggle rounded-pill d-flex align-items-center bg-primary px-3 py-1" onClick={() => setModalForm({show:true})}>
        <FontAwesomeIcon icon={faPlus} className="text-white"/>
        <small className="fw-bold p-2 text-white">Novo Prospect</small>
    </div>
    <Modal
      size="md"
      show={modalform.show}
      onHide={() => setModalForm({show:false})}
      aria-labelledby="example-modal-sizes-title-lg"
      scrollable
    >
      <Modal.Header>
        <Modal.Title id="example-modal-sizes-title-lg" style={{fontSize: '16px'}}>
            {kanbanState && kanbanState.pipe && kanbanState.pipe.code === 518984924 ? 'Novo Prospect' : 'Adicionar Card'}
        </Modal.Title>
            <CloseButton onClick={() => setModalForm({show:false})}/>
      </Modal.Header>
      <Modal.Body>
        {kanbanState && kanbanState.pipe &&
            <Row className="flex-center sectionform">
                {kanbanState.pipe.code === 518984721 ? <ProductForm fase={84} onSubmit={() => setModalForm({show:false})}/>
                  : kanbanState.pipe.code === 518984924 ? <ProspectForm fase={84} onSubmit={() => setModalForm({show:false})}/> : null
                }
            </Row>
        }
      </Modal.Body>
    </Modal>
    </>
    )
}

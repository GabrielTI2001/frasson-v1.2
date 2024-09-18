import { faCircleCheck, faFileAlt, faFileLines, faFilePdf, faInfoCircle, faPenToSquare } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useState } from "react"
import { CloseButton, Modal, Nav } from "react-bootstrap"
import { Link } from "react-router-dom"
import ModalDeleteCard from "../../components/Custom/ModalDeleteCard"
import FormAlongamento from "../Alongamentos/Form"
import Edit from "../Alongamentos/Edit"
import CardInfo from "../Pipeline/CardInfo"

const NavModal = ({record}) =>{
    return (
    <Nav variant="pills" className="flex-row fs--2">
        <Nav.Item>
            <Nav.Link className="text-secondary px-1 py-0 border-1 border me-2 mb-2 link-primary" eventKey="main">
                <FontAwesomeIcon icon={faInfoCircle} className="me-1"/>Operação
            </Nav.Link>
        </Nav.Item>
        <Nav.Item>
            <Nav.Link className="text-secondary px-1 py-0 border-1 border me-2 custom-tab mb-2 link-primary" eventKey="cedulas">
                <FontAwesomeIcon icon={faFilePdf} className="me-1"/>Anexos
            </Nav.Link>
        </Nav.Item>
        <Nav.Item>
            <Nav.Link className="text-secondary px-1 py-0 border-1 border me-2 custom-tab mb-2 link-primary" eventKey="alongamentos">
                <FontAwesomeIcon icon={faFileAlt} className="me-1"/>Alongamentos
            </Nav.Link>
        </Nav.Item>
    </Nav>
    )
}

export default NavModal;

export const Alongamentos = ({record, reducer}) =>{
    const [modalform, setModalForm] = useState({show:false, id:null, type:null})
    const [modaldelete, setModalDelete] = useState({show:false, link:null})

    const update = (data, id) =>{
        reducer({...data, alongamento_total:data.valor_total, along:true, alongamento_id:data.id})
        setModalForm({show:false})
    }

    return (
        record.alongamento.alongamento_permission && 
        <>
        {!record.alongamento.along && <>
            <hr className="mb-1 mt-1" />
            <div className="mb-1"><span className="fw-normal fs-xs">Operação sem alongamento</span></div>
            <div className='mt-0'><Link onClick={() => setModalForm({show:true, type:'add'})}>
                <button className="btn btn-sm btn-primary shadow-none fw-semibold mb-1" style={{fontSize: '10px'}}>
                    <FontAwesomeIcon icon={faFileLines} className='me-2' />Alongar Operação
                </button>
            </Link></div>
        </>}
        {record.alongamento.alongamento_id && 
            <CardInfo data={record.alongamento} attr1={'alongamento_total'} pk={'alongamento_id'} 
                url={'alongamentos'} title2={'teste'}
            />
        }
        <Modal
            size="md"
            show={modalform.show}
            onHide={() => setModalForm({show:false})}
            aria-labelledby="example-modal-sizes-title-lg"
            scrollable className="modal-delete-card"
            backdrop={false}
        >
            <Modal.Header>
            <Modal.Title id="example-modal-sizes-title-lg" style={{fontSize: '16px'}}>
                {modalform && modalform.type == 'edit' 
                    ? 'Editar Alongamento'
                    : 'Adicionar Alongamento'
                }
            </Modal.Title>
                <CloseButton onClick={() => setModalForm({show:false})}/>
            </Modal.Header>
            <Modal.Body className="pb-0">
                <div className="">
                {modalform && modalform.type == 'edit' 
                    ? <Edit id={modalform.id} update={update} operacao={record}/>
                    : <FormAlongamento hasLabel type={modalform.type} submit={update} operacao={record}/>
                }
                </div>
            </Modal.Body>
        </Modal>
        <ModalDeleteCard show={modaldelete.show} link={modaldelete.link} close={() => setModalDelete({...modaldelete, show:false})} 
            update={update} name='Alongamento'
        />
        </>
    )
}
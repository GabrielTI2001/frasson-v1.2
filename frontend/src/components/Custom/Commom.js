import Breadcrumbs from '@mui/material/Breadcrumbs';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { CloseButton, Modal, Row } from 'react-bootstrap';

const CustomBreadcrumb = ({children, iskanban}) => {
    return (
    <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} 
        className={`fs--1 mb-${iskanban ? '0':'2'} w-50 pt-${iskanban ? '2':'0'}`} 
    aria-label="breadcrumb">
        {children}
    </Breadcrumbs>
    )
}
export default CustomBreadcrumb;

export const FloatButton = ({title, onClick, icon}) =>{
    return (
    <div className="add-card-toggle rounded-pill d-flex align-items-center bg-primary px-3 py-1" onClick={onClick}>
        <FontAwesomeIcon icon={icon || faPlus} className="text-white"/>
        <small className="fw-bold p-2 text-white">{title || 'Novo Cadastro'}</small>
    </div>
    )
}

export const ModalForm = ({show, title, onClose, size='md', children}) =>{
    return (
    <Modal
        size={size}
        show={show}
        onHide={onClose}
        aria-labelledby="example-modal-sizes-title-lg"
        scrollable
    >
        <Modal.Header>
            <Modal.Title id="example-modal-sizes-title-lg" style={{fontSize: '16px'}}>
                {title}
            </Modal.Title>
            <CloseButton onClick={onClose}/>
        </Modal.Header>
        <Modal.Body className="pb-0">
            <Row className="flex-center sectionform">
                {show && children}
            </Row>
        </Modal.Body>
    </Modal>
    )
}


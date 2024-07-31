import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import RequerimentoAPPOForm from "./Form";
import { CloseButton, Modal, Row } from "react-bootstrap";

const NewRequerimento = ({show, reduce, close}) =>{
    const user = JSON.parse(localStorage.getItem("user"))
    const navigate = useNavigate();
    useEffect(() =>{
        if ((user.permissions && user.permissions.indexOf("add_requerimentos_appo") === -1) && !user.is_superuser){
            navigate("/error/403")
        }
    },[])
    return (<>
    <Modal
        size="xl"
        show={show}
        onHide={close}
        scrollable
        aria-labelledby="example-modal-sizes-title-lg"
    >
        <Modal.Header>
            <Modal.Title id="example-modal-sizes-title-lg" style={{fontSize: '16px'}}>
                Requerimentos INEMA - APPO - NOVO
            </Modal.Title>
                <CloseButton onClick={close}/>
            </Modal.Header>
            <Modal.Body className="">
                <Row className="flex-center sectionform">
                    <RequerimentoAPPOForm hasLabel type='add' submit={(type, data, coordenadas) =>{reduce(type, data, coordenadas)}} />
                </Row>
        </Modal.Body>
    </Modal>
    </>)
}

export default NewRequerimento;
import React from "react";
import { Row, Col, Card } from "react-bootstrap";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMapLocationDot } from "@fortawesome/free-solid-svg-icons";

const IndexIrrigacao = () =>{
    return (<>
    <ol className="breadcrumb breadcrumb-alt mb-3">
        <li className="breadcrumb-item fw-bold" aria-current="page">
            Requerimentos INEMA
        </li>             
    </ol>
    <Row xl={4} className="gx-2 mt-1">
        <Col>
            <Link className="card shadow-sm px-3 py-1 panel cursor-pointer" to={'appo'}>
                <Card.Body as={Row} className="justify-content-between py-3">
                    <Col className="px-0">
                        <Card.Title className="px-0 col fw-bold" style={{fontSize:'0.75rem'}}>Requerimentos APPO</Card.Title>
                        <h3 className="px-0 fs--2 mb-0 text-secondary">INEMA</h3>
                    </Col>
                    <Col xl={2} className="d-flex align-items-center">
                        <FontAwesomeIcon icon={faMapLocationDot} className="fs-3 text-primary"/>
                    </Col>
                </Card.Body>
            </Link>     
        </Col>
    </Row>
    
    </>)
}

export default IndexIrrigacao;
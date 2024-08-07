import React from "react";
import { Row, Col, Card } from "react-bootstrap";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faScrewdriverWrench, faCircleNotch } from "@fortawesome/free-solid-svg-icons";
import CustomBreadcrumb from "../../components/Custom/Commom";

const IndexIrrigacao = () =>{
    return (<>
    <CustomBreadcrumb>
        <span className="breadcrumb-item fw-bold" aria-current="page">
            Irrigation Application
        </span>             
    </CustomBreadcrumb>
    <Row xl={6} sm={4} xs={2} className="gx-4 mt-1">
        <Col>
            <Link className="card shadow-sm px-1 py-1 panel cursor-pointer" to={'pivots'} style={{backgroundColor:'rgba(6, 159, 186, 0.75)'}}>
                <Card.Body as={Row} className="justify-content-between py-3">
                    <div className="d-flex justify-content-center mb-2">
                        <div className="bg-white rounded-circle p-3 text-center" style={{width:'70px'}}>
                            <FontAwesomeIcon icon={faCircleNotch} className="fs-4 text-dark"/>
                        </div>
                    </div>
                    <div className="text-center text-white">Cadastro Pivots</div>
                </Card.Body>
            </Link>     
        </Col>
        <Col>
            <Link className="card shadow-sm px-1 py-1 panel cursor-pointer" style={{backgroundColor:'rgba(6, 159, 186, 0.75)'}}>
                <Card.Body as={Row} className="justify-content-between py-3">
                    <div className="d-flex justify-content-center mb-2">
                        <div className="bg-white rounded-circle p-3 text-center" style={{width:'70px'}}>
                            <FontAwesomeIcon icon={faScrewdriverWrench} className="fs-4 text-dark"/>
                        </div>
                    </div>
                    <div className="text-center text-white">Projetos Irrigação</div>
                </Card.Body>
            </Link>     
        </Col>
    </Row>
    
    </>)
}

export default IndexIrrigacao;
import React from "react";
import { Card, Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "@fortawesome/fontawesome-svg-core/styles.css";  
import { faMoneyBillWheat, faMapLocationDot, faMoneyBillTrendUp, faArrowTrendUp, faSatellite } 
from "@fortawesome/free-solid-svg-icons";

const ToolsIndex = () =>{
    return (
        <>
        <ol className="breadcrumb breadcrumb-alt fs-xs mb-3">
            <li className="breadcrumb-item fw-bold" aria-current="page">
                Ferramentas Frasson
            </li>    
        </ol>
        <Row className="gx-4 gy-2" xl={4} sm={2}>
          <Col>
            <Card className="shadow-sm px-3">
                <Link className="text-decoration-none" to={'kml-to-coordinates'}>
                  <Card.Body as={Row} className="justify-content-between" xs={2}>
                    <Col lg={9} sm={9} className="ps-0">
                      <Card.Title className="fw-bold fs--1">Extrair Coordenadas</Card.Title>  
                      <p className="mb-0 fw-600">Arquivo KML</p>
                    </Col>
                    <Col lg={2} sm={2} className="px-0 d-flex align-items-center justify-content-end">
                      <FontAwesomeIcon icon={faMapLocationDot} className="fs-4" style={{color:'#17a2b8'}}/>
                    </Col>
                  </Card.Body>
                </Link>
            </Card>
          </Col>
        </Row>
        </>
    )
}

export default ToolsIndex;
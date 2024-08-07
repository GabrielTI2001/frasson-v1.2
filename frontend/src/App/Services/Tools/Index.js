import React from "react";
import { Card, Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "@fortawesome/fontawesome-svg-core/styles.css";  
import { faLocationDot, faMapLocationDot, faGlobe, faMap } 
from "@fortawesome/free-solid-svg-icons";
import CustomBreadcrumb from "../../../components/Custom/Commom";

const ToolsIndex = () =>{
    return (
        <>
        <CustomBreadcrumb >
            <span className="breadcrumb-item fw-bold" aria-current="page">
                Ferramentas Frasson
            </span>    
        </CustomBreadcrumb>
        <Row className="gx-4 gy-2" xl={4} sm={2} xs={1}>
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
          <Col>
            <Card className="shadow-sm px-3">
                <Link className="text-decoration-none" to={'pivot'}>
                  <Card.Body as={Row} className="justify-content-between" xs={2}>
                    <Col lg={9} sm={9} className="ps-0">
                      <Card.Title className="fw-bold fs--1">Coordenadas Pivot</Card.Title>  
                      <p className="mb-0 fw-600">Limites do Pivot</p>
                    </Col>
                    <Col lg={2} sm={2} className="px-0 d-flex align-items-center justify-content-end">
                      <FontAwesomeIcon icon={faLocationDot} className="fs-4" style={{color:'#17a2b8'}}/>
                    </Col>
                  </Card.Body>
                </Link>
            </Card>
          </Col>
          <Col>
            <Card className="shadow-sm px-3">
                <Link className="text-decoration-none" to={'LatLong'}>
                  <Card.Body as={Row} className="justify-content-between" xs={2}>
                    <Col lg={9} sm={9} className="ps-0">
                      <Card.Title className="fw-bold fs--1">Lançar Coordenadas</Card.Title>  
                      <p className="mb-0 fw-600">KML Pontos ou Polígono</p>
                    </Col>
                    <Col lg={2} sm={2} className="px-0 d-flex align-items-center justify-content-end">
                      <FontAwesomeIcon icon={faGlobe} className="fs-4" style={{color:'#17a2b8'}}/>
                    </Col>
                  </Card.Body>
                </Link>
            </Card>
          </Col>
          <Col>
            <Card className="shadow-sm px-3">
                <Link className="text-decoration-none" to={''}>
                  <Card.Body as={Row} className="justify-content-between" xs={2}>
                    <Col lg={9} sm={9} className="ps-0">
                      <Card.Title className="fw-bold fs--1">Google Countours</Card.Title>  
                      <p className="mb-0 fw-600">Curvas de Elevação</p>
                    </Col>
                    <Col lg={2} sm={2} className="px-0 d-flex align-items-center justify-content-end">
                      <FontAwesomeIcon icon={faGlobe} className="fs-4" style={{color:'#17a2b8'}}/>
                    </Col>
                  </Card.Body>
                </Link>
            </Card>
          </Col>
          <Col>
            <Card className="shadow-sm px-3">
                <Link className="text-decoration-none" to={'kml/polygon'}>
                  <Card.Body as={Row} className="justify-content-between" xs={2}>
                    <Col lg={9} sm={9} className="ps-0 pe-0">
                      <Card.Title className="fw-bold fs--1">KML CAD {`->`} KML Corrigido</Card.Title>  
                      <p className="mb-0 fw-600">Curvas de Elevação</p>
                    </Col>
                    <Col lg={2} sm={2} className="px-0 d-flex align-items-center justify-content-end">
                      <FontAwesomeIcon icon={faMap} className="fs-4" style={{color:'#17a2b8'}}/>
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
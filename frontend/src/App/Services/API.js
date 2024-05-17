import React from "react";
import { Card, Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "@fortawesome/fontawesome-svg-core/styles.css";  
import { faMoneyBillWheat, faMagnifyingGlass, faMoneyBillTrendUp, faArrowTrendUp, faSatellite } 
from "@fortawesome/free-solid-svg-icons";

const ExternalAPIs = () =>{
    return (
        <>
        <ol className="breadcrumb breadcrumb-alt fs-xs mb-3">
            <li className="breadcrumb-item fw-bold" aria-current="page">
                API de Terceiros
            </li>    
        </ol>
        <Row className="gx-4 gy-2" xl={4} sm={2} xs={1}>
          <Col>
            <Card className="shadow-sm px-3">
                <Link className="text-decoration-none" to={'cnpj'}>
                  <Card.Body as={Row} className="justify-content-between" xs={2}>
                    <Col lg={9} sm={9} xs={9} className="ps-0">
                      <Card.Title className="fw-bold fs--1">Consulta CNPJ</Card.Title>  
                      <p className="mb-0 fw-600">Receita Federal</p>
                    </Col>
                    <Col lg={2} sm={2} xs={2} className="px-0 d-flex align-items-center justify-content-end">
                      <FontAwesomeIcon icon={faMagnifyingGlass} className="fs-4" style={{color:'#17a2b8'}}/>
                    </Col>
                  </Card.Body>
                </Link>
            </Card>
          </Col>
          <Col>
            <Card className="shadow-sm px-3">
                <Link className="text-decoration-none" to={'currency/commodity'}>
                  <Card.Body as={Row} className="justify-content-between" xs={2}>
                    <Col lg={9} sm={9} xs={9} className="ps-0">
                      <Card.Title className="fw-bold fs--1">Cotações Agrícolas</Card.Title>  
                      <p className="mb-0 fw-600">Commodities Agrícolas e Pecuárias</p>
                    </Col>
                    <Col lg={2} sm={2} xs={2} className="px-0 d-flex align-items-center justify-content-end">
                      <FontAwesomeIcon icon={faMoneyBillWheat} className="fs-4" style={{color:'#17a2b8'}}/>
                    </Col>
                  </Card.Body>
                </Link>
            </Card>
          </Col>
          <Col>
            <Card className="shadow-sm px-3">
                <Link className="text-decoration-none" to={'currency/exchange'}>
                  <Card.Body as={Row} className="justify-content-between" xs={2}>
                    <Col lg={9} sm={9} xs={9} className="ps-0">
                      <Card.Title className="fw-bold fs--1">Moedas Estrangeiras</Card.Title>  
                      <p className="mb-0 fw-600">BRL, USD, BTC</p>
                    </Col>
                    <Col lg={2} sm={2} xs={2} className="px-0 text-end">
                      <FontAwesomeIcon icon={faMoneyBillTrendUp} className="fs-4" style={{color:'#17a2b8'}}/>
                    </Col>
                  </Card.Body>
                </Link>
            </Card>
          </Col>
          <Col>
            <Card className="shadow-sm px-3">
                <Link className="text-decoration-none">
                  <Card.Body as={Row} className="justify-content-between" xs={2}>
                    <Col lg={9} sm={9} xs={9} className="ps-0">
                      <Card.Title className="fw-bold fs--1">Cotações de Ativos</Card.Title>  
                      <p className="mb-0 fw-600">B3</p>
                    </Col>
                    <Col lg={2} sm={2} xs={2} className="px-0 text-end">
                      <FontAwesomeIcon icon={faArrowTrendUp} className="fs-4" style={{color:'#17a2b8'}}/>
                    </Col>
                  </Card.Body>
                </Link>
            </Card>
          </Col>
          <Col>
            <Card className="shadow-sm px-3">
                <Link className="text-decoration-none">
                  <Card.Body as={Row} className="justify-content-between" xs={2}>
                    <Col lg={9} sm={9} xs={9} className="ps-0">
                      <Card.Title className="fw-bold fs--1">Map Biomas</Card.Title>  
                      <p className="mb-0 fw-600">Alerta Desmatamento</p>
                    </Col>
                    <Col lg={2} sm={2} xs={2} className="px-0 text-end">
                      <FontAwesomeIcon icon={faSatellite} className="fs-4" style={{color:'#17a2b8'}}/>
                    </Col>
                  </Card.Body>
                </Link>
            </Card>
          </Col>
        </Row>
        </>
    )
}

export default ExternalAPIs;
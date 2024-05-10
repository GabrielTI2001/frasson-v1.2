import React from "react";
import { Card, Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "@fortawesome/fontawesome-svg-core/styles.css";  
import { faMoneyBillWheat } from "@fortawesome/free-solid-svg-icons";

const Cotacoes = () =>{
    return (
        <>
        <ol className="breadcrumb breadcrumb-alt fs-xs mb-3">
            <li className="breadcrumb-item fw-bold">
                <Link className="link-fx text-primary" to={'/home'}>Home</Link>
            </li>
            <li className="breadcrumb-item fw-bold" aria-current="page">
                Cotações
            </li>    
        </ol>
        <Row className="mx-auto align-items-start">
            <Card as={Col} className="col-lg-3 col-sm-4 col-xl-3 shadow-sm me-4">
                <Link className="text-decoration-none" to={'commodity'}>
                <Card.Body as={Row} className="justify-content-between">
                  <Col lg={9} sm={9} className="ps-0">
                    <Card.Title className="fw-bold fs--1">Commodities</Card.Title>  
                    <p className="mb-0 fw-600">Agrícola, Pecuária</p>
                  </Col>
                  <Col lg={2} sm={2} className="px-0 text-end">
                    <FontAwesomeIcon icon={faMoneyBillWheat} className="fs-4" style={{color:'#17a2b8'}}/>
                  </Col>
                </Card.Body>
                </Link>
            </Card>
            <Card as={Col} className="col-lg-3 col-sm-4 col-xl-3 shadow-sm">
                <Link className="text-decoration-none" to={'exchange'}>
                <Card.Body as={Row} className="justify-content-between">
                  <Col lg={9} sm={9} className="ps-0">
                    <Card.Title className="fw-bold fs--1">Moedas Estrangeiras</Card.Title>  
                    <p className="mb-0 fw-600">BRL, USD, BTC</p>
                  </Col>
                  <Col lg={2} sm={2} className="px-0 text-end">
                    <FontAwesomeIcon icon={faMoneyBillWheat} className="fs-4" style={{color:'#17a2b8'}}/>
                  </Col>
                </Card.Body>
                </Link>
            </Card>
        </Row>
        </>
    )
}

export default Cotacoes;
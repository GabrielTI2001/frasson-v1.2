import { Card, Col, Row } from "react-bootstrap"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export const CardProduto = ({title, data, atribute, icon}) =>{
    return (
        <Col className="d-flex">
            <Card className="shadow-sm px-3 py-1 panel w-100">
                <Card.Body as={Row} className="justify-content-between py-3 gy-2">
                    <Col className="px-0 d-flex flex-column justify-content-center mt-1">
                        <h3 className="px-0 mb-1 fw-bold" style={{fontSize:'1rem'}}>{data[atribute]}</h3>
                        <h3 className="px-0 mb-0" style={{fontSize:'0.75rem'}}>{title}</h3>
                    </Col>
                    <Col xl={2} className="d-flex align-items-center">
                        <FontAwesomeIcon icon={icon} className="fs-2"/>
                    </Col>
                </Card.Body>
            </Card>  
        </Col>
    )
}
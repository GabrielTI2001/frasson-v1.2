import { Card, Col, Row } from "react-bootstrap"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"

export const CardDRE = ({icon, title, data, atribute, atribute2}) =>{
    return (
        <Col>
        <Card className="shadow-sm px-3 py-1 panel">
            <Card.Body as={Row} className="justify-content-between py-3" sm={2} xs={2}>
                <Col className="px-0" xl={10} sm={8}>
                    <Card.Title className="px-0 col fw-bold" style={{fontSize:'1.2rem'}}>
                        {data[atribute]}{atribute2 && <span className="fw-normal ms-1">({data[atribute2]})</span>}
                    </Card.Title>
                    <h3 className="px-0 mb-0" style={{fontSize:'0.75rem'}}>{title}</h3>
                </Col>
                <Col xl={2} sm='auto' xs='auto' className="d-flex align-items-center">
                    <FontAwesomeIcon icon={icon} className="fs-3"/>
                </Col>
            </Card.Body>
        </Card>  
    </Col>
    )
}
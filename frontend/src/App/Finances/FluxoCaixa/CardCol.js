import { Card, Col, Row } from "react-bootstrap"

export const CardCol = ({logo, title, data, atribute, color}) =>{
    return (
        <Col>
            <Card className="shadow-sm px-3 py-1 panel cursor-pointer" style={{borderLeft: `4px solid ${color}`}}>
                <Card.Body as={Row} className="justify-content-between py-2">
                    <Col xl={2} className="d-flex align-items-start px-0">
                        <img src={logo} width={32} height={32} className="rounded-circle"/>
                    </Col>
                    <Col className="px-0 text-end">
                        <h3 className="px-0 fw-bold mb-1">{title}</h3>
                        <Card.Title className={`px-0 mb-0 col text-${data.colors[atribute]}`} style={{fontSize:'0.9rem'}}>
                            {data.saldos[atribute]}
                        </Card.Title>
                    </Col>
                </Card.Body>
            </Card>  
        </Col>
    )
}
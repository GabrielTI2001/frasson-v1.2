import { Card, Col, Row } from "react-bootstrap"

export const CardCobrancas = ({title, data, atribute, atribute2, color, onClick}) =>{
    return (
    <Col>
        <Card className="shadow-sm p-3 panel cursor-pointer hover-card" style={{borderLeft: `4px solid ${color}`}}
            onClick={onClick}
        >
            <Card.Body as={Row} className="justify-content-between py-1">
                <Card.Title className="px-0 col text-primary" style={{fontSize:'0.75rem'}}>{title}</Card.Title>
                <Card.Title className={`px-0 col-auto text-dark`} style={{fontSize:'0.75rem'}}>
                    {data[atribute2]} %
                </Card.Title>
                <h3 className={`px-0 mb-0 fs--1 `}>{ data[atribute] }</h3>
            </Card.Body>
        </Card>  
    </Col>
    )
}
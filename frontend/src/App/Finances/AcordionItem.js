import { Col, Accordion } from "react-bootstrap"

export const ItemTable = ({title, subtitle, data, atribute, disabled, items, colortitle, colorvalue, eventkey}) =>{
    // type = 'R', 'D', 'O'
    // items = [{title:'', attrtotal:'', attrpercent:''}, {title:'', attrtotal:'', attrpercent:''}]
    return (
    <Accordion.Item eventKey={eventkey || 0} className={`${disabled ? 'disabled' : ''}`}>
        <Accordion.Header className="p-0">
            <div className="d-flex justify-content-between mx-auto px-3" style={{width:'100%', fontSize: '0.88rem'}}>
                <Col className={`fw-bold fs--1 text-${colortitle}`} xl={8}>
                    {title} {subtitle && <span className="text-700 fw-normal fs--2">({subtitle})</span>}
                </Col>
                <Col 
                    className={
                        `fw-bold text-end fs--1 text-${colorvalue || (Number(data[atribute].replace(',', '.').split(' ')[1]) < 0 ? 'danger' : 'success')}`
                    } 
                    xl={4}
                >
                    {data[atribute]}
                </Col>
            </div>            
        </Accordion.Header>
        {!disabled &&
            <Accordion.Body className="ps-2 py-0">
                {items && items.map( i =>
                <div className="d-flex justify-content-between mx-auto text-800" style={{width:'87%', fontSize: '0.88rem'}} key={i.title}>
                    <Col className="fw-bold" xl={8}>{i.title}</Col>
                    <Col xl='auto' className="fw-bold text-end">{data[i.attrtotal]}
                        {i.attrpercent && <span className="fw-normal ms-1">({data[i.attrpercent]})</span>}
                    </Col>
                </div>
                )}
            </Accordion.Body>
        }
    </Accordion.Item>
    )
}
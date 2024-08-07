import React, {useState, useEffect} from "react";
import { Card, Row, Col, Form, Spinner, Modal, CloseButton} from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useAppContext } from "../../../Main";
import { BarChart } from "../../../components/Custom/Charts";
import { HandleSearch } from "../../../helpers/Data";
import ReportPagamentos from "../../Finances/Reports/Pagamentos";
import CustomBreadcrumb from "../../../components/Custom/Commom";

const meses = [
    {'number': 1, 'name': 'JAN', 'description':'JANEIRO'}, {'number': 2, 'name': 'FEV', 'description':'FEVEREIRO'}, 
    {'number': 3, 'name': 'MAR', 'description':'MARÇO'}, {'number': 4, 'name': 'ABR', 'description':'ABRIL'},
    {'number': 5, 'name': 'MAI', 'description':'MAIO'}, {'number': 6, 'name': 'JUN', 'description':'JUNHO'}, 
    {'number': 7, 'name': 'JUL', 'description':'JULHO'}, {'number': 8, 'name': 'AGO', 'description':'AGOSTO'},
    {'number': 9, 'name': 'SET', 'description':'SETEMBRO'}, {'number': 10, 'name': 'OUT', 'description':'OUTUBRO'}, 
    {'number': 11, 'name': 'NOV', 'description':'NOVEMBRO'}, {'number': 12, 'name': 'DEZ', 'description':'DEZEMBRO'}
];

const DashBillings = () =>{
    const {config: {theme}} = useAppContext();
    const [formData, setFormData] = useState();
    const [modal, setModal] = useState({show:false, type:null, mes:null, ano:null})
    const navigate = useNavigate();
    const [data, setData] = useState()
    const user = JSON.parse(localStorage.getItem("user"))

    const setter = (responsedata) => {
        setData(responsedata)
    }

    useEffect(()=>{
        if ((user.permissions && user.permissions.indexOf("view_pagamentos_pipefy") === -1) && !user.is_superuser){
            navigate("/error/403")
        }
        if (!data){
            HandleSearch('', 'dashboard/finances/billings', setter)
        }
        setFormData({mes:new Date().getMonth()+1, ano:new Date().getFullYear()})
    }, [])

    if (formData && (formData.ano && formData.mes)){
        if(!data){
            const params = `?year=${formData.ano}&month=${formData.mes}`
            HandleSearch('', 'dashboard/finances/billings', setter, params)
        }
    }

    const handleFieldChange = e => {
        setFormData({
          ...formData,
          [e.target.name]: e.target.value
        });
        setData(null)
    };

    return (
        <>
        <CustomBreadcrumb>
            <span className="breadcrumb-item fw-bold" aria-current="page">
                Dashboard Pagamentos
            </span>    
        </CustomBreadcrumb>
        <Form className='row mb-3'>
            <Form.Group className="mb-1" as={Col} xl={2} sm={4}>
                <Form.Select name='ano' onChange={handleFieldChange} value={formData ? formData.ano : ''}>
                    {data && data.anos.map(ano =>(
                        <option key={ano} value={ano}>{ano}</option>
                    ))}
                </Form.Select>
            </Form.Group>
            <Form.Group className="mb-1" as={Col} xl={2} sm={4}>
                <Form.Select name='mes' onChange={handleFieldChange} value={formData ? formData.mes : ''}>
                    {meses && meses.map( m =>(
                        <option key={m.number} value={m.number}>{m.name}</option>
                    ))}
                </Form.Select>
            </Form.Group>
        </Form>
        {data ? <>
        <Row className="gx-4 gy-4 mb-4" xs={1} sm={2} xl={2}>
            <Col>
                <Card className="shadow-sm p-3 panel cursor-pointer hover-card" style={{borderLeft: '4px solid #4c78dd'}}
                    onClick={() => setModal({show:true, type:'pagamento'})}
                >
                    <Card.Body as={Row} className="justify-content-between py-1">
                        <Card.Title className="px-0 col text-primary" style={{fontSize:'0.75rem'}}>TOTAL PAGAMENTOS</Card.Title>
                        <h3 className={`px-0 mb-0 fs--1 `}>{ data.total_pagamentos }</h3>
                    </Card.Body>
                </Card>  
            </Col>
            <Col>
                <Card className="shadow-sm p-3 panel cursor-pointer hover-card" style={{borderLeft: '4px solid #4c78dd'}}
                    onClick={() => setModal({show:true, type:'pagamento'})}
                >
                    <Card.Body as={Row} className="justify-content-between py-1">
                        <Card.Title className="px-0 col text-primary" style={{fontSize:'0.75rem'}}>Conferência</Card.Title>
                        <Card.Title className={`px-0 col-auto text-dark`} style={{fontSize:'0.75rem'}}>
                            {data.percentual_conferencia} %
                        </Card.Title>
                        <h3 className={`px-0 mb-0 fs--1 `}>{ data.conferencia }</h3>
                    </Card.Body>
                </Card>  
            </Col>
            <Col>
                <Card className="shadow-sm p-3 panel cursor-pointer hover-card" style={{borderLeft: '4px solid #4c78dd'}}
                    onClick={() => setModal({show:true, type:'pagamento'})}
                >
                    <Card.Body as={Row} className="justify-content-between py-1">
                        <Card.Title className="px-0 col text-primary" style={{fontSize:'0.75rem'}}>Agendado</Card.Title>
                        <Card.Title className={`px-0 col-auto text-dark`} style={{fontSize:'0.75rem'}}>
                            {data.percentual_agendado} %
                        </Card.Title>
                        <h3 className={`px-0 mb-0 fs--1 `}>{ data.agendado }</h3>
                    </Card.Body>
                </Card>  
            </Col>
            <Col>
                <Card className="shadow-sm p-3 panel cursor-pointer hover-card" style={{borderLeft: '4px solid #4c78dd'}}
                    onClick={() => setModal({show:true, type:'pagamento'})}
                >
                    <Card.Body as={Row} className="justify-content-between py-1">
                        <Card.Title className="px-0 col text-primary" style={{fontSize:'0.75rem'}}>Agendado</Card.Title>
                        <Card.Title className={`px-0 col-auto text-dark`} style={{fontSize:'0.75rem'}}>
                            {data.percentual_pago} %
                        </Card.Title>
                        <h3 className={`px-0 mb-0 fs--1 `}>{ data.pago }</h3>
                    </Card.Body>
                </Card>  
            </Col>
        </Row>
        <Row xs={1} sm={2} xl={2} className="gx-4 d-flex"> 
            <Col>
                <Card.Body className="card">
                    <BarChart
                        columns={[...Object.keys(data.categorias)]}
                        names={['Meta', 'Realizado']}
                        title={`Top 10 Pagamentos por Categoria`}
                        series = {[{
                            name: '',
                            data: [...Object.values(data.categorias)]
                        }]}
                        hidescale
                        height={280}
                    />
                </Card.Body>
            </Col>  
        </Row> 
        </>    
        : <div className="text-center"><Spinner></Spinner></div>} 
        <Modal
            size="xl"
            show={modal.show}
            onHide={() => setModal({show:false})}
            dialogClassName="mt-1"
            aria-labelledby="example-modal-sizes-title-lg"
        >
            <Modal.Header>
            <Modal.Title id="example-modal-sizes-title-lg" style={{fontSize: '16px'}}>
                Pagamentos {formData && formData.ano}
            </Modal.Title>
                <CloseButton onClick={() => setModal({show:false})}/>
            </Modal.Header>
            <Modal.Body>
                {modal.type === 'pagamento' && <ReportPagamentos />}
            </Modal.Body>
        </Modal>
        </>
        
    )
}

export default DashBillings;
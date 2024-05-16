import React, {useState, useEffect} from "react";
import { Card, Row, Col, Form, Table, Spinner, Modal, CloseButton} from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useAppContext } from "../../../Main";
import { ColumnLineChart, BarChart, ColumnChart } from "../../../components/Custom/Charts";
import IndexCredit from "../../Analytics/Credit/Index";
import { HandleSearch } from "../../../helpers/Data";

const meses = [
    {'number': 1, 'name': 'JAN', 'description':'JANEIRO'}, {'number': 2, 'name': 'FEV', 'description':'FEVEREIRO'}, 
    {'number': 3, 'name': 'MAR', 'description':'MARÇO'}, {'number': 4, 'name': 'ABR', 'description':'ABRIL'},
    {'number': 5, 'name': 'MAI', 'description':'MAIO'}, {'number': 6, 'name': 'JUN', 'description':'JUNHO'}, 
    {'number': 7, 'name': 'JUL', 'description':'JULHO'}, {'number': 8, 'name': 'AGO', 'description':'AGOSTO'},
    {'number': 9, 'name': 'SET', 'description':'SETEMBRO'}, {'number': 10, 'name': 'OUT', 'description':'OUTUBRO'}, 
    {'number': 11, 'name': 'NOV', 'description':'NOVEMBRO'}, {'number': 12, 'name': 'DEZ', 'description':'DEZEMBRO'}
];

const DashCredit = () =>{
    const {config: {theme}} = useAppContext();
    const [formData, setFormData] = useState();
    const [modal, setModal] = useState({show:false, mes:null, ano:null})
    const navigate = useNavigate();
    const [data, setData] = useState()
    const user = JSON.parse(localStorage.getItem("user"))

    const setter = (responsedata) => {
        setData(responsedata)
        setData({...responsedata,
            realizado_ultimo_ano:{
                'JAN': 20
            },
            tipos_operacao:{
                'Teste': 10,
                'Teste2': 15
            },

        })
    }

    useEffect(()=>{
        if ((user.permissions && user.permissions.indexOf("view_operacoes_contratadas") === -1) && !user.is_superuser){
            navigate("/error/403")
        }
        if (!data){
            HandleSearch('', 'dashboard/credit', setter)
        }
        setFormData({mes:new Date().getMonth()+1, ano:new Date().getFullYear()})
    }, [])

    if (formData && (formData.ano && formData.mes)){
        if(!data){
            const params = `?year=${formData.ano}&month=${formData.mes}`
            HandleSearch('', 'dashboard/credit', setter, params)
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
        <ol className="breadcrumb breadcrumb-alt fs-xs mb-3">
            <li className="breadcrumb-item fw-bold">
                <Link className="link-fx text-primary" to={'/analytics/credit'}>Operações de Crédito</Link>
            </li>
            <li className="breadcrumb-item fw-bold" aria-current="page">
                Dashboard
            </li>    
        </ol>
        <Form className='row mb-2'>
            <Form.Group className="mb-1" as={Col} xl={2} sm={4}>
                <Form.Select name='mes' onChange={handleFieldChange} value={formData ? formData.ano : ''}>
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
        <Row className="gx-4 gy-2 mb-3" xs={1} sm={2} xl={2}>
            <Col>
                <Card className="shadow-sm px-3 panel cursor-pointer" style={{borderLeft: '5px solid #4c78dd'}} 
                    onClick={() => setModal({show:true, ano:formData && formData.ano})}>
                    <Card.Body as={Row} className="justify-content-between pt-2 pb-0">
                        <Card.Title className="px-0 col" style={{fontSize:'0.75rem'}}>META</Card.Title>
                        <Card.Title className="px-0 col-auto" style={{fontSize:'0.75rem'}}>{formData && formData.ano}</Card.Title>
                        <h3 className="px-0 fw-bold fs--1 text-primary">{data.meta_ano}</h3>
                        <hr className="mb-0"></hr>
                    </Card.Body>
                    <Card.Body as={Row} className="justify-content-between pt-2 pb-1">
                        <Card.Title className="px-0 col" style={{fontSize:'0.75rem'}}>REALIZADO</Card.Title>
                        <Card.Title className={`px-0 col-auto text-${data.percentual_ano > 100 ? 'success' : 'danger'}`} style={{fontSize:'0.75rem'}}>
                            {data.percentual_ano} %
                        </Card.Title>
                        <h3 className={`px-0 fw-bold fs--1 text-primary`}>{data.realizado_ano} <span className="text-secondary">({data.total_projecao})</span></h3>
                    </Card.Body>
                </Card>  
            </Col>
            <Col>
                <Card className="shadow-sm px-3 panel cursor-pointer" style={{borderLeft: '5px solid #4c78dd'}}
                    onClick={() => setModal({show:true, ano:formData && formData.ano, mes:formData && formData.mes})}>
                    <Card.Body as={Row} className="justify-content-between pt-2 pb-0">
                        <Card.Title className="px-0 col" style={{fontSize:'0.75rem'}}>META</Card.Title>
                        <Card.Title className="px-0 col-auto" style={{fontSize:'0.75rem'}}>{formData && meses[formData.mes-1].description}</Card.Title>
                        <h3 className="px-0 fw-bold fs--1 text-primary">{data.meta_mes}</h3>
                        <hr className="mb-0"></hr>
                    </Card.Body>
                    <Card.Body as={Row} className="justify-content-between pt-2 pb-1">
                        <Card.Title className="px-0 col" style={{fontSize:'0.75rem'}}>REALIZADO</Card.Title>
                        <Card.Title className={`px-0 col-auto text-${data.percentual_mes > 100 ? 'success' : 'danger'}`} style={{fontSize:'0.75rem'}}>
                            {data.percentual_mes} %
                        </Card.Title>
                        <h3 className={`px-0 fw-bold fs--1 text-primary`}>{data.realizado_mes}</h3>
                    </Card.Body>
                </Card>  
            </Col>
            <Col>
                <Card className="shadow-sm px-3 panel cursor-pointer" style={{borderLeft: '5px solid #4c78dd'}}>
                    <Card.Body as={Row} className="justify-content-between pt-2 pb-0">
                        <Card.Title className="px-0 col" style={{fontSize:'0.75rem'}}>META ATÉ {formData && meses[formData.mes-1].description}</Card.Title>
                        <Card.Title className="px-0 col-auto" style={{fontSize:'0.75rem'}}>{data.percentual_meta_ate_mes} %</Card.Title>
                        <h3 className="px-0 fw-bold fs--1 text-primary">{data.total_meta_ate_mes}</h3>
                        <hr className="mb-0"></hr>
                    </Card.Body>
                    <Card.Body as={Row} className="justify-content-between pt-2 pb-1">
                        <Card.Title className="px-0 col" style={{fontSize:'0.75rem'}}>REALIZADO ATÉ {formData && meses[formData.mes-1].description}</Card.Title>
                        <Card.Title className={`px-0 col-auto text-${data.percentual_realizado_ate_mes > 100 ? 'success' : 'danger'}`} style={{fontSize:'0.75rem'}}>
                            {data.percentual_realizado_ate_mes} %
                        </Card.Title>
                        <h3 className={`px-0 fw-bold fs--1 text-primary`}>{data.total_realizado_ate_mes}</h3>
                    </Card.Body>
                </Card>  
            </Col>
            <Col>
                <Card className="shadow-sm px-3 panel cursor-pointer" style={{borderLeft: '5px solid #4c78dd'}}>
                    <Card.Body as={Row} className="justify-content-between pt-2 pb-0">
                        <Card.Title className="px-0 col" style={{fontSize:'0.75rem'}}>ÁREA TOTAL BENEFICIADA</Card.Title>
                        <Card.Title className="px-0 col-auto" style={{fontSize:'0.75rem'}}>{formData && formData.ano}</Card.Title>
                        <h3 className="px-0 fw-bold fs--1 text-primary">{data.area_beneficiada} ha</h3>
                        <hr className="mb-0"></hr>
                    </Card.Body>
                    <Card.Body as={Row} className="justify-content-between pt-2 pb-1">
                        <Card.Title className="px-0 col" style={{fontSize:'0.75rem'}}>TAXA MÉDIA JUROS</Card.Title>
                        <Card.Title className="px-0 col-auto" style={{fontSize:'0.75rem'}}>{formData && formData.ano}</Card.Title>
                        <h3 className={`px-0 fw-bold fs--1 text-primary`}>{data.taxa_media_anual} %</h3>
                    </Card.Body>
                </Card>  
            </Col>
        </Row>
        <Row xs={1} sm={2} xl={2} className="gx-4 d-flex"> 
            <Col>
                <ColumnLineChart
                    valuescolumn={[...Object.values(data.realizado)]} 
                    valuesline={[...Object.values(data.meta)]} 
                    columns={meses.map(m => m.name)}
                    names={['Meta', 'Realizado']}
                    title={`Operações de Crédito ${formData && formData.ano}`}
                />
            </Col>
            <Col>
                <Row xl={2} sm={1} xs={1} className="gx-4 gy-2 d-flex">
                    <Col>
                        <Card as={Col}>
                            <BarChart type='bar' 
                                columns={[...Object.keys(data.bancos)]} 
                                title={`Total Operações ${formData && formData.ano} (R$)`}
                                height={'150vh'}
                                series = {[{
                                    name: '',
                                    data: [...Object.values(data.bancos)]
                                }]}
                            />
                        </Card>
                    </Col>
                    <Col>
                        <Card as={Col}>
                            <BarChart type='bar' 
                                columns={[...Object.keys(data.taxas)]} 
                                title={`Taxa Média Operações ${formData && formData.ano} (%)`}
                                height={'150vh'}
                                series = {[{
                                    name: '',
                                    data: [...Object.values(data.taxas)]
                                }]}
                            />
                        </Card>
                    </Col>
                    {data.tipos_operacao && !data.tipos_operacao.null &&
                        <Col>
                            <Card as={Col}>
                                <BarChart type='bar' 
                                    columns={[...Object.keys(data.tipos_operacao)]} 
                                    title={`Total por Tipo de Operação ${formData && formData.ano} (R$)`}
                                    height={'150vh'}
                                    series = {[{
                                        name: '',
                                        data: [...Object.values(data.tipos_operacao)]
                                    }]}
                                />
                            </Card>
                        </Col>
                    }
                    {data.realizado_ultimo_ano && !data.realizado_ultimo_ano.null &&
                        <Col>
                            <Card as={Col}>
                                <ColumnChart type='column' 
                                    columns={meses.map(m => m.name)} 
                                    title={`Operações de Crédito ${formData && formData.ano} X ${formData && formData.ano-1}`}
                                    height={'150vh'}
                                    series = {[
                                        {
                                            name: `${formData && formData.ano}`,
                                            data: [...Object.values(data.realizado)],
                                            type:'bar'
                                        },
                                        {
                                            name: `${formData && formData.ano-1}`,
                                            data: [...Object.values(data.realizado_ultimo_ano)],
                                            type:'bar'
                                        }
                                    ]}
                                />
                            </Card>
                        </Col>
                    }
                </Row>
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
                Operações de Crédito {formData && formData.ano}
            </Modal.Title>
                <CloseButton onClick={() => setModal({show:false})}/>
            </Modal.Header>
            <Modal.Body>
                <IndexCredit mes={modal.mes} ano={modal.ano} />
            </Modal.Body>
        </Modal>
        </>
        
    )
}

export default DashCredit;
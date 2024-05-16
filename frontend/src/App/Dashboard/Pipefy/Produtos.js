import React, {useState, useEffect} from "react";
import { useNavigate } from "react-router-dom";
import { Card, Row, Col, Spinner} from "react-bootstrap";
import { useAppContext } from "../../../Main";
import { BarChart, PieChart } from "../../../components/Custom/Charts";
import { HandleSearch } from "../../../helpers/Data";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGear, faMoneyBills, faSeedling } from "@fortawesome/free-solid-svg-icons";

const meses = [
    {'number': 1, 'name': 'JAN', 'description':'JANEIRO'}, {'number': 2, 'name': 'FEV', 'description':'FEVEREIRO'}, 
    {'number': 3, 'name': 'MAR', 'description':'MARÇO'}, {'number': 4, 'name': 'ABR', 'description':'ABRIL'},
    {'number': 5, 'name': 'MAI', 'description':'MAIO'}, {'number': 6, 'name': 'JUN', 'description':'JUNHO'}, 
    {'number': 7, 'name': 'JUL', 'description':'JULHO'}, {'number': 8, 'name': 'AGO', 'description':'AGOSTO'},
    {'number': 9, 'name': 'SET', 'description':'SETEMBRO'}, {'number': 10, 'name': 'OUT', 'description':'OUTUBRO'}, 
    {'number': 11, 'name': 'NOV', 'description':'NOVEMBRO'}, {'number': 12, 'name': 'DEZ', 'description':'DEZEMBRO'}
];

const DashProdutos = () =>{
    const {config: {theme}} = useAppContext();
    const [data, setData] = useState()
    const user = JSON.parse(localStorage.getItem("user"))
    const navigate = useNavigate()

    const setter = (data) => {
        setData(data)
        setData({...data,   
            faturamento_estimado_gc: [
                {
                  "fase": "FASE A",
                  "total": 1
                },
                {
                    "fase": "FASE B",
                    "total": 5
                }
            ],
            faturamento_estimado_gai: [
                {
                  "fase": "FASE A",
                  "total": 1
                },
                {
                    "fase": "FASE B",
                    "total": 5
                }
            ],
            operacoes_andamento: [
                {
                  "fase": "FASE A",
                  "total": 1
                },
                {
                    "fase": "FASE B",
                    "total": 5
                }
            ]
        })
    }

    useEffect(()=>{
        if ((user.permissions && user.permissions.indexOf("view_card_produtos") === -1) && !user.is_superuser){
            navigate("/error/403")
        }
        if (!data){
            HandleSearch('','dashboard/products', setter)
        }
    }, [])

    return (
        <>
        <ol className="breadcrumb breadcrumb-alt fs-xs mb-2">
            <li className="breadcrumb-item fw-bold" aria-current="page">
                Dashboard Produtos
            </li>    
        </ol>
        {data ? <>
        <Row className="d-flex flex-row gx-4 gy-3 mb-4" xs={1} sm={2} xl={4}>
            <Col className="d-flex">
                <Card className="shadow-sm px-3 py-1 panel w-100">
                    <Card.Body as={Row} className="justify-content-between py-3 gy-2">
                        <Col className="px-0">
                            <Card.Title className="px-0 col fw-bold" style={{fontSize:'1rem'}}>{data.qtd_processos}</Card.Title>
                            <h3 className="px-0 mb-0" style={{fontSize:'0.75rem'}}>Processos em Andamento</h3>
                        </Col>
                        <Col xl={2} className="d-flex align-items-center">
                            <FontAwesomeIcon icon={faGear} className="fs-2"/>
                        </Col>
                    </Card.Body>
                </Card>  
            </Col>
            <Col className="d-flex">
                <Card className="shadow-sm px-3 py-1 panel w-100">
                    <Card.Body as={Row} className="justify-content-between py-3 gy-2">
                        <Col className="px-0">
                            <Card.Title className="px-0 col fw-bold" style={{fontSize:'1rem'}}>{data.qtd_gestao_credito}</Card.Title>
                            <h3 className="px-0 mb-0" style={{fontSize:'0.75rem'}}>Gestão de Crédito</h3>
                        </Col>
                        <Col xl={2} className="d-flex align-items-center">
                            <FontAwesomeIcon icon={faSeedling} className="fs-2"/>
                        </Col>
                    </Card.Body>
                </Card>  
            </Col>
            <Col className="d-flex">
                <Card className="shadow-sm px-3 py-1 panel w-100">
                    <Card.Body as={Row} className="justify-content-between py-3 gy-2">
                        <Col className="px-0">
                            <Card.Title className="px-0 col fw-bold" style={{fontSize:'1rem'}}>{data.qtd_gestao_ambiental}</Card.Title>
                            <h3 className="px-0 mb-0" style={{fontSize:'0.75rem'}}>Gestão Ambiental e Irrigação</h3>
                        </Col>
                        <Col xl={2} className="d-flex align-items-center">
                            <FontAwesomeIcon icon={faSeedling} className="fs-2"/>
                        </Col>
                    </Card.Body>
                </Card>  
            </Col>
            <Col className="d-flex">
                <Card className="shadow-sm px-3 py-1 panel w-100">
                    <Card.Body as={Row} className="justify-content-between py-3 gy-2">
                        <Col className="px-0">
                            <Card.Title className="px-0 col fw-bold" style={{fontSize:'1rem'}}>{data.fatu_estimado_total}</Card.Title>
                            <h3 className="px-0 mb-0" style={{fontSize:'0.75rem'}}>Faturamento total estimado em andamento</h3>
                        </Col>
                        <Col xl={2} className="d-flex align-items-center">
                            <FontAwesomeIcon icon={faMoneyBills} className="fs-2"/>
                        </Col>
                    </Card.Body>
                </Card>  
            </Col>
            <Col className="d-flex">
                <Card className="shadow-sm px-3 py-1 panel w-100">
                    <Card.Body as={Row} className="justify-content-between py-3 gy-2">
                        <Col className="px-0">
                            <Card.Title className="px-0 col fw-bold" style={{fontSize:'1rem'}}>{data.concluidos_gc}</Card.Title>
                            <h3 className="px-0 mb-0" style={{fontSize:'0.75rem'}}>Processos GC Concluídos em {new Date().getFullYear()}</h3>
                        </Col>
                        <Col xl={2} className="d-flex align-items-center">
                            <FontAwesomeIcon icon={faMoneyBills} className="fs-2"/>
                        </Col>
                    </Card.Body>
                </Card>  
            </Col>
            <Col className="d-flex">
                <Card className="shadow-sm px-3 py-1 panel w-100">
                    <Card.Body as={Row} className="justify-content-between py-3 gy-2">
                        <Col className="px-0">
                            <Card.Title className="px-0 col fw-bold" style={{fontSize:'1rem'}}>{data.concluidos_gai}</Card.Title>
                            <h3 className="px-0 mb-0" style={{fontSize:'0.75rem'}}>Processos GAI Concluídos em {new Date().getFullYear()}</h3>
                        </Col>
                        <Col xl={2} className="d-flex align-items-center">
                            <FontAwesomeIcon icon={faMoneyBills} className="fs-2"/>
                        </Col>
                    </Card.Body>
                </Card>  
            </Col>
        </Row>
        <Row xs={1} sm={3} xl={3} className="gx-4 gy-2 d-flex"> 
            {data.faturamento_estimado_gc && data.faturamento_estimado_gc.length > 0 &&
                <Col>
                    <Card as={Col} className="p-3">
                        <BarChart
                            columns={data.faturamento_estimado_gc.map(p => p.fase)} 
                            title={`Faturamento Estimado por Fase - GC`}
                            height={'205vh'}
                            series = {[
                                {
                                    name: '',
                                    data: data.faturamento_estimado_gc.map(p => p.total),
                                    type:'bar'
                                }
                            ]}
                            hidescale
                        />
                    </Card>
                </Col>
            }
            {data.faturamento_estimado_gai && data.faturamento_estimado_gai.length > 0 &&
                <Col>
                    <Card as={Col} className="p-3">
                        <BarChart
                            columns={data.faturamento_estimado_gai.map(p => p.fase)} 
                            title={`Faturamento Estimado por Fase - GAI`}
                            height={'205vh'}
                            series = {[
                                {
                                    name: '',
                                    data: data.faturamento_estimado_gai.map(p => p.total),
                                    type:'bar'
                                }
                            ]}
                            hidescale
                        />
                    </Card>
                </Col>
            }
            {data.operacoes_andamento && data.operacoes_andamento.length > 0 &&
                <Col>
                    <Card as={Col} className="p-3">
                        <BarChart
                            columns={data.operacoes_andamento.map(p => p.fase)} 
                            title={`Operações de Crédito em Andamento`}
                            height={'205vh'}
                            series = {[
                                {
                                    name: '',
                                    data: data.operacoes_andamento.map(p => p.total),
                                    type:'bar'
                                }
                            ]}
                            hidescale
                        />
                    </Card>
                </Col>
            }
        </Row> 
        </>    
        : <div className="text-center"><Spinner></Spinner></div>} 
        </>
        
    )
}

export default DashProdutos;
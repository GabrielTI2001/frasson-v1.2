import React, {useState, useEffect} from "react";
import { useNavigate } from "react-router-dom";
import { Card, Row, Col, Spinner} from "react-bootstrap";
import { useAppContext } from "../../../Main";
import { BarChart, PieChart } from "../../../components/Custom/Charts";
import { HandleSearch } from "../../../helpers/Data";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilter, faFilterCircleDollar, faPercent } from "@fortawesome/free-solid-svg-icons";

const DashProspects = () =>{
    const {config: {theme}} = useAppContext();
    const [data, setData] = useState()
    const user = JSON.parse(localStorage.getItem("user"))
    const navigate = useNavigate()

    const setter = (data) => {
        setData(data)
        setData({...data,   
        produtos: [
            {
              "produto": "Produto A",
              "total": 1
            },
            {
                "produto": "Produto B",
                "total": 5
            }
          ]
        })
    }

    useEffect(()=>{
        if ((user.permissions && user.permissions.indexOf("view_card_prospects") === -1) && !user.is_superuser){
            navigate("/error/403")
        }
        if (!data){
            HandleSearch('','dashboard/prospects', setter)
        }
    }, [])

    return (
        <>
        <ol className="breadcrumb breadcrumb-alt fs-xs mb-2">
            <li className="breadcrumb-item fw-bold" aria-current="page">
                Dashboard Prospects
            </li>    
        </ol>
        {data ? <>
        <Row className="gx-4 gy-2 mb-3" xs={1} sm={2} xl={4}>
            <Col>
                <Card className="shadow-sm px-3 py-1 panel cursor-pointer">
                    <Card.Body as={Row} className="justify-content-between py-3">
                        <Col className="px-0">
                            <Card.Title className="px-0 col fw-bold" style={{fontSize:'1rem'}}>{data.qtd_prospects}</Card.Title>
                            <h3 className="px-0 fs--1 mb-0">Prospects em Andamento</h3>
                        </Col>
                        <Col xl={2} className="d-flex align-items-center">
                            <FontAwesomeIcon icon={faFilter} className="fs-2"/>
                        </Col>
                    </Card.Body>
                </Card>  
            </Col>
            <Col>
                <Card className="shadow-sm px-3 py-1 panel cursor-pointer">
                    <Card.Body as={Row} className="justify-content-between py-3">
                        <Col className="px-0">
                            <Card.Title className="px-0 col fw-bold" style={{fontSize:'1rem'}}>{data.qtd_proposta_valor}</Card.Title>
                            <h3 className="px-0 fs--1 mb-0">Prospects em proposta de valor</h3>
                        </Col>
                        <Col xl={2} className="d-flex align-items-center">
                            <FontAwesomeIcon icon={faFilter} className="fs-2"/>
                        </Col>
                    </Card.Body>
                </Card>  
            </Col>
            <Col>
                <Card className="shadow-sm px-3 py-1 panel cursor-pointer">
                    <Card.Body as={Row} className="justify-content-between py-3">
                        <Col className="px-0">
                            <Card.Title className="px-0 col fw-bold" style={{fontSize:'1rem'}}>{data.valor_proposta_valor}</Card.Title>
                            <h3 className="px-0 fs--1 mb-0">Proposta de valor GAI (Total)</h3>
                        </Col>
                        <Col xl={2} className="d-flex align-items-center">
                            <FontAwesomeIcon icon={faFilterCircleDollar} className="fs-2"/>
                        </Col>
                    </Card.Body>
                </Card>  
            </Col>
            <Col>
                <Card className="shadow-sm px-3 py-1 panel cursor-pointer">
                    <Card.Body as={Row} className="justify-content-between py-3">
                        <Col className="px-0">
                            <Card.Title className="px-0 col fw-bold" style={{fontSize:'1rem'}}>{data.media_proposta_valor}</Card.Title>
                            <h3 className="px-0 fs--1 mb-0">Proposta de valor GC (% médio)</h3>
                        </Col>
                        <Col xl={2} className="d-flex align-items-center">
                            <FontAwesomeIcon icon={faPercent} className="fs-2"/>
                        </Col>
                    </Card.Body>
                </Card>  
            </Col>
        </Row>
        <Row xs={1} sm={3} xl={3} className="gx-4 gy-2 d-flex"> 
            {data.produtos && !data.produtos.null &&
                <Col>
                    <Card as={Col} className="p-3">
                        <PieChart 
                            type='pie' 
                            labels={data.produtos.map(p => p.produto)} 
                            title={`Processos em Andamento por Produto`}
                            height={'250vh'}
                            name=''
                            values={data.produtos.map(p => p.total)}
                        />
                    </Card>
                </Col>
            }
            {data.classificacao && !data.classificacao.null &&
                <Col>
                    <Card as={Col} className="p-3">
                        <PieChart 
                            type='pie' 
                            labels={data.classificacao.map(p => p.classificacao)} 
                            title={`Classificação Prospects`}
                            height={'250vh'}
                            name=''
                            values={data.classificacao.map(p => p.total)}
                        />
                    </Card>
                </Col>
            }
            {data.fases && data.fases.length > 0 &&
                <Col>
                    <Card as={Col} className="p-3">
                        <BarChart
                            columns={data.fases.map(p => p.fase)} 
                            title={`Prospects por Fase`}
                            height={'205vh'}
                            series = {[
                                {
                                    name: '',
                                    data: data.fases.map(p => p.total),
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

export default DashProspects;
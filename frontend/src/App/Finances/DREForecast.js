import React, {useState, useEffect} from "react";
import { Card, Row, Col, Spinner, Accordion} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMoneyBillTrendUp, faSackDollar, faArrowTrendDown } 
from "@fortawesome/free-solid-svg-icons";
import { HandleSearch } from "../../helpers/Data";

const DREProvisionado = () =>{
    const navigate = useNavigate();
    const [data, setData] = useState()
    const user = JSON.parse(localStorage.getItem("user"))

    const setter = (responsedata) => {
        setData(responsedata)
    }

    useEffect(()=>{
        if ((user.permissions && user.permissions.indexOf("ver_dre_consolidado") === -1) && !user.is_superuser){
            navigate("/error/403")
        }
        if (!data){
            HandleSearch('', 'finances/dre/forecast', setter)
        }
    }, [])

    return (
        <>
        <ol className="breadcrumb breadcrumb-alt fs-xs mb-3">
            <li className="breadcrumb-item fw-bold" aria-current="page">
                DRE Provisionado
            </li>    
        </ol>
        {data ? 
        <>
        <Row xs={1} sm={1} xl={2} className="gx-4 gy-3 d-flex"> 
            <Col>
                <Accordion defaultActiveKey={['0']}>
                    <Accordion.Item eventKey="1">
                        <Accordion.Header className="p-0">
                            <div className="d-flex justify-content-between mx-auto px-3" style={{width:'100%', fontSize: '0.88rem'}}>
                                <Col className="fw-bold fs--1 text-primary" xl={8}>
                                    (+) Receita Sobre Serviços
                                </Col>
                                <Col className={`fw-bold text-end fs--1 text-success`} xl={4}>
                                    {data.faturado_total}
                                </Col>
                            </div>            
                        </Accordion.Header>
                        <Accordion.Body className="ps-2 py-0">
                            <div className="d-flex justify-content-between mx-auto text-800" style={{width:'87%', fontSize: '0.88rem'}}>
                                <Col className="fw-bold" xl={8}>Gestão de Crédito</Col>
                                <Col xl='auto' className="fw-bold text-end">{data.faturado_gc}</Col>
                            </div>
                            <div className="d-flex justify-content-between mx-auto text-800" style={{width:'87%', fontSize: '0.88rem'}}>
                                <Col className="fw-bold" xl={8}>Gestão Ambiental e Irrigação</Col>
                                <Col xl='auto' className="fw-bold text-end">{data.faturado_gai}</Col>
                            </div>
                            <div className="d-flex justify-content-between mx-auto text-800" style={{width:'87%', fontSize: '0.88rem'}}>
                                <Col className="fw-bold" xl={8}>Avaliação de Imóvel</Col>
                                <Col xl='auto' className="fw-bold text-end">{data.faturado_avaliacao}</Col>
                            </div>
                            <div className="d-flex justify-content-between mx-auto text-800" style={{width:'87%', fontSize: '0.88rem'}}>
                                <Col className="fw-bold" xl={8}>Tecnologia e Inovação</Col>
                                <Col xl='auto' className="fw-bold text-end">{data.faturado_tecnologia}</Col>
                            </div>
                        </Accordion.Body>
                    </Accordion.Item>
                    <Accordion.Item eventKey="2">
                        <Accordion.Header className="p-0">
                            <div className="d-flex justify-content-between mx-auto px-3" style={{width:'100%', fontSize: '0.88rem'}}>
                                <Col className="fw-bold fs--1 text-primary" xl={8}>
                                    (-) Impostos Sobre Serviços (Indiretos)
                                </Col>
                                <Col className={`fw-bold text-end fs--1 text-danger`} xl={4}>
                                    {data.total_impostos_indiretos}
                                </Col>
                            </div>            
                        </Accordion.Header>
                        <Accordion.Body className="ps-2 py-0">
                            <div className="d-flex justify-content-between mx-auto text-800" style={{width:'87%', fontSize: '0.88rem'}}>
                                <Col className="fw-bold" xl={8}>ISS</Col>
                                <Col xl='auto' className="fw-bold text-end">{data.total_iss}</Col>
                            </div>
                            <div className="d-flex justify-content-between mx-auto text-800" style={{width:'87%', fontSize: '0.88rem'}}>
                                <Col className="fw-bold" xl={8}>PIS</Col>
                                <Col xl='auto' className="fw-bold text-end">{data.total_pis}</Col>
                            </div>
                            <div className="d-flex justify-content-between mx-auto text-800" style={{width:'87%', fontSize: '0.88rem'}}>
                                <Col className="fw-bold" xl={8}>COFINS</Col>
                                <Col xl='auto' className="fw-bold text-end">{data.total_cofins}</Col>
                            </div>
                        </Accordion.Body>
                    </Accordion.Item>
                    <Accordion.Item eventKey="3">
                        <Accordion.Header className="p-0">
                            <div className="d-flex justify-content-between mx-auto px-3" style={{width:'100%', fontSize: '0.88rem'}}>
                                <Col className="fw-bold fs--1 text-primary" xl={8}>
                                    (+) Cobranças Abertas
                                </Col>
                                <Col className={`fw-bold text-end fs--1 text-success`} xl={4}>
                                    {data.aberto_total}
                                </Col>
                            </div>            
                        </Accordion.Header>
                        <Accordion.Body className="ps-2 py-0">
                            <div className="d-flex justify-content-between mx-auto text-800" style={{width:'87%', fontSize: '0.88rem'}}>
                                <Col className="fw-bold" xl={8}>Gestão de Crédito</Col>
                                <Col xl='auto' className="fw-bold text-end">{data.aberto_gc}</Col>
                            </div>
                            <div className="d-flex justify-content-between mx-auto text-800" style={{width:'87%', fontSize: '0.88rem'}}>
                                <Col className="fw-bold" xl={8}>Gestão Ambiental e Irrigação</Col>
                                <Col xl='auto' className="fw-bold text-end">{data.aberto_gai}</Col>
                            </div>
                            <div className="d-flex justify-content-between mx-auto text-800" style={{width:'87%', fontSize: '0.88rem'}}>
                                <Col className="fw-bold" xl={8}>Avaliação de Imóvel</Col>
                                <Col xl='auto' className="fw-bold text-end">{data.aberto_avaliacao}</Col>
                            </div>
                            <div className="d-flex justify-content-between mx-auto text-800" style={{width:'87%', fontSize: '0.88rem'}}>
                                <Col className="fw-bold" xl={8}>Tecnologia e Inovação</Col>
                                <Col xl='auto' className="fw-bold text-end">{data.aberto_tecnologia}</Col>
                            </div>
                        </Accordion.Body>
                    </Accordion.Item>
                    <Accordion.Item eventKey="4">
                        <Accordion.Header className="p-0">
                            <div className="d-flex justify-content-between mx-auto px-3" style={{width:'100%', fontSize: '0.88rem'}}>
                                <Col className="fw-bold fs--1 text-primary" xl={8}>
                                    (+) Receita Provisionada
                                </Col>
                                <Col className={`fw-bold text-end fs--1 text-success`} xl={4}>
                                    {data.receita_provisionada}
                                </Col>
                            </div>            
                        </Accordion.Header>
                        <Accordion.Body className="ps-2 py-0">
                            <div className="d-flex justify-content-between mx-auto text-800" style={{width:'87%', fontSize: '0.88rem'}}>    
                                <Col className="fw-bold" xl={8}>
                                    Proposta de valor GAI <span className="fw-normal">({data.percentual_proposta_valor})</span>
                                </Col>
                                <Col xl='auto' className="fw-bold text-end">{data.total_pv_prospect}</Col>
                            </div>
                            <div className="d-flex justify-content-between mx-auto text-800" style={{width:'87%', fontSize: '0.88rem'}}>
                                <Col className="fw-bold" xl={8}>Operações de crédito em andamento <span className="fw-normal">(0,8%)</span></Col>
                                <Col xl='auto' className="fw-bold text-end">{data.faturamento_provisionado_gc}</Col>
                            </div>
                            <div className="d-flex justify-content-between mx-auto text-800" style={{width:'87%', fontSize: '0.88rem'}}>
                                <Col className="fw-bold" xl={8}>Faturamento GAI em andamento</Col>
                                <Col xl='auto' className="fw-bold text-end">{data.faturamento_provisionado_gai}</Col>
                            </div>
                        </Accordion.Body>
                    </Accordion.Item>
                    <Accordion.Item eventKey="0" className="disabled">
                        <Accordion.Header>
                            <div className="d-flex justify-content-between mx-auto px-3" style={{width:'100%', fontSize: '0.88rem'}}>
                                <Col className="fw-bold fs--1 text-primary" xl={8}>
                                    (-)	Impostos Sobre Serviços (Estimativa)
                                </Col>
                                <Col className={`fw-bold text-end fs--1 text-danger`} xl={4}>
                                    {data.total_previsao_impostos_indiretos}
                                </Col>
                            </div>
                        </Accordion.Header>
                    </Accordion.Item> 
                    <Accordion.Item eventKey="0" className="disabled">
                        <Accordion.Header>
                            <div className="d-flex justify-content-between mx-auto px-3" style={{width:'100%', fontSize: '0.88rem'}}>
                                <Col className="fw-bold fs--1 text-primary" xl={8}>
                                    (=) Receita Líquida
                                </Col>
                                <Col className={`fw-bold text-end fs--1 text-${data.receita_liquida > 0 ? 'success' : 'danger'}`} xl={4}>
                                    {data.receita_liquida}
                                </Col>
                            </div>
                        </Accordion.Header>
                    </Accordion.Item>
                    <Accordion.Item eventKey="0" className="disabled">
                        <Accordion.Header>
                            <div className="d-flex justify-content-between mx-auto px-3" style={{width:'100%', fontSize: '0.88rem'}}>
                                <Col className="fw-bold fs--1 text-primary" xl={8}>
                                    (-)	Custo Serviço Prestado
                                </Col>
                                <Col className={`fw-bold text-end fs--1 text-danger`} xl={4}>
                                    {data.total_custos}
                                </Col>
                            </div>
                        </Accordion.Header>
                    </Accordion.Item> 
                    <Accordion.Item eventKey="0" className="disabled">
                        <Accordion.Header>
                            <div className="d-flex justify-content-between mx-auto px-3" style={{width:'100%', fontSize: '0.88rem'}}>
                                <Col className="fw-bold fs--1 text-primary" xl={8}>
                                    (-)	Estimativa Custo 
                                    <span className="fw-normal text-secondary ms-1 fs--2">(Até dezembro {new Date().getFullYear()})</span>                          
                                </Col>
                                <Col className={`fw-bold text-end fs--1 text-danger`} xl={4}>
                                    {data.total_custos_estimativa}
                                </Col>
                            </div>
                        </Accordion.Header>
                    </Accordion.Item>
                    <Accordion.Item eventKey="0" className="disabled">
                        <Accordion.Header>
                            <div className="d-flex justify-content-between mx-auto px-3" style={{width:'100%', fontSize: '0.88rem'}}>
                                <Col className="fw-bold fs--1 text-primary" xl={8}>
                                    (=) Lucro Bruto
                                </Col>
                                <Col className={`fw-bold text-end fs--1 text-${data.lucro_bruto > 0 ? 'success' : 'danger'}`} xl={4}>
                                    {data.lucro_bruto}
                                </Col>
                            </div>
                        </Accordion.Header>
                    </Accordion.Item>
                    <Accordion.Item eventKey="5">
                        <Accordion.Header className="p-0">
                            <div className="d-flex justify-content-between mx-auto px-3" style={{width:'100%', fontSize: '0.88rem'}}>
                                <Col className="fw-bold fs--1 text-primary" xl={8}>
                                    (-) Despesas
                                </Col>
                                <Col className={`fw-bold text-end fs--1 text-danger`} xl={4}>
                                    {data.total_despesas}
                                </Col>
                            </div>            
                        </Accordion.Header>
                        <Accordion.Body className="ps-2 py-0">
                            <div className="d-flex justify-content-between mx-auto text-800" style={{width:'87%', fontSize: '0.88rem'}}>
                                <Col className="fw-bold" xl={8}>Operacionais</Col>
                                <Col xl='auto' className="fw-bold text-end">{data.despesas_operacionais}</Col>
                            </div>
                            <div className="d-flex justify-content-between mx-auto text-800" style={{width:'87%', fontSize: '0.88rem'}}>
                                <Col className="fw-bold" xl={8}>Não Operacionais</Col>
                                <Col xl='auto' className="fw-bold text-end">{data.despesas_nao_operacionais}</Col>
                            </div>
                        </Accordion.Body>
                    </Accordion.Item>
                    <Accordion.Item eventKey="0" className="disabled">
                        <Accordion.Header>
                            <div className="d-flex justify-content-between mx-auto px-3" style={{width:'100%', fontSize: '0.88rem'}}>
                                <Col className="fw-bold fs--1 text-primary" xl={8}>
                                    (-)	Estimativa Despesas
                                    <span className="fw-normal text-secondary ms-1 fs--2">(Até dezembro {new Date().getFullYear()})</span>                          
                                </Col>
                                <Col className={`fw-bold text-end fs--1 text-danger`} xl={4}>
                                    {data.total_despesas_estimativa}
                                </Col>
                            </div>
                        </Accordion.Header>
                    </Accordion.Item>
                    <Accordion.Item eventKey="0" className="disabled">
                        <Accordion.Header>
                            <div className="d-flex justify-content-between mx-auto px-3" style={{width:'100%', fontSize: '0.88rem'}}>
                                <Col className="fw-bold fs--1 text-primary" xl={8}>
                                    (=) Lucro Operacional
                                </Col>
                                <Col className={`fw-bold text-end fs--1 text-${data.lucro_operacional > 0 ? 'success' : 'danger'}`} xl={4}>
                                    {data.lucro_operacional}
                                </Col>
                            </div>
                        </Accordion.Header>
                    </Accordion.Item>
                    <Accordion.Item eventKey="6">
                        <Accordion.Header className="p-0">
                            <div className="d-flex justify-content-between mx-auto px-3" style={{width:'100%', fontSize: '0.88rem'}}>
                                <Col className="fw-bold fs--1 text-primary" xl={8}>
                                    (+) Resultado Financeiro
                                </Col>
                                <Col className={`fw-bold text-end fs--1 text-${data.resultado_financeiro < 0 ? 'danger' : 'success'}`} xl={4}>
                                    {data.resultado_financeiro}
                                </Col>
                            </div>            
                        </Accordion.Header>
                        <Accordion.Body className="ps-2 py-0">
                            <div className="d-flex justify-content-between mx-auto text-800" style={{width:'87%', fontSize: '0.88rem'}}>
                                <Col className="fw-bold" xl={8}>Receitas em Movimentações Financeiras</Col>
                                <Col xl='auto' className="fw-bold text-end">{data.receitas_financeiras}</Col>
                            </div>
                            <div className="d-flex justify-content-between mx-auto text-800" style={{width:'87%', fontSize: '0.88rem'}}>
                                <Col className="fw-bold" xl={8}>Despesas em Movimentações Financeiras</Col>
                                <Col xl='auto' className="fw-bold text-end">{data.despesas_financeiras}</Col>
                            </div>
                            <div className="d-flex justify-content-between mx-auto text-800" style={{width:'87%', fontSize: '0.88rem'}}>
                                <Col className="fw-bold" xl={8}>Reembolso Adiantamentos Clientes</Col>
                                <Col xl='auto' className="fw-bold text-end">{data.reembolso_clientes}</Col>
                            </div>
                        </Accordion.Body>
                    </Accordion.Item>
                    <Accordion.Item eventKey="0" className="disabled">
                        <Accordion.Header>
                            <div className="d-flex justify-content-between mx-auto px-3" style={{width:'100%', fontSize: '0.88rem'}}>
                                <Col className="fw-bold fs--1 text-primary" xl={8}>
                                    (=) Lucro Antes dos Impostos (EBITDA)
                                </Col>
                                <Col className={`fw-bold text-end fs--1 text-${data.ebitda > 0 ? 'success' : 'danger'}`} xl={4}>
                                    {data.ebitda}
                                </Col>
                            </div>
                        </Accordion.Header>
                    </Accordion.Item>
                    <Accordion.Item eventKey="7">
                        <Accordion.Header className="p-0">
                            <div className="d-flex justify-content-between mx-auto px-3" style={{width:'100%', fontSize: '0.88rem'}}>
                                <Col className="fw-bold fs--1 text-primary" xl={8}>
                                    (-) Impostos Sobre Lucros (Diretos) 
                                </Col>
                                <Col className={`fw-bold text-end fs--1 text-danger`} xl={4}>
                                    {data.total_impostos_diretos}
                                </Col>
                            </div>            
                        </Accordion.Header>
                        <Accordion.Body className="ps-2 py-0">
                            <div className="d-flex justify-content-between mx-auto text-800" style={{width:'87%', fontSize: '0.88rem'}}>
                                <Col className="fw-bold" xl={8}>CSLL</Col>
                                <Col xl='auto' className="fw-bold text-end">{data.total_csll}</Col>
                            </div>
                            <div className="d-flex justify-content-between mx-auto text-800" style={{width:'87%', fontSize: '0.88rem'}}>
                                <Col className="fw-bold" xl={8}>IRPJ</Col>
                                <Col xl='auto' className="fw-bold text-end">{data.total_irpj}</Col>
                            </div>
                        </Accordion.Body>
                    </Accordion.Item>
                    <Accordion.Item eventKey="0" className="disabled">
                        <Accordion.Header>
                            <div className="d-flex justify-content-between mx-auto px-3" style={{width:'100%', fontSize: '0.88rem'}}>
                                <Col className="fw-bold fs--1" xl={8}>
                                    (=) Lucro Líquido Provisionado {new Date().getFullYear()}
                                </Col>
                                <Col className={`fw-bold text-end fs--1 text-${data.lucro_liquido > 0 ? 'success' : 'danger'}`} xl={4}>
                                    {data.lucro_liquido}
                                </Col>
                            </div>
                        </Accordion.Header>
                    </Accordion.Item>
                </Accordion>
            </Col>

            <Col>
                <Row className="gx-4 gy-3 mb-3" xs={1} sm={2} xl={2}>
                    <Col>
                        <Card className="shadow-sm px-3 py-1 panel">
                            <Card.Body as={Row} className="justify-content-between py-3" sm={2} xs={2}>
                                <Col className="px-0" xl={10} sm={8}>
                                    <Card.Title className="px-0 col fw-bold" style={{fontSize:'1.2rem'}}>
                                        {data.receita_bruta_estimada_total}
                                    </Card.Title>
                                    <h3 className="px-0 mb-0" style={{fontSize:'0.75rem'}}>Receita Bruta estimada {new Date().getFullYear()}</h3>
                                </Col>
                                <Col xl={2} sm='auto' xs='auto' className="d-flex align-items-center">
                                    <FontAwesomeIcon icon={faSackDollar} className="fs-3"/>
                                </Col>
                            </Card.Body>
                        </Card>  
                    </Col>
                    <Col>
                        <Card className="shadow-sm px-3 py-1 panel">
                            <Card.Body as={Row} className="justify-content-between py-3" sm={2} xs={2}>
                                <Col className="px-0" xl={10} sm={8}>
                                    <Card.Title className="px-0 col fw-bold" style={{fontSize:'1.2rem'}}>
                                        {data.previsao_impostos_total}
                                    </Card.Title>
                                    <h3 className="px-0 mb-0" style={{fontSize:'0.75rem'}}>Previsão impostos {new Date().getFullYear()}</h3>
                                </Col>
                                <Col xl={2} sm='auto' xs='auto' className="d-flex align-items-center">
                                    <FontAwesomeIcon icon={faArrowTrendDown} className="fs-3"/>
                                </Col>
                            </Card.Body>
                        </Card>  
                    </Col>
                    <Col>
                        <Card className="shadow-sm px-3 py-1 panel">
                            <Card.Body as={Row} className="justify-content-between py-3" sm={2} xs={2}>
                                <Col className="px-0" xl={10} sm={9}>
                                    <Card.Title className="px-0 col fw-bold" style={{fontSize:'1.2rem'}}>{data.margem_liquida}</Card.Title>
                                    <h3 className="px-0 mb-0" style={{fontSize:'0.75rem'}}>Margem Líquida Provisionada {new Date().getFullYear()}</h3>
                                </Col>
                                <Col xl={2} sm='auto' xs='auto' className="d-flex align-items-center">
                                    <FontAwesomeIcon icon={faMoneyBillTrendUp} className="fs-3"/>
                                </Col>
                            </Card.Body>
                        </Card>  
                    </Col>
                    <Col>
                        <Card className="shadow-sm px-3 py-1 panel">
                            <Card.Body as={Row} className="justify-content-between py-3" sm={2} xs={2}>
                                <Col className="px-0" xl={10} sm={9}>
                                    <Card.Title className="px-0 col fw-bold" style={{fontSize:'1.2rem'}}>{data.margem_bruta}</Card.Title>
                                    <h3 className="px-0 mb-0" style={{fontSize:'0.75rem'}}>Margem Bruta Provisionada {new Date().getFullYear()}</h3>
                                </Col>
                                <Col xl={2} sm='auto' xs='auto' className="d-flex align-items-center">
                                    <FontAwesomeIcon icon={faMoneyBillTrendUp} className="fs-3"/>
                                </Col>
                            </Card.Body>
                        </Card>  
                    </Col>
                </Row>
            </Col>
        </Row> 
        </>    
        : <div className="text-center"><Spinner></Spinner></div>} 
        </>
    )
}

export default DREProvisionado;
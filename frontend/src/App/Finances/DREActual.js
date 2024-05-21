import React, {useState, useEffect} from "react";
import { Card, Row, Col, Form, Spinner, Accordion} from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useAppContext } from "../../Main";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilterCircleDollar, faMoneyBillTrendUp, faSackDollar, faArrowTrendDown } 
from "@fortawesome/free-solid-svg-icons";
import { HandleSearch } from "../../helpers/Data";

const DREConsolidado = () =>{
    const {config: {theme}} = useAppContext();
    const [formData, setFormData] = useState();
    const [modal, setModal] = useState({show:false, mes:null, ano:null})
    const navigate = useNavigate();
    const [data, setData] = useState()
    const user = JSON.parse(localStorage.getItem("user"))

    const setter = (responsedata) => {
        setData(responsedata)
    }

    useEffect(()=>{
        if ((user.permissions && user.permissions.indexOf("ver_dre_provisionado") === -1) && !user.is_superuser){
            navigate("/error/403")
        }
        if (!data){
            HandleSearch('', 'finances/dre/actual', setter)
        }
        setFormData({mes:new Date().getMonth()+1, ano:new Date().getFullYear()})
    }, [])

    if (formData && (formData.ano)){
        if(!data){
            const params = `?year=${formData.ano}`
            HandleSearch('', 'finances/dre/actual', setter, params)
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
            <li className="breadcrumb-item fw-bold" aria-current="page">
                DRE Consolidado
            </li>    
        </ol>
        <Form className='row mb-2'>
            <Form.Group className="mb-1" as={Col} xl={2} sm={4}>
                <Form.Select name='ano' onChange={handleFieldChange} value={formData ? formData.ano : ''}>
                    {data && data.anos.map(ano =>(
                        <option key={ano} value={ano}>{ano}</option>
                    ))}
                </Form.Select>
            </Form.Group>
        </Form>
        {data ? 
        <>
        <Row xs={1} sm={1} xl={2} className="gx-4 gy-3 d-flex"> 
            <Col>
                <Accordion defaultActiveKey={['0']}>
                    <Accordion.Item eventKey="0" className="disabled">
                        <Accordion.Header>
                            <div className="d-flex justify-content-between mx-auto px-3" style={{width:'100%', fontSize: '0.88rem'}}>
                                <Col className="fw-bold fs--1" xl={8}>
                                    (=) Saldo Inicial em 01/01/{formData && formData.ano}
                                </Col>
                                <Col className={`fw-bold text-end fs--1 text-${data.saldo_inicial_ano > 0 ? 'success' : 'danger'}`} xl={4}>
                                    {data.saldo_inicial_ano}
                                </Col>
                            </div>
                        </Accordion.Header>
                    </Accordion.Item>
                    <Accordion.Item eventKey="1">
                        <Accordion.Header className="p-0">
                            <div className="d-flex justify-content-between mx-auto px-3" style={{width:'100%', fontSize: '0.88rem'}}>
                                <Col className="fw-bold fs--1" xl={8}>
                                    (-) Retirada de Sócios e Comissões 
                                    <span className="ms-1 text-secondary fw-normal fs--2">(Referente a {formData && formData.ano-1})</span>
                                </Col>
                                <Col className={`fw-bold text-end fs--1 text-danger`} xl={4}>
                                    {data.total_retiradas_comissoes}
                                </Col>
                            </div>            
                        </Accordion.Header>
                        <Accordion.Body className="ps-2 py-0">
                            <div className="d-flex justify-content-between mx-auto text-800" style={{width:'87%', fontSize: '0.88rem'}}>
                                <Col className="fw-bold" xl={8}>Retiradas de Sócios</Col>
                                <Col xl='auto' className="fw-bold text-end">{data.retiradas_socios}</Col>
                            </div>
                            <div className="d-flex justify-content-between mx-auto text-800" style={{width:'87%', fontSize: '0.88rem'}}>
                                <Col className="fw-bold" xl={8}>Pagamento Comissões</Col>
                                <Col xl='auto' className="fw-bold text-end">{data.pagamento_comissao}</Col>
                            </div>
                        </Accordion.Body>
                    </Accordion.Item>
                    <Accordion.Item eventKey="0" className="disabled">
                        <Accordion.Header>
                            <div className="d-flex justify-content-between mx-auto px-3" style={{width:'100%', fontSize: '0.88rem'}}>
                                <Col className="fw-bold fs--1" xl={8}>
                                    (-)	Investimentos <span className="text-secondary fw-normal fs--2">(Ativos Imobilizados)</span>
                                </Col>
                                <Col className={`fw-bold text-end fs--1 text-danger`} xl={4}>
                                    {data.ativos_imobilizados}
                                </Col>
                            </div>
                        </Accordion.Header>
                    </Accordion.Item>
                    <Accordion.Item eventKey="0" className="disabled">
                        <Accordion.Header>
                            <div className="d-flex justify-content-between mx-auto px-3" style={{width:'100%', fontSize: '0.88rem'}}>
                                <Col className="fw-bold fs--1" xl={8}>
                                    (-)	Outros Acertos <span className="text-secondary fw-normal fs--2">(Acertos realizados com o Lucro Líquido)</span>
                                </Col>
                                <Col className={`fw-bold text-end fs--1 text-danger`} xl={4}>
                                    {data.outros_acertos}
                                </Col>
                            </div>
                        </Accordion.Header>
                    </Accordion.Item>
                    <Accordion.Item eventKey="0" className="disabled">
                        <Accordion.Header>
                            <div className="d-flex justify-content-between mx-auto px-3" style={{width:'100%', fontSize: '0.88rem'}}>
                                <Col className="fw-bold fs--1" xl={8}>
                                    (=) Saldo Remanescente
                                </Col>
                                <Col className={`fw-bold text-end fs--1 text-${data.saldo_inicio_exercicio > 0 ? 'success' : 'danger'}`} 
                                    xl={4}
                                >
                                    {data.saldo_inicio_exercicio}
                                </Col>
                            </div>
                        </Accordion.Header>
                    </Accordion.Item>
                    <Accordion.Item eventKey="2">
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
                                <Col xl='auto' className="fw-bold text-end">{data.faturado_gc}
                                    <span className="fw-normal ms-1">({data.percentual_faturado_gc})</span>
                                </Col>
                            </div>
                            <div className="d-flex justify-content-between mx-auto text-800" style={{width:'87%', fontSize: '0.88rem'}}>
                                <Col className="fw-bold" xl={8}>Gestão Ambiental e Irrigação</Col>
                                <Col xl='auto' className="fw-bold text-end">{data.faturado_gai}
                                    <span className="fw-normal ms-1">({data.percentual_faturado_gai})</span>
                                </Col>
                            </div>
                            <div className="d-flex justify-content-between mx-auto text-800" style={{width:'87%', fontSize: '0.88rem'}}>
                                <Col className="fw-bold" xl={8}>Avaliação de Imóvel</Col>
                                <Col xl='auto' className="fw-bold text-end">{data.faturado_avaliacao}
                                    <span className="fw-normal ms-1">({data.percentual_faturado_avaliacao})</span>
                                </Col>
                            </div>
                            <div className="d-flex justify-content-between mx-auto text-800" style={{width:'87%', fontSize: '0.88rem'}}>
                                <Col className="fw-bold" xl={8}>Tecnologia e Inovação</Col>
                                <Col xl='auto' className="fw-bold text-end">{data.faturado_tecnologia}
                                    <span className="fw-normal ms-1">({data.percentual_faturado_avaliacao})</span>
                                </Col>
                            </div>
                        </Accordion.Body>
                    </Accordion.Item>
                    <Accordion.Item eventKey="3">
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
                                <Col xl='auto' className="fw-bold text-end">{data.total_iss}
                                    <span className="fw-normal ms-1">({data.percentual_iss})</span>
                                </Col>
                            </div>
                            <div className="d-flex justify-content-between mx-auto text-800" style={{width:'87%', fontSize: '0.88rem'}}>
                                <Col className="fw-bold" xl={8}>PIS</Col>
                                <Col xl='auto' className="fw-bold text-end">{data.total_pis}
                                    <span className="fw-normal ms-1">({data.percentual_pis})</span>
                                </Col>
                            </div>
                            <div className="d-flex justify-content-between mx-auto text-800" style={{width:'87%', fontSize: '0.88rem'}}>
                                <Col className="fw-bold" xl={8}>COFINS</Col>
                                <Col xl='auto' className="fw-bold text-end">{data.total_cofins}
                                    <span className="fw-normal ms-1">({data.percentual_cofins})</span>
                                </Col>
                            </div>
                        </Accordion.Body>
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
                                    (=) Lucro Bruto
                                </Col>
                                <Col className={`fw-bold text-end fs--1 text-${data.lucro_bruto > 0 ? 'success' : 'danger'}`} xl={4}>
                                    {data.lucro_bruto}
                                </Col>
                            </div>
                        </Accordion.Header>
                    </Accordion.Item>
                    <Accordion.Item eventKey="4">
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
                                    (=) Lucro Operacional
                                </Col>
                                <Col className={`fw-bold text-end fs--1 text-${data.lucro_operacional > 0 ? 'success' : 'danger'}`} xl={4}>
                                    {data.lucro_operacional}
                                </Col>
                            </div>
                        </Accordion.Header>
                    </Accordion.Item>
                    <Accordion.Item eventKey="5">
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
                    <Accordion.Item eventKey="6">
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
                                <Col xl='auto' className="fw-bold text-end">{data.total_csll}
                                    <span className="fw-normal ms-1">({data.percentual_csll})</span>
                                </Col>
                            </div>
                            <div className="d-flex justify-content-between mx-auto text-800" style={{width:'87%', fontSize: '0.88rem'}}>
                                <Col className="fw-bold" xl={8}>IRPJ</Col>
                                <Col xl='auto' className="fw-bold text-end">{data.total_irpj}
                                    <span className="fw-normal ms-1">({data.percentual_irpj})</span>
                                </Col>
                            </div>
                        </Accordion.Body>
                    </Accordion.Item>
                    <Accordion.Item eventKey="0" className="disabled">
                        <Accordion.Header>
                            <div className="d-flex justify-content-between mx-auto px-3" style={{width:'100%', fontSize: '0.88rem'}}>
                                <Col className="fw-bold fs--1 text-primary" xl={8}>
                                    (=) Lucro Líquido {formData && formData.ano}
                                </Col>
                                <Col className={`fw-bold text-end fs--1 text-${data.lucro_liquido > 0 ? 'success' : 'danger'}`} xl={4}>
                                    {data.lucro_liquido}
                                </Col>
                            </div>
                        </Accordion.Header>
                    </Accordion.Item>
                    <Accordion.Item eventKey="0" className="disabled">
                        <Accordion.Header>
                            <div className="d-flex justify-content-between mx-auto px-3" style={{width:'100%', fontSize: '0.88rem'}}>
                                <Col className="fw-bold fs--1" xl={8}>
                                    (=) Saldo Final {formData && formData.ano}
                                </Col>
                                <Col className={`fw-bold text-end fs--1 text-${data.saldo_atual > 0 ? 'success' : 'danger'}`} xl={4}>
                                    {data.saldo_atual}
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
                                <Col className="px-0" xl={9} sm={8}>
                                    <Card.Title className="px-0 col fw-bold" style={{fontSize:'1.2rem'}}>{data.margem_liquida}</Card.Title>
                                    <h3 className="px-0 mb-0" style={{fontSize:'0.75rem'}}>Margem Líquida {formData && formData.ano}</h3>
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
                                <Col className="px-0" xl={9} sm={8}>
                                    <Card.Title className="px-0 col fw-bold" style={{fontSize:'1.2rem'}}>{data.margem_bruta}</Card.Title>
                                    <h3 className="px-0 mb-0" style={{fontSize:'0.75rem'}}>Margem Bruta {formData && formData.ano}</h3>
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
                                <Col className="px-0" xl={10} sm={8}>
                                    <Card.Title className="px-0 col fw-bold" style={{fontSize:'1.2rem'}}>
                                        {data.faturamento_tributado}<span className="fw-normal ms-1">({data.percentual_fatu_tributado})</span>
                                    </Card.Title>
                                    <h3 className="px-0 mb-0" style={{fontSize:'0.75rem'}}>Faturamento Tributado {formData && formData.ano}</h3>
                                </Col>
                                <Col xl={2} sm='auto' xs='auto' className="d-flex align-items-center">
                                    <FontAwesomeIcon icon={faFilterCircleDollar} className="fs-3"/>
                                </Col>
                            </Card.Body>
                        </Card>  
                    </Col>
                    <Col>
                        <Card className="shadow-sm px-3 py-1 panel">
                            <Card.Body as={Row} className="justify-content-between py-3" sm={2} xs={2}>
                                <Col className="px-0" xl={10} sm={8}>
                                    <Card.Title className="px-0 col fw-bold" style={{fontSize:'1.2rem'}}>
                                        {data.faturamento_sem_tributacao}<span className="fw-normal ms-1">({data.percentual_fatu_sem_tributacao})</span>
                                    </Card.Title>
                                    <h3 className="px-0 mb-0" style={{fontSize:'0.75rem'}}>Faturamento sem tributação {formData && formData.ano}</h3>
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
                                        {data.percentual_impostos_tributado}<span className="fw-normal ms-1">({data.total_impostos})</span>
                                    </Card.Title>
                                    <h3 className="px-0 mb-0" style={{fontSize:'0.75rem'}}>Imposto sobre faturamento tributado {formData && formData.ano}</h3>
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
                                <Col className="px-0" xl={10} sm={8}>
                                    <Card.Title className="px-0 col fw-bold" style={{fontSize:'1.2rem'}}>
                                        {data.percentual_impostos_total}<span className="fw-normal ms-1">({data.total_impostos})</span>
                                    </Card.Title>
                                    <h3 className="px-0 mb-0" style={{fontSize:'0.75rem'}}>Imposto sobre faturamento total {formData && formData.ano}</h3>
                                </Col>
                                <Col xl={2} sm='auto' xs='auto' className="d-flex align-items-center">
                                    <FontAwesomeIcon icon={faArrowTrendDown} className="fs-3"/>
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

export default DREConsolidado;
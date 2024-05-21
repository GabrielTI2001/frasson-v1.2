import React, {useState, useEffect} from "react";
import { Card, Row, Col, Table, Spinner, Modal, CloseButton} from "react-bootstrap";
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

const DashRevenues = () =>{
    const {config: {theme}} = useAppContext();
    const [modal, setModal] = useState({show:false, mes:null, ano:null})
    const navigate = useNavigate();
    const [data, setData] = useState()
    const user = JSON.parse(localStorage.getItem("user"))

    const setter = (responsedata) => {
        setData(responsedata)
        setData({...responsedata,
            categorias:{
                'Teste': 10,
                'Teste2': 15
            },

        })
    }

    useEffect(()=>{
        if ((user.permissions && user.permissions.indexOf("view_cobrancas_pipefy") === -1) && !user.is_superuser){
            navigate("/error/403")
        }
        if (!data){
            HandleSearch('', 'dashboard/finances/revenues', setter)
        }
    }, [])

    return (
        <>
        <ol className="breadcrumb breadcrumb-alt fs-xs mb-3">
            <li className="breadcrumb-item fw-bold" aria-current="page">
                Dashboard Cobranças
            </li>    
        </ol>
        {data ? <>
        <h6 className="fs--2 fw-bold mb-1">Cobranças abertas</h6>
        <h6 className="fs-0 fw-bold mb-2">{ data.aberto_total }</h6>
        <Row className="gx-4 gy-4 mb-4" xs={1} sm={2} xl={4}>
            <Col>
                <Card className="shadow-sm p-3 panel cursor-pointer" style={{borderLeft: '4px solid #4c78dd'}}
                    onClick={() => setModal({show:true})}
                >
                    <Card.Body as={Row} className="justify-content-between py-1">
                        <Card.Title className="px-0 col text-primary" style={{fontSize:'0.75rem'}}>Aguardando Distribuição</Card.Title>
                        <Card.Title className={`px-0 col-auto text-dark`} style={{fontSize:'0.75rem'}}>
                            {data.percentual_aguardando} %
                        </Card.Title>
                        <h3 className={`px-0 mb-0 fs--1 `}>{ data.total_aguardando_distribuicao }</h3>
                    </Card.Body>
                </Card>  
            </Col>
            <Col>
                <Card className="shadow-sm p-3 panel cursor-pointer" style={{borderLeft: '4px solid #4c78dd'}}
                    onClick={() => setModal({show:true})}
                >
                    <Card.Body as={Row} className="justify-content-between py-1">
                        <Card.Title className="px-0 col text-primary" style={{fontSize:'0.75rem'}}>Notificação</Card.Title>
                        <Card.Title className={`px-0 col-auto text-dark`} style={{fontSize:'0.75rem'}}>
                            {data.percentual_notificacao} %
                        </Card.Title>
                        <h3 className={`px-0 mb-0 fs--1 `}>{ data.total_notificacao }</h3>
                    </Card.Body>
                </Card>  
            </Col>
            <Col>
                <Card className="shadow-sm p-3 panel cursor-pointer" style={{borderLeft: '4px solid #4c78dd'}}
                    onClick={() => setModal({show:true})}
                >
                    <Card.Body as={Row} className="justify-content-between py-1">
                        <Card.Title className="px-0 col text-primary" style={{fontSize:'0.75rem'}}>Faturamento</Card.Title>
                        <Card.Title className={`px-0 col-auto text-dark`} style={{fontSize:'0.75rem'}}>
                            {data.percentual_faturamento} %
                        </Card.Title>
                        <h3 className={`px-0 mb-0 fs--1 `}>{ data.total_faturamento }</h3>
                    </Card.Body>
                </Card>  
            </Col>
            <Col>
                <Card className="shadow-sm p-3 panel cursor-pointer" style={{borderLeft: '4px solid #4c78dd'}}
                    onClick={() => setModal({show:true})}
                >
                    <Card.Body as={Row} className="justify-content-between py-1">
                        <Card.Title className="px-0 col text-primary" style={{fontSize:'0.75rem'}}>Confirmação</Card.Title>
                        <Card.Title className={`px-0 col-auto text-dark`} style={{fontSize:'0.75rem'}}>
                            {data.percentual_confirmacao} %
                        </Card.Title>
                        <h3 className={`px-0 mb-0 fs--1 `}>{ data.total_confirmacao }</h3>
                    </Card.Body>
                </Card>  
            </Col>
        </Row> 
        <h6 class="fs--2 fw-bold mb-2">Cobranças abertas Por Produto</h6>
        <Row className="gx-4 gy-4 mb-4" xs={1} sm={2} xl={4}>
            <Col>
                <Card className="shadow-sm p-3 panel cursor-pointer" style={{borderLeft: '4px solid rgb(234, 88, 12)'}}
                    onClick={() => setModal({show:true})}
                >
                    <Card.Body as={Row} className="justify-content-between py-1">
                        <Card.Title className="px-0 col text-primary" style={{fontSize:'0.75rem'}}>GESTÃO DE CRÉDITO </Card.Title>
                        <Card.Title className={`px-0 col-auto text-dark`} style={{fontSize:'0.75rem'}}>
                            {data.percentual_aberto_gc} %
                        </Card.Title>
                        <h3 className={`px-0 mb-0 fs--1 `}>{ data.aberto_gc }</h3>
                    </Card.Body>
                </Card>  
            </Col>
            <Col>
                <Card className="shadow-sm p-3 panel cursor-pointer" style={{borderLeft: '4px solid rgb(101, 163, 13)'}}
                    onClick={() => setModal({show:true})}
                >
                    <Card.Body as={Row} className="justify-content-between py-1">
                        <Card.Title className="px-0 col text-primary" style={{fontSize:'0.75rem'}}>GESTÃO AMBIENTAL E IRRIGAÇÃO</Card.Title>
                        <Card.Title className={`px-0 col-auto text-dark`} style={{fontSize:'0.75rem'}}>
                            {data.percentual_aberto_gai} %
                        </Card.Title>
                        <h3 className={`px-0 mb-0 fs--1 `}>{ data.aberto_gai }</h3>
                    </Card.Body>
                </Card>  
            </Col>
            <Col>
                <Card className="shadow-sm p-3 panel cursor-pointer" style={{borderLeft: '4px solid rgb(71, 85, 105)'}}
                    onClick={() => setModal({show:true})}
                >
                    <Card.Body as={Row} className="justify-content-between py-1">
                        <Card.Title className="px-0 col text-primary" style={{fontSize:'0.75rem'}}>AVALIAÇÃO DE IMÓVEIS</Card.Title>
                        <Card.Title className={`px-0 col-auto text-dark`} style={{fontSize:'0.75rem'}}>
                            {data.percentual_aberto_avaliacao} %
                        </Card.Title>
                        <h3 className={`px-0 mb-0 fs--1 `}>{ data.aberto_avaliacao }</h3>
                    </Card.Body>
                </Card>  
            </Col>
            <Col>
                <Card className="shadow-sm p-3 panel cursor-pointer" style={{borderLeft: '4px solid rgb(71, 85, 105)'}}
                    onClick={() => setModal({show:true})}
                >
                    <Card.Body as={Row} className="justify-content-between py-1">
                        <Card.Title className="px-0 col text-primary" style={{fontSize:'0.75rem'}}>TECNOLOGIA E INOVAÇÃO</Card.Title>
                        <Card.Title className={`px-0 col-auto text-dark`} style={{fontSize:'0.75rem'}}>
                            {data.percentual_aberto_tecnologia} %
                        </Card.Title>
                        <h3 className={`px-0 mb-0 fs--1 `}>{ data.aberto_tecnologia }</h3>
                    </Card.Body>
                </Card>  
            </Col>
        </Row> 
        <hr></hr>
        <h6 class="fs--2 fw-bold mb-2">Faturamento Consolidado {new Date().getFullYear()}</h6>
        <h6 className="fs-0 fw-bold mb-2">{ data.faturado_total }</h6>
        <Row className="gx-4 gy-4 mb-4" xs={1} sm={2} xl={4}>
            <Col>
                <Card className="shadow-sm p-3 panel cursor-pointer" style={{borderLeft: '4px solid rgb(234, 88, 12)'}}
                    onClick={() => setModal({show:true})}
                >
                    <Card.Body as={Row} className="justify-content-between py-1">
                        <Card.Title className="px-0 col text-primary" style={{fontSize:'0.75rem'}}>GESTÃO DE CRÉDITO </Card.Title>
                        <Card.Title className={`px-0 col-auto text-dark`} style={{fontSize:'0.75rem'}}>
                            {data.percentual_faturado_gc} %
                        </Card.Title>
                        <h3 className={`px-0 mb-0 fs--1 `}>{ data.faturado_gc }</h3>
                    </Card.Body>
                </Card>  
            </Col>
            <Col>
                <Card className="shadow-sm p-3 panel cursor-pointer" style={{borderLeft: '4px solid rgb(101, 163, 13)'}}
                    onClick={() => setModal({show:true})}
                >
                    <Card.Body as={Row} className="justify-content-between py-1">
                        <Card.Title className="px-0 col text-primary" style={{fontSize:'0.75rem'}}>GESTÃO AMBIENTAL E IRRIGAÇÃO</Card.Title>
                        <Card.Title className={`px-0 col-auto text-dark`} style={{fontSize:'0.75rem'}}>
                            {data.percentual_faturado_gai} %
                        </Card.Title>
                        <h3 className={`px-0 mb-0 fs--1 `}>{ data.faturado_gai }</h3>
                    </Card.Body>
                </Card>  
            </Col>
            <Col>
                <Card className="shadow-sm p-3 panel cursor-pointer" style={{borderLeft: '4px solid rgb(71, 85, 105)'}}
                    onClick={() => setModal({show:true})}
                >
                    <Card.Body as={Row} className="justify-content-between py-1">
                        <Card.Title className="px-0 col text-primary" style={{fontSize:'0.75rem'}}>AVALIAÇÃO DE IMÓVEIS</Card.Title>
                        <Card.Title className={`px-0 col-auto text-dark`} style={{fontSize:'0.75rem'}}>
                            {data.percentual_faturado_avaliacao} %
                        </Card.Title>
                        <h3 className={`px-0 mb-0 fs--1 `}>{ data.faturado_avaliacao }</h3>
                    </Card.Body>
                </Card>  
            </Col>
            <Col>
                <Card className="shadow-sm p-3 panel cursor-pointer" style={{borderLeft: '4px solid rgb(71, 85, 105)'}}
                    onClick={() => setModal({show:true})}
                >
                    <Card.Body as={Row} className="justify-content-between py-1">
                        <Card.Title className="px-0 col text-primary" style={{fontSize:'0.75rem'}}>TECNOLOGIA E INOVAÇÃO</Card.Title>
                        <Card.Title className={`px-0 col-auto text-dark`} style={{fontSize:'0.75rem'}}>
                            {data.percentual_faturado_tecnologia} %
                        </Card.Title>
                        <h3 className={`px-0 mb-0 fs--1 `}>{ data.faturado_tecnologia }</h3>
                    </Card.Body>
                </Card>  
            </Col>
        </Row>
        <h6 class="fs--2 fw-bold mb-2">Previsão de Faturamento {new Date().getFullYear()}</h6>
        <h6 className="fs-2 fw-bold mb-2">{ data.previsao_faturamento_anual }</h6>
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
                Cobranças
            </Modal.Title>
                <CloseButton onClick={() => setModal({show:false})}/>
            </Modal.Header>
            <Modal.Body>
                {/* <IndexCredit mes={modal.mes} ano={modal.ano} /> */}
            </Modal.Body>
        </Modal>
        </>
        
    )
}

export default DashRevenues;
import React, {useState, useEffect} from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card, Row, Col, Placeholder} from "react-bootstrap";
import { useAppContext } from "../../../Main";
import { BarChart, ColumnChart } from "../../../components/Custom/Charts";
import { HandleSearch } from "../../../helpers/Data";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleNotch, faLeaf, faArrowAltCircleRight, faMapLocationDot, faDroplet, faClock, faStopwatch, faHourglassHalf } 
from "@fortawesome/free-solid-svg-icons";

const meses = [
    {'number': 1, 'name': 'JAN', 'description':'JANEIRO'}, {'number': 2, 'name': 'FEV', 'description':'FEVEREIRO'}, 
    {'number': 3, 'name': 'MAR', 'description':'MARÇO'}, {'number': 4, 'name': 'ABR', 'description':'ABRIL'},
    {'number': 5, 'name': 'MAI', 'description':'MAIO'}, {'number': 6, 'name': 'JUN', 'description':'JUNHO'}, 
    {'number': 7, 'name': 'JUL', 'description':'JULHO'}, {'number': 8, 'name': 'AGO', 'description':'AGOSTO'},
    {'number': 9, 'name': 'SET', 'description':'SETEMBRO'}, {'number': 10, 'name': 'OUT', 'description':'OUTUBRO'}, 
    {'number': 11, 'name': 'NOV', 'description':'NOVEMBRO'}, {'number': 12, 'name': 'DEZ', 'description':'DEZEMBRO'}
];

const DashAmbiental = () =>{
    const {config: {theme}} = useAppContext();
    const [data, setData] = useState()
    const user = JSON.parse(localStorage.getItem("user"))
    const navigate = useNavigate()

    const setter = (data) => {
        setData(data)
    }

    useEffect(()=>{
        if ((user.permissions && user.permissions.indexOf("ver_menu_ambiental") === -1) && !user.is_superuser){
            navigate("/error/403")
        }
        if (!data){
            HandleSearch('','dashboard/ambiental', setter)
        }
    }, [])

    return (
        <>
        <ol className="breadcrumb breadcrumb-alt fs-xs mb-2">
            <li className="breadcrumb-item fw-bold" aria-current="page">
            Dashboard Gestão Ambiental e Irrigação
            </li>    
        </ol>
        {data ? <>
        <Row className="d-flex flex-row gx-4 gy-4 mb-4" xs={1} sm={2} xl={2}>
            <Col className="d-flex">
                <Card className="shadow-sm px-0 pt-1 pb-0 panel w-100">
                    <Card.Body as={Row} className="justify-content-between pt-3 pb-0 px-3 gy-2">
                        <Col className="px-3 pb-3">
                            <Card.Title className="px-0 col fw-bold" style={{fontSize:'1rem'}}>{data.qtd_processos}</Card.Title>
                            <h3 className="px-0 fw-normal mb-0 text-secondary" style={{fontSize:'0.75rem'}}>Processos Gestão Ambiental</h3>
                        </Col>
                        <Col xl='auto' className="d-flex align-items-center">
                            <FontAwesomeIcon icon={faLeaf} className="fs-2 text-success-emphasis"/>
                        </Col>
                        <Link as={Col} xl={12} className="d-flex align-items-between rounded-1 mb-0 py-2 px-3 bg-100 cursor-pointer" 
                            to={'/pipefy/pipes/301573538'}
                        >
                            <span className="col text-primary fw-semibold">Ver Processos</span>
                            <FontAwesomeIcon icon={faArrowAltCircleRight} className="fs--1 px-1 col-auto opacity-25"/>
                        </Link>
                    </Card.Body>
                </Card>  
            </Col>
            <Col className="d-flex">
                <Card className="shadow-sm px-0 pt-1 pb-0 panel w-100">
                    <Card.Body as={Row} className="justify-content-between pt-3 pb-0 px-3 gy-2">
                        <Col className="px-3 pb-3">
                            <Card.Title className="px-0 col fw-bold" style={{fontSize:'1rem'}}>{data.qtd_appo}</Card.Title>
                            <h3 className="px-0 fw-normal mb-0 text-secondary" style={{fontSize:'0.75rem'}}>Poços mapeados</h3>
                        </Col>
                        <Col xl='auto' className="d-flex align-items-center">
                            <FontAwesomeIcon icon={faMapLocationDot} className="fs-2"/>
                        </Col>
                        <Link as={Col} xl={12} className="d-flex align-items-between rounded-1 mb-0 py-2 px-3 bg-100 cursor-pointer" 
                            to={'/ambiental/inema/appos'}
                        >
                            <span className="col text-primary fw-semibold">Ver Processos</span>
                            <FontAwesomeIcon icon={faArrowAltCircleRight} className="fs--1 px-1 col-auto opacity-25"/>
                        </Link>
                    </Card.Body>
                </Card>  
            </Col>
            <Col className="d-flex">
                <Card className="shadow-sm px-0 pt-1 pb-0 panel w-100">
                    <Card.Body as={Row} className="justify-content-between pt-3 pb-0 px-3 gy-2">
                        <Col className="px-3 pb-3">
                            <Card.Title className="px-0 col fw-bold" style={{fontSize:'1rem'}}>{data.qtd_outorgas}</Card.Title>
                            <h3 className="px-0 fw-normal mb-0 text-secondary" style={{fontSize:'0.75rem'}}>Pontos de outorga mapeados</h3>
                        </Col>
                        <Col xl='auto' className="d-flex align-items-center">
                            <FontAwesomeIcon icon={faDroplet} className="fs-2 text-primary"/>
                        </Col>
                        <Link as={Col} xl={12} className="d-flex align-items-between rounded-1 mb-0 py-2 px-3 bg-100 cursor-pointer" 
                            to={'/ambiental/inema/outorgas'}
                        >
                            <span className="col text-primary fw-semibold">Ver Processos</span>
                            <FontAwesomeIcon icon={faArrowAltCircleRight} className="fs--1 px-1 col-auto opacity-25"/>
                        </Link>
                    </Card.Body>
                </Card>  
            </Col>
            <Col className="d-flex">
                <Card className="shadow-sm px-0 pt-1 pb-0 panel w-100">
                    <Card.Body as={Row} className="justify-content-between pt-3 pb-0 px-3 gy-2">
                        <Col className="px-3 pb-3">
                            <Card.Title className="px-0 col fw-bold" style={{fontSize:'1rem'}}>{data.qtd_pivots}</Card.Title>
                            <h3 className="px-0 fw-normal mb-0 text-secondary" style={{fontSize:'0.75rem'}}>Pivots mapeados</h3>
                        </Col>
                        <Col xl='auto' className="d-flex align-items-center">
                            <FontAwesomeIcon icon={faCircleNotch} className="fs-2 text-danger"/>
                        </Col>
                        <Link as={Col} xl={12} className="d-flex align-items-between rounded-1 mb-0 py-2 px-3 bg-100 cursor-pointer" 
                            to={'/irrigation/pivots'}
                        >
                            <span className="col text-primary fw-semibold">Ver Processos</span>
                            <FontAwesomeIcon icon={faArrowAltCircleRight} className="fs--1 px-1 col-auto opacity-25"/>
                        </Link>
                    </Card.Body>
                </Card>  
            </Col>
            <Col className="d-flex">
                <Card className="shadow-sm px-3 py-1 panel w-100">
                    <Card.Body as={Row} className="justify-content-between py-3 gy-2">
                        <Col className="px-0">
                            <Card.Title className="px-0 col fw-bold" style={{fontSize:'1rem'}}>{data.tempo_dias_requerimento}</Card.Title>
                            <h3 className="px-0 mb-0 fw-normal text-secondary" style={{fontSize:'0.75rem'}}>
                                Tempo médio para abertura do requerimento após aberto no Pipefy
                            </h3>
                        </Col>
                        <Col xl='auto' className="d-flex align-items-center px-0">
                            <FontAwesomeIcon icon={faClock} className="fs-2 text-info-emphasis"/>
                        </Col>
                    </Card.Body>
                </Card>  
            </Col>
            <Col className="d-flex">
                <Card className="shadow-sm px-3 py-1 panel w-100">
                    <Card.Body as={Row} className="justify-content-between py-3 gy-2">
                        <Col className="px-0">
                            <Card.Title className="px-0 col fw-bold" style={{fontSize:'1rem'}}>{data.tempo_dias_formacao}</Card.Title>
                            <h3 className="px-0 mb-0 fw-normal text-secondary" style={{fontSize:'0.75rem'}}>
                                Tempo médio para formação do processo após aberto o requerimento
                            </h3>
                        </Col>
                        <Col xl='auto' className="d-flex align-items-center px-0">
                            <FontAwesomeIcon icon={faStopwatch} className="fs-2"/>
                        </Col>
                    </Card.Body>
                </Card>  
            </Col>
            <Col className="d-flex">
                <Card className="shadow-sm px-3 py-1 panel w-100">
                    <Card.Body as={Row} className="justify-content-between py-3 gy-2">
                        <Col className="px-0">
                            <Card.Title className="px-0 col fw-bold" style={{fontSize:'1rem'}}>{data.tempo_dias_formacao}</Card.Title>
                            <h3 className="px-0 mb-0 fw-normal text-secondary" style={{fontSize:'0.75rem'}}>
                                Tempo médio para formação do processo após aberto no Pipefy
                            </h3>
                        </Col>
                        <Col xl='auto' className="d-flex align-items-center px-0">
                            <FontAwesomeIcon icon={faHourglassHalf} className="fs-2 text-warning"/>
                        </Col>
                    </Card.Body>
                </Card>  
            </Col>
        </Row>
        <Row xs={1} sm={3} xl={3} className="gx-4 gy-2 d-flex mb-2"> 
            {data.processos && Object.keys(data.processos).length > 0 &&
                <Col>
                    <Card as={Col} className="p-3">
                        <BarChart
                            columns={Object.keys(data.processos)} 
                            title={`Processos por Instituição`}
                            height={'205vh'}
                            series = {[
                                {
                                    name: '',
                                    data: Object.values(data.processos),
                                    type:'bar'
                                }
                            ]}
                            hidescale
                        />
                    </Card>
                </Col>
            }
            {data.faturamentos && Object.keys(data.faturamentos).length > 0 &&
                <Col>
                    <Card as={Col} className="p-3">
                        <BarChart
                            columns={Object.keys(data.faturamentos)} 
                            title={`Faturamento Estimado por Fase - GC`}
                            height={'205vh'}
                            series = {[
                                {
                                    name: '',
                                    data: Object.values(data.faturamentos),
                                    type:'bar'
                                }
                            ]}
                            hidescale
                        />
                    </Card>
                </Col>
            }
            {data.abertos && data.abertos_last &&
                <Col>
                    <Card as={Col} className="p-3">
                        <ColumnChart type='column' 
                            columns={meses.map(m => m.name)} 
                            title={`Operações de Crédito ${new Date().getFullYear()} X ${new Date().getFullYear()-1}`}
                            height={'205vh'}
                            series = {[
                                {
                                    name: `${new Date().getFullYear()}`,
                                    data: data.abertos.map(v => v),
                                    type:'bar'
                                },
                                {
                                    name: `${new Date().getFullYear()-1}`,
                                    data: data.abertos_last.map(v => v),
                                    type:'bar'
                                }
                            ]}
                        />
                    </Card>
                </Col>
            }
        </Row> 
        </>    
        : 
        <div>
            <Placeholder animation="glow">
                <Placeholder xs={7} /> <Placeholder xs={4} /> 
                <Placeholder xs={4} />
                <Placeholder xs={6} /> <Placeholder xs={8} />
            </Placeholder>    
        </div>   
        } 
        </>
        
    )
}

export default DashAmbiental;
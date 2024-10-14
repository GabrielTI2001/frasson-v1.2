import React, {useState, useEffect} from "react";
import { Card, Row, Col, Modal, CloseButton, Placeholder} from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useAppContext } from "../../../Main";
import { BarChart, ColumnChart, PieChart } from "../../../components/Custom/Charts";
import { HandleSearch } from "../../../helpers/Data";
import CustomBreadcrumb from "../../../components/Custom/Commom";

const meses = [
    {'number': 1, 'name': 'JAN', 'description':'JANEIRO'}, {'number': 2, 'name': 'FEV', 'description':'FEVEREIRO'}, 
    {'number': 3, 'name': 'MAR', 'description':'MARÇO'}, {'number': 4, 'name': 'ABR', 'description':'ABRIL'},
    {'number': 5, 'name': 'MAI', 'description':'MAIO'}, {'number': 6, 'name': 'JUN', 'description':'JUNHO'}, 
    {'number': 7, 'name': 'JUL', 'description':'JULHO'}, {'number': 8, 'name': 'AGO', 'description':'AGOSTO'},
    {'number': 9, 'name': 'SET', 'description':'SETEMBRO'}, {'number': 10, 'name': 'OUT', 'description':'OUTUBRO'}, 
    {'number': 11, 'name': 'NOV', 'description':'NOVEMBRO'}, {'number': 12, 'name': 'DEZ', 'description':'DEZEMBRO'}
];

const DashGestaoCredito = () =>{
    const [modal, setModal] = useState({show:false, fase:null})
    const {config: {theme}} = useAppContext();
    const [data, setData] = useState()
    const user = JSON.parse(localStorage.getItem("user"))
    const navigate = useNavigate()

    const setter = (responsedata) => {
        setData(responsedata)
    }

    useEffect(()=>{
        if ((user.permissions && user.permissions.indexOf("view_operacoes_contratadas") === -1) && !user.is_superuser){
            navigate("/error/403")
        }
        if (!data){
            HandleSearch('','dashboard/credit-management', setter)
        }
    }, [])

    return (
        <>
        <CustomBreadcrumb>
            <span className="breadcrumb-item fw-bold">
                <Link className="link-fx text-primary" to={'/credit/operations'}>Operações de Crédito</Link>
            </span>
            <span className="breadcrumb-item fw-bold" aria-current="page">
                Em Andamento
            </span>    
        </CustomBreadcrumb>
        {data ? <>
        <Row className="d-flex gx-4 gy-2 mb-4" xs={1} sm={2} xl={2}>
            {data.processos_gc && data.processos_gc.length > 0 &&
                <Col>
                    <Card as={Col} className="p-3">
                        <BarChart
                            columns={data.processos_gc.map(p => p.phase_name)} 
                            title={`Operações de Crédito em Andamento (${data.total_operacoes_em_aberto})`}
                            height={'250vh'}
                            series = {[
                                {
                                    name: '',
                                    data: data.processos_gc.map(p => p.total),
                                    type:'bar'
                                }
                            ]}
                        />
                        <div>
                        {data.processos_gc.map(p => 
                            <span key={p.phase_name} 
                                className={`badge ${theme == 'dark' ? 'text-white' : 'text-dark'} bg-info-subtle me-2 cursor-pointer`}
                                onClick={() => setModal({show:true, fase:p.phase_name})}
                            >
                                {p.phase_name}
                            </span>
                        )}
                        </div>
                    </Card>
                </Col>
            }
            {data.cards_last_year && !data.cards_last_year.null &&
                <Col>
                    <Card as={Col} className="p-3">
                        <ColumnChart type='column' 
                            columns={meses.map(m => m.name)} 
                            title={`Operações de Crédito Abertas Por Mês`}
                            height={'270vh'}
                            series = {[
                                {
                                    name: `${new Date().getFullYear()}`,
                                    data: data.cards_current_year.map(p => Object.values(p)[0]),
                                    type:'bar'
                                },
                                {
                                    name: `${new Date().getFullYear()-1}`,
                                    data: data.cards_last_year.map(p => Object.values(p)[0]),
                                    type:'bar'
                                }
                            ]}
                        />
                    </Card>
                </Col>
            }
        </Row>
        <Row xs={1} sm={3} xl={3} className="gx-4 gy-2 d-flex"> 
            {data.produtos && !data.produtos.null &&
                <Col>
                    <Card as={Col} className="p-3">
                        <PieChart 
                            type='pie' 
                            labels={data.produtos.map(p => Object.keys(p)[0])} 
                            title={`Processos em Andamento por Produto`}
                            height={'250vh'}
                            name=''
                            values={data.produtos.map(p => Object.values(p)[0])}
                        />
                    </Card>
                </Col>
            }
            {data.total_beneficiarios && data.total_beneficiarios.length > 0 &&
                <Col>
                    <Card as={Col} className="p-3">
                        <BarChart
                            columns={data.total_beneficiarios.map(p => Object.keys(p)[0])} 
                            title={`Top 10 Beneficiários`}
                            height={'205vh'}
                            series = {[
                                {
                                    name: '',
                                    data: data.total_beneficiarios.map(p => Object.values(p)[0]),
                                    type:'bar'
                                }
                            ]}
                            hidescale
                        />
                    </Card>
                </Col>
            }
            {data.total_bancos && data.total_bancos.length > 0 &&
                <Col>
                    <Card as={Col} className="p-3">
                        <BarChart
                            columns={data.total_bancos.map(p => Object.keys(p)[0])} 
                            title={`Total Por Instituição Financeira`}
                            height={'205vh'}
                            series = {[
                                {
                                    name: '',
                                    data: data.total_bancos.map(p => Object.values(p)[0]),
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
        : 
        <div>
            <Placeholder animation="glow">
                <Placeholder xs={7} /> <Placeholder xs={4} /> 
                <Placeholder xs={4} />
                <Placeholder xs={6} /> <Placeholder xs={8} />
            </Placeholder>    
        </div>   
        } 
        <Modal
            size="xl"
            show={modal.show}
            onHide={() => setModal({show:false})}
            dialogClassName="mt-1"
            aria-labelledby="example-modal-sizes-title-lg"
        >
            <Modal.Header>
            <Modal.Title id="example-modal-sizes-title-lg" style={{fontSize: '16px'}}>
                Produtos Nesta Fase
            </Modal.Title>
                <CloseButton onClick={() => setModal({show:false})}/>
            </Modal.Header>
            <Modal.Body>
                <></>
            </Modal.Body>
        </Modal>
        </>
        
    )
}

export default DashGestaoCredito;
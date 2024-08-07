import React, {useState, useEffect} from "react";
import { useNavigate } from "react-router-dom";
import { Card, Row, Col, Spinner} from "react-bootstrap";
import { useAppContext } from "../../../Main";
import { BarChart, PieChart } from "../../../components/Custom/Charts";
import { HandleSearch } from "../../../helpers/Data";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilter, faFilterCircleDollar, faPercent } from "@fortawesome/free-solid-svg-icons";
import { CardProduto } from "./Card";
import CustomBreadcrumb from "../../../components/Custom/Commom";

const DashProspects = () =>{
    const {config: {theme}} = useAppContext();
    const [data, setData] = useState()
    const user = JSON.parse(localStorage.getItem("user"))
    const navigate = useNavigate()

    const setter = (data) => {
        setData(data)
        // setData({...data,   
        // produtos: [
        //     {
        //       "produto": "Produto A",
        //       "total": 1
        //     },
        //     {
        //         "produto": "Produto B",
        //         "total": 5
        //     }
        //   ]
        // })
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
        <CustomBreadcrumb>
            <span className="breadcrumb-item fw-bold" aria-current="page">
                Dashboard Prospects
            </span>    
        </CustomBreadcrumb>
        {data ? <>
        <Row className="gx-4 gy-2 mb-4" xs={1} sm={2} xl={4}>
            <CardProduto title='Prospects em Andamento' icon={faFilter} data={data} atribute='qtd_prospects'/>
            <CardProduto title='Prospects em proposta de valor' icon={faFilter} data={data} atribute='qtd_proposta_valor'/>
            <CardProduto title='Proposta de valor GAI (Total)' icon={faFilterCircleDollar} data={data} atribute='valor_proposta_valor'/>
            <CardProduto title='Proposta de valor GC (% médio)' icon={faPercent} data={data} atribute='media_proposta_valor'/>
        </Row>
        <Row xs={1} sm={3} xl={3} className="gx-4 gy-2 d-flex"> 
            {data.produtos &&
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
            {data.classificacao && 
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
            {data && data.fases &&
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
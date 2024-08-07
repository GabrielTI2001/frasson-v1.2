import React, {useState, useEffect} from "react";
import { Row, Col, Spinner, Accordion} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { faMoneyBillTrendUp, faSackDollar, faArrowTrendDown } 
from "@fortawesome/free-solid-svg-icons";
import { HandleSearch } from "../../helpers/Data";
import { ItemTable } from "./AcordionItem";
import { CardDRE } from "./Card";
import CustomBreadcrumb from "../../components/Custom/Commom";

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
        <CustomBreadcrumb >
            <span className="breadcrumb-item fw-bold" aria-current="page">
                DRE Provisionado
            </span>    
        </CustomBreadcrumb>
        {data ? 
        <>
        <Row xs={1} sm={1} xl={2} className="gx-4 gy-3 d-flex"> 
            <Col>
                <Accordion defaultActiveKey={['0']}>
                    <ItemTable data={data} title={`(+) Receita Sobre Serviços`} colorvalue='success' colortitle='primary' eventkey="1"
                        atribute='faturado_total'
                        items={[
                            {title:'Gestão de Crédito', attrtotal:'faturado_gc'},
                            {title:'Gestão Ambiental e Irrigação', attrtotal:'faturado_gai'},
                            {title:'Avaliação de Imóvel', attrtotal:'faturado_avaliacao'},
                            {title:'Tecnologia e Inovação', attrtotal:'faturado_tecnologia'}
                        ]}
                    />
                    <ItemTable data={data} title='(-) Impostos Sobre Serviços (Indiretos)' colorvalue='danger' colortitle='primary' 
                        eventkey="2" atribute='total_impostos_indiretos'
                        items={[
                            {title:'ISS', attrtotal:'total_iss'},
                            {title:'PIS', attrtotal:'total_pis'},
                            {title:'COFINS', attrtotal:'total_cofins'}
                        ]}
                    />
                    <ItemTable data={data} title={`(+) Cobranças Abertas`} colorvalue='success' colortitle='primary' eventkey="3"
                        atribute='aberto_total'
                        items={[
                            {title:'Gestão de Crédito', attrtotal:'aberto_gc'},
                            {title:'Gestão Ambiental e Irrigação', attrtotal:'aberto_gai'},
                            {title:'Avaliação de Imóvel', attrtotal:'aberto_avaliacao'},
                            {title:'Tecnologia e Inovação', attrtotal:'aberto_tecnologia'}
                        ]}
                    />
                    <ItemTable data={data} title={`(+) Receita Provisionada`} colorvalue='success' colortitle='primary' eventkey="4"
                        atribute='receita_provisionada'
                        items={[
                            {title:'Proposta de valor GAI', attrtotal:'total_pv_prospect', attrpercent:'percentual_proposta_valor'},
                            {title:'Operações de crédito em andamento', attrtotal:'faturamento_provisionado_gc'},
                            {title:'Faturamento GAI em andamento', attrtotal:'faturamento_provisionado_gai'},
                        ]}
                    />
                    <ItemTable data={data} title={`(-)	Impostos Sobre Serviços (Estimativa)`} colortitle='primary' colorvalue='danger'
                        atribute='total_previsao_impostos_indiretos' disabled
                    />
                    <ItemTable data={data} title={`(=) Receita Líquida`} colortitle='primary'
                        atribute='receita_liquida' disabled
                    />
                    <ItemTable data={data} title={`(-) Custo Serviço Prestado`} colortitle='primary' colorvalue='danger'
                        atribute='total_custos' disabled
                    />
                    <ItemTable data={data} title={`(-)	Estimativa Custo`} colortitle='primary' colorvalue='danger'
                        atribute='total_custos_estimativa' disabled
                    />
                    <ItemTable data={data} title={`(=) Lucro Bruto`} colortitle='primary'
                        atribute='lucro_bruto' disabled
                    />
                    <ItemTable data={data} title='(-) Despesas`' colorvalue='danger' colortitle='primary' 
                        eventkey="5" atribute='total_despesas'
                        items={[
                            {title:'Operacionais', attrtotal:'despesas_operacionais'},
                            {title:'Não Operacionais', attrtotal:'despesas_nao_operacionais'},
                        ]}
                    />
                    <ItemTable data={data} title={`(-) Estimativa Despesas`} colortitle='primary' colorvalue='danger'
                        atribute='total_despesas_estimativa' disabled subtitle={`Até dezembro ${new Date().getFullYear()}`}
                    />
                    <ItemTable data={data} title={`(=) Lucro Operacional`} colortitle='primary'
                        atribute='lucro_operacional' disabled
                    />
                    <ItemTable data={data} title='(+) Resultado Financeiro`' colortitle='primary' 
                        eventkey="6" atribute='resultado_financeiro'
                        items={[
                            {title:'Receitas em Movimentações Financeiras', attrtotal:'receitas_financeiras'},
                            {title:'Despesas em Movimentações Financeiras', attrtotal:'despesas_financeiras'},
                            {title:'Reembolso Adiantamentos Clientes', attrtotal:'reembolso_clientes'}
                        ]}
                    />
                    <ItemTable data={data} title={`(=) Lucro Antes dos Impostos (EBITDA)`} colortitle='primary'
                        atribute='ebitda' disabled
                    />
                    <ItemTable data={data} title='(-) Impostos Sobre Lucros (Diretos)' colorvalue='danger' colortitle='primary' 
                        eventkey="7" atribute='total_impostos_diretos'
                        items={[
                            {title:'CSLL', attrtotal:'total_csll'},
                            {title:'IRPJ', attrtotal:'total_irpj'}
                        ]}
                    />
                    <ItemTable data={data} title={`(=) Lucro Líquido Provisionado ${new Date().getFullYear()}`} colortitle='900'
                        atribute='lucro_liquido' disabled
                    />
                </Accordion>
            </Col>

            <Col>
                <Row className="gx-4 gy-3 mb-3" xs={1} sm={2} xl={2}>
                    <CardDRE data={data} atribute='receita_bruta_estimada_total'
                        title={`Receita Bruta estimada ${new Date().getFullYear()}`} icon={faSackDollar}
                    />
                    <CardDRE data={data} atribute='previsao_impostos_total'
                        title={`Previsão impostos ${new Date().getFullYear()}`} icon={faArrowTrendDown}
                    />
                    <CardDRE data={data} atribute='margem_liquida'
                        title={`Margem Líquida Provisionada ${new Date().getFullYear()}`} icon={faMoneyBillTrendUp}
                    />
                    <CardDRE data={data} atribute='margem_bruta'
                        title={`Margem Bruta Provisionada ${new Date().getFullYear()}`} icon={faMoneyBillTrendUp}
                    />
                </Row>
            </Col>
        </Row> 
        </>    
        : <div className="text-center"><Spinner></Spinner></div>} 
        </>
    )
}

export default DREProvisionado;
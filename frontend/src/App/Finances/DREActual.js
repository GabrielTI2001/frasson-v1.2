import React, {useState, useEffect} from "react";
import { Row, Col, Form, Spinner, Accordion} from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useAppContext } from "../../Main";
import { faFilterCircleDollar, faMoneyBillTrendUp, faSackDollar, faArrowTrendDown } 
from "@fortawesome/free-solid-svg-icons";
import { HandleSearch } from "../../helpers/Data";
import { ItemTable } from "./AcordionItem";
import { CardDRE } from "./Card";

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
        <Row xs={1} sm={1} xl={2} className="gx-4 gy-3 d-flex mb-4"> 
            <Col>
                <Accordion>
                    <ItemTable data={data} title={`(=) Saldo Inicial em 01/01/${formData && formData.ano}`} colortitle='900'
                        atribute='saldo_inicial_ano' disabled
                    />
                    <ItemTable data={data} title={`(-) Retirada de Sócios e Comissões `} colorvalue='danger' colortitle='900' eventkey="1"
                        atribute='total_retiradas_comissoes' subtitle={`Referente a ${formData && formData.ano-1}`}
                        items={[
                            {title:'Retiradas de Sócios', attrtotal:'retiradas_socios'}, 
                            {title:'Pagamento Comissões', attrtotal:'pagamento_comissao'}
                        ]}
                    />
                    <ItemTable data={data} title={`(-) Investimentos`} colortitle='900' colorvalue='danger'
                        atribute='ativos_imobilizados' disabled subtitle='Ativos Imobilizados'
                    />
                    <ItemTable data={data} title={`(-) Outros Acertos`} colortitle='900' colorvalue='danger'
                        atribute='outros_acertos' disabled subtitle='Acertos realizados com o Lucro Líquido'
                    />
                    <ItemTable data={data} title={`(=) Saldo Remanescente`} colortitle='900'
                        atribute='saldo_inicio_exercicio' disabled
                    />
                    <ItemTable data={data} title={`(+) Receita Sobre Serviços`} colorvalue='success' colortitle='primary' eventkey="2"
                        atribute='faturado_total'
                        items={[
                            {title:'Gestão de Crédito', attrtotal:'faturado_gc', attrpercent:'percentual_faturado_gc'},
                            {title:'Gestão Ambiental e Irrigação', attrtotal:'faturado_gai', attrpercent:'percentual_faturado_gai'},
                            {title:'Avaliação de Imóvel', attrtotal:'faturado_avaliacao', attrpercent:'percentual_faturado_avaliacao'},
                            {title:'Tecnologia e Inovação', attrtotal:'faturado_tecnologia', attrpercent:'percentual_faturado_tecnologia'}
                        ]}
                    />
                    <ItemTable data={data} title='(-) Impostos Sobre Serviços (Indiretos)' colorvalue='danger' colortitle='primary' 
                        eventkey="3" atribute='total_impostos_indiretos'
                        items={[
                            {title:'ISS', attrtotal:'total_iss', attrpercent:'percentual_iss'},
                            {title:'PIS', attrtotal:'total_pis', attrpercent:'percentual_pis'},
                            {title:'COFINS', attrtotal:'total_cofins', attrpercent:'percentual_cofins'}
                        ]}
                    />
                    <ItemTable data={data} title={`(=) Receita Líquida`} colortitle='primary'
                        atribute='receita_liquida' disabled
                    />
                    <ItemTable data={data} title={`(-) Custo Serviço Prestado`} colortitle='primary' colorvalue='danger'
                        atribute='total_custos' disabled
                    />
                    <ItemTable data={data} title={`(=) Lucro Bruto`} colortitle='primary'
                        atribute='lucro_bruto' disabled
                    />
                    <ItemTable data={data} title='(-) Despesas`' colorvalue='danger' colortitle='primary' 
                        eventkey="4" atribute='total_despesas'
                        items={[
                            {title:'Operacionais', attrtotal:'despesas_operacionais'},
                            {title:'Não Operacionais', attrtotal:'despesas_nao_operacionais'},
                        ]}
                    />
                    <ItemTable data={data} title={`(=) Lucro Operacional`} colortitle='primary'
                        atribute='lucro_operacional' disabled
                    />
                    <ItemTable data={data} title='(+) Resultado Financeiro`' colortitle='primary' 
                        eventkey="5" atribute='resultado_financeiro'
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
                        eventkey="6" atribute='total_impostos_diretos'
                        items={[
                            {title:'CSLL', attrtotal:'total_csll', attrpercent:'percentual_csll'},
                            {title:'IRPJ', attrtotal:'total_irpj', attrpercent:'percentual_irpj'}
                        ]}
                    />
                    <ItemTable data={data} title={`(=) Lucro Líquido ${formData && formData.ano}`} colortitle='primary'
                        atribute='lucro_liquido' disabled
                    />
                    <ItemTable data={data} title={`(=) Saldo Final ${formData && formData.ano}`} colortitle='900'
                        atribute='saldo_atual' disabled
                    />
                </Accordion>
            </Col>

            <Col>
                <Row className="gx-4 gy-3 mb-3" xs={1} sm={2} xl={2}>
                    <CardDRE data={data} atribute='margem_liquida' title={`Margem Líquida ${formData && formData.ano}`} 
                        icon={faMoneyBillTrendUp}
                    />
                    <CardDRE data={data} atribute='margem_bruta' title={`Margem Bruta ${formData && formData.ano}`} 
                        icon={faMoneyBillTrendUp}
                    />
                    <CardDRE data={data} atribute='faturamento_tributado' atribute2='percentual_fatu_tributado' 
                        title={`Faturamento Tributado ${formData && formData.ano}`} icon={faFilterCircleDollar}
                    />
                    <CardDRE data={data} atribute='faturamento_sem_tributacao' atribute2='percentual_fatu_sem_tributacao' 
                        title={`Faturamento sem tributação ${formData && formData.ano}`} icon={faSackDollar}
                    />
                    <CardDRE data={data} atribute='percentual_impostos_tributado' atribute2='total_impostos' 
                        title={`Imposto sobre faturamento tributado ${formData && formData.ano}`} icon={faSackDollar}
                    />
                    <CardDRE data={data} atribute='percentual_impostos_total' atribute2='total_impostos' 
                        title={`Imposto sobre faturamento total ${formData && formData.ano}`} icon={faArrowTrendDown}
                    />
                </Row>
            </Col>
        </Row> 
        <div>
            <Link className="btn btn-sm btn-secondary fs--2 me-2 mb-2" to={`/finances/dre/overview/`}>Detalhamento Mensal</Link>
            <Link className="btn btn-sm btn-warning fs--2 mb-2" to={`${process.env.REACT_APP_API_URL}/finances/dre/real/report/?search=${formData.ano || ''}`}>
                Relatório PDF
            </Link>
        </div>
        </>    
        : <div className="text-center"><Spinner></Spinner></div>} 
        </>
        
    )
}

export default DREConsolidado;
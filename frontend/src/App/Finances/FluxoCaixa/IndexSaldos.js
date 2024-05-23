import React, {useState, useEffect} from "react";
import { useNavigate } from "react-router-dom";
import { Card, Row, Col, Spinner, Image} from "react-bootstrap";
import { useAppContext } from "../../../Main";
import { BarChart, PieChart } from "../../../components/Custom/Charts";
import { HandleSearch } from "../../../helpers/Data";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilter, faFilterCircleDollar, faPercent } from "@fortawesome/free-solid-svg-icons";
import logobb from '../../../assets/media/various/bb-bank.png'
import logocaixa from '../../../assets/media/various/caixa-bank.png'
import logosantander from '../../../assets/media/various/santander-bank.png'
import logosicredi from '../../../assets/media/various/sicredi-bank.png'
import logomoney from '../../../assets/media/various/money-bank.png'
import logofrasson from '../../../assets/media/various/frasson-bank.png'
import logobbinv from '../../../assets/media/various/bb-inv-bank.png'
import logoxp from '../../../assets/media/various/xp-bank.png'
import logosicoob from '../../../assets/media/various/sicoob-bank.png'
import {CardCol} from "./CardCol";

const SaldosContasIndex = () =>{
    const {config: {theme}} = useAppContext();
    const [data, setData] = useState()
    const user = JSON.parse(localStorage.getItem("user"))
    const navigate = useNavigate()

    const setter = (data) => {
        setData(data)
    }

    useEffect(()=>{
        if ((user.permissions && user.permissions.indexOf("view_transferencias_contas") === -1) && !user.is_superuser){
            navigate("/error/403")
        }
        if (!data){
            HandleSearch('','finances/accounts', setter)
        }
    }, [])

    return (
        <>
        <ol className="breadcrumb breadcrumb-alt fs-xs mb-2">
            <li className="breadcrumb-item fw-bold" aria-current="page">
                Saldos Bancários
            </li>    
        </ol>
        {data ? <>
        <h6 className="fw-bold mb-1"  style={{fontSize:'0.75rem'}}>Saldo Total</h6>
        <h3 className="px-0 fw-bold mb-2 fs-0">{data.saldo_total}</h3>
        <Row className="gx-4 gy-3 mb-3" xs={1} sm={2} xl={4}>
            <CardCol logo={logobb} title='Banco do Brasil' data={data} atribute='banco_brasil' color='#0d6efd'/>
            <CardCol logo={logocaixa} title='Caixa Econômica Federal' data={data} atribute='caixa_economica' color='#0d6efd'/>
            <CardCol logo={logosantander} title='Santander' data={data} atribute='banco_santander' color='rgb(220, 38, 38)'/>
            <CardCol logo={logosicredi} title='Sicredi' data={data} atribute='banco_sicredi' color='rgb(101, 163, 13)'/>
            <CardCol logo={logomoney} title='Dinheiro/Cheque' data={data} atribute='dinheiro' color='rgb(101, 163, 13)'/>
            <CardCol logo={logofrasson} title='Grupo Frasson' data={data} atribute='grupo_frasson' color='rgb(8, 145, 178)'/>
            <CardCol logo={logobbinv} title='BB Investimentos' data={data} atribute='aplicacao_bb' color='rgb(51, 65, 85)'/>
            <CardCol logo={logoxp} title='XP Investimentos' data={data} atribute='aplicacao_xp' color='rgb(51, 65, 85)'/>
            <CardCol logo={logosicoob} title='Sicoob' data={data} atribute='banco_sicoob' color='rgb(51, 65, 85)'/>
        </Row>
        <Row xs={1} sm={3} xl={3} className="gx-4 gy-2 d-flex"> 
        </Row> 
        </>    
        : <div className="text-center"><Spinner></Spinner></div>} 
        </>
    )
}

export default SaldosContasIndex;
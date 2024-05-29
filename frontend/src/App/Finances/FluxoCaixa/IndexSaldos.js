import React, {useState, useEffect} from "react";
import { useNavigate } from "react-router-dom";
import { Row, Spinner, Modal, CloseButton} from "react-bootstrap";
import { useAppContext } from "../../../Main";
import { HandleSearch } from "../../../helpers/Data";
import logobb from '../../../assets/media/various/bb-bank.png'
import logocaixa from '../../../assets/media/various/caixa-bank.png'
import logosantander from '../../../assets/media/various/santander-bank.png'
import logosicredi from '../../../assets/media/various/sicredi-bank.png'
import logomoney from '../../../assets/media/various/money-bank.png'
import logofrasson from '../../../assets/media/various/frasson-bank.png'
import logobbinv from '../../../assets/media/various/bb-inv-bank.png'
import logoxp from '../../../assets/media/various/xp-bank.png'
import logosicoob from '../../../assets/media/various/sicoob-bank.png'
import {CardCol, SimpleCard} from "./CardCol";
import MovContas from "./MovContas";
import CobrancasPhase from "../Reports/CobrancasPhase";
import ReportPagamentos from "../Reports/Pagamentos";

const SaldosContasIndex = () =>{
    const {config: {theme}} = useAppContext();
    const [data, setData] = useState()
    const user = JSON.parse(localStorage.getItem("user"))
    const navigate = useNavigate()
    const [modal, setModal] = useState({show:false})

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
        <Row className="gx-4 gy-3 mb-4" xs={1} sm={2} xl={4}>
            <CardCol logo={logobb} title='Banco do Brasil' data={data} atribute='banco_brasil' color='#0d6efd' 
                onclick={() => setModal({show:true, id:667993245})}
            />
            <CardCol logo={logocaixa} title='Caixa Econômica Federal' data={data} atribute='caixa_economica' color='#0d6efd'
                onclick={() => setModal({show:true, id:667993332})}
            />
            <CardCol logo={logosantander} title='Santander' data={data} atribute='banco_santander' color='rgb(220, 38, 38)'
                onclick={() => setModal({show:true, id:667993459})}
            />
            <CardCol logo={logosicredi} title='Sicredi' data={data} atribute='banco_sicredi' color='rgb(101, 163, 13)'
                onclick={() => setModal({show:true, id:667994503})}
            />
            <CardCol logo={logomoney} title='Dinheiro/Cheque' data={data} atribute='dinheiro' color='rgb(101, 163, 13)'
                onclick={() => setModal({show:true, id:667994628})}
            />
            <CardCol logo={logofrasson} title='Grupo Frasson' data={data} atribute='grupo_frasson' color='rgb(8, 145, 178)'
                onclick={() => setModal({show:true, id:667994767})}
            />
            <CardCol logo={logobbinv} title='BB Investimentos' data={data} atribute='aplicacao_bb' color='rgb(51, 65, 85)'
                onclick={() => setModal({show:true, id:667994970})}
            />
            <CardCol logo={logoxp} title='XP Investimentos' data={data} atribute='aplicacao_xp' color='rgb(51, 65, 85)'
                onclick={() => setModal({show:true, id:667995029})}
            />
            <CardCol logo={logosicoob} title='Sicoob' data={data} atribute='banco_sicoob' color='rgb(51, 65, 85)'
                onclick={() => setModal({show:true, id:667994860})}
            />
        </Row>
        <h6 className="fw-bold mb-1"  style={{fontSize:'0.75rem'}}>Cobranças em Aberto</h6>
        <h3 className="px-0 fw-bold mb-2 fs-0">{data.total_aberto_cobrancas}</h3>
        <Row xs={1} sm={2} xl={2} className="gx-4 gy-4 d-flex mb-4"> 
            <SimpleCard data={data} title='Aguardando Distribuição' atribute='aberto_aguardando' color='primary' 
                onclick={() => setModal({show:true, phase:317532037})}
            />
            <SimpleCard data={data} title='Notificação' atribute='aberto_notificacao' color='primary'
                onclick={() => setModal({show:true, phase:317532038})}
            />
            <SimpleCard data={data} title='Faturamento' atribute='aberto_faturamento' color='primary'
                onclick={() => setModal({show:true, phase:318663454})}
            />
            <SimpleCard data={data} title='Confirmação' atribute='aberto_confirmacao' color='primary'
                onclick={() => setModal({show:true, phase:317532040})}
            />
        </Row> 
        <h6 className="fw-bold mb-1"  style={{fontSize:'0.75rem'}}>Pagamentos em Aberto</h6>
        <h3 className="px-0 fw-bold mb-2 fs-0">{data.total_aberto_pagamentos}</h3>
        <Row xs={1} sm={2} xl={2} className="gx-4 gy-4 d-flex mb-4"> 
            <SimpleCard data={data} title='Conferência' atribute='aberto_conferencia' color='warning'
                onclick={() => setModal({show:true, payment:true})}
            />
            <SimpleCard data={data} title='Agendado' atribute='aberto_agendado' color='warning'
                onclick={() => setModal({show:true, payment:true})}
            />
        </Row> 
        <h6 className="fw-bold mb-1"  style={{fontSize:'0.75rem'}}>Previsão de Saldo</h6>
        <h3 className="px-0 fw-bold mb-2 fs-1">{data.previsao_saldo}</h3>
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
                {modal.id ? 'Movimentações '+new Date().getFullYear() : modal.phase ? 'Cobranças ' : 'Pagamentos'}
            </Modal.Title>
                <CloseButton onClick={() => setModal({show:false})}/>
            </Modal.Header>
            <Modal.Body>
                {modal.id 
                    ? <MovContas id={modal.id} />
                    : modal.phase ? <CobrancasPhase idphase={modal.phase} /> 
                    : <ReportPagamentos />
                }
            </Modal.Body>
        </Modal>
        </>
    )
}

export default SaldosContasIndex;
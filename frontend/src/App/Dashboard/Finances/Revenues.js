import React, {useState, useEffect} from "react";
import { Card, Row, Col, Spinner, Modal, CloseButton} from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useAppContext } from "../../../Main";
import { HandleSearch } from "../../../helpers/Data";
import { CardCobrancas } from "./CardCol";
import CobrancasPhase from "../../Finances/Reports/CobrancasPhase";
import Invoices from "../../Finances/Reports/Invoices";
import CustomBreadcrumb from "../../../components/Custom/Commom";

const DashRevenues = () =>{
    const {config: {theme}} = useAppContext();
    const [modal, setModal] = useState({show:false, phase:null, produto:null})
    const navigate = useNavigate();
    const [data, setData] = useState()
    const user = JSON.parse(localStorage.getItem("user"))

    const setter = (responsedata) => {
        setData(responsedata)
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
        <CustomBreadcrumb>
            <span className="breadcrumb-item fw-bold" aria-current="page">
                Dashboard Cobranças
            </span>    
        </CustomBreadcrumb>
        {data ? <>
        <h6 className="fs--2 fw-bold mb-1">Cobranças abertas</h6>
        <h6 className="fs-0 fw-bold mb-2">{ data.aberto_total }</h6>
        <Row className="gx-4 gy-4 mb-4" xs={1} sm={2} xl={4}>
            <CardCobrancas data={data} atribute='total_aguardando' atribute2='percentual_aguardando' 
                title='Aguardando Distribuição' color='#4c78dd' onClick={() => setModal({show:true, phase:317532037})}
            />
            <CardCobrancas data={data} atribute='total_notificacao' atribute2='percentual_notificacao' 
                title='Notificação' color='#4c78dd' onClick={() => setModal({show:true, phase:317532038})}
            />
            <CardCobrancas data={data} atribute='total_faturamento' atribute2='percentual_faturamento' 
                title='Faturamento' color='#4c78dd' onClick={() => setModal({show:true, phase:318663454})}
            />
            <CardCobrancas data={data} atribute='total_confirmacao' atribute2='percentual_confirmacao' 
                title='Confirmação' color='#4c78dd' onClick={() => setModal({show:true, phase:317532040})}
            />
        </Row> 
        <h6 className="fs--2 fw-bold mb-2">Cobranças abertas Por Produto</h6>
        <Row className="gx-4 gy-4 mb-4" xs={1} sm={2} xl={4}>
            <CardCobrancas data={data} atribute='aberto_gc' atribute2='percentual_aberto_gc' 
                title='GESTÃO DE CRÉDITO' color='rgb(234, 88, 12)' onClick={() => setModal({show:true, produto:'gc'})}
            />
            <CardCobrancas data={data} atribute='aberto_gai' atribute2='percentual_aberto_gai' 
                title='GESTÃO AMBIENTAL E IRRIGAÇÃO' color='rgb(101, 163, 13)' onClick={() => setModal({show:true, produto:'gai'})}
            />
            <CardCobrancas data={data} atribute='aberto_avaliacao' atribute2='percentual_aberto_avaliacao' 
                title='AVALIAÇÃO DE IMÓVEIS' color='rgb(71, 85, 105)' onClick={() => setModal({show:true, produto:'ava'})}
            />
            <CardCobrancas data={data} atribute='aberto_tecnologia' atribute2='percentual_aberto_tecnologia' 
                title='TECNOLOGIA E INOVAÇÃO' color='rgb(71, 85, 105)' onClick={() => setModal({show:true, produto:'tec'})}
            />
        </Row> 
        <hr></hr>
        <h6 className="fs--2 fw-bold mb-2">Faturamento Consolidado {new Date().getFullYear()}</h6>
        <h6 className="fs-0 fw-bold mb-2">{ data.faturado_total }</h6>
        <Row className="gx-4 gy-4 mb-4" xs={1} sm={2} xl={4}>
            <CardCobrancas data={data} atribute='faturado_gc' atribute2='percentual_faturado_gc' 
                title='GESTÃO DE CRÉDITO' color='rgb(234, 88, 12)' onClick={() => setModal({show:true, invoice:true, produto:'gc'})}
            />
            <CardCobrancas data={data} atribute='faturado_gai' atribute2='percentual_faturado_gai' 
                title='GESTÃO AMBIENTAL E IRRIGAÇÃO' color='rgb(101, 163, 13)' onClick={() => setModal({show:true, invoice:true, produto:'gai'})}
            />
            <CardCobrancas data={data} atribute='faturado_avaliacao' atribute2='percentual_faturado_avaliacao' 
                title='AVALIAÇÃO DE IMÓVEIS' color='rgb(71, 85, 105)' onClick={() => setModal({show:true, invoice:true, produto:'ava'})}
            />
            <CardCobrancas data={data} atribute='faturado_tecnologia' atribute2='percentual_faturado_tecnologia' 
                title='TECNOLOGIA E INOVAÇÃO' color='rgb(71, 85, 105)' onClick={() => setModal({show:true, invoice:true, produto:'tec'})}
            />
        </Row>
        <h6 className="fs--2 fw-bold mb-2">Previsão de Faturamento {new Date().getFullYear()}</h6>
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
                {modal.invoice ? `Faturamento ${new Date().getFullYear()}` : 'Cobranças'}
            </Modal.Title>
                <CloseButton onClick={() => setModal({show:false})}/>
            </Modal.Header>
            <Modal.Body>
                {modal.invoice 
                ? <Invoices produto={modal.produto}/>
                : <CobrancasPhase idphase={modal.phase} produto={modal.produto}/>
                }
                
            </Modal.Body>
        </Modal>
        </>
        
    )
}

export default DashRevenues;
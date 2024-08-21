import { useState, useEffect} from "react";
import React from 'react';
import { Modal, CloseButton, Tabs, Tab} from 'react-bootstrap';
import { useNavigate, useParams } from "react-router-dom";
import { HandleSearch } from "../../../helpers/Data";
import { ModalPagamento } from "./Modal";
import { PagamentoForm } from "./Form";
import CustomBreadcrumb from "../../../components/Custom/Commom";
import { MenuPagamento, TablePagamento } from "./Components";
import { RedirectToLogin } from "../../../Routes/PrivateRoute";

const InitData = {
    'urlapilist':'finances/billings', 
    'urlview':'/finances/billings', 'title': 'Pagamentos'
}

const meses = [
    {'number': 1, 'name': 'JAN', 'description':'JANEIRO'}, {'number': 2, 'name': 'FEV', 'description':'FEVEREIRO'}, 
    {'number': 3, 'name': 'MAR', 'description':'MARÇO'}, {'number': 4, 'name': 'ABR', 'description':'ABRIL'},
    {'number': 5, 'name': 'MAI', 'description':'MAIO'}, {'number': 6, 'name': 'JUN', 'description':'JUNHO'}, 
    {'number': 7, 'name': 'JUL', 'description':'JULHO'}, {'number': 8, 'name': 'AGO', 'description':'AGOSTO'},
    {'number': 9, 'name': 'SET', 'description':'SETEMBRO'}, {'number': 10, 'name': 'OUT', 'description':'OUTUBRO'}, 
    {'number': 11, 'name': 'NOV', 'description':'NOVEMBRO'}, {'number': 12, 'name': 'DEZ', 'description':'DEZEMBRO'}
];


const ReportPagamentos = () => {
    const [anos, setAnos] = useState();
    const [pagamentos, setPagamentos] = useState();
    const [formData, setFormData] = useState({ano:new Date().getFullYear(), mes:new Date().getMonth()+1});
    const user = JSON.parse(localStorage.getItem("user"))
    const navigate = useNavigate();
    const {uuid} = useParams()
    const [modal, setModal] = useState({show:false});
    const [showmodal, setShowModal] = useState(false);

    const setter = (responsedata) => {
        setAnos(responsedata.anos)
        setPagamentos(responsedata.pagamentos)
    }
    const submit = (type, data) => {
        if (type === 'add') setPagamentos([data, ...pagamentos])
        else if (type === 'edit' && pagamentos) setPagamentos([...pagamentos.map(reg => reg.uuid === data.uuid ? data : reg)])
        else if (type === 'delete' && pagamentos) setPagamentos(pagamentos.filter(r => r.uuid !== data))
        setShowModal(false)
    }

    const handleFieldChange = e => {
        setFormData({
          ...formData,
          [e.target.name]: e.target.value
        });
        setPagamentos(null)
    };

    const click = (url) =>{
        navigate('/finances/billings/'+url)
    }
   
    useEffect(()=>{
        if ((user.permissions && user.permissions.indexOf("view_cobrancas_pipefy") === -1) && !user.is_superuser){
            navigate("/error/403")
        }
    },[])
    useEffect(() => {
        const search = async () => {
            if (formData && (formData.ano && formData.mes)){
                if(!pagamentos){
                    const params = `?year=${formData.ano}&month=${formData.mes}`
                    const status = await HandleSearch(formData.search || '', 'finances/billings', setter, params)
                    if (status === 401) RedirectToLogin(navigate)
                }
            }
        }
        if (uuid){
            setModal({show:true})
        }
        else{
            setModal({show:false})
            search()
        }
    },[uuid, formData])

    return (
        <>
        <CustomBreadcrumb>
            <span className="breadcrumb-item fw-bold" aria-current="page">
               {InitData.title}
            </span>  
        </CustomBreadcrumb>
        <Tabs defaultActiveKey="ad" id="uncontrolled-tab-example">
            <Tab eventKey="ad" title="Aguardando Distribuição" className='py-3 px-0'>
                <MenuPagamento handlechange={handleFieldChange} form={formData} setmodal={setShowModal} anos={anos} meses={meses}/>
                <TablePagamento pagamentos={pagamentos} status='AD' click={click}/>
            </Tab>
            <Tab eventKey="ag" title="Agendado" className='py-3 px-0'>
                <MenuPagamento handlechange={handleFieldChange} form={formData} setmodal={setShowModal} anos={anos} meses={meses}/>
                <TablePagamento pagamentos={pagamentos} status='AG' click={click}/>
            </Tab>
            <Tab eventKey="pg" title="Pago" className='py-3 px-0'>
                <MenuPagamento handlechange={handleFieldChange} form={formData} setmodal={setShowModal} anos={anos} meses={meses}/>
                <TablePagamento pagamentos={pagamentos} status='PG' click={click}/>
            </Tab>
        </Tabs>
       
        <ModalPagamento show={modal.show} reducer={submit} />
        <Modal
            size="md"
            show={showmodal.show}
            onHide={() => setShowModal({show:false})}
            aria-labelledby="example-modal-sizes-title-lg"
            scrollable
        >
            <Modal.Header>
                <Modal.Title id="example-modal-sizes-title-lg" style={{fontSize: '16px'}}>
                    {showmodal && showmodal.data ? 'Editar' : 'Adicionar'} Pagamento
                </Modal.Title>
                <CloseButton onClick={() => setShowModal({show:false})}/>
            </Modal.Header>
            <Modal.Body className="pb-0">
                <PagamentoForm type='add' hasLabel submit={submit} />
            </Modal.Body>
        </Modal>
        </>
    );
  };
  
  export default ReportPagamentos;
  
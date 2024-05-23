import { useState, useEffect} from "react";
import React from 'react';
import {Row, Col, Spinner} from 'react-bootstrap';
import { useNavigate } from "react-router-dom";
import AdvanceTable from '../../../components/common/advance-table/AdvanceTable';
import AdvanceTableFooter from '../../../components/common/advance-table/AdvanceTableFooter';
import AdvanceTableSearchBox from '../../../components/common/advance-table/AdvanceTableSearchBox';
import AdvanceTableWrapper from '../../../components/common/advance-table/AdvanceTableWrapper';
import { Link } from "react-router-dom";
import { columnsAutomPayments} from "../Data";
import { HandleSearch } from "../../../helpers/Data";
import { Modal, CloseButton } from "react-bootstrap";
import ModalDelete from "../../../components/Custom/ModalDelete";
import FormAutomPagamento from "./Form";

const InitData = {
    'columns':columnsAutomPayments, 'urlapilist':'finances/automation/payments', 
    'urlview':'/finances/automations/payments/', 'title': 'Automação de Pagamentos'
}

const IndexAutomPagamentos = () => {
    const [searchResults, setSearchResults] = useState();
    const user = JSON.parse(localStorage.getItem("user"))
    const navigate = useNavigate();
    const [showmodal, setShowModal] = useState({show:false, type:'', data:{}})
    const [modalDelete, setModalDelete] = useState({show:false, link:''})

    const onClick = (data, type) =>{
        if (type === 'edit'){
            setShowModal({show:true, type:'edit', data:{...data}})
        }
        else if (type === 'delete'){
            setModalDelete({show:true, link: `${process.env.REACT_APP_API_URL}/finances/automation/payments/${data.uuid}/`})
        }
    }

    const submit = (type, data) => {
        if (type === 'add'){
            setSearchResults([...searchResults, data])
            setShowModal({show:false})
        }
        if (type === 'edit'){
            setSearchResults([...searchResults.map( reg => reg.id === reg.id ? data : reg)])
            setShowModal({show:false})
        }
        if (type === 'delete'){
            setSearchResults(searchResults.filter(reg => reg.uuid !== data))
            setShowModal({show:false})
        }
    }

    useEffect(()=>{
        if ((user.permissions && user.permissions.indexOf("view_lancamentos_automaticos_pagamentos") === -1) && !user.is_superuser){
            navigate("/error/403")
        }
        const getdata = async () =>{
            const status = await HandleSearch('', InitData.urlapilist, setSearchResults)
            if (status === 401) navigate("/auth/login");
        }
        if (!searchResults){
            getdata()
        }
    },[searchResults])

    const handleChange = async (value) => {
        const status = await HandleSearch(value, InitData.urlapilist, setSearchResults)
        if (status === 401) navigate("/auth/login");
        const getdata = async () =>{
            const status = await HandleSearch(value, InitData.urlapilist, setSearchResults)
            if (status === 401) navigate("/auth/login");
        }
        getdata()
    };

    return (
        <>
        <ol className="breadcrumb breadcrumb-alt fs-xs mb-3">
            <li className="breadcrumb-item fw-bold">
                <Link className="link-fx text-primary" to={'/home'}>Home</Link>
            </li>
            <li className="breadcrumb-item fw-bold" aria-current="page">
               {InitData.title}
            </li>  
        </ol>
        {searchResults ? 
        <AdvanceTableWrapper
            columns={InitData.columns}
            data={searchResults}
            sortable
            pagination
            perPage={5}
        >
            <Row className="flex-end-center justify-content-start gy-2 gx-2 mb-3" xs={2} xl={12} sm={8}>
                <Col xl={4} sm={6} xs={12}>
                    <AdvanceTableSearchBox table onSearch={handleChange}/>
                </Col>
                <Col xl={'auto'} sm='auto' xs={'auto'}>
                    <Link className="text-decoration-none btn btn-success shadow-none"
                        style={{padding: '3px 5px', fontSize: '12px'}} onClick={() =>{setShowModal({show:true, type:'add'})}}
                    >Novo Lançamento Automático</Link>
                </Col>
            </Row>     
            <AdvanceTable
                table
                headerClassName="text-nowrap align-middle fs-xs"
                rowClassName='align-middle white-space-nowrap fs-xs'
                tableProps={{
                    bordered: true,
                    striped: false,
                    className: 'fs-xs mb-0 overflow-hidden',
                    showactions: 'true',
                }}
                Click={onClick}
            />
            <div className="mt-3">
                <AdvanceTableFooter
                    rowCount={searchResults.length}
                    table
                    rowInfo
                    navButtons
                    rowsPerPageSelection
                />
            </div>
        </AdvanceTableWrapper> : <div className="text-center"><Spinner></Spinner></div>}
        <Modal
            size="xl"
            show={showmodal.show}
            onHide={() => setShowModal({show:false})}
            dialogClassName="mt-10"
            aria-labelledby="example-modal-sizes-title-lg"
        >
            <Modal.Header>
                <Modal.Title id="example-modal-sizes-title-lg" style={{fontSize: '16px'}}>
                   {showmodal.type === 'add' ? 'Adicionar': 'Editar'} Autom. Pagamento
                </Modal.Title>
                    <CloseButton onClick={() => setShowModal({show:false})}/>
                </Modal.Header>
                <Modal.Body>
                    <Row className="flex-center w-100 sectionform">
                        {showmodal.type === 'add' 
                            ? <FormAutomPagamento hasLabel type='add' submit={submit}/>
                            : <FormAutomPagamento hasLabel type='edit' data={showmodal.data} submit={submit}/>
                        }
                        
                    </Row>
            </Modal.Body>
        </Modal>
        <ModalDelete show={modalDelete.show} link={modalDelete.link} close={() => setModalDelete({show: false, link:''})} update={submit}/>
        </>
    );
  };
  
  export default IndexAutomPagamentos;
  
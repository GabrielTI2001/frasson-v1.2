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
import ModalDelete from "../../../components/Custom/ModalDelete";
import FormAutomPagamento from "./Form";
import { RedirectToLogin } from "../../../Routes/PrivateRoute";
import CustomBreadcrumb, { FloatButton, ModalForm } from "../../../components/Custom/Commom";

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
            setSearchResults([data, ...searchResults])
            setShowModal({show:false})
        }
        if (type === 'edit'){
            setSearchResults([...searchResults.map( reg => reg.id === data.id ? data : reg)])
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
            if (status === 401) RedirectToLogin(navigate);
        }
        if (!searchResults){
            getdata()
        }
    },[searchResults])

    const handleChange = async (value) => {
        const status = await HandleSearch(value, InitData.urlapilist, setSearchResults)
        if (status === 401) RedirectToLogin(navigate);
        const getdata = async () =>{
            const status = await HandleSearch(value, InitData.urlapilist, setSearchResults)
        }
        getdata()
    };

    return (
    <>
        <CustomBreadcrumb>
            <span className="breadcrumb-item fw-bold">
                <Link className="link-fx text-primary" to={'/home'}>Home</Link>
            </span>
            <span className="breadcrumb-item fw-bold" aria-current="page">
               {InitData.title}
            </span>  
        </CustomBreadcrumb>
        {searchResults ? 
            <AdvanceTableWrapper
                columns={InitData.columns}
                data={searchResults}
                sortable
                pagination
                perPage={15}
            >
                <Row className="flex-end-center justify-content-start gy-2 gx-2 mb-3" xs={2} xl={12} sm={8}>
                    <Col xl={4} sm={6} xs={12}>
                        <AdvanceTableSearchBox table onSearch={handleChange}/>
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
            </AdvanceTableWrapper> 
        : <div className="text-center"><Spinner></Spinner></div>}

        <FloatButton title='Novo Lançamento Automático' onClick={() =>{setShowModal({show:true, type:'add'})}}/>
        <ModalForm show={showmodal.show} onClose={() => setShowModal({show:false})} 
            title={showmodal.type === 'add' ? 'Adicionar' : 'Editar'+' Autom. Pagamento'}
        >
            {showmodal.type === 'add' 
                ? <FormAutomPagamento hasLabel type='add' submit={submit}/>
                : <FormAutomPagamento hasLabel type='edit' data={showmodal.data} submit={submit}/>
            }
        </ModalForm>
        <ModalDelete show={modalDelete.show} link={modalDelete.link} close={() => setModalDelete({show: false, link:''})} update={submit}/>
    </>
    );
  };
  
  export default IndexAutomPagamentos;
  
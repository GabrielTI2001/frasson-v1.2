import { useState, useEffect} from "react";
import React from 'react';
import {Row, Col, Spinner} from 'react-bootstrap';
import { useNavigate } from "react-router-dom";
import AdvanceTable from '../../../components/common/advance-table/AdvanceTable';
import AdvanceTableFooter from '../../../components/common/advance-table/AdvanceTableFooter';
import AdvanceTableSearchBox from '../../../components/common/advance-table/AdvanceTableSearchBox';
import AdvanceTableWrapper from '../../../components/common/advance-table/AdvanceTableWrapper';
import { Link } from "react-router-dom";
import { columnsReembolso} from "../Data";
import { HandleSearch } from "../../../helpers/Data";
import { Modal, CloseButton } from "react-bootstrap";
import ModalDelete from "../../../components/Custom/ModalDelete";
import FormReembolso from "./FormRefunds";
import { RedirectToLogin } from "../../../Routes/PrivateRoute";
import CustomBreadcrumb from "../../../components/Custom/Commom";

const InitData = {
    'columns':columnsReembolso, 'urlapilist':'finances/refunds', 
    'urlview':'/finances/refunds/', 'title': 'Reembolsos Clientes'
}

const IndexReembolsos = () => {
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
            setModalDelete({show:true, link: `${process.env.REACT_APP_API_URL}/finances/refunds/${data.id}/`})
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
            setSearchResults(searchResults.filter(reg => reg.id !== parseInt(data)))
            setShowModal({show:false})
        }
    }

    useEffect(()=>{
        if ((user.permissions && user.permissions.indexOf("view_transferencias_contas") === -1) && !user.is_superuser){
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
            if (status === 401) RedirectToLogin(navigate);
        }
        getdata()
    };

    return (
        <>
        <CustomBreadcrumb>
            <span className="breadcrumb-item fw-bold">
                <Link className="link-fx text-primary" to={'/finances/accounts'}>Saldos Bancários</Link>
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
                <Col xl={'auto'} sm='auto' xs={'auto'}>
                    <Link className="text-decoration-none btn btn-success shadow-none"
                        style={{padding: '3px 5px', fontSize: '12px'}} onClick={() =>{setShowModal({show:true, type:'add'})}}
                    >Novo Reembolso</Link>
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
                    index_status: 4
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
            size="md"
            show={showmodal.show}
            onHide={() => setShowModal({show:false})}
            scrollable
            aria-labelledby="example-modal-sizes-title-lg"
        >
            <Modal.Header>
                <Modal.Title id="example-modal-sizes-title-lg" style={{fontSize: '16px'}}>
                   {showmodal.type === 'add' ? 'Adicionar': 'Editar'} Reembolso
                </Modal.Title>
                    <CloseButton onClick={() => setShowModal({show:false})}/>
                </Modal.Header>
                <Modal.Body className="pb-0">
                    <Row className="flex-center sectionform">
                        {showmodal.type === 'add' 
                            ? <FormReembolso hasLabel type='add' submit={submit}/>
                            : <FormReembolso hasLabel type='edit' data={showmodal.data} submit={submit}/>
                        }
                    </Row>
            </Modal.Body>
        </Modal>
        <ModalDelete show={modalDelete.show} link={modalDelete.link} close={() => setModalDelete({show: false, link:''})} update={submit}/>
        </>
    );
  };
  
  export default IndexReembolsos;
  
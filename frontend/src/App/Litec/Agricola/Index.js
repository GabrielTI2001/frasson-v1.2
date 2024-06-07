import { useState, useEffect} from "react";
import React from 'react';
import {Row, Col, Spinner} from 'react-bootstrap';
import { useNavigate, useParams } from "react-router-dom";
import AdvanceTable from '../../../components/common/advance-table/AdvanceTable';
import AdvanceTableFooter from '../../../components/common/advance-table/AdvanceTableFooter';
import AdvanceTableWrapper from '../../../components/common/advance-table/AdvanceTableWrapper';
import { Link } from "react-router-dom";
import { columnsAgricola} from "../Data";
import { GetRecord, HandleSearch } from "../../../helpers/Data";
import { Modal, CloseButton } from "react-bootstrap";
import FormProdAgricola from "./Form";
import EditProdAgricola from "./Edit";

const InitData = {
    'columns':columnsAgricola, 'urlapilist':'litec/agricola', 
    'urlview':'/litec/agricola/', 'title': ''
}

const IndexProdAgricola = () => {
    const [searchResults, setSearchResults] = useState();
    const user = JSON.parse(localStorage.getItem("user"))
    const {id} = useParams()
    const navigate = useNavigate();
    const [showmodal, setShowModal] = useState({show:false})

    const onClick = async (pk, uuid) =>{
        const gleba = await GetRecord(id, 'glebas/coordenadas');
        setShowModal({show:true, data:{gleba:gleba, id:pk}})
    }

    const submit = (type, data) => {
        if (type === 'add'){
            setShowModal({showmodal:false})
            setSearchResults([...searchResults, data])
        }
        if (type === 'edit'){
            setShowModal({showmodal:false})
            setSearchResults(searchResults.map(s => s.id === data.id ? data : s))
        }
        if (type === 'delete'){
            setShowModal({show:false})
            setSearchResults(searchResults.filter(s => s.id !== parseInt(data)))
        }
    }

    useEffect(()=>{
        if ((user.permissions && user.permissions.indexOf("view_producao_agricola") === -1) && !user.is_superuser){
            navigate("/error/403")
        }
        const getdata = async () =>{
            const status = await HandleSearch('', InitData.urlapilist, setSearchResults, `?gleba=${id}`)
            if (status === 401) navigate("/auth/login");
        }
        if (!searchResults){
            getdata()
        }
    },[])

    return (
        <>
        {/* <ol className="breadcrumb breadcrumb-alt fs-xs mb-3">
            <li className="breadcrumb-item fw-bold">
                <Link className="link-fx text-primary" to={'/register'}>Cadastros Gerais</Link>
            </li>
            <li className="breadcrumb-item fw-bold" aria-current="page">
               {InitData.title}
            </li>  
        </ol> */}
        {searchResults ? 
        <AdvanceTableWrapper
            columns={InitData.columns}
            data={searchResults}
            sortable
            pagination
            perPage={5}
        >
            <Row className="flex-end-center justify-content-start gy-2 gx-2 mb-3" xs={2} xl={12} sm={8}>
                <Col xl={'auto'} sm='auto' xs={'auto'}>
                    <Link className="text-decoration-none btn btn-primary shadow-none fs--2"
                        style={{padding: '2px 5px'}} onClick={() =>{setShowModal({show:true})}}
                    >Nova Produção</Link>
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
            dialogClassName={showmodal.data ? 'mt-1' : 'mt-6'}
            aria-labelledby="example-modal-sizes-title-lg"
        >
            <Modal.Header>
                <Modal.Title id="example-modal-sizes-title-lg" style={{fontSize: '16px'}}>
                    Adicionar Produção Agrícola
                </Modal.Title>
                    <CloseButton onClick={() => setShowModal(false)}/>
                </Modal.Header>
                <Modal.Body>
                    <Row className="flex-center sectionform">  
                    {!showmodal.data 
                        ? <FormProdAgricola hasLabel type={showmodal.data ? 'edit' : 'add'} data={showmodal.data} submit={submit}/>
                        : <EditProdAgricola gleba={showmodal.data.gleba} id={showmodal.data.id} submit={submit} />
                    }
                    </Row>
            </Modal.Body>
        </Modal>
        </>
    );
  };
  
  export default IndexProdAgricola;
  
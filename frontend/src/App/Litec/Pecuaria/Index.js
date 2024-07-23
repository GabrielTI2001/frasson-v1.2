import { useState, useEffect} from "react";
import React from 'react';
import {Row, Col, Spinner} from 'react-bootstrap';
import { useNavigate, useParams } from "react-router-dom";
import AdvanceTable from '../../../components/common/advance-table/AdvanceTable';
import AdvanceTableFooter from '../../../components/common/advance-table/AdvanceTableFooter';
import AdvanceTableWrapper from '../../../components/common/advance-table/AdvanceTableWrapper';
import { Link } from "react-router-dom";
import { columnsPecuaria} from "../Data";
import { HandleSearch, GetRecord} from "../../../helpers/Data";
import { Modal, CloseButton } from "react-bootstrap";
import FormProdPecuaria from "./Form";
import EditProdPecuaria from "./Edit";

const InitData = {
    'columns':columnsPecuaria, 'urlapilist':'litec/pecuaria', 
    'urlview':'/litec/pecuaria/', 'title': ''
}

const IndexProdPecuaria= ({gleba}) => {
    const [searchResults, setSearchResults] = useState();
    const user = JSON.parse(localStorage.getItem("user"))
    const {uuid} = useParams()
    const navigate = useNavigate();
    const [showmodal, setShowModal] = useState({show:false})

    const onClick = async (pk, uuid) =>{
        const gleba = await GetRecord(uuid, 'glebas/coordenadas');
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
            const status = await HandleSearch('', InitData.urlapilist, setSearchResults, `?gleba=${uuid}`)
            if (status === 401) navigate("/auth/login");
        }
        if (!searchResults){
            getdata()
        }
    },[])

    return (
        <>
        {searchResults ? 
        <AdvanceTableWrapper
            columns={InitData.columns}
            data={searchResults}
            sortable
            pagination
            perPage={15}
        >
            <Row className="flex-end-center justify-content-start gy-2 gx-2 mb-3 mt-1" xs={2} xl={12} sm={8}>
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
            size="lg"
            show={showmodal.show}
            onHide={() => setShowModal({show:false})}
            aria-labelledby="example-modal-sizes-title-lg"
            centered scrollable
        >
            <Modal.Header>
                <Modal.Title id="example-modal-sizes-title-lg" style={{fontSize: '16px'}}>
                    {!showmodal.data && 'Adicionar'} Produção Pecuária
                </Modal.Title>
                    <CloseButton onClick={() => setShowModal(false)}/>
                </Modal.Header>
                <Modal.Body className="px-3 py-2">
                    {!showmodal.data 
                        ? <FormProdPecuaria hasLabel type={showmodal.data ? 'edit' : 'add'} data={showmodal.data} submit={submit} gleba={gleba.id}/>
                        : <EditProdPecuaria gleba={gleba} id={showmodal.data.id} submit={submit} />
                    }
            </Modal.Body>
        </Modal>
        </>
    );
  };
  
  export default IndexProdPecuaria;
  
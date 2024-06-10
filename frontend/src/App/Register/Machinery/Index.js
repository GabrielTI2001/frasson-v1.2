import { useState, useEffect} from "react";
import React from 'react';
import {Row, Col, Spinner} from 'react-bootstrap';
import { useNavigate } from "react-router-dom";
import AdvanceTable from '../../../components/common/advance-table/AdvanceTable';
import AdvanceTableFooter from '../../../components/common/advance-table/AdvanceTableFooter';
import AdvanceTableSearchBox from '../../../components/common/advance-table/AdvanceTableSearchBox';
import AdvanceTableWrapper from '../../../components/common/advance-table/AdvanceTableWrapper';
import { Link } from "react-router-dom";
import { columnsMachinery} from "../Data";
import MachineryForm from "./Form";
import { Modal, CloseButton } from "react-bootstrap";
import { HandleSearch } from "../../../helpers/Data";

const InitData = {
    'columns':columnsMachinery, 'urlapilist':'register/machinery', 
    'urlview':'/register/machinery/', 'title': 'Máquinas e Equipamentos'
}

const IndexMachinery = () => {
    const [searchResults, setSearchResults] = useState();
    const token = localStorage.getItem("token")
    const user = JSON.parse(localStorage.getItem("user"))
    const navigate = useNavigate();
    const [showmodal, setShowModal] = useState(false)

    const onClick = (id, uuid) =>{
        const url = `${InitData.urlview}${uuid}`
        navigate(url)
    }
    const setter = (data) => {
        setSearchResults(data)
    }
    const handleChange = async (value) => {
        HandleSearch(value, InitData.urlapilist, setter)
    };

    useEffect(()=>{
        if ((user.permissions && user.permissions.indexOf("view_maquinas_equipamentos") === -1) && !user.is_superuser){
            navigate("/error/403")
        }
        const Search = async () => {
            const status = await HandleSearch('', InitData.urlapilist, setter) 
            if (status === 401) navigate("/auth/login");
        }
        if (!searchResults){
            Search()
        }
    },[])

    return (
        <>
        <ol className="breadcrumb breadcrumb-alt fs-xs mb-3">
            <li className="breadcrumb-item fw-bold">
                <Link className="link-fx text-primary" to={'/register'}>Cadastros Gerais</Link>
            </li>
            <li className="breadcrumb-item fw-bold" aria-current="page">
               {InitData.title}
            </li>  
        </ol>
        <Row>
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
                    <a className="text-decoration-none btn btn-primary shadow-none fs--2"
                        style={{padding: '2px 5px'}} onClick={() =>{setShowModal(true)}}
                    >Novo Cadastro</a>
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
        </Row>
        <Modal
            size="xl"
            show={showmodal}
            onHide={() => setShowModal(false)}
            dialogClassName="mt-7"
            aria-labelledby="example-modal-sizes-title-lg"
        >
        <Modal.Header>
        <Modal.Title id="example-modal-sizes-title-lg" style={{fontSize: '16px'}}>
            Adicionar Máquina
        </Modal.Title>
            <CloseButton onClick={() => setShowModal(false)}/>
        </Modal.Header>
        <Modal.Body>
            <Row className="flex-center sectionform">
                <MachineryForm type='add' hasLabel/>
            </Row>
        </Modal.Body>
    </Modal>
        </>
    );
  };
  
  export default IndexMachinery;
  
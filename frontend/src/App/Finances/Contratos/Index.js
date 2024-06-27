import { useState, useEffect} from "react";
import React from 'react';
import {Row, Col, Spinner, Modal, CloseButton} from 'react-bootstrap';
import { useNavigate } from "react-router-dom";
import AdvanceTable from '../../../components/common/advance-table/AdvanceTable';
import AdvanceTableFooter from '../../../components/common/advance-table/AdvanceTableFooter';
import AdvanceTableSearchBox from '../../../components/common/advance-table/AdvanceTableSearchBox';
import AdvanceTableWrapper from '../../../components/common/advance-table/AdvanceTableWrapper';
import { Link } from "react-router-dom";
import { columnsContratos } from "../Data";
import { HandleSearch } from "../../../helpers/Data";
import ContratoForm from "./FormContrato";

const IndexContratos = () => {
    const [searchResults, setSearchResults] = useState();
    const user = JSON.parse(localStorage.getItem("user"))
    const navigate = useNavigate();
    const [modalform, setModalform] = useState({show:false, type:''});

    const onClick = (id, uuid) =>{
        const url = `/finances/contracts/${uuid}`
        navigate(url)
    }
    const setter = (data) => {
        setSearchResults(data)
    }
    const submit = (type, data, id) => {
        if (type === 'add'){
            setSearchResults([...searchResults, data])
        }
        setModalform({show:false})
    }
    const handleChange = async (value) => {
        setSearchResults(null)
        HandleSearch(value, 'finances/contratos-servicos', setter)
    };

    useEffect(()=>{
        const Search = async () => {
            const status = await HandleSearch('', 'finances/contratos-servicos', setter) 
            if (status === 401) navigate("/auth/login");
        }
        if ((user.permissions && user.permissions.indexOf("view_contratos_servicos") === -1) && !user.is_superuser){
            navigate("/error/403")
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
                Contratos Serviços
            </li>  
        </ol>
        
        <AdvanceTableWrapper
            columns={columnsContratos}
            data={searchResults || []}
            sortable
            pagination
            perPage={5}
        >
            <Row className="flex-end-center justify-content-start mb-3">
                <Col xs="auto" sm={6} lg={4}>
                    <AdvanceTableSearchBox table onSearch={handleChange}/>
                </Col>
                <Col xl={'auto'} sm='auto' xs={'auto'}>
                    <Link className="text-decoration-none btn btn-primary shadow-none fs--1"
                        style={{padding: '2px 8px'}} onClick={() =>{setModalform({show:true})}}
                    >Novo Cadastro</Link>
                </Col>
            </Row>
        {searchResults ? <>
        <AdvanceTable
            table
            headerClassName="text-nowrap align-middle fs-xs"
            rowClassName='align-middle white-space-nowrap fs-xs'
            tableProps={{
                bordered: true,
                striped: false,
                className: 'fs-xs mb-0 overflow-hidden',
                index_status: 6
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
        </div></>
        : <div className="text-center"><Spinner></Spinner></div>}
        </AdvanceTableWrapper> 
        <Modal
            size="xl"
            show={modalform.show}
            onHide={() => setModalform({show:false})}
            dialogClassName="mt-7"
            aria-labelledby="example-modal-sizes-title-lg"
        >
            <Modal.Header>
            <Modal.Title id="example-modal-sizes-title-lg" style={{fontSize: '16px'}}>
                {!modalform.data ? 'Adicionar Contrato' : 'Atualizar Contrato'}
            </Modal.Title>
                <CloseButton onClick={() => setModalform({show:false})}/>
            </Modal.Header>
            <Modal.Body>
                <Row className="flex-center sectionform">
                    <ContratoForm type='add' hasLabel submit={submit}/>
                </Row>
            </Modal.Body>
        </Modal>
        </>
    );
  };
  
  export default IndexContratos;
  
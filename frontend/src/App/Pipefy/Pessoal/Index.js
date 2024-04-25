import { useState, useEffect} from "react";
import React from 'react';
import {Row, Col, Spinner} from 'react-bootstrap';
import { useNavigate } from "react-router-dom";
import AdvanceTable from '../../../components/common/advance-table/AdvanceTable';
import AdvanceTableFooter from '../../../components/common/advance-table/AdvanceTableFooter';
import AdvanceTableSearchBox from '../../../components/common/advance-table/AdvanceTableSearchBox';
import AdvanceTableWrapper from '../../../components/common/advance-table/AdvanceTableWrapper';
import { Link } from "react-router-dom";
import { columnsPessoal } from "../Data";
// import OutorgaForm from "../InemaOutorgas/OutorgaForm";
// import APPOForm from "./InemaAppo/APPOForm";
import { Modal, CloseButton } from "react-bootstrap";
const IndexPessoal = () => {
    const [searchResults, setSearchResults] = useState();
    const token = localStorage.getItem("token")
    const navigate = useNavigate();
    const [showmodal, setShowModal] = useState(false)

    const onClick = (id, uuid) =>{
        const url = `/pipefy/pessoal/${uuid}`
        navigate(url)
    }

    useEffect(()=>{
        if (!searchResults){
            handleSearch('') 
        }
    },[])

    const handleSearch = async (search) => {
        const params = search === '' ? '' : `?search=${search}`
        const url = `${process.env.REACT_APP_API_URL}/pipefy/pessoal/${params}`
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
            });
            const data = await response.json();
            if (response.status === 401) {
                localStorage.setItem("login", JSON.stringify(false));
                localStorage.setItem('token', "");
                navigate("/auth/login");
            } else if (response.status === 200) {
                setSearchResults(data)
            }
        } catch (error) {
            console.error('Erro:', error);
        }
      };

    return (
        <>
        <ol className="breadcrumb breadcrumb-alt fs-xs mb-3">
            <li className="breadcrumb-item fw-bold">
                <Link className="link-fx text-primary" to={'/register'}>Cadastros Gerais</Link>
            </li>
            <li className="breadcrumb-item fw-bold" aria-current="page">
                Cadastro Pessoal
            </li>  
        </ol>
        {searchResults ? 
        <AdvanceTableWrapper
            columns={columnsPessoal}
            data={searchResults}
            sortable
            pagination
            perPage={5}
        >
        <Row className="flex-end-center justify-content-start mb-3">
            <Col xs="auto" sm={6} lg={4}>
                <AdvanceTableSearchBox table onSearch={handleSearch}/>
            </Col>
            <Col xs="auto" sm="auto" lg="auto" className="px-1">
                <a className="text-decoration-none btn btn-primary shadow-none fs--1"
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
        <Modal
            size="xl"
            show={showmodal}
            onHide={() => setShowModal(false)}
            dialogClassName="mt-10"
            aria-labelledby="example-modal-sizes-title-lg"
        >
            <Modal.Header>
                <Modal.Title id="example-modal-sizes-title-lg" style={{fontSize: '16px'}}>
                    Adicionar Pessoa
                </Modal.Title>
                    <CloseButton onClick={() => setShowModal(false)}/>
                </Modal.Header>
                <Modal.Body>
                    <Row className="flex-center w-100 sectionform">
                        {/* {type === 'appo' ? <APPOForm hasLabel type='add' /> : <OutorgaForm hasLabel type='add'></OutorgaForm>} */}
                    </Row>
            </Modal.Body>
        </Modal>
        </>
    );
  };
  
  export default IndexPessoal;
  
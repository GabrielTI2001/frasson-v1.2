import { useState, useEffect} from "react";
import React from 'react';
import {Row, Col, Spinner, Modal, CloseButton} from 'react-bootstrap';
import { useNavigate } from "react-router-dom";
import AdvanceTable from '../../../components/common/advance-table/AdvanceTable';
import AdvanceTableFooter from '../../../components/common/advance-table/AdvanceTableFooter';
import AdvanceTableSearchBox from '../../../components/common/advance-table/AdvanceTableSearchBox';
import AdvanceTableWrapper from '../../../components/common/advance-table/AdvanceTableWrapper';
import { Link } from "react-router-dom";
import { columnsPessoal } from "../Data";
import { HandleSearch } from "../../../helpers/Data";
import ModalDelete from "../../../components/Custom/ModalDelete";
import PessoaForm from "./Form";

const IndexPessoal = () => {
    const [searchResults, setSearchResults] = useState();
    const user = JSON.parse(localStorage.getItem("user"))
    const navigate = useNavigate();
    const [showmodal, setShowModal] = useState({show:false})
    const [modalDelete, setModalDelete] = useState({show:false, link:''})

    const onClick = (data, type) =>{
        if ((user.permissions && user.permissions.indexOf("view_cadastro_pessoal") === -1) && !user.is_superuser){
           navigate("/error/403")
        }
        if (type === 'view'){
            const url = `/register/pessoal/${data.uuid}`
            navigate(url)
        }
        else if (type === 'edit'){
            setShowModal({show:true, data:data.uuid})
        }
        else if (type === 'delete'){
            setModalDelete({show:true, link: `${process.env.REACT_APP_API_URL}/register/pessoal/${data.uuid}/`})
        }
    }
    const setter = (data) => {
        setSearchResults(data)
    }
    const handleChange = async (value) => {
        HandleSearch(value, 'register/pessoal', setter)
    };
    const submit = (type, data, id) => {
        if (type === 'add'){
            setSearchResults([...searchResults, data])
        }
        if (type === 'edit'){
            setSearchResults(searchResults.map(r => r.id === parseInt(id) ? data : r))
        }
        if (type === 'delete'){
            setSearchResults(searchResults.filter(r => r.uuid !== data))
        }
        setShowModal({show:false})
        setModalDelete({show:false})
    }

    useEffect(()=>{
        const Search = async () => {
            const status = await HandleSearch('', 'register/pessoal', setter) 
            if (status === 401) navigate("/auth/login");
        }
        if ((user.permissions && user.permissions.indexOf("view_cadastro_pessoal") === -1) && !user.is_superuser){
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
                    <AdvanceTableSearchBox table onSearch={handleChange}/>
                </Col>
                <Col xl={'auto'} sm='auto' xs={'auto'}>
                    <Link className="text-decoration-none btn btn-primary shadow-none fs--2"
                        style={{padding: '2px 5px'}} onClick={() =>{setShowModal({show:true})}}
                    >Novo Cadastro</Link>
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
                showactions:'true',
                showview:'true'
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
            scrollable
            centered
        >
            <Modal.Header>
                <Modal.Title id="example-modal-sizes-title-lg" style={{fontSize: '16px'}}>
                    {showmodal.data ? 'Editar' : 'Adicionar' } Pessoa
                </Modal.Title>
                    <CloseButton onClick={() => setShowModal({show:false})}/>
                </Modal.Header>
                <Modal.Body>
                    <Row className="flex-center sectionform">
                        {showmodal.data
                           ? <PessoaForm type='edit' hasLabel data={showmodal.data} submit={submit}/>
                           : <PessoaForm type='add' hasLabel submit={submit}/>
                        }
                        
                    </Row>
            </Modal.Body>
        </Modal>
        <ModalDelete show={modalDelete.show} link={modalDelete.link} close={() => setModalDelete({show: false, link:''})} update={submit}/>
        </>
    );
  };
  
  export default IndexPessoal;
  
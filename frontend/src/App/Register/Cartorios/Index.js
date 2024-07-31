import { useState, useEffect} from "react";
import React from 'react';
import {Row, Col, Spinner, Modal, CloseButton} from 'react-bootstrap';
import { useNavigate } from "react-router-dom";
import AdvanceTable from '../../../components/common/advance-table/AdvanceTable';
import AdvanceTableFooter from '../../../components/common/advance-table/AdvanceTableFooter';
import AdvanceTableSearchBox from '../../../components/common/advance-table/AdvanceTableSearchBox';
import AdvanceTableWrapper from '../../../components/common/advance-table/AdvanceTableWrapper';
import { Link } from "react-router-dom";
import { columnsCartorio } from "../Data";
import { HandleSearch } from "../../../helpers/Data";
import ModalDelete from "../../../components/Custom/ModalDelete";
import CartorioForm from "./Form";
import { RedirectToLogin } from "../../../Routes/PrivateRoute";

const IndexCartorios = () => {
    const [searchResults, setSearchResults] = useState();
    const user = JSON.parse(localStorage.getItem("user"))
    const navigate = useNavigate();
    const [showmodal, setShowModal] = useState({show:false})
    const [modalDelete, setModalDelete] = useState({show:false, link:''})

    const onClick = (data, type) =>{
        if ((user.permissions && user.permissions.indexOf("view_cartorios_registro") === -1) && !user.is_superuser){
           navigate("/error/403")
        }
        if (type === 'view'){
            const url = `/register/cartorios/${data.uuid}`
            navigate(url)
        }
        else if (type === 'edit'){
            setShowModal({show:true, data:data.uuid})
        }
        else if (type === 'delete'){
            setModalDelete({show:true, link: `${process.env.REACT_APP_API_URL}/register/cartorios/${data.uuid}/`})
        }
    }
    const setter = (data) => {
        setSearchResults(data)
    }
    const handleChange = async (value) => {
        HandleSearch(value, 'register/cartorios', setter)
    };
    const submit = (type, data, id) => {
        if (type === 'add'){
            setSearchResults([data, ...searchResults])
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
            const status = await HandleSearch('', 'register/cartorios', setter) 
            if (status === 401) RedirectToLogin(navigate);
        }
        if ((user.permissions && user.permissions.indexOf("view_cartorios_registro") === -1) && !user.is_superuser){
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
                Cartórios Registro
            </li>  
        </ol>
        {searchResults ? 
        <AdvanceTableWrapper
            columns={columnsCartorio}
            data={searchResults}
            sortable
            pagination
            perPage={15}
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
                    {showmodal.data ? 'Editar' : 'Adicionar' } Cartório
                </Modal.Title>
                    <CloseButton onClick={() => setShowModal({show:false})}/>
                </Modal.Header>
                <Modal.Body className="pb-0">
                    <Row className="flex-center sectionform">
                        {showmodal.data
                           ? <CartorioForm type='edit' hasLabel data={showmodal.data} submit={submit}/>
                           : <CartorioForm type='add' hasLabel submit={submit}/>
                        }
                    </Row>
            </Modal.Body>
        </Modal>
        <ModalDelete show={modalDelete.show} link={modalDelete.link} close={() => setModalDelete({show: false, link:''})} update={submit}/>
        </>
    );
  };
  
  export default IndexCartorios;
  
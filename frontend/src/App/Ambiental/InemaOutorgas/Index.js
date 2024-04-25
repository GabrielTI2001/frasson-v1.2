import { useState, useEffect} from "react";
import React from 'react';
import {Row, Col, Spinner} from 'react-bootstrap';
import { useNavigate } from "react-router-dom";
import AdvanceTable from '../../../components/common/advance-table/AdvanceTable';
import AdvanceTableFooter from '../../../components/common/advance-table/AdvanceTableFooter';
import AdvanceTableSearchBox from '../../../components/common/advance-table/AdvanceTableSearchBox';
import AdvanceTableWrapper from '../../../components/common/advance-table/AdvanceTableWrapper';
import { Link } from "react-router-dom";
import { columnsOutorga } from "../Data";
import OutorgaForm from "./OutorgaForm";
import { Modal, CloseButton } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMapLocation } from "@fortawesome/free-solid-svg-icons";
const IndexOutorgas = () => {
    const [searchResults, setSearchResults] = useState();
    const token = localStorage.getItem("token")
    const user = JSON.parse(localStorage.getItem("user"))
    const navigate = useNavigate();
    const [showmodal, setShowModal] = useState(false)
    const [isloading, setIsLoading] = useState(false)

    const onClick = (id, uuid) =>{
        const url = `/ambiental/inema/outorgas/${uuid}`
        navigate(url)
    }

    useEffect(()=>{
        if ((user.permissions && user.permissions.indexOf("view_processos_outorga") === -1) && !user.is_superuser){
            navigate("/error/403")
        }
        if (!searchResults){
            handleSearch('') 
        }
    },[])


    const handleSearch = async (search) => {
        setIsLoading(true)
        const params = search === '' ? '' : `?search=${search}`
        const url = `${process.env.REACT_APP_API_URL}/environmental/inema/outorgas/${params}`
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
                setIsLoading(false)
            }
        } catch (error) {
            console.error('Erro:', error);
        }
      };

    return (
        <>
        <ol className="breadcrumb breadcrumb-alt fs-xs mb-3">
            <li className="breadcrumb-item fw-bold">
                <Link className="link-fx text-primary" to={'/home'}>Home</Link>
            </li>
            <li className="breadcrumb-item fw-bold" aria-current="page">
                Processos Outorga
            </li>  
        </ol>
        {searchResults ? 
        <AdvanceTableWrapper
            columns={columnsOutorga}
            data={searchResults}
            sortable
            pagination
            perPage={5}
        >
        <Row className="flex-end-center justify-content-start gy-2 gx-2 mb-3" xs={2} xl={12} sm={8}>
            <Col xl={4} sm={6} xs={12}>
                <AdvanceTableSearchBox table onSearch={handleSearch}/>
            </Col>
            <Col xl={'auto'} sm={'auto'} xs={'auto'}>
                <a className="text-decoration-none btn btn-primary shadow-none fs--1"
                    style={{padding: '2px 5px'}} onClick={() =>{setShowModal(true)}}
                >Nova Portaria</a>
            </Col>
            <Col xl={'auto'} sm='auto' xs={'auto'}>
                <Link className="text-decoration-none btn btn-primary shadow-none fs--1"
                style={{padding: '2px 5px'}} to={'../outorga/map'}>
                    <FontAwesomeIcon icon={faMapLocation} className="me-1" />Mapa
                    </Link>
            </Col>
        </Row>
        {isloading ? <div className="text-center"><Spinner></Spinner></div> :
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
        }       

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
                    Adicionar Portaria
                </Modal.Title>
                    <CloseButton onClick={() => setShowModal(false)}/>
                </Modal.Header>
                <Modal.Body>
                    <Row className="flex-center w-100 sectionform">
                       <OutorgaForm hasLabel type='add'></OutorgaForm>
                    </Row>
            </Modal.Body>
        </Modal>
        </>
    );
  };
  
  export default IndexOutorgas;
  
import { useState, useEffect} from "react";
import React from 'react';
import {Row, Col, Spinner} from 'react-bootstrap';
import { useNavigate, useParams } from "react-router-dom";
import AdvanceTable from '../../components/common/advance-table/AdvanceTable';
import AdvanceTableFooter from '../../components/common/advance-table/AdvanceTableFooter';
import AdvanceTableSearchBox from '../../components/common/advance-table/AdvanceTableSearchBox';
import AdvanceTableWrapper from '../../components/common/advance-table/AdvanceTableWrapper';
import { Link } from "react-router-dom";
import { columnsGleba} from "./Data";
import { HandleSearch } from "../../helpers/Data";
import { Modal, CloseButton } from "react-bootstrap";
import GlebaForm from "./Form";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMapLocation } from "@fortawesome/free-solid-svg-icons";
import ModalRecord from "./Modal";
import { RedirectToLogin } from "../../Routes/PrivateRoute";
import CustomBreadcrumb from "../../components/Custom/Commom";

const InitData = {
    'columns':columnsGleba, 'urlapilist':'glebas/index', 
    'urlview':'/glebas/', 'title': 'Glebas'
}

const IndexGlebas = () => {
    const [searchResults, setSearchResults] = useState();
    const user = JSON.parse(localStorage.getItem("user"))
    const navigate = useNavigate();
    const [showmodal, setShowModal] = useState({show:false})
    const [modal, setModal] = useState({show:false, link:''})
    const {uuid} = useParams()

    const onClick = (id, uuid) =>{
        const url = `${InitData.urlview}${uuid}`
        navigate(url)
    }

    const submit = (type, data, id) => {
        if (type === 'add'){
            setShowModal({showmodal:false})
            setSearchResults([data, ...searchResults])
        }
        if (type === 'edit'){
            if (searchResults){
                setSearchResults(searchResults.map(s => s.id === data.id ? data : s))
            }
        }
        if (type === 'delete'){
            setSearchResults(searchResults.filter(s => s.uuid !== data))
        }
    }

    useEffect(()=>{
        if ((user.permissions && user.permissions.indexOf("view_cadastro_glebas") === -1) && !user.is_superuser){
            navigate("/error/403")
        }
    },[])
    useEffect(() => {
        const search = async () => {
            const status = await HandleSearch('', InitData.urlapilist, setSearchResults)
            if (status === 401) RedirectToLogin(navigate);
        }
        if (uuid){
            setModal({show:true})
        }
        else{
            setModal({show:false})
            if (!searchResults){
                search()
            }
        }
    },[uuid])

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
                    <Link className="text-decoration-none btn btn-primary shadow-none fs--2"
                        style={{padding: '2px 5px'}} onClick={() =>{setShowModal({show:true})}}
                    >Nova Gleba</Link>
                </Col>
                <Col xl={'auto'} sm='auto' xs={'auto'}>
                    <Link className="text-decoration-none btn btn-primary shadow-none fs--2"
                    style={{padding: '2px 5px'}} to={'map'}>
                        <FontAwesomeIcon icon={faMapLocation} className="me-1" />Mapa Glebas
                    </Link>
                </Col>
            </Row>     
            <AdvanceTable
                table
                headerClassName="text-nowrap align-middle fs-xs"
                rowClassName='align-middle white-space-nowrap fs-xs'
                tableProps={{
                    bordered: true,
                    striped: false,
                    className: 'fs-xs mb-0 overflow-hidden'
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
        <ModalRecord show={modal.show} reducer={submit}/>
        <Modal
            size="md"
            show={showmodal.show}
            onHide={() => setShowModal({show:false})}
            scrollable
            aria-labelledby="example-modal-sizes-title-lg"
        >
            <Modal.Header>
                <Modal.Title id="example-modal-sizes-title-lg" style={{fontSize: '16px'}}>
                    Adicionar Gleba
                </Modal.Title>
                    <CloseButton onClick={() => setShowModal(false)}/>
                </Modal.Header>
                <Modal.Body className="pb-0">
                    <Row className="flex-center sectionform">
                        <GlebaForm hasLabel type={showmodal.data ? 'edit' : 'add'} data={showmodal.data} submit={submit}/>
                    </Row>
            </Modal.Body>
        </Modal>
        </>
    );
  };
  
  export default IndexGlebas;
  
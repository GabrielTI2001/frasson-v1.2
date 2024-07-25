import { useState, useEffect} from "react";
import React from 'react';
import {Row, Col, Spinner} from 'react-bootstrap';
import { useNavigate, useParams } from "react-router-dom";
import AdvanceTable from '../../../components/common/advance-table/AdvanceTable';
import AdvanceTableFooter from '../../../components/common/advance-table/AdvanceTableFooter';
import AdvanceTableSearchBox from '../../../components/common/advance-table/AdvanceTableSearchBox';
import AdvanceTableWrapper from '../../../components/common/advance-table/AdvanceTableWrapper';
import { Link } from "react-router-dom";
import { columnsBenfeitorias} from "../Data";
import { HandleSearch } from "../../../helpers/Data";
// import OutorgaForm from "./Machinery/OutorgaForm";
import BenfeitoriaForm from "./Form";
import { Modal, CloseButton } from "react-bootstrap";
import ModalDelete from "../../../components/Custom/ModalDelete";
import ModalBenfeitoria from "./Modal";

const InitData = {
    'columns':columnsBenfeitorias, 'urlapilist':'register/farm-assets', 
    'urlview':'/register/farm-assets/', 'title': 'Benfeitorias Fazendas'
}

const IndexBenfeitorias = () => {
    const [searchResults, setSearchResults] = useState();
    const user = JSON.parse(localStorage.getItem("user"))
    const navigate = useNavigate();
    const [showmodal, setShowModal] = useState(false)
    const [modalDelete, setModalDelete] = useState({show:false, link:''})
    const [modal, setModal] = useState({show:false})
    const {uuid} = useParams()

    const onClick = (id, uuid) =>{
        if ((user.permissions && user.permissions.indexOf("view_benfeitorias_fazendas") === -1) && !user.is_superuser){
           navigate("/error/403")
        }
        const url = `${InitData.urlview}${uuid}`
        navigate(url)
    }

    const submit = (type, data, id) => {
        if (type == 'add'){
            setShowModal(false)
        }
        setSearchResults(null)
    }

    useEffect(()=>{
        if ((user.permissions && user.permissions.indexOf("view_benfeitorias_fazendas") === -1) && !user.is_superuser){
            navigate("/error/403")
        }
    },[])
    useEffect(() => {
        const search = async () => {
            const status = await HandleSearch('', InitData.urlapilist, setSearchResults)
            if (status === 401) navigate("/auth/login");
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
        if (status === 401) navigate("/auth/login");
        const getdata = async () =>{
            const status = await HandleSearch(value, InitData.urlapilist, setSearchResults)
            if (status === 401) navigate("/auth/login");
        }
        getdata()
    };

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
                        style={{padding: '2px 5px'}} onClick={() =>{setShowModal(true)}}
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
        <ModalBenfeitoria show={modal.show} reducer={submit}/>
        <Modal
            size="md"
            show={showmodal}
            onHide={() => setShowModal(false)}
            dialogClassName="mt-7"
            aria-labelledby="example-modal-sizes-title-lg"
        >
            <Modal.Header>
                <Modal.Title id="example-modal-sizes-title-lg" style={{fontSize: '16px'}}>
                    Adicionar Benfeitoria
                </Modal.Title>
                <CloseButton onClick={() => setShowModal(false)}/>
            </Modal.Header>
            <Modal.Body className="pb-0">
                <Row className="flex-center sectionform">
                    <BenfeitoriaForm hasLabel type='add' submit={submit}/>
                </Row>
            </Modal.Body>
        </Modal>
        <ModalDelete show={modalDelete.show} link={modalDelete.link} close={() => setModalDelete({show: false, link:''})} update={submit}/>
        </>
    );
  };
  
  export default IndexBenfeitorias;
  
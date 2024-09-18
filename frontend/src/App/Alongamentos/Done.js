import { useState, useEffect} from "react";
import React from 'react';
import {Row, Col, Modal, CloseButton, Placeholder} from 'react-bootstrap';
import { useNavigate, Link, useParams } from "react-router-dom";
import AdvanceTable from '../../components/common/advance-table/AdvanceTable';
import AdvanceTableFooter from '../../components/common/advance-table/AdvanceTableFooter';
import AdvanceTableSearchBox from '../../components/common/advance-table/AdvanceTableSearchBox';
import AdvanceTableWrapper from '../../components/common/advance-table/AdvanceTableWrapper';
import { columnsAlongamento } from "./Data";
import { HandleSearch } from "../../helpers/Data";
import ModalDelete from "../../components/Custom/ModalDelete";
import Edit from "./Edit";
import { RedirectToLogin } from "../../Routes/PrivateRoute";
import CustomBreadcrumb from "../../components/Custom/Commom";

const AlongamentosDone = () => {
    const [searchResults, setSearchResults] = useState();
    const user = JSON.parse(localStorage.getItem("user"))
    const [modalform, setModalForm] = useState({show:false, id:null})
    const [modaldelete, setModalDelete] = useState({show:false, link:null})
    const navigate = useNavigate();
    const {uuid} = useParams()

    const onClick = (id, uuid) =>{
        const url = `/alongamentos/done/${uuid}`
        navigate(url)
    }
    const setter = (data) =>{
        setSearchResults(data)
    }
    const update = (type, data) =>{
        if (type === 'delete'){
            setModalDelete({show:false})
            setSearchResults(searchResults.filter(s => s.id !== parseInt(data)))
        }
        else{
            setSearchResults(searchResults.map(s => s.id === parseInt(data.id) ? data : s))
            setModalForm({show:false})
        }
    }
    const search = (value) =>{
        HandleSearch(value, 'alongamentos/done', setter)
    }

    useEffect(()=>{
        if ((user.permissions && user.permissions.indexOf("view_operacoes_credito") === -1) && !user.is_superuser){
            navigate("/error/403")
        }
    },[])

    useEffect(() => {
        const search = async () => {
            const status = await HandleSearch('', 'alongamentos/done', setter) 
            if (status === 401) RedirectToLogin(navigate);
        }
        if (uuid){
            setModalForm({show:true, uuid:uuid})
        }
        else{
            setModalForm({show:false})
        }
        if (!searchResults){
            search()
        }
    },[uuid])

    return (
        <>
        <CustomBreadcrumb>
            <span className="breadcrumb-item fw-bold">
                <Link className="link-fx text-primary" to={'/alongamentos'}>Alongamentos Custeios Agrícolas</Link>
            </span>
            <span className="breadcrumb-item fw-bold" aria-current="page">Operações Alongadas</span>  
        </CustomBreadcrumb>
        {searchResults ? 
        <AdvanceTableWrapper
            columns={columnsAlongamento}
            data={searchResults}
            sortable
            pagination
            perPage={15}
        >
        <Row className="flex-end-center justify-content-start mb-3">
            <Col xs="auto" sm={6} lg={4}>
                <AdvanceTableSearchBox table onSearch={search}/>
            </Col>
            <Col xs="auto" sm={6} lg={4}>
                <Link className="btn btn-sm btn-info px-2" to={'/credit'}>Operações de Crédito</Link>
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
        </AdvanceTableWrapper> : 
        <div>
            <Placeholder animation="glow">
                <Placeholder xs={7} /> <Placeholder xs={4} /> 
                <Placeholder xs={4} />
                <Placeholder xs={6} /> <Placeholder xs={8} />
            </Placeholder>    
        </div>   
        }
        <Modal
            size="md"
            show={modalform.show}
            aria-labelledby="example-modal-sizes-title-lg"
            scrollable
        >
            <Modal.Header>
            <Modal.Title id="example-modal-sizes-title-lg" style={{fontSize: '16px'}}>
                Editar Alongamento
            </Modal.Title>
                <CloseButton onClick={() => navigate('/alongamentos/done')}/>
            </Modal.Header>
            <Modal.Body className="pb-0">
                <div><Edit update={update} uuid={modalform.uuid}/></div>
            </Modal.Body>
        </Modal>
        <ModalDelete show={modaldelete.show} link={modaldelete.link} close={() => setModalDelete({...modaldelete, show:false})} update={update} />
        </>
    );
  };
  
  export default AlongamentosDone;
  
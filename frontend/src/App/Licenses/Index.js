import { useState, useEffect} from "react";
import React from 'react';
import {Row, Col, Spinner} from 'react-bootstrap';
import { useNavigate, useParams } from "react-router-dom";
import AdvanceTable from '../../components/common/advance-table/AdvanceTable';
import AdvanceTableFooter from '../../components/common/advance-table/AdvanceTableFooter';
import AdvanceTableSearchBox from '../../components/common/advance-table/AdvanceTableSearchBox';
import AdvanceTableWrapper from '../../components/common/advance-table/AdvanceTableWrapper';
import { columnsLicenca } from "./Data";
import { HandleSearch } from "../../helpers/Data";
import FormLicenca from "./Form";
import { Modal, CloseButton } from "react-bootstrap";
import ModalRecord from "./Modal";
import { RedirectToLogin } from "../../Routes/PrivateRoute";
import CustomBreadcrumb from "../../components/Custom/Commom";

const IndexLicenses = () => {
    const [searchResults, setSearchResults] = useState();
    const user = JSON.parse(localStorage.getItem("user"))
    const navigate = useNavigate();
    const [showmodal, setShowModal] = useState(false)
    const [isloading, setIsLoading] = useState(false)
    const [modal, setModal] = useState({show:false, link:''})
    const {uuid} = useParams()

    const onClick = (id, uuid) =>{
        const url = `/licenses/${uuid}`
        navigate(url)
    }
    const submit = (type, data) => {
        if (type === 'add'){
            setShowModal(false)
            setSearchResults([data, ...searchResults])
        }
        else if (type === 'edit' && searchResults){
            setSearchResults([...searchResults.map(reg =>reg.uuid === data.uuid ? data : reg)])
        }
        else if (type === 'delete' && searchResults){
            setSearchResults(searchResults.filter(r => r.uuid !== data))
        }
    }
    const setter = (data) => {
        setSearchResults(data)
        setIsLoading(false)
    }
    const handleChange = async (value) => {
        setIsLoading(true)
        HandleSearch(value, 'licenses/index', setter)
    };

    useEffect(()=>{
        if ((user.permissions && user.permissions.indexOf("view_cadastro_licencas") === -1) && !user.is_superuser){
            navigate("/error/403")
        }
    },[])
    useEffect(() => {
        const Search = async () => {
            const status = await HandleSearch('', 'licenses/index', setter) 
            if (status === 401) RedirectToLogin(navigate);
        }
        if (uuid){
            setModal({show:true})
        }
        else{
            setModal({show:false})
            if (!searchResults){
                Search()
            }
        }
    },[uuid])


    return (
        <>
        <CustomBreadcrumb >
            <span className="breadcrumb-item fw-bold" aria-current="page">
                Cadastro Licenças
            </span>  
        </CustomBreadcrumb>
        {searchResults ? 
        <AdvanceTableWrapper
            columns={columnsLicenca}
            data={searchResults}
            sortable
            pagination
            perPage={15}
        >
        <Row className="flex-end-center justify-content-start gy-2 gx-2 mb-3" xs={2} xl={12} sm={8}>
            <Col xl={4} sm={6} xs={12}>
                <AdvanceTableSearchBox table onSearch={handleChange}/>
            </Col>
            <Col xl={'auto'} sm={'auto'} xs={'auto'}>
                <a className="text-decoration-none btn btn-primary shadow-none fs--2"
                    style={{padding: '2px 5px'}} onClick={() =>{setShowModal(true)}}
                >Nova Licença</a>
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
                    index_status: 7
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
        <ModalRecord show={modal.show} reducer={submit}/>
        <Modal
            size="md"
            show={showmodal}
            onHide={() => setShowModal(false)}
            scrollable
            aria-labelledby="example-modal-sizes-title-lg"
        >
            <Modal.Header>
                <Modal.Title id="example-modal-sizes-title-lg" style={{fontSize: '16px'}}>
                    Adicionar Licença
                </Modal.Title>
                    <CloseButton onClick={() => setShowModal(false)}/>
                </Modal.Header>
                <Modal.Body className="pb-0">
                    <Row className="flex-center sectionform">
                        <FormLicenca hasLabel type='add' submit={submit}/>
                    </Row>
            </Modal.Body>
        </Modal>
        </>
    );
  };
  
  export default IndexLicenses;
  
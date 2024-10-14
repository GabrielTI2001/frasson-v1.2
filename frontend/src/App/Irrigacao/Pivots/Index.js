import { useState, useEffect} from "react";
import React from 'react';
import {Row, Col, Spinner} from 'react-bootstrap';
import { useNavigate, useParams } from "react-router-dom";
import AdvanceTable from '../../../components/common/advance-table/AdvanceTable';
import AdvanceTableFooter from '../../../components/common/advance-table/AdvanceTableFooter';
import AdvanceTableSearchBox from '../../../components/common/advance-table/AdvanceTableSearchBox';
import AdvanceTableWrapper from '../../../components/common/advance-table/AdvanceTableWrapper';
import { Link } from "react-router-dom";
import {columnsPivot} from "../Data"
import PivotForm from "./Form";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMapLocation } from "@fortawesome/free-solid-svg-icons";
import { HandleSearch } from "../../../helpers/Data";
import { RedirectToLogin } from "../../../Routes/PrivateRoute";
import ModalRecord from "./Modal";
import CustomBreadcrumb, { FloatButton, ModalForm } from "../../../components/Custom/Commom";

const IndexPivots = () => {
    const [searchResults, setSearchResults] = useState();
    const user = JSON.parse(localStorage.getItem("user"))
    const navigate = useNavigate();
    const [showmodal, setShowModal] = useState(false)
    const [isloading, setIsLoading] = useState(false)
    const {uuid} = useParams()
    const [modal, setModal] = useState({show:false});

    const onClick = (id, uuid) =>{
        const url = `/irrigation/pivots/${uuid}`
        navigate(url)
    }
    const setter = (data) => {
        setSearchResults(data)
        setIsLoading(false)
    }
    const submit = (type, data) => {
        if (type === 'add') setSearchResults([data, ...searchResults])
        else if (type === 'edit' && searchResults) setSearchResults([...searchResults.map(reg => reg.uuid === data.uuid ? data : reg)])
        else if (type === 'delete' && searchResults) setSearchResults(searchResults.filter(r => r.uuid !== data))
        setShowModal(false)
    }
    const handleChange = async (value) => {
        setIsLoading(true)
        HandleSearch(value, 'irrigation/pivots', setter)
    };

    useEffect(()=>{
        if ((user.permissions && user.permissions.indexOf("view_cadastro_pivots") === -1) && !user.is_superuser){
            navigate("/error/403")
        }
    },[])
    useEffect(() => {
        const search = async () => {
            const status = await HandleSearch('', 'irrigation/pivots', setSearchResults)
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

    return (
        <>
        <CustomBreadcrumb>
            <span className="breadcrumb-item fw-bold">
                <Link className="link-fx text-primary" to={'/ambiental'}>Gestão Ambiental e Irrigação</Link>
            </span>
            <span className="breadcrumb-item fw-bold" aria-current="page">
                Cadastro Pivots
            </span>  
        </CustomBreadcrumb>
        {searchResults ? 
            <AdvanceTableWrapper
                columns={columnsPivot}
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
                        style={{padding: '2px 5px'}} to={'map'}>
                            <FontAwesomeIcon icon={faMapLocation} className="me-1" />Mapa Pivots
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
                                className: 'fs-xs mb-0 overflow-hidden'
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
            </AdvanceTableWrapper> 
        : <div className="text-center"><Spinner></Spinner></div>}
        <ModalRecord show={modal.show} reducer={submit} />
        
        <FloatButton title='Novo Pivot' onClick={() =>{setShowModal(true)}}/>
        <ModalForm show={showmodal} onClose={() => setShowModal(false)} title={'Adicionar Pivot'}>
            <PivotForm hasLabel type='add' submit={submit} />
        </ModalForm>
        </>
    );
  };
  
  export default IndexPivots;
  
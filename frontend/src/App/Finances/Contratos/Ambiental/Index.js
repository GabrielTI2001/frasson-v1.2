import { useState, useEffect} from "react";
import React from 'react';
import {Row, Col, Spinner} from 'react-bootstrap';
import { useNavigate, useParams } from "react-router-dom";
import AdvanceTable from '../../../../components/common/advance-table/AdvanceTable';
import AdvanceTableFooter from '../../../../components/common/advance-table/AdvanceTableFooter';
import AdvanceTableSearchBox from '../../../../components/common/advance-table/AdvanceTableSearchBox';
import AdvanceTableWrapper from '../../../../components/common/advance-table/AdvanceTableWrapper';
import { Link } from "react-router-dom";
import { columnsContratos } from "../../Data";
import { HandleSearch } from "../../../../helpers/Data";
import ContratoForm from "../FormContrato";
import ModalContract from "./Modal";
import { RedirectToLogin } from "../../../../Routes/PrivateRoute";
import CustomBreadcrumb, { FloatButton, ModalForm } from "../../../../components/Custom/Commom";

const IndexContratosAmbiental = () => {
    const [searchResults, setSearchResults] = useState();
    const user = JSON.parse(localStorage.getItem("user"))
    const navigate = useNavigate();
    const {uuid} = useParams();
    const [modal, setModal] = useState({})
    const [modalform, setModalform] = useState(false);

    const onClick = (id, uuid) =>{
        const url = `/finances/contracts/environmental/${uuid}`
        navigate(url)
    }
    const setter = (data) => {
        setSearchResults(data)
    }
    const submit = (type, data, id) => {
        if (type === 'add'){
            setSearchResults([data, ...searchResults])
        }
        if (type === 'edit'){
            setSearchResults(null)
        }
        if (type === 'delete'){
            setSearchResults([...searchResults.filter(c => c.uuid !== data)])
        }
        setModalform({show:false})
    }
    const handleChange = async (value) => {
        setSearchResults(null)
        HandleSearch(value, 'finances/contratos-ambiental', setter)
    };

    useEffect(()=>{
        if ((user.permissions && user.permissions.indexOf("view_contratos_ambiental") === -1) && !user.is_superuser){
            navigate("/error/403")
        }
    },[])
    useEffect(() => {
        const search = async () => {
            const status = await HandleSearch('', 'finances/contratos-ambiental', setter) 
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
            <span className="breadcrumb-item fw-bold" aria-current="page">
                Contratos Serviços Ambiental
            </span>  
        </CustomBreadcrumb>
        
        <AdvanceTableWrapper
            columns={columnsContratos}
            data={searchResults || []}
            sortable
            pagination
            perPage={15}
        >
            <Row className="flex-end-center justify-content-start mb-3 gy-2">
                <Col sm={6} lg={4}>
                    <AdvanceTableSearchBox table onSearch={handleChange}/>
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
                        index_status: 5
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

        <ModalContract show={modal.show} reducer={submit}/>
        <FloatButton title='Novo Contraro' onClick={() =>{setModalform(true)}}/>
        <ModalForm show={modalform} onClose={() => setModalform(false)} title={'Adicionar Contrato'}>
            <ContratoForm type='add' hasLabel submit={submit}/>
        </ModalForm>
        </>
    );
  };
  
  export default IndexContratosAmbiental;
  
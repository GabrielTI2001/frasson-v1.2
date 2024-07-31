import { useState, useEffect} from "react";
import React from 'react';
import {Row, Col, Spinner} from 'react-bootstrap';
import { useNavigate } from "react-router-dom";
import AdvanceTable from '../../../components/common/advance-table/AdvanceTable';
import AdvanceTableFooter from '../../../components/common/advance-table/AdvanceTableFooter';
import AdvanceTableSearchBox from '../../../components/common/advance-table/AdvanceTableSearchBox';
import AdvanceTableWrapper from '../../../components/common/advance-table/AdvanceTableWrapper';
import { Link } from "react-router-dom";
import { columnsContratos } from "../Data";
import { HandleSearch } from "../../../helpers/Data";
import { RedirectToLogin } from "../../../Routes/PrivateRoute";

const IndexContratos = () => {
    const [searchResults, setSearchResults] = useState();
    const user = JSON.parse(localStorage.getItem("user"))
    const navigate = useNavigate();

    const onClick = (id, uuid) =>{
        const url = `/pipefy/contracts/${id}`
        navigate(url)
    }
    const setter = (data) => {
        setSearchResults(data)
    }
    const handleChange = async (value) => {
        setSearchResults(null)
        HandleSearch(value, 'pipefy/contratos-servicos', setter)
    };

    useEffect(()=>{
        const Search = async () => {
            const status = await HandleSearch('', 'pipefy/contratos-servicos', setter) 
            if (status === 401) RedirectToLogin(navigate);
        }
        if ((user.permissions && user.permissions.indexOf("view_contratos_servicos") === -1) && !user.is_superuser){
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
                Contratos Serviços
            </li>  
        </ol>
        
        <AdvanceTableWrapper
            columns={columnsContratos}
            data={searchResults || []}
            sortable
            pagination
            perPage={15}
        >
            <Row className="flex-end-center justify-content-start mb-3">
                <Col xs="auto" sm={6} lg={4}>
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
                index_status:7
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
        </>
    );
  };
  
  export default IndexContratos;
  
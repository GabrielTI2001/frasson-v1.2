import { useState, useEffect} from "react";
import React from 'react';
import {Row, Col} from 'react-bootstrap';
import { useNavigate, Link } from "react-router-dom";
import AdvanceTable from '../../components/common/advance-table/AdvanceTable';
import AdvanceTableFooter from '../../components/common/advance-table/AdvanceTableFooter';
import AdvanceTableSearchBox from '../../components/common/advance-table/AdvanceTableSearchBox';
import AdvanceTableWrapper from '../../components/common/advance-table/AdvanceTableWrapper';
import { columnsNext } from "./Data";
import { HandleSearch } from "../../helpers/Data";
import { RedirectToLogin } from "../../Routes/PrivateRoute";
import CustomBreadcrumb from "../../components/Custom/Commom";
import { SkeletBig } from "../../components/Custom/Skelet";

const AlongamentosNext = () => {
    const [searchResults, setSearchResults] = useState();
    const user = JSON.parse(localStorage.getItem("user"))
    const navigate = useNavigate();

    const setter = (data) =>{
        setSearchResults(data)
    }
    const search = (value) =>{
        HandleSearch(value, 'alongamentos/next', setter)
    }

    useEffect(()=>{
        const search = async () => {
            const status = await HandleSearch('', 'alongamentos/next', setter) 
            if (status === 401) RedirectToLogin(navigate);
        }
        if ((user.permissions && user.permissions.indexOf("view_operacoes_credito") === -1) && !user.is_superuser){
            navigate("/error/403")
        }
        if (!searchResults){
            search()
        }
    },[])

    return (
        <>
        <CustomBreadcrumb>
            <span className="breadcrumb-item fw-bold">
                <Link className="link-fx text-primary" to={'/operational'}>Operacional</Link>
            </span>
            <span className="breadcrumb-item fw-bold" aria-current="page">Próximos Alongamentos</span>  
        </CustomBreadcrumb>
        {searchResults ? 
            <AdvanceTableWrapper
                columns={columnsNext}
                data={searchResults}
                sortable
                pagination
                perPage={15}
            >
            <Row className="flex-end-center justify-content-start mb-3">
                <Col xs="auto" sm={6} lg={4}>
                    <AdvanceTableSearchBox table onSearch={search}/>
                </Col>
            </Row>
        
            <AdvanceTable
                table
                headerClassName="text-nowrap align-middle fs-xs"
                rowClassName='align-middle white-space-nowrap fs-xs'
                tableProps={{
                    bordered: true,
                    striped: false,
                    nextalongamento: 1,
                    className: 'fs-xs mb-0 overflow-hidden',
                }}
                Click={() => {}}
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
            </AdvanceTableWrapper> 
        : <SkeletBig /> }
        </>
    );
  };
  
  export default AlongamentosNext;
  
import { useState, useEffect} from "react";
import React from 'react';
import {Row, Col, Spinner} from 'react-bootstrap';
import { useNavigate } from "react-router-dom";
import AdvanceTable from '../../../components/common/advance-table/AdvanceTable';
import AdvanceTableFooter from '../../../components/common/advance-table/AdvanceTableFooter';
import AdvanceTableSearchBox from '../../../components/common/advance-table/AdvanceTableSearchBox';
import AdvanceTableWrapper from '../../../components/common/advance-table/AdvanceTableWrapper';
import { columnsFollowup } from "../Data";
import { HandleSearch } from "../../../helpers/Data";
import CustomBreadcrumb from "../../../components/Custom/Commom";

const IndexFollowup = () => {
    const [searchResults, setSearchResults] = useState();
    const user = JSON.parse(localStorage.getItem("user"))
    const navigate = useNavigate();

    const onClick = (id, uuid) =>{
        const url = `/processes/followup/${id}`
        navigate(url)
    }
    const setter = (data) =>{
        setSearchResults(data)
    }
    const search = (value) =>{
        HandleSearch(value, 'processes/followup', setter)
    }

    useEffect(()=>{
        if ((user.permissions && user.permissions.indexOf("view_processos_andamento") === -1) && !user.is_superuser){
            navigate("/error/403")
        }
        if (!searchResults){
            HandleSearch('', 'processes/followup', setter) 
        }
    },[])

    return (
        <>
        <CustomBreadcrumb>
            <span className="breadcrumb-item fw-bold" aria-current="page">
                Acompanhamento Processos GAI
            </span>  
        </CustomBreadcrumb>
        {searchResults ? 
        <AdvanceTableWrapper
            columns={columnsFollowup}
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
                className: 'fs-xs mb-0 overflow-hidden',
                followup:'true'
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
        </>
    );
  };
  
  export default IndexFollowup;
  
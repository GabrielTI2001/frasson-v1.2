import { useState, useEffect} from "react";
import React from 'react';
import {Row, Col, Spinner} from 'react-bootstrap';
import { useNavigate } from "react-router-dom";
import AdvanceTable from '../../../components/common/advance-table/AdvanceTable';
import AdvanceTableFooter from '../../../components/common/advance-table/AdvanceTableFooter';
import AdvanceTableSearchBox from '../../../components/common/advance-table/AdvanceTableSearchBox';
import AdvanceTableWrapper from '../../../components/common/advance-table/AdvanceTableWrapper';
import { columnsCardProspects } from "../Data";
import { HandleSearch } from "../../../helpers/Data";

const IndexProspects = () => {
    const [searchResults, setSearchResults] = useState();
    const user = JSON.parse(localStorage.getItem("user"))
    const token = localStorage.getItem("token")
    const navigate = useNavigate();

    const onClick = (id, uuid) =>{
        const url = `/pipefy/pipes/301573049/${id}`
        navigate(url)
    }
    const setter = (data) =>{
        setSearchResults(data)
    }
    const search = (value) =>{
        HandleSearch(value, 'pipefy/cards/prospects', setter)
    }

    useEffect(()=>{
        const getdata = async () =>{
            const status = await HandleSearch('', 'pipefy/cards/prospects', setter)
            if (status === 401){
             navigate("/auth/login")
            } 
        }
        if ((user.permissions && user.permissions.indexOf("view_card_prospects") === -1) && !user.is_superuser){
            navigate("/error/403")
        }
        if (!searchResults){
            getdata()
        }
    },[])

    return (
        <>
        <ol className="breadcrumb breadcrumb-alt fs-xs mb-3">
            <li className="breadcrumb-item fw-bold" aria-current="page">
                Prospects Pipefy
            </li>  
        </ol>
        {searchResults ? 
        <AdvanceTableWrapper
            columns={columnsCardProspects}
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
                index_status:6
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
  
  export default IndexProspects;
  
import { useState, useEffect} from "react";
import React from 'react';
import {Row, Col, Spinner} from 'react-bootstrap';
import { useNavigate } from "react-router-dom";
import AdvanceTable from '../../../components/common/advance-table/AdvanceTable';
import AdvanceTableFooter from '../../../components/common/advance-table/AdvanceTableFooter';
import AdvanceTableWrapper from '../../../components/common/advance-table/AdvanceTableWrapper';
import { Link } from "react-router-dom";
import { columnsOutorga } from "../Data";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMapLocation } from "@fortawesome/free-solid-svg-icons";
import { HandleSearch } from "../../../helpers/Data";
import { RedirectToLogin } from "../../../Routes/PrivateRoute";

const IndexOutorgasANA = () => {
    const [searchResults, setSearchResults] = useState();
    const user = JSON.parse(localStorage.getItem("user"))
    const navigate = useNavigate();
    const [showmodal, setShowModal] = useState(false)
    const [isloading, setIsLoading] = useState(false)

    const onClick = (id, uuid) =>{
        const url = `/ambiental/inema/outorgas/${uuid}`
        navigate(url)
    }
    const setter = (data) => {
        setSearchResults(data.outorgas)
        setIsLoading(false)
    }

    useEffect(()=>{
        if ((user.permissions && user.permissions.indexOf("ver_outorgas_ana") === -1) && !user.is_superuser){
            navigate("/error/403")
        }
        const Search = async () => {
            const status = await HandleSearch('', 'external/ana/outorgas', setter) 
            if (status === 401) RedirectToLogin(navigate);
        }
        if (!searchResults){
            Search()
        }
    },[])

    return (
        <>
        <ol className="breadcrumb breadcrumb-alt fs-xs mb-3">
            <li className="breadcrumb-item fw-bold" aria-current="page">
                Outorgas ANA
            </li>  
        </ol>
        {searchResults ? 
        <AdvanceTableWrapper
            columns={columnsOutorga}
            data={searchResults}
            sortable
            pagination
            perPage={15}
        >
        <Row className="flex-end-center justify-content-start gy-2 gx-2 mb-3" xs={2} xl={12} sm={8}>
            <Col xl={4} sm={6} xs={12}>
                {/* <AdvanceTableSearchBox table onSearch={handleChange}/> */}
            </Col>
            <Col xl={'auto'} sm='auto' xs={'auto'}>
                <Link className="text-decoration-none btn btn-primary shadow-none fs--2"
                style={{padding: '2px 5px'}} to={'../outorga/map'}>
                    <FontAwesomeIcon icon={faMapLocation} className="me-1" />Mapa Outorgas
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
        </AdvanceTableWrapper> : <div className="text-center"><Spinner></Spinner></div>}
        </>
    );
  };
  
  export default IndexOutorgasANA;
  
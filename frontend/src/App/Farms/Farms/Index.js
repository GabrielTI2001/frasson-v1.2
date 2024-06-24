import { useState, useEffect} from "react";
import React from 'react';
import {Row, Col, Placeholder, Modal, CloseButton} from 'react-bootstrap';
import { useNavigate } from "react-router-dom";
import AdvanceTable from '../../../components/common/advance-table/AdvanceTable';
import AdvanceTableFooter from '../../../components/common/advance-table/AdvanceTableFooter';
import AdvanceTableSearchBox from '../../../components/common/advance-table/AdvanceTableSearchBox';
import AdvanceTableWrapper from '../../../components/common/advance-table/AdvanceTableWrapper';
import { Link } from "react-router-dom";
import { columnsFarms } from "../Data";
import { HandleSearch } from "../../../helpers/Data";
import { faMapLocation } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import FarmForm from "./Form";

const InitData = {
    'urlapilist':'farms/farms', 
    'urlview':'/farms/farms', 'title': 'Imóveis Rurais'
}

const IndexFarms = () => {
    const [searchResults, setSearchResults] = useState();
    const user = JSON.parse(localStorage.getItem("user"))
    const navigate = useNavigate();
    const [showmodal, setShowModal] = useState({show:false})

    const onClick = (id, uuid) =>{
        const url = `/farms/farms/${uuid}`
        navigate(url)
    }

    const setter = (data) =>{
        setSearchResults(data);
    }

    const submit = (type, data, id) => {
        if (type == 'add'){
            setSearchResults([...searchResults, data])
        }
        setShowModal({show:false})
    }

    const handleChange = async (value) => {
        const status = await HandleSearch(value, InitData.urlapilist, setSearchResults)
        if (status === 401) navigate("/auth/login");
    };

    useEffect(()=>{
        const getdata = async () =>{
            const status = await HandleSearch('', InitData.urlapilist, setter)
            if (status === 401) navigate("/auth/login");
        }
        if ((user.permissions && user.permissions.indexOf("view_imoveis_rurais") === -1) && !user.is_superuser){
            navigate("/error/403")
        }
        if (!searchResults){
            getdata()
        }
    },[])

    return (
        <>
        <ol className="breadcrumb breadcrumb-alt fs-xs mb-3">
            <li className="breadcrumb-item fw-bold">
                <Link className="link-fx text-primary" to={'/farms'}>Cadastros Fazendas</Link>
            </li>
            <li className="breadcrumb-item fw-bold" aria-current="page">
                {InitData.title}
            </li>  
        </ol>
        {searchResults ? 
        <AdvanceTableWrapper
            columns={columnsFarms}
            data={searchResults}
            sortable
            pagination
            perPage={5}
        >
            <Row className="flex-end-center justify-content-start mb-3">
                <Col xs="auto" sm={6} lg={4}>
                    <AdvanceTableSearchBox table onSearch={handleChange}/>
                </Col>
                <Col xl={'auto'} sm='auto' xs={'auto'}>
                    <Link className="text-decoration-none btn btn-primary shadow-none fs--1"
                        style={{padding: '2px 8px'}} onClick={() =>{setShowModal({show:true})}}
                    >Novo Cadastro</Link>
                </Col>
                <Col xl={'auto'} sm='auto' xs={'auto'}>
                    <Link className="text-decoration-none btn btn-info shadow-none fs--1"
                        style={{padding: '2px 8px'}} to={'map'}
                    >
                        <FontAwesomeIcon icon={faMapLocation} className="me-1" />Mapa
                    </Link>
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
            size="xl"
            show={showmodal.show}
            onHide={() => setShowModal({show:false})}
            centered
            scrollable
            aria-labelledby="example-modal-sizes-title-lg"
        >
            <Modal.Header>
                <Modal.Title id="example-modal-sizes-title-lg" style={{fontSize: '16px'}}>
                    {showmodal.data ? 'Editar' : 'Adicionar' } Imóvel Rural
                </Modal.Title>
                    <CloseButton onClick={() => setShowModal({show:false})}/>
                </Modal.Header>
                <Modal.Body>
                    <Row className="flex-center sectionform">
                        {showmodal.data
                           ? null
                           : <FarmForm type='add' hasLabel submit={submit}/>
                        } 
                    </Row>
            </Modal.Body>
        </Modal>
        </>
    );
  };
  
  export default IndexFarms;
  
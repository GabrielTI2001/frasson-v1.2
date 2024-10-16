import { useState, useEffect} from "react";
import React from 'react';
import {Row, Col, Spinner} from 'react-bootstrap';
import { useNavigate, useParams } from "react-router-dom";
import AdvanceTable from '../../../components/common/advance-table/AdvanceTable';
import AdvanceTableFooter from '../../../components/common/advance-table/AdvanceTableFooter';
import AdvanceTableSearchBox from '../../../components/common/advance-table/AdvanceTableSearchBox';
import AdvanceTableWrapper from '../../../components/common/advance-table/AdvanceTableWrapper';
import { Link } from "react-router-dom";
import { columnsPessoal } from "../Data";
import { HandleSearch } from "../../../helpers/Data";
import PessoaForm from "./Form";
import ModalPessoal from "./Modal";
import { RedirectToLogin } from "../../../Routes/PrivateRoute";
import Breadcrumbs from '@mui/material/Breadcrumbs';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { FloatButton, ModalForm } from "../../../components/Custom/Commom";

const IndexPessoal = () => {
    const [searchResults, setSearchResults] = useState();
    const user = JSON.parse(localStorage.getItem("user"))
    const navigate = useNavigate();
    const {uuid} = useParams()
    const [modal, setModal] = useState({show:false})
    const [showmodal, setShowModal] = useState({show:false})

    const onClick = (id, uuid) =>{
        if ((user.permissions && user.permissions.indexOf("change_cadastro_pessoal") === -1) && !user.is_superuser){
           navigate("/error/403")
        }
        const url = `/databases/pessoal/${uuid}`
        navigate(url)
    }
    const setter = (data) => {
        setSearchResults(data)
    }
    const handleChange = async (value) => {
        HandleSearch(value, 'register/pessoal', setter)
    };
    const submit = (type, data) => {
        if (type === 'add'){
            setSearchResults([data, ...searchResults])
            setShowModal({show:false})
        }
        if (type === 'edit'){
            setSearchResults()
        }
        if (type === 'delete'){
            setSearchResults(searchResults.filter(r => r.uuid !== data))
        }
    }

    useEffect(()=>{
        if ((user.permissions && user.permissions.indexOf("view_cadastro_pessoal") === -1) && !user.is_superuser){
            navigate("/error/403")
        }
    },[])
    useEffect(() => {
        const search = async () => {
            const status = await HandleSearch('', 'register/pessoal', setter)
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
        <Breadcrumbs
            separator={<NavigateNextIcon fontSize="small" />} className="fs--1 mb-2"
            aria-label="breadcrumb"
        >
            <span className="breadcrumb-item fw-bold">
                <Link className="link-fx text-primary" to={'/databases'}>Cadastros Gerais</Link>
            </span>
            <span className="breadcrumb-item fw-bold" aria-current="page">
                Cadastro Pessoal
            </span>  
        </Breadcrumbs>
        {searchResults ? 
        <AdvanceTableWrapper
            columns={columnsPessoal}
            data={searchResults}
            sortable
            pagination
            perPage={15}
        >
            <Row className="flex-end-center justify-content-start mb-3">
                <Col xs="auto" sm={6} lg={4}>
                    <AdvanceTableSearchBox table onSearch={handleChange}/>
                </Col>
            </Row>
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

        <ModalPessoal show={modal.show} reducer={submit}/>
        <FloatButton title='Novo Cadastro' onClick={() =>{setShowModal({show:true})}}/>
        <ModalForm show={showmodal.show} onClose={() => setShowModal({show:false})} title={'Adicionar Pessoa'}>
            <PessoaForm type='add' hasLabel submit={submit}/>
        </ModalForm>
        </>
    );
  };
  
  export default IndexPessoal;
  
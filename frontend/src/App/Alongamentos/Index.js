import { useState, useEffect} from "react";
import React from 'react';
import {Row, Col, Modal, CloseButton, Placeholder} from 'react-bootstrap';
import { useNavigate, Link } from "react-router-dom";
import AdvanceTable from '../../components/common/advance-table/AdvanceTable';
import AdvanceTableFooter from '../../components/common/advance-table/AdvanceTableFooter';
import AdvanceTableSearchBox from '../../components/common/advance-table/AdvanceTableSearchBox';
import AdvanceTableWrapper from '../../components/common/advance-table/AdvanceTableWrapper';
import { columnsAlongamento } from "./Data";
import { HandleSearch } from "../../helpers/Data";
import ModalDelete from "../../components/Custom/ModalDelete";
import Edit from "./Edit";

const IndexAlongamentos = () => {
    const [searchResults, setSearchResults] = useState();
    const user = JSON.parse(localStorage.getItem("user"))
    const [modalform, setModalForm] = useState({show:false, id:null})
    const [modaldelete, setModalDelete] = useState({show:false, link:null})
    const navigate = useNavigate();

    const onClick = (dados, type) =>{
        if (type === 'download'){
            const downloadFile = async (url) => {
                const response = await fetch(url.url);
                const blob = await response.blob();
                const filename = url.name;
                const link = document.createElement('a');
                link.href = window.URL.createObjectURL(blob);
                link.download = filename;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
            const filesToDownload = [
                {url:`${process.env.REACT_APP_API_URL}/alongamentos/pdf/download/${dados.id}/1`, 
                    name:`${dados.beneficiario} ${dados.numero_operacao} - page 1.pdf`},
                {url:`${process.env.REACT_APP_API_URL}/alongamentos/pdf/download/${dados.id}/2`, 
                    name:`${dados.beneficiario} ${dados.numero_operacao} - page 2.pdf`}
            ];
            if (dados.str_tipo_armazenagem == 'Silo Bag'){
                filesToDownload.push({url:`${process.env.REACT_APP_API_URL}/alongamentos/pdf/download/${dados.id}/3`, 
                name:`${dados.beneficiario} ${dados.numero_operacao} - page 3.pdf`})
            }
            // Itera sobre cada URL de arquivo e abre uma nova janela do navegador para fazer o download
            filesToDownload.forEach(url => {
                downloadFile(url)
            });
        }
        if (type === 'edit'){
            if ((user.permissions && user.permissions.indexOf("change_operacoes_credito") !== -1) || user.is_superuser){
                setModalForm({show:true, id:dados.id})
            }
        }
        if (type === 'delete'){
            if ((user.permissions && user.permissions.indexOf("delete_operacoes_credito") !== -1) || user.is_superuser){
                setModalDelete({show:true, link:`${process.env.REACT_APP_API_URL}/alongamentos/index/${dados.id}/`})
            }
        }
    }
    const setter = (data) =>{
        setSearchResults(data)
    }
    const update = (type, data) =>{
        if (type === 'delete'){
            setModalDelete({show:false})
            setSearchResults(searchResults.filter(s => s.id !== parseInt(data)))
        }
        else{
            setModalForm({show:false})
        }

    }
    const search = (value) =>{
        HandleSearch(value, 'alongamentos/index', setter)
    }

    useEffect(()=>{
        const getdata = async () =>{
            const status = await HandleSearch('', 'alongamentos/index', setter) 
            if (status === 401){
                navigate("/auth/login")
            }
        }
        if ((user.permissions && user.permissions.indexOf("view_operacoes_credito") === -1) && !user.is_superuser){
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
                Alongamentos
            </li>  
        </ol>
        {searchResults ? 
        <AdvanceTableWrapper
            columns={columnsAlongamento}
            data={searchResults}
            sortable
            pagination
            perPage={5}
        >
        <Row className="flex-end-center justify-content-start mb-3">
            <Col xs="auto" sm={6} lg={4}>
                <AdvanceTableSearchBox table onSearch={search}/>
            </Col>
            <Col xs="auto" sm={6} lg={4}>
                <Link className="btn btn-sm btn-info px-2" to={'/analytics/credit'}>Operações de Crédito</Link>
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
                alongamento:1
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
            show={modalform.show}
            onHide={() => setModalForm({show:false})}
            dialogClassName="mt-1"
            aria-labelledby="example-modal-sizes-title-lg"
        >
            <Modal.Header>
            <Modal.Title id="example-modal-sizes-title-lg" style={{fontSize: '16px'}}>
                Editar Alongamento
            </Modal.Title>
                <CloseButton onClick={() => setModalForm({show:false})}/>
            </Modal.Header>
            <Modal.Body>
                <div className="">
                    <Edit id={modalform.id} update={update}/>
                </div>
            </Modal.Body>
        </Modal>
        <ModalDelete show={modaldelete.show} link={modaldelete.link} close={() => setModalDelete({...modaldelete, show:false})} update={update} />
        </>
    );
  };
  
  export default IndexAlongamentos;
  
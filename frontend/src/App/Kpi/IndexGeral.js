import { useState, useEffect} from "react";
import React from 'react';
import {Row, Col, Spinner, Table, Modal, CloseButton, Button} from 'react-bootstrap';
import { useNavigate } from "react-router-dom";
import { HandleSearch } from "../../helpers/Data";
import { useAppContext } from "../../Main";
import IndicatorForm from "./Form";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashCan, faPen} from '@fortawesome/free-solid-svg-icons';
import ModalDelete from "../../components/Custom/ModalDelete";

const IndexIndicators = () => {
    const [searchResults, setSearchResults] = useState();
    const user = JSON.parse(localStorage.getItem("user"))
    const {config: {theme}} = useAppContext();
    const [showmodal, setShowModal] = useState({})
    const [modaldelete, setModalDelete] = useState({show:false})
    const navigate = useNavigate();

    const onClick = (uuid) =>{
        const url = `/kpi/indicators/${uuid}`
        navigate(url)
    }
    const setter = (data) => {
        setSearchResults(data)
    }
    const submit = (type, data) => {
        // setRegister(data)
        if (type === 'add') setSearchResults([...searchResults, data])
        if (type === 'edit') setSearchResults([...searchResults.map(r => (r.id === data.id ? data : r))])
        if (type === 'delete') setSearchResults([...searchResults.filter(r => r.uuid !== data)])
        setShowModal(false)
    }

    useEffect(()=>{
        const Search = async () => {
            const status = await HandleSearch('', 'kpi/metas', setter) 
            if (status === 401) navigate("/auth/login");
        }
        if (!searchResults){
            Search()
        }
    },[])

    return (
        <>
        <ol className="breadcrumb breadcrumb-alt fs-xs mb-3">
            <li className="breadcrumb-item fw-bold" aria-current="page">
                Key Performance Indicators
            </li>  
        </ol>
        <div><Button className="btn-success btn-sm fs--1" onClick={() => setShowModal({show:true, type:'add'})}>Nova Meta</Button></div>
        {searchResults ?
        <Row xl={2} xs={1} className="mt-3">
            <Table responsive className="table-sm">
                <thead className="bg-300">
                    <tr>
                        <th scope="col">INDICADOR/META</th>
                        <th scope="col">ANO</th>
                        <th scope="col">RESPONSÁVEL</th>
                        <th scope="col">AÇÕES</th>
                    </tr>
                </thead>
                <tbody className={`${theme === 'light' ? 'bg-light': 'bg-200'}`}>
                {searchResults && searchResults.map(reg =>(
                <tr key={reg.uuid} style={{cursor:'pointer'}}>
                    <td className="align-middle fw-bold text-primary" onClick={() => onClick(reg.uuid)}>{reg.str_indicator}</td>
                    <td className="align-middle fw-bold text-primary" onClick={() => onClick(reg.uuid)}>{reg.year}</td>
                    <td className="py-0" onClick={() => onClick(reg.uuid)}>
                        <img className="rounded-circle p-1" src={`${process.env.REACT_APP_API_URL}/media/${reg.user_avatar}`} 
                            alt="Header Avatar" style={{width: '35px'}}
                        />
                        <span className="col-xl-auto col-lg-auto fw-bold text-primary ps-1">{reg.str_responsavel}</span>
                    </td>
                    <td className="align-middle text-center">
                        <FontAwesomeIcon icon={faPen} className='text-primary me-2' 
                            onClick={()=>{ setShowModal({show:true, type:'edit', pk:reg.uuid})}}
                        />
                        <FontAwesomeIcon icon={faTrashCan} className='text-danger me-2' 
                            onClick={()=>{setModalDelete({show:true, link:`${process.env.REACT_APP_API_URL}/kpi/metas/${reg.uuid}/`})}}
                        />
                    </td>
                </tr>
                ))} 
                </tbody>
            </Table>
        </Row>
        : <div className="text-center"><Spinner></Spinner></div>}
        <Modal
            size="xl"
            show={showmodal.show}
            onHide={() => setShowModal({show:false})}
            dialogClassName="mt-7"
            aria-labelledby="example-modal-sizes-title-lg"
        >
            <Modal.Header>
                <Modal.Title id="example-modal-sizes-title-lg" style={{fontSize: '16px'}}>
                {showmodal.type == 'edit' ? 'Editar' : 'Nova'} Meta
                </Modal.Title>
                    <CloseButton onClick={() => setShowModal({show:false})}/>
                </Modal.Header>
                <Modal.Body>
                    <Row className="flex-center sectionform">
                        {showmodal.type == 'edit' 
                            ? <IndicatorForm hasLabel type='edit' submit={submit} pk={showmodal.pk}/>
                            : <IndicatorForm hasLabel type='add' submit={submit}/>
                        }
                        
                    </Row>
            </Modal.Body>
        </Modal>
        <ModalDelete show={modaldelete.show} link={modaldelete.link} close={() => setModalDelete({...modaldelete, show:false})} update={submit} />
        </>
    );
  };
  
  export default IndexIndicators;
  
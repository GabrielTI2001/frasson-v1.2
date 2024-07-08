import { useEffect, useState, useReducer } from "react";
import React from 'react';
import { useParams, useNavigate } from "react-router-dom";
import { Row, Col, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import { Placeholder } from "react-bootstrap";
import APPOForm from "./APPOForm";
import PontoForm from "./PontoForm";
import AdvanceTableFooter from "../../../components/common/advance-table/AdvanceTableFooter";
import AdvanceTableWrapper from "../../../components/common/advance-table/AdvanceTableWrapper";
import ModalDelete from "../../../components/Custom/ModalDelete";
import { Modal } from "react-bootstrap";
import { CloseButton } from 'react-bootstrap';
import { AmbientalContext } from "../../../context/Context";
import {ambientalReducer} from '../../../reducers/ambientalReducer'
import { columnsPontoAPPO } from "./../Data";
import PocoTable from "./PocoTable";
import {toast} from 'react-toastify'

export const Edit = () => {
    const channel = new BroadcastChannel('meu_canal');
    const {uuid} = useParams()
    const token = localStorage.getItem("token")
    const user = JSON.parse(localStorage.getItem("user"))
    const navigate = useNavigate();
    const [ambientalState, ambientalDispatch] = useReducer(ambientalReducer, {modal:{show:false, content:{}}});
    const modal = ambientalState.modal;
    const appo = ambientalState.appo;
    const coordenadas = ambientalState.appo ? ambientalState.appo.coordenadas : null;

    const onClickPoint = (dados, type) =>{
        if (type === 'delete'){
            ambientalDispatch({type:'OPEN_MODAL', payload:{type:'delete', data:dados}})
        }
        else if (type === 'add'){
            ambientalDispatch({type:'OPEN_MODAL', payload:{type:'add', data:dados}})
        }
        else{
            ambientalDispatch({type:'OPEN_MODAL', payload:{type:'edit', data:dados}})
        }
    }

    const posdelete = () =>{
        ambientalDispatch({type:'REMOVE_PONTO_APPO',payload:{id:modal.content.data}})
        channel.postMessage({ tipo: 'remover_coordenada', id:modal.content.data, appo_id:appo.id})
    }

    useEffect(() =>{
        const getCoordenadas = async (id) => {
            try{
                const response = await fetch(`${process.env.REACT_APP_API_URL}/environmental/inema/appo/coordenadas-detail/?processo=${id}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                });
                if (response.status === 401){
                    localStorage.setItem("login", JSON.stringify(false));
                    localStorage.setItem('token', "");
                    toast.error("Sua Sessão Expirou")
                    const next = window.location.href.toString().split(process.env.REACT_APP_HOST)[1]
                    navigate(`/auth/login?next=${next}`);
                }
                else if (response.status === 200){
                    const data = await response.json();
                    ambientalDispatch({type:'SET_DATA', payload:{
                        appo:{...appo, coordenadas:data}
                    }})
                }
                
            } catch (error){
                console.error("Erro: ",error)
            }
        }

        const getData = async () => {
            try{
                const response = await fetch(`${process.env.REACT_APP_API_URL}/environmental/inema/appos/${uuid}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                });
                if (response.status === 401){
                    localStorage.setItem("login", JSON.stringify(false));
                    localStorage.setItem('token', "");
                    const next = window.location.href.toString().split(process.env.REACT_APP_HOST)[1]
                    toast.error("Sua Sessão Expirou")
                    navigate(`/auth/login?next=${next}`);
                }
                if (response.status === 404){
                    navigate("/errors/404");
                }
                else if (response.status === 200){
                    const data = await response.json();
                    ambientalDispatch({type:'SET_DATA', payload:{
                        appo:{...data}
                    }})
                }
                
            } catch (error){
                console.error("Erro: ",error)
            }
        }
        if ((user.permissions && user.permissions.indexOf("change_processos_appo") === -1) && !user.is_superuser){
            navigate("/error/403")
        }
        if (!appo){
            getData()
        }
        else{
            if (!coordenadas){
                getCoordenadas(appo.id)
            }
        }
    }, [appo])

    return (
    <>
    <AmbientalContext.Provider value={{ambientalState, ambientalDispatch}}>
        <ol className="breadcrumb breadcrumb-alt fs-xs mb-3">
            <li className="breadcrumb-item fw-bold">
                <Link className="link-fx text-primary" to={'/ambiental/inema/appos'}>Processos APPO</Link>
            </li>
            {appo && (
            <>
                <li className="breadcrumb-item fw-bold">
                    <Link className="link-fx text-primary" to={`/ambiental/inema/appos/${uuid}`}>APPO {appo.numero_processo}</Link>
                </li>
               <li className="breadcrumb-item fw-bold" aria-current="page">
                    Editar Processo
               </li>    
            </>         
            )}
        </ol>
        <div className="fs--1 sectionform">
            {/* FORMULÁRIO DE APPO */}
            {appo && (
            <>
                <APPOForm hasLabel type={'edit'} data={appo} addpoint={() => onClickPoint(null, 'add')}></APPOForm>
            </>
            )}
            <hr></hr>
            {/* TABELA DE PONTOS */}
            {coordenadas ? (coordenadas.length > 0 ?
                <AdvanceTableWrapper
                    columns={columnsPontoAPPO}
                    data={coordenadas}
                    sortable
                    pagination
                    perPage={15}
                >
                    <PocoTable
                        table
                        headerClassName="text-nowrap align-middle fs-xs"
                        rowClassName='align-middle white-space-nowrap'
                        tableProps={{
                            bordered: true,
                            striped: false,
                            className: 'fs-xs mb-0 overflow-hidden',
                            showactions: 'true',
                        }}
                        Click={onClickPoint}
                    />
                    <div className="mt-3">
                        <AdvanceTableFooter
                            rowCount={coordenadas.length}
                            table
                            rowInfo
                            navButtons
                            rowsPerPageSelection
                        />
                    </div>
                </AdvanceTableWrapper> 
                : <div className="text-danger msg-lg" style={{fontSize:'18px'}}>Nenhum Ponto Cadastrado! Necessário Adicionar</div>)
                : 
                <div>
                    <Placeholder animation="glow">
                        <Placeholder xs={7} /> <Placeholder xs={4} /> 
                        <Placeholder xs={4} />
                        <Placeholder xs={6} /> <Placeholder xs={8} />
                    </Placeholder>    
                </div>   
            }
        </div>
        {/* MODAIS */}
        {modal.content && (
            <Modal
                size="xl"
                show={modal.show && (modal.content.type === 'edit' || modal.content.type === 'add')}
                onHide={() => ambientalDispatch({type:'TOGGLE_MODAL'})}
                dialogClassName="mt-7"
                aria-labelledby="example-modal-sizes-title-lg"
            >
                <Modal.Header>
                <Modal.Title id="example-modal-sizes-title-lg" style={{fontSize: '16px'}}>
                    {modal.content.type === 'edit' ? "Editar " : "Adicionar "}Ponto
                </Modal.Title>
                    <CloseButton onClick={() => {ambientalDispatch({type:'TOGGLE_MODAL'})}}/>
                </Modal.Header>
                <Modal.Body>
                    <Row className="flex-center sectionform">
                        <PontoForm hasLabel data={modal.content.data} type={modal.content.type}></PontoForm>
                    </Row>
                </Modal.Body>
            </Modal>
        )}
        {modal.content && modal.content.data && (
            <ModalDelete show={modal.show && modal.content.type === 'delete'} close={() => {ambientalDispatch({type:'TOGGLE_MODAL'})}} 
                update={posdelete} link={`${process.env.REACT_APP_API_URL}/environmental/inema/appo/coordenadas-detail/${modal.content.data}/`}
            />
        )}

    </AmbientalContext.Provider>
    </>
    );
  };
  
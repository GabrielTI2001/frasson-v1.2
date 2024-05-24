import { useEffect, useReducer } from "react";
import React from 'react';
import { useParams, useNavigate } from "react-router-dom";
import { Row, Col, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import { Placeholder } from "react-bootstrap";
import AreaForm from "./AreaForm";
import AdvanceTable from "../../../components/common/advance-table/AdvanceTable";
import AdvanceTableFooter from "../../../components/common/advance-table/AdvanceTableFooter";
import AdvanceTableWrapper from "../../../components/common/advance-table/AdvanceTableWrapper";
import ModalDelete from "../../../components/Custom/ModalDelete";
import { Modal } from "react-bootstrap";
import { CloseButton } from 'react-bootstrap';
import { AmbientalContext } from "../../../context/Context";
import {ambientalReducer} from '../../../reducers/ambientalReducer'
import { columnsPontoASV } from "./../Data";
import ASVForm from "./Form";

const EditASV = () => {
    const channel = new BroadcastChannel('meu_canal');
    const {uuid} = useParams()
    const token = localStorage.getItem("token")
    const user = JSON.parse(localStorage.getItem("user"))
    const navigate = useNavigate();
    const [ambientalState, ambientalDispatch] = useReducer(ambientalReducer, {modal:{show:false, content:{}}});
    const modal = ambientalState.modal;
    const asv = ambientalState.asv;
    const areas = ambientalState.asv ? ambientalState.asv.areas : [];

    const onClickPoint = (dados, type) =>{
        if (type === 'delete'){
            ambientalDispatch({type:'OPEN_MODAL', payload:{type:'delete', data:dados.id}})
        }
        else if (type === 'add'){
            ambientalDispatch({type:'OPEN_MODAL', payload:{type:'add', data:dados}})
        }
        else{
            ambientalDispatch({type:'OPEN_MODAL', payload:{type:'edit', data:dados}})
        }
    }

    const posdelete = () =>{
        ambientalDispatch({type:'REMOVE_PONTO_ASV',payload:{id:modal.content.data}})
        channel.postMessage({ tipo: 'remover_coordenada', id:modal.content.data, asv_id:asv.id})
    }

    useEffect(() =>{
        const getCoordenadas = async (id) => {
            try{
                const response = await fetch(`${process.env.REACT_APP_API_URL}/environmental/inema/asv/areas-detail/?processo=${id}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                });
                if (response.status === 401){
                    localStorage.setItem("login", JSON.stringify(false));
                    localStorage.setItem('token', "");
                    navigate("/auth/login");
                }
                else if (response.status === 200){
                    const data = await response.json();
                    ambientalDispatch({type:'SET_DATA', payload:{
                        asv:{...asv, areas:data}
                    }})
                }
                
            } catch (error){
                console.error("Erro: ",error)
            }
        }

        const getData = async () => {
            try{
                const response = await fetch(`${process.env.REACT_APP_API_URL}/environmental/inema/asvs/${uuid}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                });
                if (response.status === 401){
                    localStorage.setItem("login", JSON.stringify(false));
                    localStorage.setItem('token', "");
                    navigate("/auth/login");
                }
                if (response.status === 404){
                    navigate("/errors/404");
                }
                else if (response.status === 200){
                    const data = await response.json();
                    ambientalDispatch({type:'SET_DATA', payload:{
                        asv:{...data}
                    }})
                }
                
            } catch (error){
                console.error("Erro: ",error)
            }
        }
        if ((user.permissions && user.permissions.indexOf("change_processos_asv") === -1) && !user.is_superuser){
            navigate("/error/403")
        }
        if (!asv){
            getData()
        }
        else{
            if (!areas){
                getCoordenadas(asv.id)
            }
        }
    }, [asv])

    return (
    <>
    <AmbientalContext.Provider value={{ambientalState, ambientalDispatch}}>
        <ol className="breadcrumb breadcrumb-alt fs-xs mb-3">
            <li className="breadcrumb-item fw-bold">
                <Link className="link-fx text-primary" to={'/ambiental/inema/asv'}>Processos ASV</Link>
            </li>
            {asv && (
            <>
                <li className="breadcrumb-item fw-bold">
                    <Link className="link-fx text-primary" to={`/ambiental/inema/asv/${uuid}`}>ASV {asv.numero_processo}</Link>
                </li>
               <li className="breadcrumb-item fw-bold" aria-current="page">
                    Editar Portaria 
               </li>    
            </>         
            )}
        </ol>
        <div className="fs--1 sectionform">
            {/* FORMULÁRIO DE ASV */}
            {asv && (
            <>
                <ASVForm hasLabel type={'edit'} data={asv} />
                <hr></hr>
                {/* BOTÃO ADD ÁREA */}
                <Row className="text-end">
                    <Col><Button onClick={()=> onClickPoint(null, 'add')}>Adicionar Área</Button></Col>
                </Row>
            </>
            )}
            <hr></hr>
            {/* TABELA DE PONTOS */}
            {areas ? (areas.length > 0 ?
                <AdvanceTableWrapper
                    columns={columnsPontoASV}
                    data={areas}
                    sortable
                    pagination
                    perPage={5}
                >
                    <AdvanceTable
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
                            rowCount={areas.length}
                            table
                            rowInfo
                            navButtons
                            rowsPerPageSelection
                        />
                    </div>
                </AdvanceTableWrapper> 
                : <div className="text-danger msg-lg" style={{fontSize:'18px'}}>Nenhuma Área Cadastrada!</div>)
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
                dialogClassName="mt-10"
                aria-labelledby="example-modal-sizes-title-lg"
            >
                <Modal.Header>
                <Modal.Title id="example-modal-sizes-title-lg" style={{fontSize: '16px'}}>
                    {modal.content.type === 'edit' ? "Editar " : "Adicionar "}Área
                </Modal.Title>
                    <CloseButton onClick={() => {ambientalDispatch({type:'TOGGLE_MODAL'})}}/>
                </Modal.Header>
                <Modal.Body>
                    <Row className="flex-center w-100 sectionform">
                        <AreaForm hasLabel data={modal.content.data} type={modal.content.type} />
                    </Row>
                </Modal.Body>
            </Modal>
        )}
        {modal.content && (
            <ModalDelete show={modal.show && modal.content.type === 'delete'} close={() => {ambientalDispatch({type:'TOGGLE_MODAL'})}} 
                update={posdelete} link={`${process.env.REACT_APP_API_URL}/environmental/inema/asv/areas-detail/${modal.content.data}/`}
            />
        )}

    </AmbientalContext.Provider>
    </>
    );
  };
  
  export default EditASV;
  
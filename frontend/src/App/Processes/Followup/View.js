import React,{useEffect, useState} from 'react';
import { useParams, useNavigate } from "react-router-dom";
import { RetrieveRecord } from '../../../helpers/Data';
import { Link } from 'react-router-dom';
import { Button, Col, Row, Card, OverlayTrigger, Tooltip, Modal, CloseButton } from 'react-bootstrap';
import {Placeholder} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faPencil } from '@fortawesome/free-solid-svg-icons';
import ModalDelete from '../../../components/Custom/ModalDelete';
import FormAcomp from './FormAcomp';
import FormProcesso from './FormProcesso';

const ViewFollowup = () => {
    const {id} = useParams()
    const navigate = useNavigate()
    const user = JSON.parse(localStorage.getItem("user"))
    const [card, setCard] = useState();
    const [acompanhamentos, setAcompanhamentos] = useState();
    const [modal, setModal] = useState({show:false, link:''});
    const [modalform, setModalform] = useState({show:false, type:''});
    const [formData, setformData] = useState({created_by:user.id});

    const setter = (data) =>{
        setCard(data)
        setformData({...formData, processo:data.id})
        setAcompanhamentos(data.acompanhamentos)
    }
    const submit = (type, data) =>{
        if (type === 'add') setAcompanhamentos([...acompanhamentos, data])
        if (type === 'delete'){ 
            setAcompanhamentos(acompanhamentos.filter(m => m.id !== parseInt(data)))
            setModal({show:false})
        }
        setModalform({show:false})
    }
    const submit2 = (type, data) =>{
        if (type === 'edit') setCard({...data})
        if (type === 'delete'){
            navigate('/processes/followup')
        }
        setModalform({show:false})
    }
    useEffect(() =>{
        const getdata = async () =>{
            const status = await RetrieveRecord(id, 'processes/followup', setter)
            if(status === 401){
                navigate("/auth/login")
            }
        }
        if ((user.permissions && user.permissions.indexOf("view_processos_andamento") === -1) && !user.is_superuser){
            navigate("/error/403")
        }
        if (!card){
            getdata()
        }

    },[])

    return (
    <>
    <ol className="breadcrumb breadcrumb-alt fs-xs">
        <li className="breadcrumb-item fw-bold">
            <Link className="link-fx text-primary" to={'/processes/followup'}>Acompanhamentos Processo GAI</Link>
        </li>
        <li className="breadcrumb-item fw-bold" aria-current="page">
            Processo {card && card.processo}
        </li>  
    </ol>
    {card ? <>
    <Row className='mt-2 mb-2' xl={2} sm={2} xs={1}>
        <Col className='d-flex flex-column'>
            <Row xs={1} xl={1} className='gy-1'>
                <h6 style={{fontSize: '12px'}} className='fw-bold mb-0'>Informações do Processo</h6>
                <h6 style={{fontSize: '12px'}} className='text-600 mb-0'>Processo aberto em: {card.pipefy.created_at}</h6>
                <hr className='my-1 ms-3' style={{width:'95%'}}></hr>
                <Col className='mt-0'>
                    <strong className='me-1'>Processo:</strong>
                    <span className='my-1 text-info'>{card.processo ? card.processo : '-'}</span>
                </Col>
                <Col>
                    <strong className='me-1'>Beneficiário:</strong>
                    <span className='my-1 text-info'>{card.pipefy.beneficiario}</span>
                </Col>
                <Col>
                    <strong className='me-1'>Detalhamento:</strong>
                    <span className='my-1 text-info'>{card.pipefy.detalhamento}</span>
                </Col>
                <Col>
                    <strong className='me-1'>Órgão Ambiental:</strong>
                    <span className='my-1 text-info'>{card.pipefy.instituicao}</span>
                </Col>
                <Col>
                    <strong className='me-1'>Fase Atual:</strong>
                    <span className='my-1 text-info'>{card.pipefy.current_phase}</span>
                </Col>
                <Col> 
                    <Row xs={1} xl={2} className='gy-1'>
                        <Col>
                            <strong className='me-1'>N° Requerimento:</strong>
                            <span className='my-1 text-info'>{card.inema.requerimento}</span> 
                        </Col>
                        <Col>
                            <strong className='me-1'>Data Requerimento:</strong>
                            <span className='my-1 text-info'>{card.inema.data_requerimento}</span> 
                        </Col>
                        <Col>
                            <strong className='me-1'>Data Enquadramento:</strong>
                            <span className='my-1 text-info'>{card.inema.data_enquadramento}</span> 
                        </Col>
                        <Col>
                            <strong className='me-1'>Data Formação:</strong>
                            <span className='my-1 text-info'>{card.inema.data_formacao}</span> 
                        </Col>
                    </Row>
                </Col>
                <Col>
                    <strong className='me-1'>N° Processo Órgão:</strong>
                    <span className='my-1 text-info'>{card.inema.processo_inema}</span>
                </Col>
                <Col>
                    <strong className='me-1'>N° Processo SEI:</strong>
                    <span className='my-1 text-info'>{card.inema.processo_sei}</span>
                </Col>
                <Col className='mt-2 mb-1'>
                    <div>
                    {((user.permissions && user.permissions.indexOf("change_processos_andamento") !== -1) | user.is_superuser) ?
                        <Button className='col-auto btn-success btn-sm px-2 me-1' style={{fontSize:'10px'}} onClick={() => setModalform({show:true, type:'process'})}>
                            <FontAwesomeIcon icon={faPencil} className='me-2' /> Editar Acompanhamento
                        </Button> : null
                    }
                    {((user.permissions && user.permissions.indexOf("delete_processos_andamento") !== -1) | user.is_superuser) ?
                        <Button className='col-auto btn-danger btn-sm px-2' style={{fontSize:'10px'}} 
                            onClick={() => setModal({show:true, link:`${process.env.REACT_APP_API_URL}/processes/followup/${id}/`})}>
                            <FontAwesomeIcon icon={faTrash} className='me-2' />Excluir Acompanhamento
                        </Button> : null
                    }
                    </div>
                </Col>
                <hr className='my-1 ms-3' style={{width:'95%'}}></hr>
            </Row>
            <div>
                <Button className='col-auto btn-success btn-sm px-2' style={{fontSize:'10px'}} onClick={() => setModalform({show:true, type:'status'})}>
                    Atualização de status
                </Button>
            </div>
        </Col>
        <Col className='d-flex flex-column'>
            <h6 style={{fontSize: '12px'}} className='fw-bold mb-2'>Atualizações de Acompanhamento</h6>
            {acompanhamentos && acompanhamentos.map(a => 
                <div className='mb-3 d-flex align-items-center' key={a.id}>
                    <OverlayTrigger
                        overlay={
                            <Tooltip id="overlay-trigger-example">
                                {`${a.user}`}
                            </Tooltip>
                        }
                    >
                        <img className='p-0 rounded-circle me-2' style={{width: '42px', height: '38px'}} 
                            src={`${process.env.REACT_APP_API_URL}${a.user_avatar}`}
                        />
                    </OverlayTrigger>
                    <Card as={Col}>
                        <Card.Header className='d-flex justify-content-between py-1'>
                            <Col xl='auto'>
                                <span className="badge bg-primary fw-normal">{ a.status }</span>
                            </Col>
                            <Col xl='auto'>
                                <span className='fw-bold me-2'>{a.data}</span>
                                <FontAwesomeIcon onClick={() => setModal({show:true, 
                                    link:`${process.env.REACT_APP_API_URL}/processes/acompanhamentos/${a.id}/`})} 
                                    icon={faTrash} className='text-danger ms-2 cursor-pointer'
                                />
                            </Col>
                        </Card.Header>
                        <Card.Body className='pt-0 pb-2'>
                            {a.description ? a.description : 'Sem Detalhamentos'}
                        </Card.Body>
                    </Card>
                </div>
            )}
        </Col>
    </Row>
    </>
    :
    <div>
        <Placeholder animation="glow">
            <Placeholder xs={7} /> <Placeholder xs={4} /> 
            <Placeholder xs={4} />
            <Placeholder xs={6} /> <Placeholder xs={8} />
            <Placeholder xs={7} /> <Placeholder xs={4} /> 
        </Placeholder>    
    </div>}
    <ModalDelete show={modal.show} link={modal.link} close={() => setModal({...modal, show:false})} 
        update={
            modal.link == `${process.env.REACT_APP_API_URL}/processes/followup/${id}/` ?
            submit2 : submit
        } 
    />
    <Modal
        size="xl"
        show={modalform.show}
        onHide={() => setModalform({show:false})}
        dialogClassName="mt-10"
        aria-labelledby="example-modal-sizes-title-lg"
    >
        <Modal.Header>
        <Modal.Title id="example-modal-sizes-title-lg" style={{fontSize: '16px'}}>
            {modalform.type == 'status' ? 'Adicionar Atualização de Status' : 'Editar Acompanhamento'}
        </Modal.Title>
            <CloseButton onClick={() => setModalform({show:false})}/>
        </Modal.Header>
        <Modal.Body>
            <Row className="flex-center w-100 sectionform">
            {modalform.type == 'status' 
                ? <FormAcomp hasLabel data={card} submit={submit}/> 
                : <FormProcesso data={card} type='edit' submit={submit2} />
            }
            </Row>
        </Modal.Body>
    </Modal>
    </>
    );
};
  
export default ViewFollowup;
  


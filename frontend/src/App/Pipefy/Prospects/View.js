import React,{useEffect, useState} from 'react';
import { useParams, useNavigate } from "react-router-dom";
import { RetrieveRecord } from '../../../helpers/Data';
import { Link } from 'react-router-dom';
import { Button, Col, Row, Card, OverlayTrigger, Tooltip } from 'react-bootstrap';
import {Placeholder, Modal, CloseButton} from 'react-bootstrap';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import ModalDelete from '../../../components/Custom/ModalDelete';
import FormMonitoramento from './FormMonit';

const ViewProspect = () => {
    const {id} = useParams()
    const navigate = useNavigate()
    const token = localStorage.getItem("token")
    const user = JSON.parse(localStorage.getItem("user"))
    const [card, setCard] = useState();
    const [monitoramentos, setMonitoramentos] = useState();
    const [modal, setModal] = useState({show:false, link:''});
    const [modalform, setModalform] = useState({show:false});

    const setter = (data) =>{
        setCard(data)
        setMonitoramentos(data.monitoramentos)
    }
    const submit = (type, data) =>{
        if (type === 'add') setMonitoramentos([...monitoramentos, data])
        if (type === 'delete'){ 
            setMonitoramentos(monitoramentos.filter(m => m.id !== parseInt(data)))
        }
        setModalform({show:false})

    }

    useEffect(() =>{
        const getdata = async () =>{
            const status = await RetrieveRecord(id, 'pipefy/cards/prospects', setter)
            if(status === 401){
                navigate("/auth/login")
            }
        }
        if ((user.permissions && user.permissions.indexOf("view_imoveis_rurais") === -1) && !user.is_superuser){
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
            <Link className="link-fx text-primary" to={'/pipefy/pipes/301573049'}>Prospects Pipefy</Link>
        </li>
        <li className="breadcrumb-item fw-bold" aria-current="page">
            {card && card.str_prospect}
        </li>  
    </ol>
    {card ? <>
    <hr className='mt-4'></hr>
    <Row className='mt-2 mb-2' xl={2} sm={2} xs={1}>
        <Col className='d-flex flex-column'>
            <Row xs={1} xl={1} className='gy-2'>
                <h6 style={{fontSize: '14px'}} className='fw-bold mb-0'>Informações do Card</h6>
                <Col>
                    <strong className='me-1'>Prazo:</strong>
                    <span className={`badge bg-${card.pipefy.color_date} ms-1`} style={{fontSize: '.75rem'}}>
                        {card.pipefy.due_date ? card.pipefy.due_date : '-'}
                    </span>
                </Col>
                <Col>
                    <strong className='me-1'>Produto:</strong>
                    <span className='my-1 text-info'>{card.produto ? card.produto : '-'}</span>
                </Col>
                <Col>
                    <strong className='me-1'>Classificação:</strong>
                    <span className='my-1 text-info'>{card.classificacao ? card.classificacao : '-'}</span>
                </Col>
                <Col className='mb-2'>
                    <strong className='me-1'>Responsáveis:</strong>
                {card.pipefy.responsavel && card.pipefy.responsavel.map(resp => 
                    <Col className='mt-1' xl={4} sm={6} key={resp.name}>
                        <div className="text-start">
                            <img className="rounded-circle me-1" src={resp.avatarUrl} alt="Avatar" style={{width: '24px'}}/>
                            <span style={{fontSize: '11px'}}><span className="fw-semibold">{ resp.name }</span></span>
                        </div>
                    </Col>
                )}
                </Col>
                <hr className='ms-3 w-100'></hr>
            </Row>
            <div>
                <Button className='col-auto btn-success btn-sm px-2' style={{fontSize:'10px'}} onClick={() => setModalform({show:true, type:'status'})}>
                    Alterar Prazo
                </Button>
            </div>
        </Col>
        <Col className='d-flex flex-column'>
            <h6 style={{fontSize: '14px'}} className='fw-bold mb-2'>Monitoramento Prazos</h6>
            {monitoramentos && monitoramentos.map(m => 
                <div className='mb-3 d-flex align-items-center' key={m.id}>
                    <OverlayTrigger
                        overlay={
                            <Tooltip id="overlay-trigger-example">
                                {`${m.user}`}
                            </Tooltip>
                        }
                    >
                        <img className='p-0 rounded-circle me-2' style={{width: '42px', height: '38px'}} 
                            src={`${process.env.REACT_APP_API_URL}${m.avatar}`}
                        />
                    </OverlayTrigger>
                    <Card as={Col}>
                        <Card.Header className='text-end py-1'>
                            <span className='fw-bold me-2'>{m.data_vencimento}</span>
                            <FontAwesomeIcon onClick={() => setModal({show:true, 
                                link:`${process.env.REACT_APP_API_URL}/pipefy/monitoramento-prazos/${m.id}/`})} 
                                icon={faTrash} className='text-danger ms-2 cursor-pointer'
                            />
                        </Card.Header>
                        <Card.Body className='pt-0 pb-2'>
                            {m.description}
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
    <ModalDelete show={modal.show} link={modal.link} close={() => setModal({...modal, show:false})} update={submit} />
    <Modal
        size="xl"
        show={modalform.show}
        onHide={() => setModalform({show:false})}
        dialogClassName="mt-7"
        aria-labelledby="example-modal-sizes-title-lg"
    >
        <Modal.Header>
        <Modal.Title id="example-modal-sizes-title-lg" style={{fontSize: '16px'}}>
            Adicionar Alteração de Prazo
        </Modal.Title>
            <CloseButton onClick={() => setModalform({show:false})}/>
        </Modal.Header>
        <Modal.Body>
            <Row className="flex-center sectionform">
                <FormMonitoramento hasLabel data={card} submit={submit}/>
            </Row>
        </Modal.Body>
    </Modal>
    </>
    );
};
  
export default ViewProspect;
  


import React,{useEffect, useState} from 'react';
import { useParams, useNavigate } from "react-router-dom";
import { RetrieveRecord } from '../../../helpers/Data';
import { Link } from 'react-router-dom';
import { Button, Col, Row, Card, OverlayTrigger, Tooltip } from 'react-bootstrap';
import {Placeholder} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen } from '@fortawesome/free-solid-svg-icons';
import { CalendarFill, Kanban, Tools, PencilSquare, PeopleFill, Building } from 'react-bootstrap-icons';
import { PersonFill, ClockHistory } from 'react-bootstrap-icons';

const ViewCardProduto = () => {
    const {id} = useParams()
    const navigate = useNavigate()
    const user = JSON.parse(localStorage.getItem("user"))
    const [card, setCard] = useState();
    const [historyphase, setHistoryPhase] = useState();
    const [comments, setComments] = useState();

    const setter = (data) =>{
        setCard(data)
        setHistoryPhase(data.history_phases)
        setComments(data.comments)
    }

    useEffect(() =>{
        const getdata = async () =>{
            const status = await RetrieveRecord(id, 'pipefy/cards/produtos', setter)
            if(status === 401){
                navigate("/auth/login")
            }
        }
        if ((user.permissions && user.permissions.indexOf("view_cards_produtos") === -1) && !user.is_superuser){
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
            <Link className="link-fx text-primary" to={'/pipefy/pipes/301573538'}>Produtos Pipefy</Link>
        </li>
        <li className="breadcrumb-item fw-bold" aria-current="page">
            {card && card.detalhe}
        </li>  
    </ol>
    {card ? <>
    <Row className='mt-2 mb-2' xl={2} sm={2} xs={1}>
        <Col className='d-flex flex-column'>
            <Row xs={1} xl={1} className='gy-2'>
                <Col>
                    <Kanban className='me-2 text-primary' /><strong className='me-1'>Processo:</strong>
                    <span className='ms-1' style={{fontSize: '.75rem'}}>
                        {card.id}
                    </span>
                </Col>
                <Col>
                    <Tools className='me-2 text-primary'/><strong className='me-1'>Produto:</strong>
                    <span className='ms-1' style={{fontSize: '.75rem'}}>
                        {card.produto ? card.produto : '-'}
                    </span>
                </Col>
                <Col>
                    <PencilSquare className='me-2 text-primary'/><strong className='me-1'>Detalhe:</strong>
                    <span className='ms-1' style={{fontSize: '.75rem'}}>
                        {card.detalhe ? card.detalhe : '-'}
                    </span>
                </Col>
                <Col>
                    <PeopleFill className='me-2 text-primary'/><strong className='me-1'>Beneficiários:</strong>
                    <span className='ms-1' style={{fontSize: '.75rem'}}>
                        {card.list_beneficiarios ? card.list_beneficiarios : '-'}
                    </span>
                </Col>
                <Col>
                    <Building className='me-2 text-primary'/><strong className='me-1'>Instituição:</strong>
                    <span className='ms-1' style={{fontSize: '.75rem'}}>
                        {card.str_instituicao ? card.str_instituicao : '-'}
                    </span>
                </Col>
            </Row>
        </Col>
        <Col className='d-flex flex-column'>
            <Row xs={1} xl={1} className='gy-2'>
                <Col>
                    <PersonFill className='me-2 text-primary'/><strong className='me-1'>Criado Por:</strong>
                    <span className='ms-1' style={{fontSize: '.75rem'}}>
                        {card.data_pipefy.created_by} em {card.data_pipefy.created_at}
                    </span>
                </Col>
                <Col>
                    <ClockHistory className='me-2 text-primary'/><strong className='me-1'>Ativo há:</strong>
                    <span className='ms-1' style={{fontSize: '.75rem'}}>
                        {card.data_pipefy.age_card} dias
                    </span>
                </Col>
                <Col>
                    <Kanban className='me-2 text-primary'/><strong className='me-1'>Fase Atual:</strong>
                    <span className='ms-1 text-info' style={{fontSize: '.75rem'}}>
                        {card.phase_name}
                    </span>
                </Col>
                <Col className='d-flex'>
                        <PeopleFill className='me-2 text-primary'/><strong className='me-2'>Responsáveis:</strong>
                        {card.assignees && card.assignees.map(resp => 
                            <Col className='mt-0' xl={4} sm={6} key={resp.name}>
                                <div className="text-start d-inline-block">
                                    <img className="rounded-circle me-1" src={resp.avatarUrl} alt="Avatar" style={{width: '18px'}}/>
                                    <span style={{fontSize: '11px'}}><span className="fw-semibold">{ resp.name }</span></span>
                                </div>
                            </Col>
                        )}
                </Col>
                <Col>
                    <CalendarFill className='me-2 text-primary'/><strong className='me-1'>Vencimento:</strong>
                    <span className={`ms-1 fw-semibold badge ${card.data_pipefy.card_vencido ? 'bg-danger-subtle text-danger' : 'bg-success-subtle text-success'}`} style={{fontSize: '.70rem'}}>
                        {card.data_pipefy.due_date}
                    </span>
                </Col>
            </Row>
        </Col>
    </Row>
    <Row className='mt-3'>
        <Link to={`http://app.pipefy.com/pipes/301573538#cards/${card.id}`} target="_blank" className='w-auto'>
            <Button className="btn btn-sm fs--2 fw-normal btn-alt-primary shadow-none badge">
                <FontAwesomeIcon icon={faPen} className="px-1" />Editar no Pipefy
            </Button>
        </Link>
    </Row>
    <hr className='mt-3 w-100'></hr>
    <Row>
        <Col>
            <h6 style={{fontSize: '14px'}} className='fw-bold mb-3'>Histórico de Fases ({historyphase.length})</h6>
            {historyphase && historyphase.map(h =>
                <div className='mb-1 d-flex align-items-start' key={h.id}>
                    <div as={Col} className='bg-primary p-2 rounded-2 mt-1 me-3'>
                        <CalendarFill className='text-white m-0 p-0' />
                    </div>
                    <Card as={Col}>
                        <Card.Header className='pt-1 pb-0 row-cols-2 d-flex justify-content-between'>
                            <Card.Title className='fs--2 fw-bold mb-0'>{h.name}</Card.Title>
                            <span className='col-auto'>{h.days} dias nesta fase</span>
                        </Card.Header>
                        <Card.Body className='col-auto pt-0 py-1'>
                           <div><label className='mb-0' style={{fontSize:'10px'}}>Última Entrada:</label> <span style={{fontSize:'10px'}}>{h.lastTimeIn}</span></div>
                           <label className='mb-0' style={{fontSize:'10px'}}>Última Saída:</label> <span style={{fontSize:'10px'}}>{h.lastTimeOut}</span>
                        </Card.Body>
                    </Card>
                </div>
            )}
        </Col>
        <Col>
            <h6 style={{fontSize: '14px'}} className='fw-bold mb-2'>Comentários do card ({comments.length})</h6>
            {comments && comments.map(c =>
                <div class="d-flex mb-3">
                    <img class="rounded-circle me-1" src={c.avatarUrl} 
                        alt="Avatar" style={{width: '30px', height: '30px'}} />
                    <div class="mb-0">
                        <span class="fw-bold text-primary mb-0 me-1 author">{c.author}</span>
                        <span class="fw-bold" style={{fontSize: '11px'}}>{c.created_at}</span><br></br>
                        <span class="" style={{fontSize: '11px'}}>{c.text}</span>
                    </div>
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
    </>
    );
};
  
export default ViewCardProduto;
  


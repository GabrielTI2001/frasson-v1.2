import React,{useEffect, useState} from 'react';
import { useParams, useNavigate } from "react-router-dom";
import { RetrieveRecord } from '../../../helpers/Data';
import { Link } from 'react-router-dom';
import { Button, Col, Row, Card, OverlayTrigger, Tooltip } from 'react-bootstrap';
import {Placeholder, Form} from 'react-bootstrap';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import ModalDelete from '../../../components/Custom/ModalDelete';

const ViewProspect = () => {
    const {id} = useParams()
    const navigate = useNavigate()
    const token = localStorage.getItem("token")
    const user = JSON.parse(localStorage.getItem("user"))
    const [card, setCard] = useState();
    const [monitoramentos, setMonitoramentos] = useState();
    const [modal, setModal] = useState({show:false, link:''});
    const [message, setMessage] = useState();
    const [formData, setformData] = useState({created_by:user.id});

    const setter = (data) =>{
        setCard(data)
        setformData({...formData, prospect:data.id})
        setMonitoramentos(data.monitoramentos)
    }
    const submit = (type, data) =>{
        if (type === 'add') setMonitoramentos([...monitoramentos, data])
        if (type === 'delete'){ 
            setMonitoramentos(monitoramentos.filter(m => m.id !== parseInt(data)))
        }

    }
    const handleApi = async (dadosform) => {
        const link = `${process.env.REACT_APP_API_URL}/pipefy/monitoramento-prazos/`
        const method = 'POST'
        try {
            const response = await fetch(link, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(dadosform)
            });
            const data = await response.json();
            if(response.status === 400){
              setMessage({...data})
            }
            else if (response.status === 401){
              localStorage.setItem("login", JSON.stringify(false));
              localStorage.setItem('token', "");
              navigate("/auth/login");
            }
            else if (response.status === 201 || response.status === 200){
                submit('add', data)
                toast.success("Registro Atualizado com Sucesso!")
            }
        } catch (error) {
            console.error('Erro:', error);
        }
    };
    const handleSubmit = async e => {
        setMessage(null)
        e.preventDefault();
        await handleApi(formData);
    };
    const handleFieldChange = e => {
        setformData({
          ...formData,
          [e.target.name]: e.target.value
        });
      };
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
            <Row>
                <h6 style={{fontSize: '14px'}} className='fw-bold mb-2'>Alterar Prazo</h6>
                <Form onSubmit={handleSubmit}>
                    <Form.Group as={Col} xl={10} className='mb-3'>
                        <Form.Label className='mb-0'>Data Vencimento*</Form.Label>
                        <Form.Control type='date' value={formData.data_vencimento || ''} 
                            onChange={handleFieldChange}
                            name='data_vencimento'
                        />
                        <label className='text-danger'>{message ? message.data_vencimento : ''}</label>
                    </Form.Group>
                    <Form.Group as={Col} xl={10} className='mb-3'>
                        <Form.Label className='mb-0'>Descrição*</Form.Label>
                        <Form.Control as='textarea' value={formData.description || ''} 
                            onChange={handleFieldChange}
                            name='description'
                        />
                        <label className='text-danger'>{message ? message.description : ''}</label>
                    </Form.Group>
                    <Form.Group as={Col} xl={10}>
                        <Button type='submit'>Registrar</Button>
                    </Form.Group>
                </Form>
            </Row>
        </Col>
        <Col className='d-flex flex-column'>
            <h6 style={{fontSize: '14px'}} className='fw-bold mb-2'>Monitoramento Prazos</h6>
            {monitoramentos && monitoramentos.map(m => 
                <div className='mb-3 d-flex align-items-center' key={m.id}>
                    <OverlayTrigger
                        overlay={
                            <Tooltip style={{ position: 'fixed', fontSize: '10px', padding: '2px !important' }} id="overlay-trigger-example">
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
    </>
    );
};
  
export default ViewProspect;
  


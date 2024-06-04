import React,{useEffect, useState} from 'react';
import { useNavigate } from "react-router-dom";
import { Link } from 'react-router-dom';
import { Col, Row, Card, OverlayTrigger, Tooltip, Modal, CloseButton } from 'react-bootstrap';
import {Placeholder} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faReply } from '@fortawesome/free-solid-svg-icons';
import ModalDelete from '../../../components/Custom/ModalDelete';
import { HandleSearch } from '../../../helpers/Data';
import ViewFeedback from './View';

const IndexFeedbacks = () => {
    const navigate = useNavigate()
    const user = JSON.parse(localStorage.getItem("user"))
    const [feedbacks, setFeedbacks] = useState();
    const [modal, setModal] = useState({show:false, link:''});
    const [modalform, setModalform] = useState({show:false, type:''});

    const setter = (data) =>{
        setFeedbacks(data)
    }
    const submit = (type, data) =>{
        if (type === 'add') setFeedbacks([...feedbacks, data])
        if (type === 'add_reply') {
            setFeedbacks([...feedbacks.map(f =>(
                f.id === data.id ? {...f, replys:[...f.replys, data]} : f
            ))])
        }           
        if (type === 'delete'){ 
            setFeedbacks(feedbacks.filter(m => m.id !== parseInt(data)))
            setModal({show:false})
        }
        if (type === 'edit'){ 
            setFeedbacks([...feedbacks.map(f =>(
                f.id === data.id ? data : f
            ))])
        }
    }
    useEffect(() =>{
        const getdata = async () =>{
            const status = await HandleSearch('', 'register/feedbacks', setter)
            if(status === 401){
                navigate("/auth/login")
            }
        }
        if ((user.permissions && user.permissions.indexOf("ver_feedbacks_users") === -1) && !user.is_superuser){
            navigate("/error/403")
        }
        if (!feedbacks){
            getdata()
        }

    },[])

    return (
    <>
    <ol className="breadcrumb breadcrumb-alt fs-xs">
        <li className="breadcrumb-item fw-bold">
            <Link className="link-fx text-primary" to={'/administrator'}>Administrator Panel</Link>
        </li>
        <li className="breadcrumb-item fw-bold" aria-current="page">
            Feedbacks
        </li>  
    </ol>
    {feedbacks ? <>
    <Row className='mt-2 mb-2' xl={1} sm={1} xs={1}>
        <Col className='d-flex flex-column'>
            <h6 style={{fontSize: '12px'}} className='fw-bold mb-2'>Feedbacks</h6>
            {feedbacks && feedbacks.map(f => 
                <div className='mb-3 d-flex align-items-center' key={f.id}>
                    <OverlayTrigger
                        overlay={
                            <Tooltip id="overlay-trigger-example">
                                {`${f.str_user}`}
                            </Tooltip>
                        }
                    >
                        <img className='p-0 rounded-circle me-2' style={{width: '42px', height: '38px'}} 
                            src={`${process.env.REACT_APP_API_URL}${f.user_avatar}`} alt='avatar'
                        />
                    </OverlayTrigger>
                    <Card as={Col}>
                        <Card.Header className='d-flex justify-content-between py-1 row' xl={2} sm={2} xs={1}>
                            <Col xl='auto' sm='auto'>
                                <span className="fw-bold">{ f.str_category }</span>
                            </Col>
                            <Col xl='auto' sm='auto' xs={12}>
                                <span className='fw-bold me-2'>
                                    {new Date(f.created_at).toLocaleDateString('pt-br', {timeZone:'UTC'})+' '}
                                    {new Date(f.created_at).toLocaleTimeString('pt-br', {timeZone:'UTC'})}
                                </span>
                                <OverlayTrigger
                                    overlay={
                                        <Tooltip id="overlay-trigger-example">
                                            {`${f.replys.length === 0 ? 'Nenhuma Resposta' : f.replys.length+' Resposta(s)'}`}
                                        </Tooltip>
                                    }
                                >
                                    <FontAwesomeIcon onClick={() => setModalform({show:true, data:f})}
                                        icon={faReply} className='text-primary me-2 cursor-pointer'
                                    />
                                </OverlayTrigger>
                                <span className='me-2'>({f.replys.length})</span>
                                <FontAwesomeIcon onClick={() => setModal({show:true, 
                                    link:`${process.env.REACT_APP_API_URL}/register/feedbacks/${f.id}/`})} 
                                    icon={faTrash} className='text-danger ms-2 cursor-pointer'
                                />
                            </Col>
                        </Card.Header>
                        <Card.Body className='pt-0 pb-2'>
                            {f.text ? f.text : 'Sem Detalhamentos'}
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
        update={submit} 
    />
    <Modal
        size="xl"
        show={modalform.show}
        onHide={() => setModalform({show:false})}
        dialogClassName="mt-2"
        aria-labelledby="example-modal-sizes-title-lg"
    >
        <Modal.Header>
        <Modal.Title id="example-modal-sizes-title-lg" style={{fontSize: '16px'}}>
            Respostas
        </Modal.Title>
            <CloseButton onClick={() => setModalform({show:false})}/>
        </Modal.Header>
        <Modal.Body className='px-4'>
            <Row className="flex-center sectionform">
                <ViewFeedback feedback={modalform.data} submit={submit}/>
            </Row>
        </Modal.Body>
    </Modal>
    </>
    );
};
  
export default IndexFeedbacks;
  


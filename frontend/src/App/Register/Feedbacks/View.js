import React, { useState, useEffect} from "react";
import { Button, Form, Col, Card, OverlayTrigger, Tooltip, Modal, CloseButton, Row} from 'react-bootstrap';
import ModalDelete from "../../../components/Custom/ModalDelete";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPencil, faTrash } from "@fortawesome/free-solid-svg-icons";
import { toast } from 'react-toastify';
import { useNavigate } from "react-router-dom";
import EditFeedback from "./Edit";
import { RetrieveRecord } from "../../../helpers/Data";
import { RedirectToLogin } from "../../../Routes/PrivateRoute";


const ViewFeedback = ({feedback, submit}) =>{
    const navigate = useNavigate()
    const [formData, setFormData] = useState({
        feedback: feedback ? feedback.id : null
    });
    const [message, setMessage] = useState()
    const [datafeedback, setDataFeedback] = useState()
    const token = localStorage.getItem("token")
    const [modal, setModal] = useState({show:false, link:''});
    const [modalform, setModalform] = useState({show:false, data:{}});

    const handleApi = async (dadosform) => {
        const link = `${process.env.REACT_APP_API_URL}/register/feedbacks-reply/`
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
              RedirectToLogin(navigate);
            }
            else if (response.status === 201 || response.status === 200){
                toast.success("Resposta Registrada!")
                setDataFeedback({...datafeedback, replys:[...datafeedback.replys, data]})
                submit('edit', {...datafeedback, replys:[...datafeedback.replys, data]})
            }
        } catch (error) {
            console.error('Erro:', error);
        }
    };
    const handleFieldChange = e => {
        setFormData({
          ...formData,
          [e.target.name]: e.target.value
        });
    };
    const handleSubmit = e => {
        setMessage(null)
        e.preventDefault();
        handleApi(formData);
    };
    const submitreply = (type, data) =>{
        if (type === 'edit') {
            setDataFeedback({...datafeedback, replys:datafeedback.replys.map(f =>(
                f.id === data.id ? data : f
            ))})
            setModalform({show:false})
        }           
        if (type === 'delete'){ 
            setDataFeedback({...datafeedback, replys:datafeedback.replys.filter(r => r.id !== parseInt(data))})
            setModal({show:false})
            submit('edit', {...datafeedback, replys:datafeedback.replys.filter(r => r.id !== parseInt(data))} )
        }
    }
    useEffect(() =>{
        const getdata = async () =>{
            const status = await RetrieveRecord(feedback.id, 'register/feedbacks', (data) => setDataFeedback(data))
            if(status === 401){
                RedirectToLogin(navigate)
            }
        }
        if (!datafeedback){
            getdata()
        }

    },[])
    

    return(
        <>
        {datafeedback &&
        <div className='mb-3 d-flex align-items-center'>
            <OverlayTrigger
                overlay={
                    <Tooltip id="overlay-trigger-example">
                        {`${datafeedback.str_user}`}
                    </Tooltip>
                }
            >
                <img className='p-0 rounded-circle me-2' style={{width: '42px', height: '38px'}} 
                    src={`${process.env.REACT_APP_API_URL}${datafeedback.user_avatar}`} alt="avatar"
                />
            </OverlayTrigger>
            <Card as={Col} className="bg-200">
                <Card.Header className='d-flex justify-content-between py-1'>
                    <Col xl='auto'>
                        <span className="fw-bold text-upper">{ datafeedback.str_category }</span>
                    </Col>
                    <Col xl='auto'>
                        <span className='fw-bold me-2'>
                            {new Date(datafeedback.created_at).toLocaleDateString('pt-br', {timeZone:'UTC'})+' '}
                            {new Date(datafeedback.created_at).toLocaleTimeString('pt-br')}
                        </span>
                    </Col>
                </Card.Header>
                <Card.Body className='pt-0 pb-2'>
                    {datafeedback.text ? datafeedback.text : 'Sem Detalhamentos'}
                </Card.Body>
            </Card>
        </div>
        }
        <div>
            <Form onSubmit={handleSubmit} className='row'>
                <Form.Group className="mb-2" as={Col} xl={12} xxl={12}>
                    <Form.Label className='fw-bold mb-1'>Resposta*</Form.Label>
                    <Form.Control
                        value={formData.text || ''}
                        name="text"
                        onChange={handleFieldChange}
                        type="text"
                        as='textarea'
                    />
                    <label className='text-danger'>{message ? message.text : ''}</label>
                </Form.Group>
                <Form.Group className={`mb-0 text-end`}>
                    <Button className="w-40" type="submit">
                        Responder Feedback
                    </Button>
                </Form.Group> 
            </Form>
            <hr className="mb-1"></hr>
        </div>
        <div>
            <h6 className="fs--2 fw-bold mb-2">{datafeedback && datafeedback.replys.length} resposta(s) para esse feedback</h6>
            {datafeedback && datafeedback.replys.map(r =>
                <Card as={Col} className="bg-200 mb-2" key={r.id}>
                    <Card.Header className='d-flex justify-content-between py-1'>
                        <Col xl='auto'>
                            <span className='fw-bold me-2'>
                                {new Date(r.created_at).toLocaleDateString('pt-br', {timeZone:'UTC'})+' '}
                                {new Date(r.created_at).toLocaleTimeString('pt-br')}
                            </span>
                        </Col>
                        <Col xl='auto'>
                            <FontAwesomeIcon onClick={() => setModalform({show:true, data:r})} 
                                icon={faPencil} className='text-primary ms-2 cursor-pointer'
                            />
                            <FontAwesomeIcon onClick={() => setModal({show:true, 
                                link:`${process.env.REACT_APP_API_URL}/register/feedbacks-reply/${r.id}/`})} 
                                icon={faTrash} className='text-danger ms-2 cursor-pointer'
                            />
                        </Col>
                    </Card.Header>
                    <Card.Body className='pt-0 pb-2'>
                        {r.text ? r.text : 'Sem Detalhamentos'}
                    </Card.Body>
                </Card>
            )}
        </div>
        <ModalDelete show={modal.show} link={modal.link} close={() => setModal({...modal, show:false})} 
            update={submitreply} 
        />
        <Modal
            size="lg"
            show={modalform.show}
            onHide={() => setModalform({show:false})}
            dialogClassName="mt-5"
            aria-labelledby="example-modal-sizes-title-lg"
        >
            <Modal.Header>
            <Modal.Title id="example-modal-sizes-title-lg" style={{fontSize: '16px'}}>
                Editar Feedback
            </Modal.Title>
                <CloseButton onClick={() => setModalform({show:false})}/>
            </Modal.Header>
            <Modal.Body className='px-4'>
                <Row className="flex-center sectionform">
                    <EditFeedback data={modalform.data} submit={submitreply} />
                </Row>
            </Modal.Body>
        </Modal>
        </>
    )
}

export default ViewFeedback;
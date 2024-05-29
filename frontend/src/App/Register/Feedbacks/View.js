import React, { useState, useEffect, useContext } from "react";
import { Button, Form, Col, Card, OverlayTrigger, Tooltip} from 'react-bootstrap';
import { toast } from 'react-toastify';
import { ProfileContext } from "../../../context/Context";
import { useNavigate } from "react-router-dom";


const ViewFeedback = ({feedback}) =>{
    const user = JSON.parse(localStorage.getItem('user'))
    const navigate = useNavigate()
    const [formData, setFormData] = useState({
        feedback_id: feedback ? feedback.id : null
    });
    const [message, setMessage] = useState()
    const [datafeedback, setDataFeedback] = useState(feedback)
    const token = localStorage.getItem("token")
    const {profileState:{perfil}} = useContext(ProfileContext)
    console.log(formData)

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
              navigate("/auth/login");
            }
            else if (response.status === 201 || response.status === 200){
                toast.success("Resposta Registrada!")
                setDataFeedback({...datafeedback, replys:[...datafeedback.replys, data]})
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
    useEffect(()=>{
    },[])
    

    return(
        <>
        <div className='mb-3 d-flex align-items-center'>
            <OverlayTrigger
                overlay={
                    <Tooltip id="overlay-trigger-example">
                        {`${datafeedback.str_user}`}
                    </Tooltip>
                }
            >
                <img className='p-0 rounded-circle me-2' style={{width: '42px', height: '38px'}} 
                    src={`${process.env.REACT_APP_API_URL}${datafeedback.user_avatar}`}
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
                            {new Date(datafeedback.created_at).toLocaleTimeString('pt-br', {timeZone:'UTC'})}
                        </span>
                    </Col>
                </Card.Header>
                <Card.Body className='pt-0 pb-2'>
                    {datafeedback.text ? datafeedback.text : 'Sem Detalhamentos'}
                </Card.Body>
            </Card>
        </div>
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
            <h6 className="fs--2 fw-bold mb-2">{datafeedback.replys.length} resposta(s) para esse feedback</h6>
            {datafeedback.replys.map(r =>
                <Card as={Col} className="bg-200 mb-2" key={r.id}>
                    <Card.Header className='d-flex justify-content-between py-1'>
                        <Col xl='auto'>
                            <span className='fw-bold me-2'>
                                {new Date(r.created_at).toLocaleDateString('pt-br', {timeZone:'UTC'})+' '}
                                {new Date(r.created_at).toLocaleTimeString('pt-br', {timeZone:'UTC'})}
                            </span>
                        </Col>
                    </Card.Header>
                    <Card.Body className='pt-0 pb-2'>
                        {r.text ? r.text : 'Sem Detalhamentos'}
                    </Card.Body>
                </Card>
            )}
        </div>
        </>
    )
}

export default ViewFeedback;
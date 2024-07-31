import React, { useState, useEffect} from "react";
import { useNavigate } from "react-router-dom";
import { Button, Form, Col} from 'react-bootstrap';
import { toast } from 'react-toastify';
import { RedirectToLogin } from "../../../Routes/PrivateRoute";

const EditFeedback = ({data, submit}) =>{
    const [formData, setFormData] = useState();
    const [message, setMessage] = useState()
    const navigate = useNavigate();
    const token = localStorage.getItem("token")

    const handleApi = async (dadosform) => {
        const link = `${process.env.REACT_APP_API_URL}/register/feedbacks-reply/${data.id}/`
        const method = 'PUT'
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
                toast.success("Registro Atualizado com Sucesso!")
                submit('edit', data)
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
        if(!formData){ 
            const {created_at, ...rest} = data;
            setFormData({...rest})
        }
    },[])
    
    return(
        <>
        <Form onSubmit={handleSubmit} className='row'>
            <Form.Group className="mb-2" as={Col} xl={12} xxl={12}>
                <Form.Label className='fw-bold mb-1'>Resposta*</Form.Label>
                <Form.Control
                    value={formData && formData.text || ''}
                    name="text"
                    onChange={handleFieldChange}
                    type="text"
                    as='textarea'
                />
                <label className='text-danger'>{message ? message.description : ''}</label>
            </Form.Group>

            <Form.Group className={`mb-0 text-end`}>
                <Button className="w-40" type="submit">
                    Edit Feedback 
                </Button>
            </Form.Group> 
        </Form>
        </>
    )
}

export default EditFeedback;
import React,{useState} from 'react';
import { useParams, useNavigate } from "react-router-dom";
import { Button, Col,} from 'react-bootstrap';
import {Form} from 'react-bootstrap';
import { toast } from 'react-toastify';

const FormMonitoramento = ({data, submit}) => {
    const navigate = useNavigate()
    const token = localStorage.getItem("token")
    const user = JSON.parse(localStorage.getItem("user"))
    const [message, setMessage] = useState();
    const [formData, setformData] = useState({created_by:user.id, prospect:data.id});

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
                submit('add', {...data, data_vencimento: new Date(data.data_vencimento).toLocaleDateString('pt-BR', {timeZone: 'UTC'})})
                toast.success("Registro Adicionado com Sucesso!")
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

    return (
    <Form onSubmit={handleSubmit}>
        <Form.Group as={Col} xl={4} className='mb-3'>
            <Form.Label className='mb-0'>Data Vencimento*</Form.Label>
            <Form.Control type='date' value={formData.data_vencimento || ''} 
                onChange={handleFieldChange}
                name='data_vencimento'
            />
            <label className='text-danger'>{message ? message.data_vencimento : ''}</label>
        </Form.Group>
        <Form.Group as={Col} xl={12} className='mb-3'>
            <Form.Label className='mb-0'>Descrição*</Form.Label>
            <Form.Control as='textarea' value={formData.description || ''} 
                onChange={handleFieldChange}
                name='description'
            />
            <label className='text-danger'>{message ? message.description : ''}</label>
        </Form.Group>
        <Form.Group as={Col} xl={12}>
            <Button type='submit'>Registrar</Button>
        </Form.Group>
    </Form>
    );
};
  
export default FormMonitoramento;
  


import React,{useState, useEffect} from 'react';
import { useNavigate } from "react-router-dom";
import { Button, Col,} from 'react-bootstrap';
import {Form} from 'react-bootstrap';
import { toast } from 'react-toastify';

const FormProcesso = ({type, data, submit}) => {
    const navigate = useNavigate()
    const token = localStorage.getItem("token")
    const user = JSON.parse(localStorage.getItem("user"))
    const [message, setMessage] = useState();
    const [formData, setformData] = useState({user:user.id});
    
    const handleApi = async (dadosform) => {
        const link = `${process.env.REACT_APP_API_URL}/processes/followup/${type == 'edit' ? data.id : ''}/`
        const method = type == 'edit' ? 'PUT' : 'POST';
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
                submit('edit', data)
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
        if (type == 'edit'){
            const {inema, pipefy, acompanhamentos, ...rest} = data;
            setformData({...formData, ...rest, created_at:null, updated_at:null})
        }
    },[])

    return (
    <Form onSubmit={handleSubmit} className='row'>
        <Form.Group as={Col} xl={4} className='mb-3'>
            <Form.Label className='mb-0'>Data Requerimento*</Form.Label>
            <Form.Control type='date' value={formData.data_requerimento || ''} 
                onChange={handleFieldChange}
                name='data_requerimento'
            />
            <label className='text-danger'>{message ? message.data_requerimento : ''}</label>
        </Form.Group>
        <Form.Group as={Col} xl={4} className='mb-3'>
            <Form.Label className='mb-0'>N° Requerimento*</Form.Label>
            <Form.Control type='text' value={formData.requerimento || ''} 
                onChange={handleFieldChange}
                name='requerimento'
            />
            <label className='text-danger'>{message ? message.requerimento : ''}</label>
        </Form.Group>
        <Form.Group as={Col} xl={4} className='mb-3'>
            <Form.Label className='mb-0'>Data Enquadramento</Form.Label>
            <Form.Control type='date' value={formData.data_enquadramento || ''} 
                onChange={handleFieldChange}
                name='data_enquadramento'
            />
            <label className='text-danger'>{message ? message.data_enquadramento : ''}</label>
        </Form.Group>
        <Form.Group as={Col} xl={4} className='mb-3'>
            <Form.Label className='mb-0'>Data Validação</Form.Label>
            <Form.Control type='date' value={formData.data_validacao || ''} 
                onChange={handleFieldChange}
                name='data_validacao'
            />
            <label className='text-danger'>{message ? message.data_validacao : ''}</label>
        </Form.Group>
        <Form.Group as={Col} xl={4} className='mb-3'>
            <Form.Label className='mb-0'>Valor Boleto (R$)</Form.Label>
            <Form.Control type='number' value={formData.valor_boleto || ''} 
                onChange={handleFieldChange}
                name='valor_boleto'
            />
            <label className='text-danger'>{message ? message.valor_boleto : ''}</label>
        </Form.Group>
        <Form.Group as={Col} xl={4} className='mb-3'>
            <Form.Label className='mb-0'>Vencimento Boleto</Form.Label>
            <Form.Control type='date' value={formData.vencimento_boleto || ''} 
                onChange={handleFieldChange}
                name='vencimento_boleto'
            />
            <label className='text-danger'>{message ? message.vencimento_boleto : ''}</label>
        </Form.Group>
        <Form.Group as={Col} xl={4} className='mb-3'>
            <Form.Label className='mb-0'>Data Formação</Form.Label>
            <Form.Control type='date' value={formData.data_formacao || ''} 
                onChange={handleFieldChange}
                name='data_formacao'
            />
            <label className='text-danger'>{message ? message.data_formacao : ''}</label>
        </Form.Group>
        <Form.Group as={Col} xl={4} className='mb-3'>
            <Form.Label className='mb-0'>N° Processo</Form.Label>
            <Form.Control type='text' value={formData.numero_processo || ''} 
                onChange={handleFieldChange}
                name='numero_processo'
            />
            <label className='text-danger'>{message ? message.numero_processo : ''}</label>
        </Form.Group>
        <Form.Group as={Col} xl={4} className='mb-3'>
            <Form.Label className='mb-0'>N° Processo SEI</Form.Label>
            <Form.Control type='text' value={formData.processo_sei || ''} 
                onChange={handleFieldChange}
                name='processo_sei'
            />
            <label className='text-danger'>{message ? message.processo_sei : ''}</label>
        </Form.Group>
        <Form.Group as={Col} xl={12} className='text-end'>
            <Button type='submit'>{type == 'edit' ? 'Atualizar Processo' : 'Adicionar'}</Button>
        </Form.Group>
    </Form>
    );
};
  
export default FormProcesso;
  


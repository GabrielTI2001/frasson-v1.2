import React,{useEffect, useState} from 'react';
import { useNavigate } from "react-router-dom";
import { Button, Col} from 'react-bootstrap';
import {Form} from 'react-bootstrap';
import { toast } from 'react-toastify';
import { fetchStatus } from '../Data';

const FormAcomp = ({data, submit}) => {
    const navigate = useNavigate()
    const token = localStorage.getItem("token")
    const user = JSON.parse(localStorage.getItem("user"))
    const [statuslist, setStatuslist] = useState();
    const [message, setMessage] = useState();
    const [formData, setformData] = useState({user:user.id, processo:data.id});

    const handleApi = async (dadosform) => {
        const link = `${process.env.REACT_APP_API_URL}/processes/acompanhamentos/`
        const method = 'POST'
        try {
            const response = await fetch(link, {
                method: method,
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: dadosform
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
                submit('add', {...data, data: new Date(data.data).toLocaleDateString('pt-BR', {timeZone: 'UTC'}), status:data.str_status})
                toast.success("Registro Atualizado com Sucesso!")
            }
        } catch (error) {
            console.error('Erro:', error);
        }
    };
    const handleSubmit = async e => {
        setMessage(null)
        e.preventDefault();
        const formDataToSend = new FormData();
        for (const key in formData) {
          formDataToSend.append(key, formData[key]);
        }  
        await handleApi(formDataToSend);
    };
    const handleFieldChange = e => {
        setformData({
          ...formData,
          [e.target.name]: e.target.value
        });
    };
    const handleFileChange = (e) => {
        setformData({...formData, [e.target.name]:e.target.files[0]})
    };
    useEffect(() =>{
        const getoptions = async () =>{
            const options = await fetchStatus()
            setStatuslist(options)
        }
        if (!statuslist){
            getoptions()
        }
    },[])

    return (
    <Form onSubmit={handleSubmit} className='row'>
        <Form.Group as={Col} xl={4} className='mb-3'>
            <Form.Label className='mb-0 fw-bold'>Data*</Form.Label>
            <Form.Control type='date' value={formData.data || ''} 
                onChange={handleFieldChange}
                name='data'
            />
            <label className='text-danger'>{message ? message.data : ''}</label>
        </Form.Group>

        <Form.Group className="mb-2" as={Col} xl={4}>
            <Form.Label className='fw-bold mb-1'>Status*</Form.Label>
            <Form.Select
              value={formData.status || ''}
              name="status"
              onChange={handleFieldChange}
              type="select"
            >
              <option value={undefined}>----</option>
              {statuslist &&( statuslist.map( c =>(
                <option key={c.value} value={c.value}>{c.label}</option>
              )))}
            </Form.Select>
            <label className='text-danger'>{message ? message.status : ''}</label>
        </Form.Group>

        <Form.Group as={Col} xl={4} className='mb-3'>
            <Form.Label className='fw-bold mb-0'>Arquivo</Form.Label>
            <Form.Control type='file' onChange={handleFileChange} name='file'/>
            <label className='text-danger'>{message ? message.file : ''}</label>
        </Form.Group>

        <Form.Group as={Col} xl={12} className='mb-3'>
            <Form.Label className='mb-0 fw-bold'>Detalhamento</Form.Label>
            <Form.Control as='textarea' value={formData.detalhamento || ''} 
                onChange={handleFieldChange}
                name='detalhamento'
            />
            <label className='text-danger'>{message ? message.detalhamento : ''}</label>
        </Form.Group>
        <Form.Group as={Col} className='text-end'>
            <Button type='submit'>Registrar</Button>
        </Form.Group>
    </Form>
    );
};
  
export default FormAcomp;
  


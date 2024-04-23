import React, { useState} from "react";
import { Form, Col, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const AllowedEmailsForm = ({hasLabel, type, submit, dados}) => {
    const [formData, setFormData] = useState({});
    const [message, setMessage] = useState()
    const navigate = useNavigate();
    const token = localStorage.getItem("token")

    const handleApi = async (dadosform) => {
        const link =`${process.env.REACT_APP_API_URL}/users/allowed-emails/${type === 'edit' ? dados.id+'/' : ''}`
        const method = type === 'edit' ? 'PUT' : 'POST'
    
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
              const next = window.location.href.toString().split(process.env.REACT_APP_HOST)[1]
              navigate(`/auth/login?next=${next}`);
            }
            else if (response.status === 201 || response.status === 200){
              if (type === 'edit'){
                toast.success("Registro Atualizado com Sucesso!")
                submit('edit', {id: dados.id, dados:data})
              }
              else{
                toast.success("Registro Efetuado com Sucesso!")
                submit('add', data)
              }
            }
        } catch (error) {
            console.error('Erro:', error);
        }
      };

    const handleSubmit = e => {
        setMessage(null)
        e.preventDefault();
        handleApi(formData);
    };
    
    const handleFieldChange = e => {
        setFormData({
          ...formData,
          [e.target.name]: e.target.value
        });
    };

    return (
        <Form onSubmit={handleSubmit} className='row'>
            <Form.Group className="mb-2" as={Col} lg={3} xl={3} sm={3}>
                {hasLabel && <Form.Label className='fw-bold mb-1'>E-Mail*</Form.Label>}
                <Form.Control
                    placeholder={!hasLabel ? 'E-Mail' : ''}
                    value={formData.email || ''}
                    name="email"
                    onChange={handleFieldChange}
                    type="email"
                />
                <label className='text-danger'>{message ? message.email : ''}</label>
            </Form.Group>

            <Form.Group as={Col} lg='auto' sm='auto' xl='auto'
                className={`mb-0 ${type === 'edit' ? 'text-start' : 'text-end'}`}>
            <Button
                className="w-40"
                type="submit"
                >
                {type === 'edit' ? "Atualizar E-Mail"
                : "Autorizar E-Mail"}
            </Button>
            </Form.Group>  
        </Form>
    );
}

export default AllowedEmailsForm;
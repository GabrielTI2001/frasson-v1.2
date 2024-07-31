import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Form, Col} from 'react-bootstrap';
import { SelectOptions } from "../../../helpers/Data";
import { toast } from 'react-toastify';
import { ProfileContext } from "../../../context/Context";
import { RedirectToLogin } from "../../../Routes/PrivateRoute";

const NewFeedback = () =>{
    const user = JSON.parse(localStorage.getItem('user'))
    const [formData, setFormData] = useState({
      created_by: user.id
    });
    const [message, setMessage] = useState()
    const [categorias, setCategorias] = useState()
    const navigate = useNavigate();
    const token = localStorage.getItem("token")
    const {profileState:{perfil}} = useContext(ProfileContext)

    const handleApi = async (dadosform) => {
        const link = `${process.env.REACT_APP_API_URL}/register/feedbacks/`
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
                toast.success("Registro Efetuado com Sucesso!")
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
        const loadFormData = async () => {
            const options = await SelectOptions('register/feedbacks-category', 'description')
            Array.isArray(options) ? setCategorias(options) : RedirectToLogin(navigate)
        }
        loadFormData()
    },[])
    

    return(
        <>
        <ol className="breadcrumb breadcrumb-alt fs-xs mb-3">
            <li className="breadcrumb-item fw-bold">
                Feedbacks da Aplicação
            </li>
        </ol>
        <h5 className="fs--2 fw-bold text-primary mb-3 mt-1">{perfil && perfil.first_name}, dê o seu feedback e ajude-nos a melhorar nossa aplicação.</h5>
        <Form onSubmit={handleSubmit} className='row'>
            <div>
                <Form.Group className="mb-2" as={Col} xl={3} sm={4}>
                    <Form.Label className='fw-bold mb-1'>Tipo de Feedback*</Form.Label>
                    <Form.Select
                        value={formData.category || ''}
                        name="category"
                        onChange={handleFieldChange}
                        type="select"
                    >
                        <option value={undefined}>----</option>
                        {categorias && ( categorias.map( c =>(
                            <option key={c.value} value={c.value}>{c.label}</option>
                        )))}
                    </Form.Select>
                    <label className='text-danger'>{message ? message.category : ''}</label>
                </Form.Group>
            </div>

            <Form.Group className="mb-2" as={Col} xl={12} xxl={12}>
                <Form.Label className='fw-bold mb-1'>Descreva seu Feedback*</Form.Label>
                <Form.Control
                    value={formData.description || ''}
                    name="description"
                    onChange={handleFieldChange}
                    type="text"
                    as='textarea'
                />
                <label className='text-danger'>{message ? message.description : ''}</label>
            </Form.Group>

            <Form.Group className={`mb-0 text-end`}>
                <Button className="w-40" type="submit">
                    Registrar Feedback
                </Button>
            </Form.Group> 
        </Form>
        </>
    )
}

export default NewFeedback;
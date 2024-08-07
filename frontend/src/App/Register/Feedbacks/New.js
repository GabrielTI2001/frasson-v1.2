import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Form, Col} from 'react-bootstrap';
import { SelectOptions, sendData } from "../../../helpers/Data";
import { toast } from 'react-toastify';
import { ProfileContext } from "../../../context/Context";
import { RedirectToLogin } from "../../../Routes/PrivateRoute";
import CustomBreadcrumb from "../../../components/Custom/Commom";

const NewFeedback = () =>{
    const user = JSON.parse(localStorage.getItem('user'))
    const [formData, setFormData] = useState({
      created_by: user.id
    });
    const [message, setMessage] = useState()
    const [categorias, setCategorias] = useState()
    const navigate = useNavigate();
    const {profileState:{perfil}} = useContext(ProfileContext)

    const handleApi = async (dadosform) => {
        const {resposta, dados} = await sendData({type:'add', url:'register/feedbacks', keyfield:null, dadosform:dadosform})
        if(resposta.status === 400){
          setMessage({...dados})
        }
        else if (resposta.status === 401){
          RedirectToLogin(navigate)
        }
        else if (resposta.status === 201 || resposta.status === 200){
          toast.success("Registro Adicionado com Sucesso!")
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
        <CustomBreadcrumb>
            <span className="breadcrumb-item fw-bold">
                Feedbacks da Aplicação
            </span>
        </CustomBreadcrumb>
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
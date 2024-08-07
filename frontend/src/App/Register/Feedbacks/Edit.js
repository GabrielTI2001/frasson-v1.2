import React, { useState, useEffect} from "react";
import { useNavigate } from "react-router-dom";
import { Button, Form, Col} from 'react-bootstrap';
import { toast } from 'react-toastify';
import { RedirectToLogin } from "../../../Routes/PrivateRoute";
import { sendData } from "../../../helpers/Data";

const EditFeedback = ({data, submit}) =>{
    const [formData, setFormData] = useState();
    const [message, setMessage] = useState()
    const navigate = useNavigate();

    const handleApi = async (dadosform) => {
        const {resposta, dados} = await sendData({type:'edit', url:'register/feedbacks-reply', keyfield:data.id, dadosform:dadosform})
        if(resposta.status === 400){
          setMessage({...dados})
        }
        else if (resposta.status === 401){
          RedirectToLogin(navigate)
        }
        else if (resposta.status === 201 || resposta.status === 200){
          submit('edit', dados)
          toast.success("Registro Atualizado com Sucesso!")
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
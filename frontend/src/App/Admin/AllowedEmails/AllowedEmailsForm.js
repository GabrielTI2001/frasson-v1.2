import React, { useState} from "react";
import { Form, Col, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { sendData } from "../../../helpers/Data";
import { RedirectToLogin } from "../../../Routes/PrivateRoute";

const AllowedEmailsForm = ({hasLabel, type, submit}) => {
    const [formData, setFormData] = useState({});
    const [message, setMessage] = useState()
    const navigate = useNavigate();

    const handleApi = async (dadosform) => {
        const {resposta, dados} = await sendData({type:type, url:'users/allowed-emails', keyfield:type === 'edit' ? dados.id : null, 
          dadosform:dadosform})
        if(resposta.status === 400){
          setMessage({...dados})
        }
        else if (resposta.status === 401){
          RedirectToLogin(navigate)
        }
        else if (resposta.status === 201 || resposta.status === 200){
          if (type === 'edit'){
            toast.success("Registro Atualizado com Sucesso!")
            submit('edit', {id: dados.id, dados:dados})
          }
          else{
            toast.success("Registro Efetuado com Sucesso!")
            submit('add', dados)
          }
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
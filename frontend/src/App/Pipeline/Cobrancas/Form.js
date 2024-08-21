import React,{useEffect, useState} from 'react';
import { useNavigate } from "react-router-dom";
import { Button, Col} from 'react-bootstrap';
import {Form} from 'react-bootstrap';
import { toast } from 'react-toastify';
import { sendData } from '../../../helpers/Data';
import { useAppContext } from '../../../Main';
import { RedirectToLogin } from '../../../Routes/PrivateRoute';

const FormCobranca = ({type, data, submit, card}) => {
    const {config: {theme}} = useAppContext();
    const navigate = useNavigate()
    const user = JSON.parse(localStorage.getItem("user"))
    const [message, setMessage] = useState();
    const [formData, setformData] = useState({created_by:user.id, fluxo_ambiental:card ? card.id : '', status:'AD',
      contrato:card.contrato, cliente:card.beneficiario, servico:card.detalhamento
    });
    const [defaultoptions, setDefaultOptions] = useState();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);

    const handleApi = async (dadosform) => {
      const {resposta, dados} = await sendData({type:type, url:'finances/revenues', keyfield:null, dadosform:dadosform})
      if(resposta.status === 400){
        setMessage({...dados})
      }
      else if (resposta.status === 401){
        RedirectToLogin(navigate)
      }
      else if (resposta.status === 201 || resposta.status === 200){
        submit('add', dados)
        toast.success("Registro Atualizado com Sucesso!")
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
      })
    };

    useEffect(() =>{
        const setform = () =>{
          setformData({...data, ...formData})
        }
        if(type === 'edit' && !formData.atividade){
            setform()
        }
        else{
            if(!defaultoptions){
                setDefaultOptions({})
            }
        }
    },[])

    return (
    <Form onSubmit={handleSubmit} className='row' encType='multipart/form-data'>
      <Form.Group className="mb-2" as={Col} xl={12}>
        <Form.Label className='fw-bold mb-1'>Etapa*</Form.Label>
        <Form.Select
          value={formData.etapa || ''}
          name="etapa"
          onChange={handleFieldChange}
          type="select"
        >
          <option value={undefined}>----</option>
          <option value='A'>Assinatura Contrato</option>
          <option value='P'>Protocolo</option>
          <option value='E'>Encerramento</option>
        </Form.Select>
      </Form.Group>

      <Form.Group className="mb-1" as={Col} xl={12}>
        <Form.Label className='fw-bold mb-1 me-1'>Data Previsão Pagamento: </Form.Label>
        <span>{futureDate.toLocaleDateString('pt-br')}</span>
      </Form.Group>

      <label className='text-danger'>{message ? message.non_fields_errors : ''}</label>  
      <Form.Group as={Col} className='text-end' xl={12}>
        <Button type='submit'>Cadastrar</Button>
      </Form.Group>
    </Form>
    );
};
  
export default FormCobranca;
  


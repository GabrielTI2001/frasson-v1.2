import React,{useEffect, useState} from 'react';
import { useNavigate } from "react-router-dom";
import { Button, Col} from 'react-bootstrap';
import {Form} from 'react-bootstrap';
import { toast } from 'react-toastify';
import AsyncSelect from 'react-select/async';
import { SelectSearchOptions } from '../../../helpers/Data';
import customStyles, { customStylesDark } from '../../../components/Custom/SelectStyles';
import { useAppContext } from '../../../Main';
import { RedirectToLogin } from '../../../Routes/PrivateRoute';

const FormCobranca = ({type, data, submit, card}) => {
    const {config: {theme}} = useAppContext();
    const navigate = useNavigate()
    const token = localStorage.getItem("token")
    const user = JSON.parse(localStorage.getItem("user"))
    const [message, setMessage] = useState();
    const [formData, setformData] = useState({created_by:user.id, fluxo_ambiental:card ? card.id : '', status:'AD',
      contrato:card.contrato, cliente:card.beneficiario
    });
    const [defaultoptions, setDefaultOptions] = useState();

    const handleApi = async (dadosform) => {
        const link = `${process.env.REACT_APP_API_URL}/finances/revenues/${type === 'edit' ? data.id+'/' : ''}`
        const method = type === 'edit' ? 'PUT' : 'POST'
        try {
            const response = await fetch(link, {
                method: method,
                headers: {
                    'Authorization': `Bearer ${token}`, 'Content-Type':'application/json'
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
                type === 'edit' ? submit('edit', data) : submit('add', data)
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
        <Form.Group className="mb-1" as={Col} xl={12}>
            <Form.Label className='fw-bold mb-1'>Status*</Form.Label>
            <Form.Select
              value={formData.status || ''}
              name="status"
              onChange={handleFieldChange}
              type="select"
            >
              <option value={undefined}>----</option>
              <option value='AD'>Aguardando Distribuição</option>
              <option value='NT'>Notificação</option>
              <option value='FT'>Faturamento</option>
              <option value='AG'>Agendado</option>
              <option value='PG'>Pago</option>
            </Form.Select>
            <label className='text-danger'>{message ? message.status : ''}</label>
        </Form.Group>

        {defaultoptions && 
          <Form.Group className="mb-2" as={Col} xl={12}>
            <Form.Label className='fw-bold mb-1'>Serviço*</Form.Label>
            <AsyncSelect 
              loadOptions={(value) => SelectSearchOptions(value, 'register/detalhamentos', 'detalhamento_servico', null, false, `contratogai=${card.contrato}`)} 
              name='servicos' styles={theme === 'light'? customStyles : customStylesDark} classNamePrefix="select"
              defaultValue={ type === 'edit' ? (defaultoptions ? defaultoptions.servicos : '') : ''}
              onChange={(selected) => {
                setformData((prevFormData) => ({
                  ...prevFormData,
                  servico: selected.value
                  }));
              }}>
            </AsyncSelect>
            <label className='text-danger'>{message ? message.servico : ''}</label>
          </Form.Group> 
        }  

        <Form.Group className="mb-1" as={Col} xl={12}>
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
            <label className='text-danger'>{message ? message.etapa : ''}</label>
        </Form.Group>

        <Form.Group className="mb-1" as={Col} xl={12}>
            <Form.Label className='fw-bold mb-1'>Data Previsão Pagamento*</Form.Label>
            <Form.Control
              value={formData.data_previsao || ''}
              name="data_previsao"
              onChange={handleFieldChange}
              type="date"
            />
            <label className='text-danger'>{message ? message.data_previsao : ''}</label>
        </Form.Group>

        {defaultoptions && 
          <Form.Group className="mb-2" as={Col} xl={12}>
            <Form.Label className='fw-bold mb-1'>Caixa*</Form.Label>
            <AsyncSelect 
              loadOptions={(value) => SelectSearchOptions(value, 'finances/caixas', 'nome', null, false)} 
              name='caixa' styles={theme === 'light'? customStyles : customStylesDark} classNamePrefix="select"
              defaultValue={ type === 'edit' ? (defaultoptions ? defaultoptions.servicos : '') : ''}
              onChange={(selected) => {
                setformData((prevFormData) => ({
                  ...prevFormData,
                  caixa: selected.value
                  }));
              }}>
            </AsyncSelect>
            <label className='text-danger'>{message ? message.caixa : ''}</label>
          </Form.Group> 
        }
        <label className='text-danger'>{message ? message.non_fields_errors : ''}</label>  
        <Form.Group as={Col} className='text-end' xl={12}>
            <Button type='submit'>Cadastrar</Button>
        </Form.Group>
    </Form>
    );
};
  
export default FormCobranca;
  


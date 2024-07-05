import React,{useEffect, useState} from 'react';
import { useNavigate } from "react-router-dom";
import { Button, Col} from 'react-bootstrap';
import {Form} from 'react-bootstrap';
import { toast } from 'react-toastify';
import AsyncSelect from 'react-select/async';
import { SelectSearchOptions } from '../../../helpers/Data';
import customStyles, { customStylesDark } from '../../../components/Custom/SelectStyles';
import { useAppContext } from '../../../Main';

const FormEtapa = ({type, data, submit, contrato}) => {
    const {config: {theme}} = useAppContext();
    const navigate = useNavigate()
    const token = localStorage.getItem("token")
    const user = JSON.parse(localStorage.getItem("user"))
    const [etapaslist, setEtapasList] = useState();
    const [message, setMessage] = useState();
    const [formData, setformData] = useState({user:user.id, contrato:contrato ? contrato.id : ''});
    const [defaultoptions, setDefaultOptions] = useState();

    const handleApi = async (dadosform) => {
        const link = `${process.env.REACT_APP_API_URL}/finances/contratos-pagamentos-ambiental/${type === 'edit' ? data.id+'/' : ''}`
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
              navigate("/auth/login");
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
    const calcPercent = (v) => {
        const valor = contrato.valor ? (Number(contrato.valor/100)) * Number(v): 0
        setformData({
          ...formData,
          valor: valor, percentual:v
        });
    };
    const handleFieldChange = e => {
        if (e.target.name === 'percentual') {
            calcPercent(e.target.value)
        }
        else{
            setformData({
                ...formData,
                [e.target.name]: e.target.value
            });
        }
    };
    useEffect(() =>{
        const getoptions = () =>{
            const list = [{value:'A', label:'Assinatura Contrato'}, {value:'P', label:'Protocolo'}, {value:'E', label:'Encerramento'}]
            const max = contrato.servicos.length
            // console.log(list)
            if (type !== 'edit'){
                for (let i = list.length - 1; i >= 0; i--){
                    const label = list[i].label
                    if (contrato.etapas.filter(l => l.etapa === label).length >= max){
                        list.splice(i, 1);
                    }
                }
            }
            setEtapasList(list)
        }
        const setform = () =>{
            setformData({...data, ...formData, etapa:data.etapa.substr(0,1).toUpperCase()})
        }
        if (!etapaslist && contrato){
            getoptions()
        }
        if(type === 'edit' && data && !formData.etapa){
            setform()
        }
        else{
            if(!defaultoptions){
                setDefaultOptions({beneficiario:{}, categoria_pagamento:{}})
            }
        }
    },[])

    return (
    <Form onSubmit={handleSubmit} className='row'>
        <Form.Group className="mb-2" as={Col} xl={4}>
            <Form.Label className='fw-bold mb-1'>Etapa Pagamento*</Form.Label>
            <Form.Select
              value={formData.etapa || ''}
              name="etapa"
              onChange={handleFieldChange}
              type="select"
            >
              <option value={undefined}>----</option>
              {etapaslist &&( etapaslist.map( c =>(
                <option key={c.value} value={c.value}>{c.label}</option>
              )))}
            </Form.Select>
            <label className='text-danger'>{message ? message.etapa : ''}</label>
        </Form.Group>

        {defaultoptions && (
          <Form.Group className="mb-2" as={Col} xl={4}>
            <Form.Label className='fw-bold mb-1'>Serviço*</Form.Label>
            <AsyncSelect 
              name='beneficiario' 
              loadOptions={(value) => SelectSearchOptions(value, 'register/detalhamentos', 'detalhamento_servico', null, false, `contratogai=${contrato.id}`)}
              styles={theme === 'light'? customStyles : customStylesDark} classNamePrefix="select"
              defaultValue={type === 'edit' ? defaultoptions.servico || '' : ''}
              onChange={(selected) => {
                setformData((prevFormData) => ({
                  ...prevFormData,
                  servico: selected.value
                }));
              }}>
            </AsyncSelect>
            <label className='text-danger'>{message ? message.servico : ''}</label>
          </Form.Group>        
        )}

        <Form.Group as={Col} xl={3} sm={6} className='mb-3'>
            <Form.Label className='mb-0 fw-bold'>Percentual*</Form.Label>
            <Form.Control 
                type='number'
                value={formData.percentual || ''} 
                onChange={handleFieldChange}
                name='percentual'
            />
            <label className='text-danger'>{message ? message.percentual : ''}</label>
        </Form.Group>


        <Form.Group as={Col} xl={3} sm={6} className='mb-3'>
            <Form.Label className='mb-0 fw-bold'>Valor*</Form.Label>
            <Form.Control 
                type='number'
                value={formData.valor || ''} 
                onChange={handleFieldChange}
                name='valor'
            />
            <label className='text-danger'>{message ? message.valor : ''}</label>
        </Form.Group>

        <Form.Group as={Col} xl={12} className='mb-3'>
            <Form.Label className='mb-0 fw-bold'>Observações</Form.Label>
            <Form.Control 
                as='textarea' 
                value={formData.observacoes || ''} 
                onChange={handleFieldChange}
                name='observacoes'
            />
            <label className='text-danger'>{message ? message.observacoes : ''}</label>
        </Form.Group>

        <Form.Group as={Col} className='text-end'>
            <Button type='submit'>Registrar</Button>
        </Form.Group>
    </Form>
    );
};
  
export default FormEtapa;
  


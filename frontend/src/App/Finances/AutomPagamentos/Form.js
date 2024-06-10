import React, { useEffect, useState} from 'react';
import AsyncSelect from 'react-select/async';
import { json, useNavigate} from 'react-router-dom';
import { toast } from 'react-toastify';
import { Button, Form, Col} from 'react-bootstrap';
import customStyles, {customStylesDark} from '../../../components/Custom/SelectStyles';
import { useAppContext } from '../../../Main';
import { SelectSearchOptions } from '../../../helpers/Data';
import { RetrieveRecord } from '../../../helpers/Data';

const FormAutomPagamento = ({ hasLabel, type, submit, data}) => {
  const {config: {theme}} = useAppContext();
  const user = JSON.parse(localStorage.getItem('user'))
  const [formData, setFormData] = useState({
    created_by: user.id
  });
  const [message, setMessage] = useState()
  const [record, setRecord] = useState()
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const uuid = data ? data.uuid : '';
  const [defaultoptions, setDefaultOptions] = useState();

  const handleApi = async (dadosform) => {
    const link = `${process.env.REACT_APP_API_URL}/finances/automation/payments/${type === 'edit' ? uuid+'/':''}`
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
        if (type === 'edit'){
          submit('edit', data)
          toast.success("Registro Atualizado com Sucesso!")
        }
        else{
          submit('add', data)
          toast.success("Registro Efetuado com Sucesso!")
        }
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
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  useEffect(()=>{
    const loadFormData = async () => {
      const status = !record ? await RetrieveRecord(uuid, 'finances/automation/payments', (data) => setRecord(data)) : 200
      if(status === 200){
        if(record){
          const filteredData = Object.entries(record)
            .filter(([key, value]) => value !== null)
            .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
        
          const { str_categoria, str_beneficiario, ...restData } = filteredData;
          setFormData({...formData, ...restData})
          setDefaultOptions({
            beneficiario: {value:data.beneficiario, label: str_beneficiario}, 
            categoria_pagamento: {value:data.categoria_pagamento, label: str_categoria}, 
          })
        }
      }
      else{
        navigate("/auth/login")
      }
    }

    if (type === 'edit' && !defaultoptions){
      loadFormData()
    }
    else{
      if(!defaultoptions){
        setDefaultOptions({beneficiario:{}, categoria_pagamento:{}})
      }
    }

  },[record])

  return (
    <>
      <Form onSubmit={handleSubmit} className='row' encType='multipart/form-data'>
        {defaultoptions && (
          <Form.Group className="mb-2" as={Col} xl={4} sm={6}>
            {hasLabel && <Form.Label className='fw-bold mb-1'>Beneficiário*</Form.Label>}
            <AsyncSelect 
              name='beneficiario' 
              loadOptions={(value) => SelectSearchOptions(value, 'pipefy/forncolab', 'razao_social')}
              styles={theme === 'light'? customStyles : customStylesDark} classNamePrefix="select"
              defaultValue={type === 'edit' ? defaultoptions.beneficiario || '' : ''}
              onChange={(selected) => {
                setFormData((prevFormData) => ({
                  ...prevFormData,
                  beneficiario: selected.value
                }));
              }}>
            </AsyncSelect>
            <label className='text-danger'>{message ? message.beneficiario : ''}</label>
          </Form.Group>        
        )}

        <Form.Group className="mb-2" as={Col} xl={4} sm={6}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Descrição*</Form.Label>}
          <Form.Control
            placeholder={!hasLabel ? 'Descrição' : ''}
            value={formData.descricao || ''}
            name="descricao"
            onChange={handleFieldChange}
            type="text"
          />
          <label className='text-danger'>{message ? message.descricao : ''}</label>
        </Form.Group>

        {defaultoptions && (
          <Form.Group className="mb-2" as={Col} xl={4} sm={6}>
            {hasLabel && <Form.Label className='fw-bold mb-1'>Categoria Pagamento*</Form.Label>}
            <AsyncSelect 
              name='categoria_pagamento' 
              loadOptions={(value) => SelectSearchOptions(value, 'finances/category-payments', 'category', 'sub_category')}
              styles={theme === 'light'? customStyles : customStylesDark} classNamePrefix="select"
              defaultValue={defaultoptions.categoria_pagamento || ''}
              onChange={(selected) => {
                setFormData((prevFormData) => ({
                  ...prevFormData,
                  categoria_pagamento: selected.value
                }));
              }}>
            </AsyncSelect>
            <label className='text-danger'>{message ? message.categoria_pagamento : ''}</label>
          </Form.Group>        
        )}

        <Form.Group className="mb-2" as={Col} xl={4} sm={6}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Valor Pagamento*</Form.Label>}
          <Form.Control
            placeholder={!hasLabel ? 'Valor' : ''}
            value={formData.valor_pagamento || ''}
            name="valor_pagamento"
            onChange={handleFieldChange}
            type="number"
          />
          <label className='text-danger'>{message ? message.valor_pagamento : ''}</label>
        </Form.Group>

        <Form.Group className="mb-2" as={Col} xl={4} sm={6}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Dia Vencimento*</Form.Label>}
          <Form.Control
            placeholder={!hasLabel ? 'Dia Vencimento' : ''}
            value={formData.dia_vencimento || ''}
            name="dia_vencimento"
            onChange={handleFieldChange}
            type="number"
          />
          <label className='text-danger'>{message ? message.dia_vencimento : ''}</label>
        </Form.Group>

        <Form.Group className="mb-2" as={Col} xl={8} sm={12}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Detalhamento</Form.Label>}
          <Form.Control
            placeholder={!hasLabel ? 'Detalhamento' : ''}
            value={formData.detalhamento || ''}
            name="detalhamento"
            onChange={handleFieldChange}
            as='textarea'
          />
          <label className='text-danger'>{message ? message.detalhamento : ''}</label>
        </Form.Group>

        <Form.Group className={`mb-0 ${type === 'edit' ? 'text-start' : 'text-end'}`}>
          <Button
            className="w-40"
            type="submit"
            >
              {type === 'edit' ? "Atualizar" : "Cadastrar"}
          </Button>
        </Form.Group>    
      </Form>
    </>
  );
};

export default FormAutomPagamento;

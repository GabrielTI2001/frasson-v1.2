import React, { useEffect, useState} from 'react';
import AsyncSelect from 'react-select/async';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Button, Form, Col, Spinner} from 'react-bootstrap';
import customStyles, {customStylesDark} from '../../../components/Custom/SelectStyles';
import { useAppContext } from '../../../Main';
import { SelectSearchOptions, sendData } from '../../../helpers/Data';
import { RetrieveRecord } from '../../../helpers/Data';
import { RedirectToLogin } from '../../../Routes/PrivateRoute';

const FormAutomPagamento = ({ hasLabel, type, submit, data}) => {
  const {config: {theme}} = useAppContext();
  const user = JSON.parse(localStorage.getItem('user'))
  const [formData, setFormData] = useState({
    created_by: user.id
  });
  const [message, setMessage] = useState()
  const [record, setRecord] = useState()
  const navigate = useNavigate();
  const uuid = data ? data.uuid : '';
  const [defaultoptions, setDefaultOptions] = useState();
  const [isLoading, setIsLoading] = useState(false);

  const handleApi = async (dadosform) => {
    const {resposta, dados} = await sendData({type:type, url:'finances/automation/payments', keyfield:type === 'edit' ? uuid : null, 
      dadosform:dadosform})
    if(resposta.status === 400){
      setMessage(dados)
    }
    else if (resposta.status === 401){
      RedirectToLogin(navigate);
    }
    else if (resposta.status === 201 || resposta.status === 200){
      if (type === 'edit'){
        submit('edit', dados)
        toast.success("Registro Atualizado com Sucesso!")
      }
      else{
        submit('add', dados)
        toast.success("Registro Efetuado com Sucesso!")
      }
    }
    setIsLoading(false)
  };

  const handleSubmit = async e => {
    setMessage(null)
    setIsLoading(true)
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
        RedirectToLogin(navigate)
      }
    }

    if (type === 'edit' && !defaultoptions){
      loadFormData()
    }
    else{
      if(!defaultoptions){
        setDefaultOptions({})
      }
    }

  },[record])

  return (
    <>
      <Form onSubmit={handleSubmit} className='row' encType='multipart/form-data'>
        {defaultoptions && (
          <Form.Group className="mb-2" as={Col} xl={12}>
            {hasLabel && <Form.Label className='fw-bold mb-1'>Beneficiário*</Form.Label>}
            <AsyncSelect 
              name='beneficiario' 
              loadOptions={(value) => SelectSearchOptions(value, 'register/pessoal', 'razao_social')}
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

        <Form.Group className="mb-2" as={Col} xl={12}>
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
          <Form.Group className="mb-2" as={Col} xl={12}>
            {hasLabel && <Form.Label className='fw-bold mb-1'>Categoria Pagamento*</Form.Label>}
            <AsyncSelect 
              name='categoria_pagamento' 
              loadOptions={(value) => SelectSearchOptions(value, 'finances/category-payments', 'category', 'sub_category', false, null, navigate)}
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

        <Form.Group className="mb-2" as={Col} xl={12}>
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

        <Form.Group className="mb-2" as={Col} xl={12}>
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

        <Form.Group className="mb-2" as={Col} xl={12}>
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
        
        <Form.Group className={`mb-0 text-center fixed-footer ${theme === 'light' ? 'bg-white' : 'bg-dark'}`}>
          <Button className="w-50" type="submit" disabled={isLoading} >
            {isLoading ? <Spinner size='sm' className='p-0' style={{marginBottom:'-4px'}}/> : type === 'edit' ? 'Atualizar' : 'Cadastrar'}
          </Button> 
        </Form.Group>   
      </Form>
    </>
  );
};

export default FormAutomPagamento;

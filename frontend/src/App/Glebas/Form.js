import React, { useEffect, useState} from 'react';
import AsyncSelect from 'react-select/async';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Button, Form, Col} from 'react-bootstrap';
import customStyles, {customStylesDark} from '../../components/Custom/SelectStyles';
import { useAppContext } from '../../Main';
import { SelectSearchOptions } from '../../helpers/Data';

const GlebaForm = ({ hasLabel, type, submit, data}) => {
  const {config: {theme}} = useAppContext();
  const user = JSON.parse(localStorage.getItem('user'))
  const [formData, setFormData] = useState({
    created_by: user.id
  });
  const [message, setMessage] = useState()
  const navigate = useNavigate();
  const token = localStorage.getItem("token")
  const [defaultoptions, setDefaultOptions] = useState()

  const handleApi = async (dadosform) => {
    const link = `${process.env.REACT_APP_API_URL}/glebas/index/${type === 'edit' ? data.uuid+'/':''}`
    const method = type === 'edit' ? 'PUT' : 'POST'
    try {
        const response = await fetch(link, {
          method: method,
          headers: {
              'Authorization': `Bearer ${token}`
          },
          body: dadosform
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
            submit('add', {...data, list_propriedades: data.list_propriedades.map(l => l.label).join(", ")})
            toast.success("Registro Efetuado com Sucesso!")
        }
    } catch (error) {
        console.error('Erro:', error);
    }
  };

  const handleSubmit = async e => {
    setMessage(null)
    e.preventDefault();
    const formDataToSend = new FormData();
    for (const key in formData) {
      if (Array.isArray(formData[key])) {
        formData[key].forEach(value => {
          formDataToSend.append(key, value);
        });
      } else {
        formDataToSend.append(key, formData[key]);
      }
    }
    await handleApi(formDataToSend);
  };

  const handleFile = (e) => {
    setFormData({...formData, [e.target.name]:e.target.files[0]})
  };

  const handleFieldChange = e => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  useEffect(()=>{
    const loadFormData = async () => {
      if(data){
        const filteredData = Object.entries(data)
          .filter(([key, value]) => value !== null)
          .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
        const { list_propriedades, str_municipio, str_cliente, ...restData } = filteredData;
        setFormData({...formData, ...restData})
        setDefaultOptions({propriedade:data.list_propriedades,cliente:{value:data.cliente, label:data.str_cliente}}); 
      }
    }

    if (type === 'edit' && (!defaultoptions || !data)){
      loadFormData()
    }
    else{
      if(!defaultoptions){
        loadFormData()
        setDefaultOptions({})
      }
    }

  },[])

  return (
    <>
      <Form onSubmit={handleSubmit} className='row' encType='multipart/form-data'>
        {defaultoptions && (
          <Form.Group className="mb-2" as={Col} xl={4}>
            {hasLabel && <Form.Label className='fw-bold mb-1'>Cliente*</Form.Label>}
            <AsyncSelect loadOptions={(v) => SelectSearchOptions(v, 'register/pessoal', 'razao_social')} name='cliente' 
              styles={theme === 'light'? customStyles : customStylesDark} classNamePrefix="select"
              defaultValue={ type === 'edit' ? (defaultoptions ? defaultoptions.cliente : '') : '' }
              onChange={(selected) => {
              setFormData((prevFormData) => ({
                ...prevFormData,
                cliente: selected.value
                }));
              }}>
            </AsyncSelect>
            <label className='text-danger'>{message ? message.cliente : ''}</label>
          </Form.Group>        
        )}
        
        <Form.Group className="mb-2" as={Col} xl={4}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Identificação Gleba*</Form.Label>}
          <Form.Control
            placeholder={!hasLabel ? '' : ''}
            value={formData.gleba || ''}
            name="gleba"
            onChange={handleFieldChange}
            type="text"
          />
          <label className='text-danger'>{message ? message.gleba : ''}</label>
        </Form.Group>

        {defaultoptions && (
          <Form.Group className="mb-2" as={Col} xl={6}>
            {hasLabel && <Form.Label className='fw-bold mb-1'>Fazendas*</Form.Label>}
            <AsyncSelect loadOptions={(v) => SelectSearchOptions(v, 'farms/farms', 'nome', 'matricula')} name='propriedades' 
              styles={theme === 'light'? customStyles : customStylesDark} classNamePrefix="select" isMulti={true}
              defaultValue={ type === 'edit' ? (defaultoptions ? defaultoptions.propriedade : '') : '' }
              onChange={(selected) => {
              setFormData((prevFormData) => ({
                ...prevFormData,
                propriedades: selected.map(s => s.value)
                }))
              }}>
            </AsyncSelect>
            <label className='text-danger'>{message ? message.propriedades : ''}</label>
          </Form.Group>        
        )}

        <Form.Group className="mb-2" as={Col} xl={3}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>KML da Gleba*</Form.Label>}
          <Form.Control
            placeholder={!hasLabel ? 'KML' : ''}
            name="kml"
            onChange={handleFile}
            type="file"
          />
          <label className='text-danger'>{message ? message.kml : ''}</label>
        </Form.Group>

        <Form.Group className="mb-2" as={Col} xl={3}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Área Gleba (ha)*</Form.Label>}
          <Form.Control
            placeholder={!hasLabel ? '' : ''}
            value={formData.area || ''}
            name="area"
            onChange={handleFieldChange}
            type="number"
          />
          <label className='text-danger'>{message ? message.area : ''}</label>
        </Form.Group>

        <Form.Group className="mb-2" as={Col} xl={8}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Descrição</Form.Label>}
          <Form.Control
            placeholder={!hasLabel ? '' : ''}
            value={formData.descricao || ''}
            name="descricao"
            onChange={handleFieldChange}
            type="text"
            as='textarea'
          />
          <label className='text-danger'>{message ? message.descricao : ''}</label>
        </Form.Group>

        
        <Form.Group className={`mb-0 ${type === 'edit' ? 'text-start' : 'text-end'}`}>
          <Button
            className="w-40"
            type="submit"
            >
              {type === 'edit' ? "Atualizar Gleba"
              : "Cadastrar Gleba"}
          </Button>
        </Form.Group>           
      </Form>
    </>
  );
};

export default GlebaForm;

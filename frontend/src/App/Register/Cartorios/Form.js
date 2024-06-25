import React, { useEffect, useState} from 'react';
import AsyncSelect from 'react-select/async';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Button, Form, Col } from 'react-bootstrap';
import customStyles, {customStylesDark} from '../../../components/Custom/SelectStyles';
import { useAppContext } from '../../../Main';
import { GetRecord, SelectOptions, SelectSearchOptions } from '../../../helpers/Data';

const CartorioForm = ({ hasLabel, type, submit, data}) => {
  const {config: {theme}} = useAppContext();
  const user = JSON.parse(localStorage.getItem('user'))
  const [formData, setFormData] = useState({
    created_by: user.id
  });
  const [message, setMessage] = useState()
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [defaultoptions, setDefaultOptions] = useState();

  const handleApi = async (dadosform) => {
    const link = `${process.env.REACT_APP_API_URL}/register/cartorios/${type === 'edit' ? data+'/':''}`
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
          submit('edit', {razao_social:data.razao_social, uuid:data.uuid, str_municipio:data.str_municipio, logradouro:data.logradouro,
            cnpj:data.cnpj, atendente:data.atendente, id:data.id
          }, data.id)
          toast.success("Registro Atualizado com Sucesso!")
        }
        else{
          submit('add', {razao_social:data.razao_social, uuid:data.uuid, str_municipio:data.str_municipio, logradouro:data.logradouro,
            cnpj:data.cnpj, atendente:data.atendente, id:data.id
          })
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
      if (type === 'edit'){
        const data_db = await GetRecord(data, 'register/cartorios')
        if(data_db && Object.keys(data_db)){
          //Pega os atributos não nulos de data
          const filteredData = Object.entries(data_db)
            .filter(([key, value]) => value !== null)
            .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
          
          const { str_municipio, ...restData } = filteredData;
          setFormData({...formData, ...restData})
          setDefaultOptions({municipio:{value:data_db.municipio, label: str_municipio}})
        }
      }
    }

    if (type === 'edit' && (!defaultoptions || !data)){
      loadFormData()
    }
    else{
      if(!defaultoptions){
        loadFormData()
        setDefaultOptions({municipio:{}, grupo:{}})
      }
    }

  },[])

  return (
    <>
      <Form onSubmit={handleSubmit} className='row' encType='multipart/form-data'>

        <Form.Group className="mb-2" as={Col} xl={4}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Nome ou Razão Social*</Form.Label>}
          <Form.Control
            value={formData.razao_social || ''}
            name="razao_social"
            onChange={handleFieldChange}
            type="text"
          />
          <label className='text-danger'>{message ? message.razao_social : ''}</label>
        </Form.Group>

        <Form.Group className="mb-2" as={Col} xl={4}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>CNPJ*</Form.Label>}
          <Form.Control
            value={formData.cnpj || ''}
            name="cnpj"
            onChange={handleFieldChange}
            type="text"
          />
          <label className='text-danger'>{message ? message.cnpj : ''}</label>
        </Form.Group>

        {defaultoptions && 
          <Form.Group className="mb-2" as={Col} xl={4}>
            {hasLabel && <Form.Label className='fw-bold mb-1'>Município*</Form.Label>}
            <AsyncSelect loadOptions={(value) => SelectSearchOptions(value, 'register/municipios', 'nome_municipio', 'sigla_uf')} 
              name='municipio' styles={theme === 'light'? customStyles : customStylesDark} classNamePrefix="select"
              defaultValue={ type === 'edit' ? (defaultoptions ? defaultoptions.municipio :'') : ''}
              onChange={(selected) => {
              setFormData((prevFormData) => ({
                ...prevFormData,
                municipio: selected.value
                }));
              }}>
            </AsyncSelect>
            <label className='text-danger'>{message ? message.municipio : ''}</label>
          </Form.Group> 
        }

        <Form.Group className="mb-2" as={Col} xl={4}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>CEP Logradouro*</Form.Label>}
          <Form.Control
            value={formData.cep_logradouro || ''}
            name="cep_logradouro"
            onChange={handleFieldChange}
            type="text"
          />
          <label className='text-danger'>{message ? message.cep_logradouro : ''}</label>
        </Form.Group>

        <Form.Group className="mb-2" as={Col} xl={6}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Logradouro*</Form.Label>}
          <Form.Control
            value={formData.logradouro || ''}
            name="logradouro"
            onChange={handleFieldChange}
            type="text"
          />
          <label className='text-danger'>{message ? message.logradouro : ''}</label>
        </Form.Group>

        <Form.Group className="mb-2" as={Col} xl={3}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Contato 01</Form.Label>}
          <Form.Control
            value={formData.contato1 || ''}
            name="contato1"
            onChange={handleFieldChange}
            type="text"
          />
          <label className='text-danger'>{message ? message.contato1 : ''}</label>
        </Form.Group>

        <Form.Group className="mb-2" as={Col} xl={3}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Contato 02</Form.Label>}
          <Form.Control
            value={formData.contato2 || ''}
            name="contato2"
            onChange={handleFieldChange}
            type="text"
          />
          <label className='text-danger'>{message ? message.contato2 : ''}</label>
        </Form.Group>

        <Form.Group className="mb-2" as={Col} xl={3}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Atendente</Form.Label>}
          <Form.Control
            value={formData.atendente || ''}
            name="atendente"
            onChange={handleFieldChange}
            type="text"
          />
          <label className='text-danger'>{message ? message.atendente : ''}</label>
        </Form.Group>

        <Form.Group className="mb-2" as={Col} xl={3}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Email</Form.Label>}
          <Form.Control
            value={formData.email || ''}
            name="email"
            onChange={handleFieldChange}
            type="email"
          />
          <label className='text-danger'>{message ? message.email : ''}</label>
        </Form.Group>

        <Form.Group className="mb-2" as={Col} xl={3}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Observações</Form.Label>}
          <Form.Control
            as='textarea'
            value={formData.observacoes || ''}
            name="observacoes"
            onChange={handleFieldChange}
            type="text"
          />
          <label className='text-danger'>{message ? message.observacoes : ''}</label>
        </Form.Group>

        <Form.Group className={`mb-0 ${type === 'edit' ? 'text-start' : 'text-end'}`}>
          <Button
            className="w-40"
            type="submit"
            >
              {type === 'edit' ? "Atualizar Cartório" : "Cadastrar Cartório"}
          </Button>
        </Form.Group>    
      </Form>
    </>
  );
};

export default CartorioForm;

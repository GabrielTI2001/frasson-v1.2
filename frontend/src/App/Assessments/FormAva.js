import React, { useEffect, useState} from 'react';
import AsyncSelect from 'react-select/async';
import { json, useNavigate} from 'react-router-dom';
import { toast } from 'react-toastify';
import { Button, Form, Col} from 'react-bootstrap';
import customStyles, {customStylesDark} from '../../components/Custom/SelectStyles';
import { useAppContext } from '../../Main';
import { SelectSearchOptions } from '../../helpers/Data';

const FormAvaliacao = ({ hasLabel, type, submit, data}) => {
  const {config: {theme}} = useAppContext();
  const user = JSON.parse(localStorage.getItem('user'))
  const [formData, setFormData] = useState({});
  const [message, setMessage] = useState()
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const uuid = data ? data.uuid : '';
  const [defaultoptions, setDefaultOptions] = useState();

  const handleApi = async (dadosform) => {
    const link = `${process.env.REACT_APP_API_URL}/assessments/data/${type === 'edit' ? uuid+'/':''}`
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
    if (e.target.type === 'checkbox') {
      setFormData({
        ...formData,
        [e.target.name]: e.target.checked ? true : false
      });
    }
    else{
      setFormData({
        ...formData,
        [e.target.name]: e.target.value
      });
    }
  };

  useEffect(()=>{
    const loadFormData = async () => {
      if(data){
        const filteredData = Object.entries(data)
          .filter(([key, value]) => value !== null)
          .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
        const { list_colaboradores, ...restData } = filteredData;
        setFormData({...formData, ...restData})
        setDefaultOptions({
          colaboradores: list_colaboradores, 
        })
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

  },[])

  return (
    <>
      <Form onSubmit={handleSubmit} className='row' encType='multipart/form-data'>
        {defaultoptions && (
          <Form.Group className="mb-2" as={Col} xl={6} sm={12}>
            {hasLabel && <Form.Label className='fw-bold mb-1'>Colaboradores*</Form.Label>}
            <AsyncSelect 
              name='colaboradores' 
              loadOptions={(value) => SelectSearchOptions(value, 'users/users', 'first_name')}
              styles={theme === 'light'? customStyles : customStylesDark} classNamePrefix="select"
              defaultValue={type === 'edit' ? defaultoptions.colaboradores || '' : ''} isMulti
              onChange={(selected) => {
                setFormData((prevFormData) => ({
                  ...prevFormData,
                  colaboradores: selected.map(s => s.value)
                }));
              }}>
            </AsyncSelect>
            <label className='text-danger'>{message ? message.colaboradores : ''}</label>
          </Form.Group>        
        )}

        <Form.Group className="mb-2" as={Col} xl={2} sm={2}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Ativa?*</Form.Label>}
          <Form.Check
            name="is_active" type='checkbox'
            onChange={handleFieldChange}
            checked={formData.is_active}
          />
          <label className='text-danger'>{message ? message.is_active : ''}</label>
        </Form.Group>

        <Form.Group className="mb-2" as={Col} xl={4} sm={6}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Data Referente*</Form.Label>}
          <Form.Control
            value={formData.data_ref || ''}
            name="data_ref"
            onChange={handleFieldChange}
            type="date"
          />
          <label className='text-danger'>{message ? message.data_ref : ''}</label>
        </Form.Group>

        <Form.Group className="mb-2" as={Col} xl={6} sm={6}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Descrição*</Form.Label>}
          <Form.Control
            value={formData.description || ''}
            name="description"
            onChange={handleFieldChange}
            as='textarea'
          />
          <label className='text-danger'>{message ? message.description : ''}</label>
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

export default FormAvaliacao;

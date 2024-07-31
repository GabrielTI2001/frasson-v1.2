import React, { useState} from 'react';
import AsyncSelect from 'react-select/async';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Button, Form, Col, Spinner} from 'react-bootstrap';
import customStyles, {customStylesDark} from '../../components/Custom/SelectStyles';
import { useAppContext } from '../../Main';
import { SelectSearchOptions, sendData } from '../../helpers/Data';
import { RedirectToLogin } from '../../Routes/PrivateRoute';

const GlebaForm = ({ hasLabel, type, submit, data}) => {
  const {config: {theme}} = useAppContext();
  const user = JSON.parse(localStorage.getItem('user'))
  const [formData, setFormData] = useState({
    created_by: user.id
  });
  const [message, setMessage] = useState()
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleApi = async (dadosform) => {
    const {resposta, dados} = await sendData({type:type, url:'glebas/index', keyfield:null, dadosform:dadosform, is_json:false})
    if(resposta.status === 400){
      setMessage({...dados})
    }
    else if (resposta.status === 401){
      RedirectToLogin(navigate);
    }
    else if (resposta.status === 201 || resposta.status === 200){
      submit('add', {...dados, list_propriedades: dados.list_propriedades.map(l => l.label).join(", ")})
      toast.success("Registro Efetuado com Sucesso!")
    }
    setIsLoading(false)
  };

  const handleSubmit = async e => {
    setMessage(null)
    setIsLoading(true)
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

  return (
    <>
      <Form onSubmit={handleSubmit} className='row row-cols-1' encType='multipart/form-data'>
        <Form.Group className="mb-2" as={Col}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Cliente*</Form.Label>}
          <AsyncSelect loadOptions={(v) => SelectSearchOptions(v, 'register/pessoal', 'razao_social')} name='cliente' 
            styles={theme === 'light'? customStyles : customStylesDark} classNamePrefix="select"
            onChange={(selected) => {
            setFormData((prevFormData) => ({
              ...prevFormData,
              cliente: selected.value
              }));
            }}>
          </AsyncSelect>
          <label className='text-danger'>{message ? message.cliente : ''}</label>
        </Form.Group>        
        <Form.Group className="mb-2" as={Col}>
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
        <Form.Group className="mb-2" as={Col}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Fazendas*</Form.Label>}
          <AsyncSelect loadOptions={(v) => SelectSearchOptions(v, 'farms/farms', 'nome', 'matricula')} name='propriedades' 
            styles={theme === 'light'? customStyles : customStylesDark} classNamePrefix="select" isMulti={true}
            onChange={(selected) => {
            setFormData((prevFormData) => ({
              ...prevFormData,
              propriedades: selected.map(s => s.value)
              }))
            }}>
          </AsyncSelect>
          <label className='text-danger'>{message ? message.propriedades : ''}</label>
        </Form.Group>        

        <Form.Group className="mb-2" as={Col}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>KML da Gleba*</Form.Label>}
          <Form.Control
            placeholder={!hasLabel ? 'KML' : ''}
            name="kml"
            onChange={handleFile}
            type="file"
          />
          <label className='text-danger'>{message ? message.kml : ''}</label>
        </Form.Group>

        <Form.Group className="mb-2" as={Col}>
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

        <Form.Group className="mb-2" as={Col}>
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
        <Form.Group className={`mb-0 text-center fixed-footer ${theme === 'light' ? 'bg-white' : 'bg-dark'}`}>
          <Button className="w-50" type="submit" disabled={isLoading}>
              {isLoading ? <Spinner size='sm' className='p-0' style={{marginBottom:'-4px'}}/> : 'Cadastrar Gleba'}
          </Button>
        </Form.Group>          
      </Form>
    </>
  );
};

export default GlebaForm;

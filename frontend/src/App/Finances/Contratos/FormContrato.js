import React, { useEffect, useState} from 'react';
import AsyncSelect from 'react-select/async';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Button, Form, Col} from 'react-bootstrap';
import customStyles, {customStylesDark} from '../../../components/Custom/SelectStyles';
import { useAppContext } from '../../../Main';
import { SelectSearchOptions } from '../../../helpers/Data';

const ContratoForm = ({ hasLabel, type, submit, data}) => {
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
    const link = `${process.env.REACT_APP_API_URL}/finances/contratos-servicos/${type === 'edit' ? data.uuid+'/':''}`
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
        if (type === 'edit'){
          submit('edit', data, data.id)
          toast.success("Registro Atualizado com Sucesso!")
        }
        else{
          submit('add', {str_contratante:data.str_contratante, uuid:data.uuid, str_servicos:data.str_servicos.map(s => s.label).join(', '),
            status:{'text': '-', 'color': 'secondary'}, str_produto:data.str_produto, valor:data.valor, percentual:data.percentual, data_assinatura:data.data_assinatura
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
    const formDataToSend = new FormData();
    for (const key in formData) {
      if (key === 'file') {
        formDataToSend.append('file', formData[key]);
      } else {
        formDataToSend.append(key, formData[key]);
      }
    }
    await handleApi(formDataToSend);
  };

  const handleFileChange = (e) => {
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
      if (type === 'edit'){
        if(data && Object.keys(data)){
          const filteredData = Object.entries(data)
            .filter(([key, value]) => value !== null)
            .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
          
          const { pdf, str_servicos, str_contratante, etapas, ...restData } = filteredData;
          setFormData({...formData, ...restData})
          setDefaultOptions({
            servicos:str_servicos,
            contratante:{value:data.contratante, label:str_contratante}
          })
        }
      }
    }

    if (type === 'edit' && (!defaultoptions || !data)){
      loadFormData()
    }
    else{
      if(!defaultoptions){
        loadFormData()
        setDefaultOptions({contratante:{}, grupo:{}})
      }
    }

  },[])

  return (
    <>
      <Form onSubmit={handleSubmit} className='row' encType='multipart/form-data'>

        {defaultoptions && 
          <Form.Group className="mb-2" as={Col} xl={4} sm={6}>
            {hasLabel && <Form.Label className='fw-bold mb-1'>Contratante*</Form.Label>}
            <AsyncSelect loadOptions={(value) => SelectSearchOptions(value, 'register/pessoal', 'razao_social', 'cpf_cnpj')} 
              name='contratante' styles={theme === 'light'? customStyles : customStylesDark} classNamePrefix="select"
              defaultValue={ type === 'edit' ? (defaultoptions ? defaultoptions.contratante :'') : ''}
              onChange={(selected) => {
              setFormData((prevFormData) => ({
                ...prevFormData,
                contratante: selected.value
                }));
              }}>
            </AsyncSelect>
            <label className='text-danger'>{message ? message.contratante : ''}</label>
          </Form.Group> 
        }       

        {defaultoptions && 
          <Form.Group className="mb-2" as={Col} xl={6} sm={6}>
            {hasLabel && <Form.Label className='fw-bold mb-1'>Serviço(s) Contratado(s)*</Form.Label>}
            <AsyncSelect loadOptions={(value) => SelectSearchOptions(value, 'register/detalhamentos', 'detalhamento_servico')} isMulti
              name='servicos' styles={theme === 'light'? customStyles : customStylesDark} classNamePrefix="select"
              defaultValue={ type === 'edit' ? (defaultoptions ? defaultoptions.servicos : '') : ''}
              onChange={(selected) => {
              setFormData((prevFormData) => ({
                ...prevFormData,
                servicos: selected.map(s => s.value)
                }));
              }}>
            </AsyncSelect>
            <label className='text-danger'>{message ? message.servicos : ''}</label>
          </Form.Group> 
        }  

        <Form.Group className="mb-2" as={Col} xl={3} sm={6}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Percentual</Form.Label>}
          <Form.Control
            value={formData.percentual || ''}
            name="percentual"
            onChange={handleFieldChange}
            type="number"
          />
          <label className='text-danger'>{message ? message.percentual : ''}</label>
        </Form.Group>

        <Form.Group className="mb-2" as={Col} xl={3} sm={6}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Valor*</Form.Label>}
          <Form.Control
            value={formData.valor || ''}
            name="valor"
            onChange={handleFieldChange}
            type="number"
          />
          <label className='text-danger'>{message ? message.valor : ''}</label>
        </Form.Group>

        <Form.Group className="mb-2" as={Col} xl={3} sm={6}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Data Assinatura*</Form.Label>}
          <Form.Control
            value={formData.data_assinatura || ''}
            name="data_assinatura"
            onChange={handleFieldChange}
            type="date"
          />
          <label className='text-danger'>{message ? message.data_assinatura : ''}</label>
        </Form.Group>

        <Form.Group className="mb-2" as={Col} xl={3} sm={6}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Data Vencimento*</Form.Label>}
          <Form.Control
            value={formData.data_vencimento || ''}
            name="data_vencimento"
            onChange={handleFieldChange}
            type="date"
          />
          <label className='text-danger'>{message ? message.data_vencimento : ''}</label>
        </Form.Group>

        <Form.Group className="mb-2" as={Col} xl={12}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Detalhes Negociação</Form.Label>}
          <Form.Control
            as='textarea'
            value={formData.detalhes || ''}
            name="detalhes"
            onChange={handleFieldChange}
            type="text"
          />
          <label className='text-danger'>{message ? message.detalhes : ''}</label>
        </Form.Group>

        <Form.Group className="mb-2" as={Col} xl={3} sm={6}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>PDF</Form.Label>}
          <Form.Control
            name="pdf"
            onChange={handleFileChange}
            type="file"
          />
          <label className='text-danger'>{message ? message.pdf : ''}</label>
        </Form.Group>

        <Form.Group className={`mb-0 text-end`}>
          <Button
            className="w-40"
            type="submit"
            >
              {type === 'edit' ? "Atualizar Contrato" : "Cadastrar Contrato"}
          </Button>
        </Form.Group>    
      </Form>
    </>
  );
};

export default ContratoForm;

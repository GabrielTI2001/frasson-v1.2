import React, { useEffect, useState} from 'react';
import AsyncSelect from 'react-select/async';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Button, Form, Col, OverlayTrigger, Tooltip} from 'react-bootstrap';
import { fetchPessoal, FetchImoveisRurais } from '../../Pipefy/Data';
import customStyles, {customStylesDark} from '../../../components/Custom/SelectStyles';
import { useAppContext } from '../../../Main';
import { faCircleQuestion, faFilePdf } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { GetRecord, SelectOptions, SelectSearchOptions } from '../../../helpers/Data';
import { Option } from 'react-bootstrap-icons';

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
  const [categorias, setCategorias] = useState([]);

  const handleApi = async (dadosform) => {
    const link = `${process.env.REACT_APP_API_URL}/register/pessoal/${type === 'edit' ? data+'/':''}`
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
          submit('edit', {razao_social:data.razao_social, uuid:data.uuid, str_municipio:data.str_municipio, numero_rg:data.numero_rg,
            cpf_cnpj:data.cpf_cnpj, grupo_info:data.grupo_info, natureza:data.str_natureza
          }, data.id)
          toast.success("Registro Atualizado com Sucesso!")
        }
        else{
          submit('add', {razao_social:data.razao_social, uuid:data.uuid, str_municipio:data.str_municipio, numero_rg:data.numero_rg,
            cpf_cnpj:data.cpf_cnpj, grupo_info:data.grupo_info, natureza:data.str_natureza
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
      const cat = await SelectOptions('register/categorias-cadastro', 'categoria')
      setCategorias(cat)
      if (type === 'edit'){
        const data_db = await GetRecord(data, 'register/pessoal')
        if(data_db && Object.keys(data_db)){
          //Pega os atributos não nulos de data
          const filteredData = Object.entries(data_db)
            .filter(([key, value]) => value !== null)
            .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
          
          const { str_municipio, contas_bancarias, avatar, grupo_info, ...restData } = filteredData;
          setFormData({...formData, ...restData})
          setDefaultOptions({municipio:{value:data_db.municipio, label: str_municipio}, grupo:data_db.grupo && {value:data_db.grupo, label: grupo_info}})
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
          {hasLabel && <Form.Label className='fw-bold mb-1'>Natureza Jurídica*</Form.Label>}
          <Form.Select
            value={formData.natureza || ''}
            name="natureza"
            onChange={handleFieldChange}
          >
            <option value='PF'>Pessoa Física</option>
            <option value='PJ'>Pessoa Jurídica</option>
          </Form.Select>
          <label className='text-danger'>{message ? message.natureza : ''}</label>
        </Form.Group>

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
          {hasLabel && <Form.Label className='fw-bold mb-1'>Nome Fantasia</Form.Label>}
          <Form.Control
            value={formData.fantasia || ''}
            name="fantasia"
            onChange={handleFieldChange}
            type="text"
          />
          <label className='text-danger'>{message ? message.fantasia : ''}</label>
        </Form.Group>

        <Form.Group className="mb-2" as={Col} xl={4}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>CPF ou CNPJ*</Form.Label>}
          <Form.Control
            value={formData.cpf_cnpj || ''}
            name="cpf_cnpj"
            onChange={handleFieldChange}
            type="text"
          />
          <label className='text-danger'>{message ? message.cpf_cnpj : ''}</label>
        </Form.Group>

        <Form.Group className="mb-2" as={Col} xl={4}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Número RG</Form.Label>}
          <Form.Control
            value={formData.numero_rg || ''}
            name="numero_rg"
            onChange={handleFieldChange}
            type="text"
          />
          <label className='text-danger'>{message ? message.numero_rg : ''}</label>
        </Form.Group>

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
          {hasLabel && <Form.Label className='fw-bold mb-1'>Data Nascimento</Form.Label>}
          <Form.Control
            value={formData.data_nascimento || ''}
            name="data_nascimento"
            onChange={handleFieldChange}
            type="date"
          />
          <label className='text-danger'>{message ? message.data_nascimento : ''}</label>
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
          {hasLabel && <Form.Label className='fw-bold mb-1'>Email 01</Form.Label>}
          <Form.Control
            value={formData.email1 || ''}
            name="email1"
            onChange={handleFieldChange}
            type="email"
          />
          <label className='text-danger'>{message ? message.email1 : ''}</label>
        </Form.Group>

        <Form.Group className="mb-2" as={Col} xl={3}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Email 02</Form.Label>}
          <Form.Control
            value={formData.email2 || ''}
            name="email2"
            onChange={handleFieldChange}
            type="email"
          />
          <label className='text-danger'>{message ? message.email2 : ''}</label>
        </Form.Group>

        <Form.Group className="mb-2" as={Col} xl={3}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Categoria Cadastro*</Form.Label>}
          <Form.Select
            value={formData.categoria || ''}
            name="categoria"
            onChange={handleFieldChange}
          >
          {categorias.map(cat =>
            <option value={cat.value} key={cat.value}>{cat.label}</option>
          )}
          </Form.Select>
          <label className='text-danger'>{message ? message.categoria : ''}</label>
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

        {defaultoptions && 
          <Form.Group className="mb-2" as={Col} xl={4}>
            {hasLabel && <Form.Label className='fw-bold mb-1'>Grupo</Form.Label>}
            <AsyncSelect loadOptions={(value) => SelectSearchOptions(value, 'register/grupos-clientes', 'nome_grupo')} 
              name='grupo' styles={theme === 'light'? customStyles : customStylesDark} classNamePrefix="select"
              defaultValue={ type === 'edit' ? (defaultoptions ? defaultoptions.grupo : '') : ''}
              onChange={(selected) => {
              setFormData((prevFormData) => ({
                ...prevFormData,
                grupo: selected.value
                }));
              }}>
            </AsyncSelect>
            <label className='text-danger'>{message ? message.grupo : ''}</label>
          </Form.Group> 
        }  

        <Form.Group className="mb-2" as={Col} xl={3}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Avatar</Form.Label>}
          <Form.Control
            name="avatar"
            onChange={handleFileChange}
            type="file"
          />
          <label className='text-danger'>{message ? message.avatar : ''}</label>
        </Form.Group>

        <Form.Group className={`mb-0 ${type === 'edit' ? 'text-start' : 'text-end'}`}>
          <Button
            className="w-40"
            type="submit"
            >
              {type === 'edit' ? "Atualizar Pessoa" : "Cadastrar Pessoa"}
          </Button>
        </Form.Group>    
      </Form>
    </>
  );
};

export default CartorioForm;

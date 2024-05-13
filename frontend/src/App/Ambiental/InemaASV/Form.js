import React, { useEffect, useState, useContext } from 'react';
import PropTypes from 'prop-types';
import AsyncSelect from 'react-select/async';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Button, Form, Col} from 'react-bootstrap';
import { fetchEmpresa, fetchMunicipio} from '../Data';
import customStyles, {customStylesDark} from '../../../components/Custom/SelectStyles';
import { AmbientalContext } from '../../../context/Context';
import { useAppContext } from '../../../Main';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilePdf } from '@fortawesome/free-solid-svg-icons';

const ASVForm = ({ hasLabel, type}) => {
  const {config: {theme}} = useAppContext();
  // const user = JSON.parse(localStorage.getItem('user'))
  const {ambientalState, ambientalDispatch} = useContext(AmbientalContext)
  const [formData, setFormData] = useState({});
  const [message, setMessage] = useState()
  const channel = new BroadcastChannel('meu_canal');
  const navigate = useNavigate();
  const token = localStorage.getItem("token")
  const {uuid} = useParams()
  const [defaultoptions, setDefaultOptions] = useState()

  const handleApi = async (dadosform) => {
    const link =`${process.env.REACT_APP_API_URL}/environmental/inema/asvs/${type === 'edit' ? uuid+'/' : ''}`
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
          const next = window.location.href.toString().split(process.env.REACT_APP_HOST)[1]
          toast.error("Sua Sessão Expirou")
          navigate(`/auth/login?next=${next}`);
        }
        else if (response.status === 201 || response.status === 200){
          if (type === 'edit'){
            ambientalDispatch({type:'SET_DATA', payload:{
              asv: {coordenadas:ambientalState.asv.areas, ...data}
            }})
            channel.postMessage({ tipo: 'atualizar_asv', asv_id:ambientalState.asv.id, reg:data});
            toast.success("Registro Atualizado com Sucesso!")
          }
          else{
            toast.success("Registro Efetuado com Sucesso!")
            navigate(`/ambiental/inema/asv/edit/${data.uuid}`);
          }
        }
    } catch (error) {
        console.error('Erro:', error);
    }
  };

  const handleSubmit = e => {
    setMessage(null)
    e.preventDefault();
    const formDataToSend = new FormData();
    for (const key in formData) {
      formDataToSend.append(key, formData[key]);
    }  
    handleApi(formDataToSend);
  };

  const handleFieldChange = e => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e) => {
    setFormData({...formData, [e.target.name]:e.target.files[0]})
  };

  useEffect(()=>{
    const loadFormData = async () => {
      if(ambientalState){
          const filteredData = Object.entries(ambientalState.asv)
            .filter(([key, value]) => value !== null)
            .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
          const { info_user, token_apimaps, file, ...restData } = filteredData;
          setFormData({...formData, ...restData})

          setDefaultOptions({municipio: {value: ambientalState.asv.municipio, label: ambientalState.asv.nome_municipio},
            empresa: {value:ambientalState.asv.empresa || '', label: ambientalState.asv.str_empresa || ''}
          }); 
      }
    
    }

    if (type === 'edit' && (!defaultoptions || !ambientalState.asv)){
      loadFormData()
    }
    else{
      if(!defaultoptions){
        setDefaultOptions({municipio:{}, empresa:{}})
      }
    }

  }, [])

  return (
    <>
      <Form onSubmit={handleSubmit} className='row'>

        <Form.Group className="mb-2" as={Col} lg={3}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Portaria*</Form.Label>}
          <Form.Control
            placeholder={!hasLabel ? 'Portaria*' : ''}
            value={formData.portaria || ''}
            name="portaria"
            onChange={handleFieldChange}
            type="text"
          />
          <label className='text-danger'>{message ? message.portaria : ''}</label>
        </Form.Group>

        <Form.Group className="mb-2" as={Col} lg={3}>
            {hasLabel && <Form.Label className='fw-bold mb-1'>Nº Processo INEMA*</Form.Label>}
            <Form.Control
              placeholder={!hasLabel ? 'Nº Processo INEMA' : ''}
              value={formData.processo || ''}
              name="processo"
              onChange={handleFieldChange}
              type="text"
            />
            <label className='text-danger'>{message ? message.processo : ''}</label>
        </Form.Group>

        <Form.Group className="mb-2" as={Col} lg={3}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Nome Requerente*</Form.Label>}
          <Form.Control
            placeholder={!hasLabel ? 'Nome Requerente' : ''}
            value={formData.requerente || ''}
            name="requerente"
            onChange={handleFieldChange}
            type="text"
          />
          <label className='text-danger'>{message ? message.requerente : ''}</label>
        </Form.Group>

        <Form.Group className="mb-2" as={Col} lg={3}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>CPF/CNPJ Requerente*</Form.Label>}
          <Form.Control
            placeholder={!hasLabel ? 'CPF/CNPJ Requerente' : ''}
            value={formData.cpf_cnpj || ''}
            name="cpf_cnpj"
            onChange={handleFieldChange}
            type="text"
          />
          <label className='text-danger'>{message ? message.cpf_cnpj : ''}</label>
        </Form.Group>

        <Form.Group className="mb-2" as={Col} lg={2}>
              {hasLabel && <Form.Label className='fw-bold mb-1'>Data Formação</Form.Label>}
              <Form.Control
                placeholder={!hasLabel ? 'Data Publicação' : ''}
                value={formData.data_formacao || ''}
                name="data_formacao"
                onChange={handleFieldChange}
                type="date"
              />
              <label className='text-danger'>{message ? message.data_formacao : ''}</label>
        </Form.Group>

        <Form.Group className="mb-2" as={Col} lg={2}>
              {hasLabel && <Form.Label className='fw-bold mb-1'>Data Publicação*</Form.Label>}
              <Form.Control
                placeholder={!hasLabel ? 'Data Publicação' : ''}
                value={formData.data_publicacao || ''}
                name="data_publicacao"
                onChange={handleFieldChange}
                type="date"
              />
              <label className='text-danger'>{message ? message.data_publicacao : ''}</label>
        </Form.Group>

        <Form.Group className="mb-2" as={Col} lg={2}>
              {hasLabel && <Form.Label className='fw-bold mb-1'>Data Vencimento</Form.Label>}
              <Form.Control
                placeholder={!hasLabel ? 'Data Vencimento' : ''}
                value={formData.data_vencimento|| ''}
                name="data_vencimento"
                onChange={handleFieldChange}
                type="date"
              />
              <label className='text-danger'>{message ? message.data_vencimento : ''}</label>
        </Form.Group>

        <Form.Group className="mb-2" as={Col} lg={3}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Localidade*</Form.Label>}
          <Form.Control
            placeholder={!hasLabel ? 'Localidade' : ''}
            value={formData.localidade || ''}
            name="localidade"
            onChange={handleFieldChange}
            type="text"
          />
          <label className='text-danger'>{message ? message.localidade : ''}</label>
        </Form.Group>

        {defaultoptions && (
          <Form.Group className="mb-2" as={Col} lg={3}>
                {hasLabel && <Form.Label className='fw-bold mb-1'>Município Localização*</Form.Label>}
                <AsyncSelect loadOptions={fetchMunicipio} name='municipio' styles={theme === 'light'? customStyles : customStylesDark} classNamePrefix="select"
                  defaultValue={ type === 'edit' ? (defaultoptions ? defaultoptions.municipio : null) : null }
                  onChange={(selected) => {
                  setFormData((prevFormData) => ({
                    ...prevFormData,
                    municipio: selected.value
                    }));
                  }}>
                </AsyncSelect>
                <label className='text-danger'>{message ? message.municipio : ''}</label>
            </Form.Group>        
        )}

        {defaultoptions && (
          <Form.Group className="mb-2" as={Col} lg={3}>
                {hasLabel && <Form.Label className='fw-bold mb-1'>Empresa Consultoria</Form.Label>}
                <AsyncSelect loadOptions={fetchEmpresa} name='empresa' styles={theme === 'light'? customStyles : customStylesDark} classNamePrefix="select"
                  defaultValue={ type === 'edit' ? (defaultoptions ? defaultoptions.empresa : null) : null }
                  onChange={(selected) => {
                  setFormData((prevFormData) => ({
                    ...prevFormData,
                    empresa: selected.value
                    }));
                  }}>
                </AsyncSelect>
                <label className='text-danger'>{message ? message.empresa : ''}</label>
            </Form.Group>        
        )}

        <Form.Group className="mb-2" as={Col} lg={3}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Nome do Técnico</Form.Label>}
          <Form.Control
            placeholder={!hasLabel ? 'Nome do Técnico' : ''}
            value={formData.tecnico || ''}
            name="tecnico"
            onChange={handleFieldChange}
            type="text"
          />
          <label className='text-danger'>{message ? message.tecnico : ''}</label>
        </Form.Group>

        <Form.Group className="mb-2" as={Col} lg={3}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Área Total (ha)*</Form.Label>}
          <Form.Control
            placeholder={!hasLabel ? 'Área' : ''}
            value={formData.area_total || ''}
            name="area_total"
            onChange={handleFieldChange}
            type="number"
          />
          <label className='text-danger'>{message ? message.area_total : ''}</label>
        </Form.Group>

        <Form.Group className="mb-2" as={Col} lg={3}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Rendimento Lenhoso (m<sup>3</sup>)</Form.Label>}
          <Form.Control
            placeholder={!hasLabel ? 'Rendimento' : ''}
            value={formData.rendimento || ''}
            name="rendimento"
            onChange={handleFieldChange}
            type="number"
          />
          <label className='text-danger'>{message ? message.rendimento : ''}</label>
        </Form.Group>

        {ambientalState && ambientalState.asv.file &&
        <Form.Group className="mb-2" as={Col} lg={3}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Arquivo PDF</Form.Label>}<br></br>
          <div className='mt-2'>     
            <Link to={`${ambientalState.asv.file}`} target="__blank" className="px-0 fw-bold text-danger">
                <FontAwesomeIcon icon={faFilePdf} className="me-2"></FontAwesomeIcon>Visualizar PDF
            </Link>
          </div>
        </Form.Group>} 

        <Form.Group className="mb-2" as={Col} lg={3}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Substituir ou inserir arquivo PDF</Form.Label>}
          <Form.Control
            placeholder={!hasLabel ? 'Arquivo PDF' : ''}
            name="file"
            onChange={handleFileChange}
            type="file"
          />
          <label className='text-danger'>{message ? message.file : ''}</label>
        </Form.Group>

        <Form.Group className={`mb-0 ${type === 'edit' ? 'text-start' : 'text-end'}`}>
          <Button
            className="w-40"
            type="submit"
          >
              {type === 'edit' ? "Atualizar Portaria"
              : "Cadastrar Portaria"}
          </Button>
        </Form.Group>           
      </Form>
    </>
  );
};

export default ASVForm;

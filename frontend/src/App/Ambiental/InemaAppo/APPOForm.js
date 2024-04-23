import React, { useEffect, useState, useContext } from 'react';
import PropTypes from 'prop-types';
import AsyncSelect from 'react-select/async';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Button, Form, Col} from 'react-bootstrap';
import { fetchAquifero, fetchMunicipio} from './../Data';
import customStyles, {customStylesDark} from '../../../components/Custom/SelectStyles';
import { AmbientalContext } from '../../../context/Context';
import { useAppContext } from '../../../Main';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilePdf } from '@fortawesome/free-solid-svg-icons';

const APPOForm = ({ hasLabel, type}) => {
  const {config: {theme}} = useAppContext();
  const user = JSON.parse(localStorage.getItem('user'))
  const {ambientalState, ambientalDispatch} = useContext(AmbientalContext)
  const [formData, setFormData] = useState({
    created_by: user.id, processo_frasson: false
  });
  const [message, setMessage] = useState()
  const channel = new BroadcastChannel('meu_canal');
  const navigate = useNavigate();
  const token = localStorage.getItem("token")
  const {uuid} = useParams()
  const [defaultoptions, setDefaultOptions] = useState()
  const [aquifero, setAquifero] = useState([])

  const handleApi = async (dadosform) => {
    const link =`${process.env.REACT_APP_API_URL}/environmental/inema/appos/${type === 'edit' ? uuid+'/' : ''}`
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
              appo: {coordenadas:ambientalState.appo.coordenadas, ...data}
            }})
            channel.postMessage({ tipo: 'atualizar_appo', appo_id:ambientalState.appo.id, reg:data});
            toast.success("Registro Atualizado com Sucesso!")
          }
          else{
            toast.success("Registro Efetuado com Sucesso!")
            navigate(`/ambiental/inema/appo/edit/${data.uuid}`);
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

  const handleImageChange = (e) => {
    setFormData({...formData, [e.target.name]:e.target.files[0]})
  };

  useEffect(()=>{
    const loadFormData = async () => {
      if(ambientalState){
          setFormData({...formData, numero_processo:ambientalState.appo.numero_processo,
            nome_requerente: ambientalState.appo.nome_requerente, municipio: ambientalState.appo.municipio, 
            data_documento: ambientalState.appo.data_documento, data_vencimento:ambientalState.appo.data_vencimento, 
            aquifero: ambientalState.appo.aquifero, cpf_cnpj: ambientalState.appo.cpf_cnpj,
            nome_fazenda: ambientalState.appo.nome_fazenda, processo_frasson: ambientalState.appo.processo_frasson
          })
          setDefaultOptions({municipio: {value: ambientalState.appo.municipio, label: ambientalState.appo.nome_municipio},
            aquifero: {value:ambientalState.appo.aquifero, label: ambientalState.appo.str_tipo_aquifero}
          }); 
      }
    
    }
    const buscar = async () =>{
      const data = await fetchAquifero();
      if (data.status === 401){
        const next = window.location.href.toString().split(process.env.REACT_APP_HOST)[1]
        toast.error("Sua Sessão Expirou")
        navigate(`/auth/login?next=${next}`);
      }
      setAquifero(data.dados)
    }

    if (aquifero.length === 0){
      buscar()
    }
    if (type === 'edit' && (!defaultoptions || !ambientalState.appo)){
      loadFormData()
    }
    else{
      if(!defaultoptions){
        setDefaultOptions({municipio:{}})
      }
    }

  }, [])

  return (
    <>
      <Form onSubmit={handleSubmit} className='row'>

        <Form.Group className="mb-2" as={Col} lg={3}>
              {hasLabel && <Form.Label className='fw-bold mb-1'>Nome Requerente*</Form.Label>}
              <Form.Control
                placeholder={!hasLabel ? 'Nome Requerente' : ''}
                value={formData.nome_requerente || ''}
                name="nome_requerente"
                onChange={handleFieldChange}
                type="text"
              />
              <label className='text-danger'>{message ? message.nome_requerente : ''}</label>
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

        <Form.Group className="mb-2" as={Col} lg={3}>
            {hasLabel && <Form.Label className='fw-bold mb-1'>Nº Processo INEMA*</Form.Label>}
            <Form.Control
              placeholder={!hasLabel ? 'Nº Processo INEMA' : ''}
              value={formData.numero_processo || ''}
              name="numero_processo"
              onChange={handleFieldChange}
              type="text"
            />
            <label className='text-danger'>{message ? message.numero_processo : ''}</label>
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

        <Form.Group className="mb-2" as={Col} lg={3}>
              {hasLabel && <Form.Label className='fw-bold mb-1'>Localidade*</Form.Label>}
              <Form.Control
                placeholder={!hasLabel ? 'Localidade' : ''}
                value={formData.nome_fazenda || ''}
                name="nome_fazenda"
                onChange={handleFieldChange}
                type="text"
              />
              <label className='text-danger'>{message ? message.nome_fazenda : ''}</label>
        </Form.Group>

        <Form.Group className="mb-2" as={Col} lg={2}>
            {hasLabel && <Form.Label className='fw-bold mb-1'>Tipo Aquífero*</Form.Label>}
            <Form.Select
              placeholder={!hasLabel ? 'Tipo Aquífero' : ''}
              value={formData.aquifero || ''}
              name="aquifero"
              onChange={handleFieldChange}
              type="select"
            >
              <option value={undefined}>----</option>
              {aquifero &&( aquifero.map( c =>(
                <option key={c.value} value={c.value}>{c.label}</option>
              )))}
            </Form.Select>
            <label className='text-danger'>{message ? message.aquifero : ''}</label>
        </Form.Group>

        <Form.Group className="mb-2" as={Col} lg={2}>
              {hasLabel && <Form.Label className='fw-bold mb-1'>Data Publicação*</Form.Label>}
              <Form.Control
                placeholder={!hasLabel ? 'Data Publicação' : ''}
                value={formData.data_documento || ''}
                name="data_documento"
                onChange={handleFieldChange}
                type="date"
              />
              <label className='text-danger'>{message ? message.data_documento : ''}</label>
        </Form.Group>

        <Form.Group className="mb-2" as={Col} lg={2}>
              {hasLabel && <Form.Label className='fw-bold mb-1'>Data Vencimento*</Form.Label>}
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
              {hasLabel && <Form.Label className='fw-bold mb-1'>Conduzido Frasson?*</Form.Label>}
              <Form.Select
                placeholder={!hasLabel ? 'Conduzido Frasson?' : ''}
                value={formData.processo_frasson || ''}
                name="processo_frasson"
                onChange={handleFieldChange}
                type="select"
              >
                <option value={false}>Não</option>
                <option value={true}>Sim</option>
              </Form.Select>
              <label className='text-danger'>{message ? message.processo_frasson : ''}</label>
        </Form.Group>
        {ambientalState && ambientalState.appo.file &&
        <Form.Group className="mb-2" as={Col} lg={3}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Arquivo PDF</Form.Label>}<br></br>
          <div className='mt-2'>     

                <Link to={`${ambientalState.appo.file}`} target="__blank" className="px-0 fw-bold text-danger">
                    <FontAwesomeIcon icon={faFilePdf} className="me-2"></FontAwesomeIcon>Visualizar PDF
                </Link>
          </div>
        </Form.Group>} 

        <Form.Group className="mb-2" as={Col} lg={3}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Substituir ou inserir arquivo PDF</Form.Label>}
          <Form.Control
            placeholder={!hasLabel ? 'Arquivo PDF' : ''}
            name="file"
            onChange={handleImageChange}
            type="file"
          />
          <label className='text-danger'>{message ? message.file : ''}</label>
        </Form.Group>

        <Form.Group className={`mb-0 ${type === 'edit' ? 'text-start' : 'text-end'}`}>
          <Button
            className="w-40"
            type="submit"
            disabled={
                !formData.nome_requerente ||
                !formData.numero_processo
              }
            >
              {type === 'edit' ? "Atualizar Processo"
              : "Cadastrar Processo"}
          </Button>
        </Form.Group>           
      </Form>
    </>
  );
};

APPOForm.propTypes = {
  hasLabel: PropTypes.bool
};

export default APPOForm;

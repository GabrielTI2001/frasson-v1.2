import React, { useEffect, useState, useContext } from 'react';
import PropTypes from 'prop-types';
import AsyncSelect from 'react-select/async';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Button, Form, Col, Row} from 'react-bootstrap';
import { fetchCaptacao, fetchFinalidade, fetchMunicipio} from './../Data';
import customStyles, {customStylesDark} from '../../../components/Custom/SelectStyles';
import { AmbientalContext } from '../../../context/Context';
import { useAppContext } from '../../../Main';

const OutorgaForm = ({ hasLabel, type, submit, addpoint}) => {
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
  const [captacao, setCaptacao] = useState([])

  const handleApi = async (dadosform) => {
    const link = `${process.env.REACT_APP_API_URL}/environmental/inema/outorgas/${type === 'edit' ? uuid+'/' : ''}`
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
            ambientalDispatch({type:'SET_DATA', payload:{
              outorga: {coordenadas:ambientalState.outorga.coordenadas,...formData}
            }})
            channel.postMessage({ tipo: 'atualizar_outorga', outorga_id:ambientalState.outorga.id, reg:data});
            toast.success("Registro Atualizado com Sucesso!")
          }
          else{
            toast.success("Registro Efetuado com Sucesso!")
            navigate(`/ambiental/inema/outorgas/edit/${data.uuid}`);
          }
        }
    } catch (error) {
        console.error('Erro:', error);
    }
  };

  const handleSubmit = e => {
    if (formData.data_validade === ''){
      setFormData({...formData, data_validade:undefined})
    }
    if (formData.data_publicacao === ''){
      setFormData({...formData, data_publicacao:undefined})
    }
    setMessage(null)
    e.preventDefault();
    handleApi(formData);
  };

  const handleFieldChange = e => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  useEffect(()=>{
    const loadFormData = async () => {
      if(ambientalState){
        setFormData({...formData, numero_portaria:ambientalState.outorga.numero_portaria, numero_processo:ambientalState.outorga.numero_processo,
          nome_requerente: ambientalState.outorga.nome_requerente, municipio: ambientalState.outorga.municipio, data_publicacao: ambientalState.outorga.data_publicacao,
          data_validade:ambientalState.outorga.data_validade, captacao: ambientalState.outorga.captacao, finalidade: ambientalState.outorga.finalidade, cpf_cnpj: ambientalState.outorga.cpf_cnpj,
          nome_propriedade: ambientalState.outorga.nome_propriedade, bacia_hidro: ambientalState.outorga.bacia_hidro, area_ha: ambientalState.outorga.area_ha, processo_frasson: ambientalState.outorga.processo_frasson
        })
        setDefaultOptions({ municipio: {value: ambientalState.outorga.municipio, label: ambientalState.outorga.nome_municipio}, 
          finalidade: {value: ambientalState.outorga.finalidade, label: ambientalState.outorga.str_finalidade}}); 
      }
    
    }
    const buscar = async () =>{
      const data = await fetchCaptacao();
      if (data.status === 401){
        navigate("auth/login")
      }
      setCaptacao(data.dados)
    }

    if (captacao.length === 0){
      buscar()
    }
    if (type === 'edit' && (!defaultoptions || !ambientalState)){
      loadFormData()
    }
    else{
      if(!defaultoptions){
        setDefaultOptions({municipio:{}, finalidade:{}})
      }
    }

  },[])

  return (
    <>
      <Form onSubmit={handleSubmit} className='row'>

        <Form.Group className="mb-2" as={Col} lg={2} xl={2} xxl={2}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Nº Portaria*</Form.Label>}
            <Form.Control
              placeholder={!hasLabel ? 'Nº Portaria' : ''}
              value={formData.numero_portaria || ''}
              name="numero_portaria"
              onChange={handleFieldChange}
              type="text"
            />
            <label className='text-danger error-msg'>{message ? message.numero_portaria : ''}</label>
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
            <label className='text-danger error-msg'>{message ? message.data_publicacao : ''}</label>
          </Form.Group>

          <Form.Group className="mb-2" as={Col} lg={2}>
            {hasLabel && <Form.Label className='fw-bold mb-1'>Data Vencimento*</Form.Label>}
            <Form.Control
              placeholder={!hasLabel ? 'Data Vencimento' : ''}
              value={formData.data_validade || ''}
              name="data_validade"
              onChange={handleFieldChange}
              type="date"
            />
            <label className='text-danger error-msg'>{message ? message.data_validade : ''}</label>
          </Form.Group>

          <Form.Group className="mb-2" as={Col} lg={4}>
            {hasLabel && <Form.Label className='fw-bold mb-1'>Nº Processo INEMA*</Form.Label>}
            <Form.Control
              placeholder={!hasLabel ? 'Nº Processo INEMA' : ''}
              value={formData.numero_processo || ''}
              name="numero_processo"
              onChange={handleFieldChange}
              type="text"
            />
            <label className='text-danger error-msg'>{message ? message.numero_processo : ''}</label>
          </Form.Group>

          <Form.Group className="mb-2" as={Col} lg={2}>
            {hasLabel && <Form.Label className='fw-bold mb-1'>Conduzido Frasson?*</Form.Label>}
            <Form.Select
              placeholder={!hasLabel ? 'Finalidade Outorga' : ''}
              value={formData.processo_frasson || ''}
              name="processo_frasson"
              onChange={handleFieldChange}
              type="select"
            >
              <option value={false}>Não</option>
              <option value={true}>Sim</option>
            </Form.Select>
            <label className='text-danger error-msg'>{message ? message.processo_frasson : ''}</label>
          </Form.Group>

          <Form.Group className="mb-2" as={Col} lg={5}>
            {hasLabel && <Form.Label className='fw-bold mb-1'>Nome Requerente*</Form.Label>}
            <Form.Control
              placeholder={!hasLabel ? 'Nome Requerente' : ''}
              value={formData.nome_requerente || ''}
              name="nome_requerente"
              onChange={handleFieldChange}
              type="text"
            />
            <label className='text-danger error-msg'>{message ? message.nome_requerente : ''}</label>
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
            <label className='text-danger error-msg'>{message ? message.cpf_cnpj : ''}</label>
          </Form.Group>

          <Form.Group className="mb-2" as={Col} lg={4}>
            {hasLabel && <Form.Label className='fw-bold mb-1'>Tipo de Captação*</Form.Label>}
            <Form.Select
              placeholder={!hasLabel ? 'Tipo de Captação' : ''}
              value={formData.captacao || ''}
              name="captacao"
              onChange={handleFieldChange}
              type="select"
            >
              <option value={undefined}>----</option>
              {captacao &&( captacao.map( c =>(
                <option key={c.value} value={c.value}>{c.label}</option>
              )))}
            </Form.Select>
            <label className='text-danger error-msg'>{message ? message.captacao : ''}</label>
          </Form.Group>

            <Form.Group className="mb-2" as={Col} lg={5}>
              {hasLabel && <Form.Label className='fw-bold mb-1'>Localidade*</Form.Label>}
              <Form.Control
                placeholder={!hasLabel ? 'Localidade' : ''}
                value={formData.nome_propriedade || ''}
                name="nome_propriedade"
                onChange={handleFieldChange}
                type="text"
              />
              <label className='text-danger error-msg'>{message ? message.nome_propriedade : ''}</label>
            </Form.Group>

            {defaultoptions && (
              <Form.Group className="mb-2" as={Col} lg={4}>
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
                <label className='text-danger error-msg'>{message ? message.municipio : ''}</label>
              </Form.Group>        
            )}

            <Form.Group className="mb-2" as={Col} lg={3}>
              {hasLabel && <Form.Label className='fw-bold mb-1'>Área Outorgada (ha)</Form.Label>}
              <Form.Control
                placeholder={!hasLabel ? 'Bacia Hidrográfica' : ''}
                value={formData.area_ha || ''}
                name="area_ha"
                onChange={handleFieldChange}
                type="text"
              />
              <label className='text-danger error-msg'>{message ? message.area_ha : ''}</label>
            </Form.Group>

            <Form.Group className="mb-2" as={Col} lg={5}>
              {hasLabel && <Form.Label className='fw-bold mb-1'>Bacia Hidrográfica*</Form.Label>}
              <Form.Control
                placeholder={!hasLabel ? 'Bacia Hidrográfica' : ''}
                value={formData.bacia_hidro || ''}
                name="bacia_hidro"
                onChange={handleFieldChange}
                type="text"
              />
              <label className='text-danger error-msg'>{message ? message.bacia_hidro : ''}</label>
            </Form.Group>
            
            {defaultoptions && (
            <Form.Group className="mb-2" as={Col} lg={4}>
              {hasLabel && <Form.Label className='fw-bold mb-1'>Finalidade Outorga*</Form.Label>}
              <AsyncSelect loadOptions={fetchFinalidade} name='finalidade' styles={theme === 'light'? customStyles : customStylesDark} classNamePrefix="select"
                defaultValue={type === 'edit' ? (defaultoptions ? defaultoptions.finalidade : null) : null }
                onChange={(selected) => {
                  setFormData((prevFormData) => ({
                    ...prevFormData,
                    finalidade: selected.value
                  }));
                }}>
              </AsyncSelect>
              <label className='text-danger error-msg'>{message ? message.finalidade : ''}</label>
            </Form.Group>
            )}
        <Row>
          <Form.Group className={`mb-2 pe-1 ${type === 'edit' ? 'text-start' : 'text-end'}`} as={Col} xl='auto' sm='auto' xs={12}>
            <Button
              className="w-40"
              type="submit"
              disabled={
                  !formData.numero_portaria ||
                  !formData.numero_processo
                }
              >
                {type === 'edit' ? "Atualizar Portaria" : "Cadastrar Portaria"}
            </Button>
          </Form.Group>   
          {type === 'edit' &&
            <Form.Group className={`mb-0`} as={Col} xl='auto' sm='auto' xs={12}>
              <Button onClick={addpoint} className='btn-success'>Adicionar Ponto</Button>
            </Form.Group>   
          }
        </Row>
      </Form>
    </>
  );
};

OutorgaForm.propTypes = {
  hasLabel: PropTypes.bool
};

export default OutorgaForm;

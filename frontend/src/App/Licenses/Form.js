import React, { useEffect, useState, useContext } from 'react';
import PropTypes from 'prop-types';
import AsyncSelect from 'react-select/async';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Button, Form, Col} from 'react-bootstrap';
import { fetchInstituicoesRazaoSocial, fetchPessoal, fetchDetalhamentoServicos, FetchImoveisRurais } from '../Pipefy/Data';
import customStyles, {customStylesDark} from '../../components/Custom/SelectStyles';
import { useAppContext } from '../../Main';
import { SelectSearchOptions, sendData } from '../../helpers/Data';

const FormLicenca = ({ hasLabel, data, type, submit}) => {
  const {config: {theme}} = useAppContext();
  const user = JSON.parse(localStorage.getItem('user'))
  const navigate = useNavigate();
  const [formData, setFormData] = useState({created_by: user.id, dias_renovacao:90});
  const [message, setMessage] = useState()
  const token = localStorage.getItem("token")
  const [defaultoptions, setDefaultOptions] = useState()

  const handledata = async (form) =>{
    const {response, dados} = await sendData({type:type, url:'licenses/index', keyfield:type === 'edit' ? data.uuid : null, dadosform:form})
    if(response.status === 400){
      setMessage({...dados})
    }
    else if (response.status === 401){
      navigate("/auth/login");
    }
    else if (response.status === 201 || response.status === 200){
      if (type === 'edit'){
        toast.success("Registro Atualizado com Sucesso!")
        submit(dados)
      }
      else{
        toast.success("Registro Efetuado com Sucesso!")
        submit('add', {...dados, list_propriedades:data.list_propriedades.map(l => l.label).join(", ")})
      }
    }
  }

  const handleSubmit = e => {
    if (formData.data_validade === ''){
      setFormData({...formData, data_validade:undefined})
    }
    if (formData.data_emissao === ''){
      setFormData({...formData, data_emissao:undefined})
    }
    setMessage(null)
    e.preventDefault();
    // handleApi(formData);
    handledata(formData)
  };

  const handleFieldChange = e => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  useEffect(()=>{
    const loadFormData = async () => {
      const {info_user, list_propriedades, status, ...rest} = data;
      setFormData({...formData, ...rest})
      setDefaultOptions({
        beneficiario:{value:data.beneficiario, label:data.str_beneficiario}, 
        tipo_licenca:{value:data.tipo_licenca, label:data.str_tipo_licenca}, 
        instituicao:{value:data.instituicao, label:data.str_instituicao}, propriedades:list_propriedades
      })
    }
    if (type === 'edit' && (!defaultoptions)){
      loadFormData()
    }
    else{
      if(!defaultoptions){
        setDefaultOptions({beneficiario:{}, tipo_licenca:{}, instituicao:{}, propriedades:[]})
      }
    }

  },[])

  return (
    <>
      <Form onSubmit={handleSubmit} className='row sectionform'>
        
        {defaultoptions && (
        <Form.Group className="mb-2" as={Col} xl={4} sm={6}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Beneficiário*</Form.Label>}
          <AsyncSelect loadOptions={(value) => SelectSearchOptions(value, 'register/pessoal', 'razao_social')} styles={theme === 'light'? customStyles : customStylesDark} classNamePrefix="select"
            defaultValue={type === 'edit' ? (defaultoptions ? defaultoptions.beneficiario : null) : null }
            onChange={(selected) => {
              setFormData((prevFormData) => ({
                ...prevFormData,
                beneficiario: selected.value
              }));
            }} />
          <label className='text-danger'>{message ? message.beneficiario : ''}</label>
        </Form.Group>
        )}

        {defaultoptions && (
        <Form.Group className="mb-2" as={Col} xl={4} sm={6}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Instituição*</Form.Label>}
          <AsyncSelect loadOptions={(value) => SelectSearchOptions(value, 'register/instituicoes-razaosocial', 'razao_social')} styles={theme === 'light'? customStyles : customStylesDark} classNamePrefix="select"
            defaultValue={type === 'edit' ? (defaultoptions ? defaultoptions.instituicao : null) : null }
            onChange={(selected) => {
              setFormData((prevFormData) => ({
                ...prevFormData,
                instituicao: selected.value
              }));
            }} />
          <label className='text-danger'>{message ? message.instituicao : ''}</label>
        </Form.Group>
        )}

        {defaultoptions && (
        <Form.Group className="mb-2" as={Col} xl={4} sm={6}> 
          {hasLabel && <Form.Label className='fw-bold mb-1'>Tipo Licença*</Form.Label>}
          <AsyncSelect loadOptions={(value) => SelectSearchOptions(value, 'register/detalhamentos', 'detalhamento_servico')} styles={theme === 'light'? customStyles : customStylesDark} classNamePrefix="select"
            defaultValue={type === 'edit' ? (defaultoptions ? defaultoptions.tipo_licenca : null) : null }
            onChange={(selected) => {
              setFormData((prevFormData) => ({
                ...prevFormData,
                tipo_licenca: selected.value
              }));
            }} />
          <label className='text-danger'>{message ? message.tipo_licenca : ''}</label>
        </Form.Group>
        )}

        {defaultoptions && (
        <Form.Group className="mb-2" as={Col} xl={4} sm={6}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Propriedades*</Form.Label>}
          <AsyncSelect loadOptions={(value) => SelectSearchOptions(value, 'farms/farms', 'nome', 'matricula')} styles={theme === 'light'? customStyles : customStylesDark} classNamePrefix="select"
            defaultValue={type === 'edit' ? (defaultoptions ? defaultoptions.propriedades : null) : null }
            onChange={(selected) => {
              setFormData((prevFormData) => ({
                ...prevFormData,
                propriedades: selected.map(s => s.value)
              }));
            }} isMulti={true} />
          <label className='text-danger'>{message ? message.propriedades : ''}</label>
        </Form.Group>
        )}

        <Form.Group className="mb-2" as={Col} xl={4} sm={6}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Detalhe da Licença</Form.Label>}
          <Form.Control
            value={formData.detalhe_licenca || ''}
            name="detalhe_licenca"
            onChange={handleFieldChange}
            type="text"
          />
          <label className='text-danger'>{message ? message.detalhe_licenca : ''}</label>
        </Form.Group>

        <Form.Group className="mb-2" as={Col} xl={4} sm={6}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Número do Requerimento</Form.Label>}
          <Form.Control
            value={formData.numero_requerimento || ''}
            name="numero_requerimento"
            onChange={handleFieldChange}
            type="text"
          />
          <label className='text-danger'>{message ? message.numero_requerimento : ''}</label>
        </Form.Group>

        <Form.Group className="mb-2" as={Col} xl={3} sm={6}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Número da Licença</Form.Label>}
          <Form.Control
            value={formData.numero_licenca || ''}
            name="numero_licenca"
            onChange={handleFieldChange}
            type="text"
          />
          <label className='text-danger'>{message ? message.numero_licenca : ''}</label>
        </Form.Group>

        <Form.Group className="mb-2" as={Col} xl={3} sm={6}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Número do Processo</Form.Label>}
          <Form.Control
            value={formData.numero_processo || ''}
            name="numero_processo"
            onChange={handleFieldChange}
            type="text"
          />
          <label className='text-danger'>{message ? message.numero_processo : ''}</label>
        </Form.Group>

        <Form.Group className="mb-2" as={Col} xl={3} sm={6}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Área Beneficiada</Form.Label>}
          <Form.Control
            value={formData.area_beneficiada || ''}
            name="area_beneficiada"
            onChange={handleFieldChange}
            type="number"
          />
          <label className='text-danger'>{message ? message.area_beneficiada : ''}</label>
        </Form.Group>

        <Form.Group className="mb-2" as={Col} xl={3} sm={6}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Data Emissão*</Form.Label>}
          <Form.Control
            value={formData.data_emissao || ''}
            name="data_emissao"
            onChange={handleFieldChange}
            type="date"
          />
          <label className='text-danger'>{message ? message.data_emissao : ''}</label>
        </Form.Group>

        <Form.Group className="mb-2" as={Col} xl={3} sm={6}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Data Validade*</Form.Label>}
          <Form.Control
            value={formData.data_validade || ''}
            name="data_validade"
            onChange={handleFieldChange}
            type="date"
          />
          <label className='text-danger'>{message ? message.data_validade : ''}</label>
        </Form.Group>

        <Form.Group className="mb-2" as={Col} xl={3} sm={6}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Prazo Renovação (dias)*</Form.Label>}
          <Form.Control
            value={formData.dias_renovacao || ''}
            name="dias_renovacao"
            onChange={handleFieldChange}
            type="number"
          />
          <label className='text-danger'>{message ? message.dias_renovacao : ''}</label>
        </Form.Group>

        <Form.Group className="mb-2" as={Col} xl={8} sm={12}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Descrição da Licença</Form.Label>}
          <Form.Control
            value={formData.descricao || ''}
            name="descricao"
            onChange={handleFieldChange}
            as='textarea'
          />
          <label className='text-danger'>{message ? message.descricao : ''}</label>
        </Form.Group>

        <Form.Group className={`mb-0 ${type === 'edit' ? 'text-start' : 'text-end'}`}>
          <Button className="w-40" type="submit">
            {type === 'edit' ? "Atualizar Licença"
            : "Cadastrar Licença"}
          </Button>
        </Form.Group>           
      </Form>
    </>
  );
};

export default FormLicenca;

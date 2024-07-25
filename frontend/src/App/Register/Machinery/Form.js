import React, { useEffect, useState } from 'react';
import AsyncSelect from 'react-select/async';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Button, Form, Col} from 'react-bootstrap';
import customStyles, {customStylesDark} from '../../../components/Custom/SelectStyles';
import { useAppContext } from '../../../Main';
import { SelectSearchOptions } from '../../../helpers/Data';

const MachineryForm = ({ hasLabel, type, submit, data}) => {
  const {config: {theme}} = useAppContext();
  const user = JSON.parse(localStorage.getItem('user'))
  const [formData, setFormData] = useState({
    created_by: user.id
  });
  const [message, setMessage] = useState()
  const channel = new BroadcastChannel('meu_canal');
  const navigate = useNavigate();
  const token = localStorage.getItem("token")
  const {uuid} = useParams()
  const [defaultoptions, setDefaultOptions] = useState()
  const estadocons = useState([{label:'Novo'}, {label:'Seminovo'}, {label:'Antigo'}])
  const situacao = useState([{label:'Quitado'}, {label:'Financiado'}])

  const handleApi = async (dadosform) => {
    const link = `${process.env.REACT_APP_API_URL}/register/machinery/${type === 'edit' ? uuid+'/':''}`
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
            submit('edit', ...formData)
            channel.postMessage({ tipo: 'atualizar_machinery', reg:data});
            toast.success("Registro Atualizado com Sucesso!")
          }
          else{
            toast.success("Registro Efetuado com Sucesso!")
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
      if(data){
        setFormData({...formData
        })
        setDefaultOptions({}); 
      }
    
    }

    if (type === 'edit' && (!defaultoptions || !data)){
      loadFormData()
    }
    else{
      if(!defaultoptions){
        setDefaultOptions({proprietario:{}, finalidade:{}})
      }
    }

  },[])

  return (
    <>
      <Form onSubmit={handleSubmit} className='row'>
        {defaultoptions && (
          <Form.Group className="mb-2" as={Col} xl={4} lg={6}>
            {hasLabel && <Form.Label className='fw-bold mb-1'>Proprietário da Máquina*</Form.Label>}
            <AsyncSelect 
              loadOptions={(v) => SelectSearchOptions(v, 'register/pessoal', 'razao_social', 'cpf_cnpj', false, null, null, navigate)} 
              name='proprietario' styles={theme === 'light'? customStyles : customStylesDark} classNamePrefix="select"
              defaultValue={ type === 'edit' ? (defaultoptions ? defaultoptions.proprietario : null) : null }
              onChange={(selected) => {
              setFormData((prevFormData) => ({
                ...prevFormData,
                proprietario: selected.value
                }));
              }}>
            </AsyncSelect>
            <label className='text-danger'>{message ? message.proprietario : ''}</label>
          </Form.Group>        
        )}
        {defaultoptions && (
          <Form.Group className="mb-2" as={Col} xl={4} lg={6}>
            {hasLabel && <Form.Label className='fw-bold mb-1'>Tipo Máquina*</Form.Label>}
            <AsyncSelect 
              loadOptions={(v) => SelectSearchOptions(v, 'register/pessoal', 'razao_social', 'cpf_cnpj', false, null, null, navigate)} 
              name='tipo' styles={theme === 'light'? customStyles : customStylesDark} classNamePrefix="select"
              defaultValue={ type === 'edit' ? (defaultoptions ? defaultoptions.tipo : null) : null }
              onChange={(selected) => {
              setFormData((prevFormData) => ({
                ...prevFormData,
                tipo: selected.value
                }));
              }}>
            </AsyncSelect>
            <label className='text-danger'>{message ? message.tipo : ''}</label>
          </Form.Group>        
        )}

        <Form.Group className="mb-2" as={Col} sm={6} xl={2} lg={6}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Quantidade*</Form.Label>}
          <Form.Control
            placeholder={!hasLabel ? 'Quantidade' : ''}
            value={formData.quantidade || ''}
            name="quantidade"
            onChange={handleFieldChange}
            type="text"
          />
          <label className='text-danger'>{message ? message.quantidade : ''}</label>
        </Form.Group>

        <Form.Group className="mb-2" as={Col} sm={6} xl={2} lg={6}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Ano Fabricação</Form.Label>}
          <Form.Control
            placeholder={!hasLabel ? 'Ano Fabricação' : ''}
            value={formData.ano_fabricacao || ''}
            name="ano_fabricacao"
            onChange={handleFieldChange}
            type="text"
          />
          <label className='text-danger'>{message ? message.ano_fabricacao : ''}</label>
        </Form.Group>

        <Form.Group className="mb-2" as={Col} sm={12} lg={6} xl={4}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Fabricante</Form.Label>}
          <Form.Control
            placeholder={!hasLabel ? 'Fabricante' : ''}
            value={formData.fabricante || ''}
            name="fabricante"
            onChange={handleFieldChange}
            type="text"
          />
          <label className='text-danger'>{message ? message.fabricante : ''}</label>
        </Form.Group>

        <Form.Group className="mb-2" as={Col} xl={3} lg={6} sm={6}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Modelo</Form.Label>}
          <Form.Control
            placeholder={!hasLabel ? 'Modelo' : ''}
            value={formData.modelo || ''}
            name="modelo"
            onChange={handleFieldChange}
            type="text"
          />
          <label className='text-danger'>{message ? message.modelo : ''}</label>
        </Form.Group>

        <Form.Group className="mb-2" as={Col} xl={3} lg={6} sm={6}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Série/Chassi</Form.Label>}
          <Form.Control
            placeholder={!hasLabel ? 'Série/Chassi' : ''}
            value={formData.serie_chassi || ''}
            name="serie_chassi"
            onChange={handleFieldChange}
            type="text"
          />
          <label className='text-danger'>{message ? message.serie_chassi : ''}</label>
        </Form.Group>

        <Form.Group className="mb-2" as={Col} xl={2} lg={6} sm={6}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Valor Total*</Form.Label>}
          <Form.Control
            placeholder={!hasLabel ? 'Valor' : ''}
            value={formData.valor_total || ''}
            name="valor_total"
            onChange={handleFieldChange}
            type="number"
          />
          <label className='text-danger'>{message ? message.valor_total : ''}</label>
        </Form.Group>

        <Form.Group className="mb-2" as={Col} xl={3} lg={6} sm={6}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Situação*</Form.Label>}
          <Form.Select
            placeholder={!hasLabel ? 'Situação' : ''}
            value={formData.situacao || ''}
            name="situacao"
            onChange={handleFieldChange}
            type="select"
          >
            <option value={undefined}>----</option>
            {situacao &&( situacao.map( c =>(
              <option key={c.label} value={c.label}>{c.label}</option>
            )))}
          </Form.Select>
          <label className='text-danger'>{message ? message.situacao : ''}</label>
        </Form.Group>

        <Form.Group className="mb-2" as={Col} xl={3} lg={6} sm={6}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Cor</Form.Label>}
          <Form.Control
            placeholder={!hasLabel ? 'Cor' : ''}
            value={formData.cor || ''}
            name="cor"
            onChange={handleFieldChange}
            type="text"
          />
          <label className='text-danger'>{message ? message.cor : ''}</label>
        </Form.Group>

        <Form.Group className="mb-2" as={Col} xl={3} lg={6} sm={6}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Potência ou Capacidade</Form.Label>}
          <Form.Control
            placeholder={!hasLabel ? 'Potência ou Capacidade' : ''}
            value={formData.potencia_capacidade || ''}
            name="potencia_capacidade"
            onChange={handleFieldChange}
            type="text"
          />
          <label className='text-danger'>{message ? message.potencia_capacidade : ''}</label>
        </Form.Group>

        <Form.Group className="mb-2" as={Col} xl={3} lg={6} sm={6}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Estado Conservação*</Form.Label>}
          <Form.Select
            placeholder={!hasLabel ? 'Estado Conservação' : ''}
            value={formData.estado_conservacao || ''}
            name="estado_conservacao"
            onChange={handleFieldChange}
            type="select"
          >
            <option value={undefined}>----</option>
            {estadocons &&( estadocons.map( c =>(
              <option key={c.label} value={c.label}>{c.label}</option>
            )))}
          </Form.Select>
          <label className='text-danger'>{message ? message.estado_conservacao : ''}</label>
        </Form.Group>

        <Form.Group className="mb-2" as={Col} xl={4} lg={6}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Imóvel Rural*</Form.Label>}
          <Form.Control
            placeholder={!hasLabel ? 'Imóvel Rural' : ''}
            value={formData.propriedade || ''}
            name="propriedade"
            onChange={handleFieldChange}
            type="text"
          />
          <label className='text-danger'>{message ? message.propriedade : ''}</label>
        </Form.Group>

        <Form.Group className="mb-2" as={Col} xl={3} lg={6} sm={6}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Percentual Participação</Form.Label>}
          <Form.Control
            placeholder={!hasLabel ? 'Potência ou Capacidade' : ''}
            value={formData.participacao || ''}
            name="participacao"
            onChange={handleFieldChange}
            type="text"
          />
          <label className='text-danger'>{message ? message.participacao : ''}</label>
        </Form.Group>

        <Form.Group className={`mb-0 ${type === 'edit' ? 'text-start' : 'text-end'}`}>
          <Button
            className="w-40"
            type="submit"
            >
              {type === 'edit' ? "Atualizar Máquina"
              : "Cadastrar Máquina"}
          </Button>
        </Form.Group>           
      </Form>
    </>
  );
};

export default MachineryForm;

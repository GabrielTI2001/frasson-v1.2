import React, { useEffect, useState } from 'react';
import AsyncSelect from 'react-select/async';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Button, Form, Col, Spinner} from 'react-bootstrap';
import customStyles, {customStylesDark} from '../../../components/Custom/SelectStyles';
import { useAppContext } from '../../../Main';
import { SelectSearchOptions, sendData } from '../../../helpers/Data';
import { RedirectToLogin } from '../../../Routes/PrivateRoute';

const MachineryForm = ({ hasLabel, type, submit, data}) => {
  const {config: {theme}} = useAppContext();
  const user = JSON.parse(localStorage.getItem('user'))
  const [formData, setFormData] = useState({
    created_by: user.id
  });
  const [message, setMessage] = useState()
  const navigate = useNavigate();
  const token = localStorage.getItem("token")
  const {uuid} = useParams()
  const [defaultoptions, setDefaultOptions] = useState()
  const estadocons = useState([{label:'Novo'}, {label:'Seminovo'}, {label:'Antigo'}])
  const situacao = useState([{label:'Quitado'}, {label:'Financiado'}])
  const [isLoading, setIsLoading] = useState(false);

  const handleApi = async (dadosform) => {
    const {resposta, dados} = await sendData({type:'add', url:'register/machinery', keyfield:type === 'edit' && uuid, dadosform:dadosform})
    if(resposta.status === 400){
      setMessage({...dados})
    }
    else if (resposta.status === 401){
      RedirectToLogin(navigate)
    }
    else if (resposta.status === 201 || resposta.status === 200){
      if (type === 'edit'){
        toast.success("Registro Atualizado com Sucesso!")
      }
      else{
        toast.success("Registro Efetuado com Sucesso!")
      }
      submit(type, ...formData)
    }
    setIsLoading(false)
  };

  const handleSubmit = e => {
    setIsLoading(true)
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
      <Form onSubmit={handleSubmit} className='row row-cols-1'>
        {defaultoptions && (
          <Form.Group className="mb-2" as={Col}>
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
          <Form.Group className="mb-2" as={Col}>
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

        <Form.Group className="mb-2" as={Col}>
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

        <Form.Group className="mb-2" as={Col}>
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

        <Form.Group className="mb-2" as={Col} >
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

        <Form.Group className="mb-2" as={Col}>
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

        <Form.Group className="mb-2" as={Col}>
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

        <Form.Group className="mb-2" as={Col}>
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

        <Form.Group className="mb-2" as={Col}>
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
              <option key={c.value} value={c.value}>{c.label}</option>
            )))}
          </Form.Select>
          <label className='text-danger'>{message ? message.situacao : ''}</label>
        </Form.Group>

        <Form.Group className="mb-2" as={Col}>
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

        <Form.Group className="mb-2" as={Col}>
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

        <Form.Group className="mb-2" as={Col} >
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
              <option key={c.label} value={c.value}>{c.label}</option>
            )))}
          </Form.Select>
          <label className='text-danger'>{message ? message.estado_conservacao : ''}</label>
        </Form.Group>

        <Form.Group className="mb-2" as={Col}>
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

        <Form.Group className="mb-2" as={Col} >
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
        <Form.Group className={`mb-0 text-center fixed-footer ${theme === 'light' ? 'bg-white' : 'bg-dark'}`}>
          <Button className="w-50" type="submit" disabled={isLoading} >
            {isLoading ? <Spinner size='sm' className='p-0' style={{marginBottom:'-4px'}}/> : 'Cadastrar Imóvel Rural'}
          </Button>
        </Form.Group>       
      </Form>
    </>
  );
};

export default MachineryForm;

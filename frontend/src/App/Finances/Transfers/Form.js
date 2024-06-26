import React, { useEffect, useState} from 'react';
import { useNavigate} from 'react-router-dom';
import { toast } from 'react-toastify';
import { Button, Form, Col} from 'react-bootstrap';
import { useAppContext } from '../../../Main';
import { SelectOptions } from '../../../helpers/Data';
import { RetrieveRecord } from '../../../helpers/Data';

const FormTransfer = ({ hasLabel, type, submit, data}) => {
  const {config: {theme}} = useAppContext();
  const user = JSON.parse(localStorage.getItem('user'))
  const [formData, setFormData] = useState({
    user: user.id
  });
  const [message, setMessage] = useState()
  const [record, setRecord] = useState()
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const id = data ? data.id : '';
  const [caixas, setCaixas] = useState()

  const handleApi = async (dadosform) => {
    const link = `${process.env.REACT_APP_API_URL}/finances/transfers/${type === 'edit' ? id+'/':''}`
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
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  useEffect(()=>{
    const loadFormData = async () => {
      const status = !record ? await RetrieveRecord(id, 'finances/transfers', (data) => setRecord(data)) : 200
      if(status === 200){
        if(record){
          const filteredData = Object.entries(record)
            .filter(([key, value]) => value !== null)
            .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
        
          const { str_categoria, str_beneficiario, ...restData } = filteredData;
          setFormData({...formData, ...restData})
        }
      }
      else{
        navigate("/auth/login")
      }
    }

    if (type === 'edit'){
      loadFormData()
    }
    if (!caixas){ 
      const get = async () => {
        const dados = await SelectOptions('finances/caixas', 'nome')
        setCaixas(dados)
      }
      get()
    }

  },[record])

  return (
    <>
      <Form onSubmit={handleSubmit} className='row'>
        <Form.Group className="mb-2" as={Col} xl={3} sm={6}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Data da Transferência*</Form.Label>}
          <Form.Control
            placeholder={!hasLabel ? 'Data' : ''}
            value={formData.data || ''}
            name="data"
            onChange={handleFieldChange}
            type="date"
          />
          <label className='text-danger'>{message ? message.data : ''}</label>
        </Form.Group>

        <Form.Group className="mb-2" as={Col} xl={3} sm={6}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Valor da Transferência*</Form.Label>}
          <Form.Control
            placeholder={!hasLabel ? 'Valor' : ''}
            value={formData.valor || ''}
            name="valor"
            onChange={handleFieldChange}
            type="number"
          />
          <label className='text-danger'>{message ? message.valor : ''}</label>
        </Form.Group>

        <Form.Group className="mb-2" as={Col} xl={3} sm={6}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Caixa Origem*</Form.Label>}
          <Form.Select
            name='caixa_origem'
            value={formData.caixa_origem || ''}
            onChange={handleFieldChange}
          >
            <option value={undefined}>----</option>
            {caixas &&(caixas.map( c =>(
              <option key={c.value} value={c.value}>{c.label}</option>
            )))}
          </Form.Select>
          <label className='text-danger'>{message ? message.caixa_origem : ''}</label>
        </Form.Group>     

        <Form.Group className="mb-2" as={Col} xl={3} sm={6}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Caixa Destino*</Form.Label>}
          <Form.Select
            name='caixa_destino'
            value={formData.caixa_destino || ''}
            onChange={handleFieldChange}
          >
            <option value={undefined}>----</option>
            {caixas &&(caixas.map( c =>(
              <option key={c.value} value={c.value}>{c.label}</option>
            )))}
          </Form.Select>
          <label className='text-danger'>{message ? message.caixa_destino : ''}</label>
        </Form.Group>      

        <Form.Group className="mb-2" as={Col} xl={6} sm={6}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Descrição*</Form.Label>}
          <Form.Control
            placeholder={!hasLabel ? 'Descrição' : ''}
            value={formData.description || ''}
            name="description"
            onChange={handleFieldChange}
            type="text"
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

export default FormTransfer;

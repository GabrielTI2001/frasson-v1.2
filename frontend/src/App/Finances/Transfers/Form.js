import React, { useEffect, useState} from 'react';
import { useNavigate} from 'react-router-dom';
import { toast } from 'react-toastify';
import { Button, Form, Col, Spinner} from 'react-bootstrap';
import { SelectOptions, sendData } from '../../../helpers/Data';
import { RetrieveRecord } from '../../../helpers/Data';
import { useAppContext } from '../../../Main';
import { RedirectToLogin } from '../../../Routes/PrivateRoute';

const FormTransfer = ({ hasLabel, type, submit, data}) => {
  const user = JSON.parse(localStorage.getItem('user'))
  const {config: {theme}} = useAppContext();
  const [formData, setFormData] = useState({
    user: user.id
  });
  const [message, setMessage] = useState()
  const [record, setRecord] = useState()
  const navigate = useNavigate();
  const id = data ? data.id : '';
  const [caixas, setCaixas] = useState()
  const [isLoading, setIsLoading] = useState(false);

  const handleApi = async (dadosform) => {
    const {resposta, dados} = await sendData({type:type, url:'finances/transfers', keyfield:type === 'edit' ? id : null, 
      dadosform:dadosform})
    if(resposta.status === 400){
      setMessage(dados)
    }
    else if (resposta.status === 401){
      RedirectToLogin(navigate);
    }
    else if (resposta.status === 201 || resposta.status === 200){
      if (type === 'edit'){
        submit('edit', dados)
        toast.success("Registro Atualizado com Sucesso!")
      }
      else{
        submit('add', dados)
        toast.success("Registro Efetuado com Sucesso!")
      }
    }
    setIsLoading(false)
  };

  const handleSubmit = async e => {
    setIsLoading(true)
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
        RedirectToLogin(navigate)
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
        <Form.Group className="mb-2" as={Col} xl={12}>
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

        <Form.Group className="mb-2" as={Col} xl={12}>
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

        <Form.Group className="mb-2" as={Col} xl={12}>
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

        <Form.Group className="mb-2" as={Col} xl={12}>
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

        <Form.Group className="mb-2" as={Col} xl={12}>
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
        <Form.Group className={`mb-0 text-center fixed-footer ${theme === 'light' ? 'bg-white' : 'bg-dark'}`}>
          <Button className="w-50" type="submit" disabled={isLoading} >
            {isLoading ? <Spinner size='sm' className='p-0' style={{marginBottom:'-4px'}}/> : type === 'edit' ? 'Atualizar' : 'Cadastrar'}
          </Button> 
        </Form.Group>    
      </Form>
    </>
  );
};

export default FormTransfer;

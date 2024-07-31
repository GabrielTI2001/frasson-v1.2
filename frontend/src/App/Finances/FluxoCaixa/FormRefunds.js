import React, { useEffect, useState} from 'react';
import { useNavigate} from 'react-router-dom';
import { toast } from 'react-toastify';
import { Button, Form, Col, Spinner} from 'react-bootstrap';
import { useAppContext } from '../../../Main';
import { SelectSearchOptions, sendData } from '../../../helpers/Data';
import AsyncSelect from 'react-select/async';
import { RetrieveRecord } from '../../../helpers/Data';
import customStyles, { customStylesDark } from '../../../components/Custom/SelectStyles';
import { RedirectToLogin } from '../../../Routes/PrivateRoute';

const FormReembolso = ({ hasLabel, type, submit, data}) => {
  const {config: {theme}} = useAppContext();
  const user = JSON.parse(localStorage.getItem('user'))
  const [formData, setFormData] = useState({
    user: user.id
  });
  const [message, setMessage] = useState()
  const [record, setRecord] = useState()
  const navigate = useNavigate();
  const [defaultoptions, setDefaultOptions] = useState();
  const id = data ? data.id : '';
  const [isLoading, setIsLoading] = useState(false);

  const handleApi = async (dadosform) => {
    const {resposta, dados} = await sendData({type:type, url:'finances/refunds', keyfield:type === 'edit' ? id : null, 
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
      const status = !record ? await RetrieveRecord(id, 'finances/refunds', (data) => setRecord(data)) : 200
      if(status === 200){
        if(record){
          const filteredData = Object.entries(record)
            .filter(([key, value]) => value !== null)
            .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
        
          const { str_cliente, ...restData } = filteredData;
          setFormData({...formData, ...restData})
          setDefaultOptions({cliente:{value:filteredData.cliente, label:str_cliente}})
        }
      }
      else{
        RedirectToLogin(navigate)
      }
    }

    if (type === 'edit'){
      loadFormData()
    }
    else{
      if(!defaultoptions){
        setDefaultOptions({})
      }
    }

  },[record])

  return (
    <>
      <Form onSubmit={handleSubmit} className='row'>
        <Form.Group className="mb-2" as={Col} xl={12}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Data*</Form.Label>}
          <Form.Control
            placeholder={!hasLabel ? 'Data' : ''}
            value={formData.data || ''}
            name="data"
            onChange={handleFieldChange}
            type="date"
          />
          <label className='text-danger'>{message ? message.data : ''}</label>
        </Form.Group>

        {defaultoptions &&
          <Form.Group className="mb-2" as={Col} xl={12}>
            {hasLabel && <Form.Label className='fw-bold mb-1'>Cliente*</Form.Label>}
            <AsyncSelect 
              name='tipo' 
              loadOptions={(value) => SelectSearchOptions(value, 'register/pessoal', 'razao_social', 'cpf_cnpj')}
              styles={theme === 'light'? customStyles : customStylesDark} classNamePrefix="select"
              defaultValue={type === 'edit' ? defaultoptions.cliente || '' : ''}
              onChange={(selected) => {
                setFormData((prevFormData) => ({
                  ...prevFormData,
                  cliente: selected.value
                }));
              }}>
            </AsyncSelect>
            <label className='text-danger'>{message ? message.tipo : ''}</label>
          </Form.Group>        
        }

        <Form.Group className="mb-2" as={Col} xl={12}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Valor*</Form.Label>}
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
          {hasLabel && <Form.Label className='fw-bold mb-1'>Cobrança?</Form.Label>}
          <Form.Select
            name='cobranca'
            value={formData.cobranca || ''}
            onChange={handleFieldChange}
          >
            <option value={false}>Não</option>
            <option value={true}>Sim</option>
          </Form.Select>
          <label className='text-danger'>{message ? message.cobranca : ''}</label>
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

export default FormReembolso;

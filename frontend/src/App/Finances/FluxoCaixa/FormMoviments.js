import React, { useEffect, useState} from 'react';
import { useNavigate} from 'react-router-dom';
import { toast } from 'react-toastify';
import { Button, Form, Col, Spinner} from 'react-bootstrap';
import { useAppContext } from '../../../Main';
import { SelectOptions, sendData } from '../../../helpers/Data';
import { SelectSearchOptions } from '../../../helpers/Data';
import { RetrieveRecord } from '../../../helpers/Data';
import AsyncSelect from 'react-select/async';
import customStyles, {customStylesDark} from '../../../components/Custom/SelectStyles';
import { RedirectToLogin } from '../../../Routes/PrivateRoute';

const FormMovimentacao = ({ hasLabel, type, submit, data}) => {
  const {config: {theme}} = useAppContext();
  const user = JSON.parse(localStorage.getItem('user'))
  const [formData, setFormData] = useState({
    user: user.id
  });
  const [message, setMessage] = useState()
  const [record, setRecord] = useState()
  const navigate = useNavigate();
  const id = data ? data.id : '';
  const [caixas, setCaixas] = useState()
  const [defaultoptions, setDefaultOptions] = useState();
  const [isLoading, setIsLoading] = useState(false);

  const handleApi = async (dadosform) => {
    const {resposta, dados} = await sendData({type:type, url:'finances/moviments', keyfield:type === 'edit' ? id : null, 
      dadosform:dadosform})
    if(resposta.status === 400){
      setMessage(dados)
    }
    else if (resposta.status === 401){
      RedirectToLogin(navigate);
    }
    else if (resposta.status === 201 || resposta.status === 200){
      if (type === 'edit'){
        submit('edit', {...dados, valor:{color:dados.str_rd === 'R' ? 'success' : 'danger', 
          text:Number(dados.valor).toLocaleString('pt-BR', {maximumFractionDigits:2, minimumFractionDigits:2})
        }})
        toast.success("Registro Atualizado com Sucesso!")
      }
      else{
        submit('add', {...dados, valor:{color:dados.str_rd === 'R' ? 'success' : 'danger', 
          text:Number(dados.valor).toLocaleString('pt-BR', {maximumFractionDigits:2, minimumFractionDigits:2})
        }})
        toast.success("Registro Efetuado com Sucesso!")
      }
    }
    setIsLoading(false)
  };

  const handleSubmit = async e => {
    setMessage(null)
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
      const status = !record ? await RetrieveRecord(id, 'finances/moviments', (data) => setRecord(data)) : 200
      if(status === 200){
        if(record){
          const filteredData = Object.entries(record)
            .filter(([key, value]) => value !== null)
            .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
        
          const {str_tipo, ...restData } = filteredData;
          setFormData({...formData, ...restData})
          setDefaultOptions({
            tipo: {value:data.tipo, label: str_tipo}, 
          })
        }
      }
      else{
        RedirectToLogin(navigate)
      }
    }

    if (type === 'edit' && !defaultoptions){
      loadFormData()
    }
    else{
      if(!defaultoptions){
        setDefaultOptions({tipo:{}})
      }
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

        {defaultoptions && (
          <Form.Group className="mb-2" as={Col} xl={12}>
            {hasLabel && <Form.Label className='fw-bold mb-1'>Tipo Movimentação*</Form.Label>}
            <AsyncSelect 
              name='tipo' 
              loadOptions={(value) => SelectSearchOptions(value, 'finances/tipo-receita-despesa', 'description')}
              styles={theme === 'light'? customStyles : customStylesDark} classNamePrefix="select"
              defaultValue={type === 'edit' ? defaultoptions.tipo || '' : ''}
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
          {hasLabel && <Form.Label className='fw-bold mb-1'>Caixa*</Form.Label>}
          <Form.Select
            name='caixa'
            value={formData.caixa|| ''}
            onChange={handleFieldChange}
          >
            <option value={undefined}>----</option>
            {caixas &&(caixas.map( c =>(
              <option key={c.value} value={c.value}>{c.label}</option>
            )))}
          </Form.Select>
          <label className='text-danger'>{message ? message.caixa : ''}</label>
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

export default FormMovimentacao;

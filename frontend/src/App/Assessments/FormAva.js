import React, { useEffect, useState} from 'react';
import AsyncSelect from 'react-select/async';
import { useNavigate} from 'react-router-dom';
import { toast } from 'react-toastify';
import { Button, Form, Col, Spinner} from 'react-bootstrap';
import customStyles, {customStylesDark} from '../../components/Custom/SelectStyles';
import { useAppContext } from '../../Main';
import { SelectSearchOptions, sendData } from '../../helpers/Data';
import { RedirectToLogin } from '../../Routes/PrivateRoute';

const FormAvaliacao = ({ hasLabel, type, submit, data}) => {
  const {config: {theme}} = useAppContext();
  const [formData, setFormData] = useState({is_active:false});
  const [message, setMessage] = useState()
  const navigate = useNavigate();
  const uuid = data ? data.uuid : '';
  const [defaultoptions, setDefaultOptions] = useState();
  const [isLoading, setIsLoading] = useState(false);

  const handleApi = async (dadosform) => {
    const {resposta, dados} = await sendData({type:type, url:'assessments/data', keyfield:type === 'edit' ? uuid : null, 
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
    setIsLoading(true)
    e.preventDefault();
    await handleApi(formData);
  };

  const handleFieldChange = e => {
    if (e.target.type === 'checkbox') {
      setFormData({
        ...formData,
        [e.target.name]: e.target.checked ? true : false
      });
    }
    else{
      setFormData({
        ...formData,
        [e.target.name]: e.target.value
      });
    }
  };

  useEffect(()=>{
    const loadFormData = async () => {
      if(data){
        const filteredData = Object.entries(data)
          .filter(([key, value]) => value !== null)
          .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
        const { list_colaboradores, ...restData } = filteredData;
        setFormData({...formData, ...restData})
        setDefaultOptions({
          colaboradores: list_colaboradores, 
        })
      }
    }

    if (type === 'edit' && !defaultoptions){
      loadFormData()
    }
    else{
      if(!defaultoptions){
        setDefaultOptions({})
      }
    }

  },[])

  return (
    <>
      <Form onSubmit={handleSubmit} className='row' encType='multipart/form-data'>
        {defaultoptions && (
          <Form.Group className="mb-2" as={Col} xl={12}>
            {hasLabel && <Form.Label className='fw-bold mb-1'>Colaboradores*</Form.Label>}
            <AsyncSelect 
              name='colaboradores' 
              loadOptions={(value) => SelectSearchOptions(value, 'users/users', 'first_name')}
              styles={theme === 'light'? customStyles : customStylesDark} classNamePrefix="select"
              defaultValue={type === 'edit' ? defaultoptions.colaboradores || '' : ''} isMulti
              onChange={(selected) => {
                setFormData((prevFormData) => ({
                  ...prevFormData,
                  colaboradores: selected.map(s => s.value)
                }));
              }}>
            </AsyncSelect>
            <label className='text-danger'>{message ? message.colaboradores : ''}</label>
          </Form.Group>        
        )}

        <Form.Group className="mb-2 d-flex" as={Col} xl={12}>
          {hasLabel && <Form.Label className='fw-bold mb-1 me-2'>Ativa?</Form.Label>}
          <Form.Check
            name="is_active" type='checkbox'
            onChange={handleFieldChange}
            checked={formData.is_active}
          />
          <label className='text-danger'>{message ? message.is_active : ''}</label>
        </Form.Group>

        <Form.Group className="mb-2" as={Col} xl={12}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Data Referente*</Form.Label>}
          <Form.Control
            value={formData.data_ref || ''}
            name="data_ref"
            onChange={handleFieldChange}
            type="date"
          />
          <label className='text-danger'>{message ? message.data_ref : ''}</label>
        </Form.Group>

        <Form.Group className="mb-2" as={Col} xl={12}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Descrição*</Form.Label>}
          <Form.Control
            value={formData.description || ''}
            name="description"
            onChange={handleFieldChange}
            as='textarea'
          />
          <label className='text-danger'>{message ? message.description : ''}</label>
        </Form.Group>

        <Form.Group className={`mb-0 text-center fixed-footer ${theme === 'light' ? 'bg-white' : 'bg-dark'}`}>
          <Button className="w-xl-50 w-sm-50" type="submit" disabled={isLoading} >
            {isLoading ? <Spinner size='sm' className='p-0' style={{marginBottom:'-4px'}}/> : type === 'edit' ? 'Atualizar' : 'Cadastrar'}
          </Button> 
        </Form.Group>   
      </Form>
    </>
  );
};

export default FormAvaliacao;

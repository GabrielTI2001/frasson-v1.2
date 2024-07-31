import React, { useEffect, useState} from 'react';
import AsyncSelect from 'react-select/async';
import { useNavigate} from 'react-router-dom';
import { toast } from 'react-toastify';
import { Button, Form, Col, Spinner} from 'react-bootstrap';
import customStyles, {customStylesDark} from '../../components/Custom/SelectStyles';
import { useAppContext } from '../../Main';
import { SelectSearchOptions, sendData } from '../../helpers/Data';
import { RedirectToLogin } from '../../Routes/PrivateRoute';

const FormQuestion = ({ hasLabel, type, submit, data}) => {
  const {config: {theme}} = useAppContext();
  const [formData, setFormData] = useState({type:'Q'});
  const [message, setMessage] = useState()
  const navigate = useNavigate();
  const uuid = data ? data.uuid : '';
  const [defaultoptions, setDefaultOptions] = useState();
  const [isLoading, setIsLoading] = useState(false);

  const handleApi = async (dadosform) => {
    const {resposta, dados} = await sendData({type:type, url:'assessments/questions', keyfield:type === 'edit' ? uuid : null, 
      dadosform:dadosform})
    if(resposta.status === 400){
      setMessage(dados)
    }
    else if (resposta.status === 401){
      RedirectToLogin(navigate)
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
        const { str_category, ...restData } = filteredData;
        setFormData({...formData, ...restData})
        setDefaultOptions({
          category: {value: data.category, label:str_category}, 
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
            {hasLabel && <Form.Label className='fw-bold mb-1'>Categoria*</Form.Label>}
            <AsyncSelect 
              name='category' 
              loadOptions={(value) => SelectSearchOptions(value, 'assessments/category', 'description')}
              styles={theme === 'light'? customStyles : customStylesDark} classNamePrefix="select"
              defaultValue={type === 'edit' ? defaultoptions.category || '' : ''}
              onChange={(selected) => {
                setFormData((prevFormData) => ({
                  ...prevFormData,
                  category: selected.value
                }));
              }}>
            </AsyncSelect>
            <label className='text-danger'>{message ? message.category : ''}</label>
          </Form.Group>        
        )}

        <Form.Group className="mb-2" as={Col} xl={12}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Tipo*</Form.Label>}
          <Form.Select
            name="type"
            onChange={handleFieldChange}
          >
            <option value='Q'>Qualitativo</option>
            <option value='N'>Quantitativo</option>
          </Form.Select>
          <label className='text-danger'>{message ? message.type : ''}</label>
        </Form.Group>

        <Form.Group className="mb-2" as={Col} xl={12}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Texto da Pergunta*</Form.Label>}
          <Form.Control
            value={formData.text || ''}
            name="text"
            onChange={handleFieldChange}
            as='textarea'
          />
          <label className='text-danger'>{message ? message.text : ''}</label>
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

export default FormQuestion;

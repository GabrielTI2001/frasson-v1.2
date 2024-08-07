import React, { useState} from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Button, Form, Spinner } from 'react-bootstrap';
import { useAppContext } from '../../../Main';
import { fieldsAnaliseSolo } from '../Data';
import RenderFields from '../../../components/Custom/RenderFields';
import { sendData } from '../../../helpers/Data';
import { RedirectToLogin } from '../../../Routes/PrivateRoute';

const AnaliseSoloForm = ({ hasLabel, type, submit}) => {
  const {config: {theme}} = useAppContext();
  const user = JSON.parse(localStorage.getItem('user'))
  const [formData, setFormData] = useState({
    created_by: user.id
  });
  const [message, setMessage] = useState()
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleApi = async (dadosform) => {
    const {resposta, dados} = await sendData({type:type, url:'register/analysis-soil', keyfield:null, dadosform:dadosform, is_json:false})
    if(resposta.status === 400){
      setMessage({...dados})
    }
    else if (resposta.status === 401){
      RedirectToLogin(navigate);
    }
    else if (resposta.status === 201 || resposta.status === 200){
      const {results, other_info, ...rest} = dados
      submit('add', {...rest})
      toast.success("Registro Efetuado com Sucesso!")
    }
    setIsLoading(false)
  };

  const handleSubmit = async e => {
    setMessage(null)
    setIsLoading(true)
    e.preventDefault();
    const formDataToSend = new FormData();
    for (const key in formData) {
      if (key === 'file') {
        for (let i = 0; i < formData[key].length; i++) {
          formDataToSend.append('file', formData[key][i]);
        }
      } else {
        formDataToSend.append(key, formData[key]);
      }
    }
    await handleApi(formDataToSend);
  };

  const handleFileChange = (e) => {
    setFormData({...formData, [e.target.name]:e.target.files})
  };

  const handleFieldChange = e => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <>
      <Form onSubmit={handleSubmit} className='row' encType='multipart/form-data'>
        <RenderFields fields={fieldsAnaliseSolo.slice(0, 11)} formData={formData} changefilemulti={handleFileChange} 
          changefield={handleFieldChange} hasLabel={hasLabel} message={message} type={type} setform={setFormData}
        />
        <hr className='ms-3 mt-0 mb-2' style={{width:'93%'}}></hr>
        <h4 style={{fontSize:'14px'}} className='fw-700'>Resultados</h4>
        <RenderFields fields={fieldsAnaliseSolo.slice(11)} formData={formData} changefield={handleFieldChange} 
          hasLabel={hasLabel} message={message} type={type} setform={setFormData}
        />
        <Form.Group className={`mb-0 text-center fixed-footer ${theme === 'light' ? 'bg-white' : 'bg-dark'}`}>
          <Button className="w-40" type="submit" disabled={isLoading}>
            {isLoading ? <Spinner size='sm' className='p-0' style={{marginBottom:'-4px'}}/> : 'Cadastrar Análise de Solo'}
          </Button>
        </Form.Group>    
      </Form>
    </>
  );
};

export default AnaliseSoloForm;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Button, Form, Spinner} from 'react-bootstrap';
import { useAppContext } from '../../Main';
import { sendData } from '../../helpers/Data';
import { fieldsLicenca } from './Data';
import RenderFields from '../../components/Custom/RenderFields';
import { RedirectToLogin } from '../../Routes/PrivateRoute';

const FormLicenca = ({ hasLabel, data, type, submit}) => {
  const {config: {theme}} = useAppContext();
  const user = JSON.parse(localStorage.getItem('user'))
  const navigate = useNavigate();
  const [formData, setFormData] = useState({created_by: user.id, dias_renovacao:90});
  const [message, setMessage] = useState()
  const [isLoading, setIsLoading] = useState(false);

  const handledata = async (form) =>{
    const {resposta, dados} = await sendData({type:type, url:'licenses/index', keyfield:type === 'edit' ? data.uuid : null, dadosform:form})
    if(resposta.status === 400){
      setMessage({...dados})
    }
    else if (resposta.status === 401){
      RedirectToLogin(navigate);
    }
    else if (resposta.status === 201 || resposta.status === 200){
      toast.success("Registro Efetuado com Sucesso!")
      submit('add', {...dados, list_propriedades:dados.list_propriedades.map(l => l.label).join(', ')})
    }
    setIsLoading(false)
  }

  const handleSubmit = e => {
    setIsLoading(true)
    setMessage(null)
    e.preventDefault();
    handledata(formData)
  };

  const handleFieldChange = e => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <>
      <Form onSubmit={handleSubmit} className='row sectionform'>
        <RenderFields fields={fieldsLicenca} formData={formData} changefield={handleFieldChange} 
          hasLabel={hasLabel} message={message} type={type}
        />
        <Form.Group className={`mb-0 text-center fixed-footer ${theme === 'light' ? 'bg-white' : 'bg-dark'}`}>
          <Button className="w-50" type="submit" disabled={isLoading} >
            {isLoading ? <Spinner size='sm' className='p-0' style={{marginBottom:'-4px'}}/> : 'Cadastrar Licença'}
          </Button>
        </Form.Group>         
      </Form>
    </>
  );
};

export default FormLicenca;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Button, Form, Row, Spinner} from 'react-bootstrap';
import { fieldsASV } from '../Data';
import { useAppContext } from '../../../Main';
import RenderFields from '../../../components/Custom/RenderFields';
import { sendData } from '../../../helpers/Data';

const ASVForm = ({ hasLabel, type, reducer}) => {
  const {config: {theme}} = useAppContext();
  const user = JSON.parse(localStorage.getItem('user'))
  const [formData, setFormData] = useState({created_by:user.id});
  const [message, setMessage] = useState()
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleApi = async (dadosform) => {
    const {resposta, dados} = await sendData({type:type, url:'environmental/inema/asvs', keyfield:null, dadosform:dadosform, is_json:false})
    if(resposta.status === 400){
      setMessage({...dados})
    }
    else if (resposta.status === 401){
      const next = window.location.href.toString().split(process.env.REACT_APP_HOST)[1]
      navigate(`/auth/login?next=${next}`);
    }
    else if (resposta.status === 201 || resposta.status === 200){
      toast.success("Registro Efetuado com Sucesso!")
      navigate(`/ambiental/inema/asv/${dados.uuid}`);
      reducer('add', dados)
    }
    setIsLoading(false)
  };

  const handleSubmit = e => {
    setIsLoading(true)
    setMessage(null)
    e.preventDefault();
    const formDataToSend = new FormData();
    for (const key in formData) {
      formDataToSend.append(key, formData[key]);
    }  
    handleApi(formDataToSend);
  };
  const handleFieldChange = e => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  const handleFileChange = (e) => {
    setFormData({...formData, [e.target.name]:e.target.files[0]})
  };

  return (
    <>
      <Form onSubmit={handleSubmit} className='row'>
        <RenderFields fields={fieldsASV} formData={formData} changefield={handleFieldChange} changefile={handleFileChange}
          hasLabel={hasLabel} message={message} type={type}
        />
        <Form.Group className={`mb-0 text-center fixed-footer ${theme === 'light' ? 'bg-white' : 'bg-dark'}`}>
          <Button className="w-50" type="submit" disabled={isLoading} >
            {isLoading ? <Spinner size='sm' className='p-0' style={{marginBottom:'-4px'}}/> : 'Cadastrar Portaria'}
          </Button>
        </Form.Group>      
      </Form>
    </>
  );
};

export default ASVForm;

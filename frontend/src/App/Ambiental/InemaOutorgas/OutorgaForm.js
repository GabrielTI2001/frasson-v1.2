import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Button, Form, Spinner} from 'react-bootstrap';
import { fieldsOutorga} from './../Data';
import { useAppContext } from '../../../Main';
import { SelectOptions, sendData } from '../../../helpers/Data';
import RenderFields from '../../../components/Custom/RenderFields';

const OutorgaForm = ({ hasLabel, type, submit}) => {
  const {config: {theme}} = useAppContext();
  const user = JSON.parse(localStorage.getItem('user'))
  const [formData, setFormData] = useState({
    created_by: user.id, processo_frasson: false
  });
  const [message, setMessage] = useState()
  const navigate = useNavigate();
  const {uuid} = useParams()
  const [captacao, setCaptacao] = useState()
  const [isLoading, setIsLoading] = useState(false);

  const handleApi = async (dadosform) => {
    const {resposta, dados} = await sendData({type:type, url:'environmental/inema/outorgas', keyfield: type === 'edit' ? uuid : null, 
      dadosform:dadosform})
    if(resposta.status === 400){
      setMessage({...dados})
    }
    else if (resposta.status === 401){
      const next = window.location.href.toString().split(process.env.REACT_APP_HOST)[1]
      navigate(`/auth/login?next=${next}`);
    }
    else if (resposta.status === 201 || resposta.status === 200){
      toast.success("Registro Efetuado com Sucesso!")
      submit('add', dados)
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
    const buscar = async () =>{
      const data = await SelectOptions('environmental/inema/captacao', 'description');
      if (data === 401){
        navigate("auth/login")
      }
      setCaptacao(data)
    }
    if (!captacao){
      buscar()
    }
  },[])

  return (
    <>
      <Form onSubmit={handleSubmit} className='row'>
        {captacao && 
          <RenderFields fields={fieldsOutorga} formData={formData} changefield={handleFieldChange} 
            hasLabel={hasLabel} message={message} type={type} options={{captacao:captacao}}
          />
        }
        <Form.Group className={`mb-0 text-center fixed-footer ${theme === 'light' ? 'bg-white' : 'bg-dark'}`}>
          <Button className="w-50" type="submit" disabled={isLoading} >
            {isLoading ? <Spinner size='sm' className='p-0' style={{marginBottom:'-4px'}}/> : 'Cadastrar Portaria'}
          </Button>
        </Form.Group>   
      </Form>
    </>
  );
};

export default OutorgaForm;

import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Button, Form, Spinner} from 'react-bootstrap';
import { fetchAquifero, fieldsAPPO} from './../Data';
import { useAppContext } from '../../../Main';
import RenderFields from '../../../components/Custom/RenderFields';
import { sendData } from '../../../helpers/Data';

const APPOForm = ({ hasLabel, type, submit}) => {
  const {config: {theme}} = useAppContext();
  const user = JSON.parse(localStorage.getItem('user'))
  const [formData, setFormData] = useState({
    created_by: user.id, processo_frasson: false
  });
  const [message, setMessage] = useState()
  const navigate = useNavigate();
  const {uuid} = useParams()
  const [aquifero, setAquifero] = useState([])
  const [isLoading, setIsLoading] = useState(false);

  const handleApi = async (dadosform) => {
    const {resposta, dados} = await sendData({type:type, url:'environmental/inema/appos', keyfield: type === 'edit' ? uuid : null, 
      dadosform:dadosform, is_json:false})
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
        navigate(`/ambiental/inema/appos/${dados.uuid}`);
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

  const handlePDFChange = (e) => {
    setFormData({...formData, [e.target.name]:e.target.files[0]})
  };

  useEffect(()=>{
    const buscar = async () =>{
      const data = await fetchAquifero();
      if (data.status === 401){
        const next = window.location.href.toString().split(process.env.REACT_APP_HOST)[1]
        navigate(`/auth/login?next=${next}`);
      }
      setAquifero(data.dados)
    }
    if (aquifero.length === 0){
      buscar()
    }
  }, [])

  return (
    <>
      <Form onSubmit={handleSubmit} className='row'>
        {aquifero && 
          <RenderFields fields={fieldsAPPO} formData={formData} changefield={handleFieldChange}  changefile={handlePDFChange}
            hasLabel={hasLabel} message={message} type={type} options={{aquifero:aquifero}}
          />
        }
        <Form.Group className={`mb-0 text-center fixed-footer ${theme === 'light' ? 'bg-white' : 'bg-dark'}`}>
          <Button className="w-50" type="submit" disabled={isLoading} >
            {isLoading ? <Spinner size='sm' className='p-0' style={{marginBottom:'-4px'}}/> : 'Cadastrar Processo'}
          </Button>
        </Form.Group>  
      </Form>
    </>
  );
};

APPOForm.propTypes = {
  hasLabel: PropTypes.bool
};

export default APPOForm;

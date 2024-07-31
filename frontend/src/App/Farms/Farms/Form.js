import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Button, Form, Spinner } from 'react-bootstrap';
import { useAppContext } from '../../../Main';
import RenderFields from '../../../components/Custom/RenderFields';
import { fieldsFarm } from '../Data';
import { sendData } from '../../../helpers/Data';
import { RedirectToLogin } from '../../../Routes/PrivateRoute';

const FarmForm = ({ hasLabel, type, submit, data}) => {
  const {config: {theme}} = useAppContext();
  const user = JSON.parse(localStorage.getItem('user'))
  const [formData, setFormData] = useState({
    created_by: user.id, localizacao_reserva:'AM'
  });
  const [message, setMessage] = useState()
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleApi = async (dadosform) => {
    const {resposta, dados} = await sendData({type:type, url:'farms/farms', keyfield:null, dadosform:dadosform, is_json:false})
    if(resposta.status === 400){
      setMessage({...dados})
    }
    else if (resposta.status === 401){
      RedirectToLogin(navigate);
    }
    else if (resposta.status === 201 || resposta.status === 200){
      submit('add', {matricula:dados.matricula, uuid:dados.uuid, municipio_localizacao:dados.municipio_localizacao, nome:dados.nome,
        str_proprietarios:dados.str_proprietarios.map(p => p.razao_social).join(', '), area_total:dados.area_total
      })
      toast.success("Registro Efetuado com Sucesso!")
    }
    setIsLoading(false)
  };

  const handleSubmit = async e => {
    setIsLoading(true)
    setMessage(null)
    e.preventDefault();
    const formDataToSend = new FormData();
    for (const key in formData) {
      if (Array.isArray(formData[key])) {
        formData[key].forEach(value => {
          formDataToSend.append(key, value);
        });
      } else {
        formDataToSend.append(key, formData[key]);
      }
    }

    await handleApi(formDataToSend);
  };

  const handleFileChange = (e) => {
    setFormData({...formData, [e.target.name]:e.target.files[0]})
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
        <RenderFields fields={fieldsFarm} formData={formData} changefile={handleFileChange} changefield={handleFieldChange} 
          hasLabel={hasLabel} message={message} type={type}
        />
        <Form.Group className={`mb-0 text-center fixed-footer ${theme === 'light' ? 'bg-white' : 'bg-dark'}`}>
          <Button className="w-50" type="submit" disabled={isLoading} >
            {isLoading ? <Spinner size='sm' className='p-0' style={{marginBottom:'-4px'}}/> : 'Cadastrar Imóvel Rural'}
          </Button>
        </Form.Group>      
      </Form>
    </>
  );
};

export default FarmForm;

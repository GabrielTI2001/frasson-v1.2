import React, { useEffect, useState} from 'react';
import { useNavigate} from 'react-router-dom';
import { toast } from 'react-toastify';
import { Button, Form, Spinner } from 'react-bootstrap';
import { useAppContext } from '../../../Main';
import { sendData } from '../../../helpers/Data';
import RenderFields from '../../../components/Custom/RenderFields';
import { fieldsPivot } from '../Data';
import { RedirectToLogin } from '../../../Routes/PrivateRoute';

const PivotForm = ({ hasLabel, type, submit, data}) => {
  const {config: {theme}} = useAppContext();
  const user = JSON.parse(localStorage.getItem('user'))
  const [formData, setFormData] = useState({
    created_by: user.id, lamina_bruta_21_h:10
  });
  const [message, setMessage] = useState()
  const navigate = useNavigate();
  const uuid = data ? data.uuid : '';
  const [defaultoptions, setDefaultOptions] = useState();
  const [isLoading, setIsLoading] = useState(false);

  const handleApi = async (dadosform) => {
    const {resposta, dados} = await sendData({type:type, url:'irrigation/pivots', keyfield:type === 'edit' ? uuid : null, 
      dadosform:dadosform, is_json:false})
    if(resposta.status === 400){
      setMessage({...dados})
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
    setIsLoading(true)
    setMessage(null)
    e.preventDefault();
    const formDataToSend = new FormData();
    for (const key in formData) {
      if (key === 'file') {
        formDataToSend.append('file', formData[key]);
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

  useEffect(()=>{
    const loadFormData = async () => {
      if(data){
        const filteredData = Object.entries(data)
          .filter(([key, value]) => value !== null)
          .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
        
        const { str_fabricante, str_municipio, str_proprietario, str_fabricante_bomba, file, ...restData } = filteredData;
        setFormData({...formData, ...restData})
        setDefaultOptions({
          proprietario: {value:data.proprietario, label: str_proprietario}, 
          municipio_localizacao: {value:data.municipio_localizacao, label: str_municipio}, 
          fabricante_pivot: {value:data.fabricante_pivot, label: str_fabricante}, 
          fabricante_bomba: {value:data.fabricante_bomba, label: str_fabricante_bomba}
        })
      }
    }

    if (type === 'edit' && (!defaultoptions)){
      loadFormData()
    }
    else{
      if(!defaultoptions){
        setDefaultOptions({proprietario:{}, municipio_localizacao:{}, fabricante_pivot:{}, fabricante_bomba:{}})
      }
    }

  },[])

  return (
    <>
      <Form onSubmit={handleSubmit} className='row' encType='multipart/form-data'>
        <RenderFields fields={fieldsPivot} formData={formData} changefield={handleFieldChange} changefile={handleFileChange} 
          hasLabel={hasLabel} message={message} type={type} defaultoptions={defaultoptions}
        />
        <Form.Group className={`mb-0 text-center fixed-footer ${theme === 'light' ? 'bg-white' : 'bg-dark'}`}>
          <Button className="w-50" type="submit" disabled={isLoading} >
            {isLoading ? <Spinner size='sm' className='p-0' style={{marginBottom:'-4px'}}/> : 'Cadastrar Pivot'}
          </Button>
        </Form.Group>   
      </Form>
    </>
  );
};

export default PivotForm;

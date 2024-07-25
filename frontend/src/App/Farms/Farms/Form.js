import React, { useEffect, useState} from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Button, Form, Spinner } from 'react-bootstrap';
import { useAppContext } from '../../../Main';
import RenderFields from '../../../components/Custom/RenderFields';
import { fieldsFarm } from '../Data';

const FarmForm = ({ hasLabel, type, submit, data}) => {
  const {config: {theme}} = useAppContext();
  const user = JSON.parse(localStorage.getItem('user'))
  const [formData, setFormData] = useState({
    created_by: user.id, localizacao_reserva:'AM'
  });
  const [message, setMessage] = useState()
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [defaultoptions, setDefaultOptions] = useState();
  const [isLoading, setIsLoading] = useState(false);

  const handleApi = async (dadosform) => {
    const link = `${process.env.REACT_APP_API_URL}/farms/farms/${type === 'edit' ? data.uuid+'/':''}`
    const method = type === 'edit' ? 'PUT' : 'POST'
    try {
      const response = await fetch(link, {
        method: method,
        headers: {
            'Authorization': `Bearer ${token}`
        },
        body: dadosform
      });
      const data = await response.json();
      if(response.status === 400){
        setMessage({...data})
      }
      else if (response.status === 401){
        localStorage.setItem("login", JSON.stringify(false));
        localStorage.setItem('token', "");
        navigate("/auth/login");
      }
      else if (response.status === 201 || response.status === 200){
        submit('add', {matricula:data.matricula, uuid:data.uuid, municipio_localizacao:data.municipio_localizacao, nome:data.nome,
          str_proprietarios:data.str_proprietarios.map(p => p.razao_social).join(', '), area_total:data.area_total
        })
        toast.success("Registro Efetuado com Sucesso!")
      }
    } catch (error) {
        console.error('Erro:', error);
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

  useEffect(()=>{
    const loadFormData = async () => {
      if (type === 'edit'){
        if(data && Object.keys(data)){
          //Pega os atributos não nulos de data
          const filteredData = Object.entries(data)
            .filter(([key, value]) => value !== null)
            .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
          
          const { kml, str_proprietarios, municipio_localizacao, str_cartorio, ...restData } = filteredData;
          setFormData({...formData, ...restData})
          setDefaultOptions({proprietarios:str_proprietarios.map(p => ({value:p.id, label:p.razao_social})), 
            cartorio:str_cartorio ? {value:data.cartorio_registro, label:str_cartorio}:null, municipio:{value:data.municipio, label:municipio_localizacao}
          })
        }
      }
    }

    if (type === 'edit' && (!defaultoptions || !data)){
      loadFormData()
    }
    else{
      if(!defaultoptions){
        loadFormData()
        setDefaultOptions({municipio:{}, grupo:{}})
      }
    }

  },[])

  return (
    <>
      <Form onSubmit={handleSubmit} className='row' encType='multipart/form-data'>
        <RenderFields fields={fieldsFarm} formData={formData} changefile={handleFileChange} changefield={handleFieldChange} 
          defaultoptions={defaultoptions} hasLabel={hasLabel} message={message} type={type}
        />
        <Form.Group className={`mb-0 text-center fixed-footer ${theme === 'light' ? 'bg-white' : 'bg-dark'}`}>
          <Button
            className="w-50"
            type="submit" disabled={isLoading}
          >
              {isLoading ? 
                <Spinner size='sm' className='p-0' style={{marginBottom:'-4px'}}/>
              : 
                'Cadastrar Imóvel Rural'
              }
              
          </Button>
        </Form.Group>      
      </Form>
    </>
  );
};

export default FarmForm;

import React, { useEffect, useState, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Button, Form, Col, Row} from 'react-bootstrap';
import { fieldsASV } from '../Data';
import { AmbientalContext } from '../../../context/Context';
import { useAppContext } from '../../../Main';
import RenderFields from '../../../components/Custom/RenderFields';

const ASVForm = ({ hasLabel, type, addarea, reducer}) => {
  const {config: {theme}} = useAppContext();
  const user = JSON.parse(localStorage.getItem('user'))
  const {ambientalState, ambientalDispatch} = useContext(AmbientalContext)
  const [formData, setFormData] = useState({created_by:user.id});
  const [message, setMessage] = useState()
  const navigate = useNavigate();
  const token = localStorage.getItem("token")
  const {uuid} = useParams()
  const [defaultoptions, setDefaultOptions] = useState()

  const handleApi = async (dadosform) => {
    const link =`${process.env.REACT_APP_API_URL}/environmental/inema/asvs/${type === 'edit' ? uuid+'/' : ''}`
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
          const next = window.location.href.toString().split(process.env.REACT_APP_HOST)[1]
          navigate(`/auth/login?next=${next}`);
        }
        else if (response.status === 201 || response.status === 200){
          if (type === 'edit'){
            ambientalDispatch({type:'SET_DATA', payload:{
              asv: {coordenadas:ambientalState.asv.areas, ...data}
            }})
            toast.success("Registro Atualizado com Sucesso!")
          }
          else{
            toast.success("Registro Efetuado com Sucesso!")
            navigate(`/ambiental/inema/asv/${data.uuid}`);
            reducer('add', data)
          }
        }
    } catch (error) {
        console.error('Erro:', error);
    }
  };

  const handleSubmit = e => {
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

  useEffect(()=>{
    const loadFormData = async () => {
      if(ambientalState){
          const filteredData = Object.entries(ambientalState.asv)
            .filter(([key, value]) => value !== null)
            .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
          const { info_user, token_apimaps, file, ...restData } = filteredData;
          setFormData({...formData, ...restData})

          setDefaultOptions({municipio: {value: ambientalState.asv.municipio, label: ambientalState.asv.nome_municipio},
            empresa: {value:ambientalState.asv.empresa || '', label: ambientalState.asv.str_empresa || ''}
          }); 
      }
    
    }

    if (type === 'edit' && (!defaultoptions || !ambientalState.asv)){
      loadFormData()
    }
    else{
      if(!defaultoptions){
        setDefaultOptions({municipio:{}, empresa:{}})
      }
    }

  }, [])

  return (
    <>
      <Form onSubmit={handleSubmit} className='row'>
        <RenderFields fields={fieldsASV} formData={formData} changefield={handleFieldChange}  changefile={handleFileChange}
          defaultoptions={defaultoptions} hasLabel={hasLabel} message={message} type={type}
        />
        <Row> 
          <Form.Group className={`mb-0 col-auto ${type === 'edit' ? 'text-start' : 'text-end'}`}>
            <Button
              className="w-40"
              type="submit"
            >
                {type === 'edit' ? "Atualizar Portaria"
                : "Cadastrar Portaria"}
            </Button>
          </Form.Group> 
          {type === 'edit' &&    
            <Form.Group className={`mb-0 ps-0 col-auto ${type === 'edit' ? 'text-start' : 'text-end'}`}>
              <Button
                className="w-40 btn-success"
                onClick={() => addarea(null, 'add')}
              >
                Adicionar Área
              </Button>
            </Form.Group>
          } 
        </Row>     
      </Form>
    </>
  );
};

export default ASVForm;

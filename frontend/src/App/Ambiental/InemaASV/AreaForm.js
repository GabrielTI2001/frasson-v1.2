import React, { useEffect, useState, useContext } from 'react';
import PropTypes from 'prop-types';
import { useNavigate} from 'react-router-dom';
import { toast } from 'react-toastify';
import { Button, Form, Row, Col} from 'react-bootstrap';
import ModalGMS from '../../../components/Custom/ModalGMS';
import { AmbientalContext } from '../../../context/Context';

const AreaForm = ({ hasLabel, type, data}) => {
  const channel = new BroadcastChannel('meu_canal');

  const {ambientalState:{asv}, ambientalDispatch} = useContext(AmbientalContext)

  const [formData, setFormData] = useState({
    processo: asv.id
  });

  console.log(formData)

  const [showModal, setShowModal] = useState({show:false, type:''});
  
  const [message, setMessage] = useState();
  const navigate = useNavigate();
  const token = localStorage.getItem("token")
  
  const handleApi = async (dadosform) => {
    const link = `${process.env.REACT_APP_API_URL}/environmental/inema/asv/areas-detail/${type === 'edit' ? data.id+'/' : ''}` 
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
          if (type === 'edit'){
            toast.success("Registro Atualizado com Sucesso!")
            ambientalDispatch({type:'UPDATE_PONTO_ASV', payload:{id:data.id, updatedArea:data}})
            ambientalDispatch({type:'TOGGLE_MODAL'})
          }
          else{
            toast.success("Registro Adicionado com Sucesso!")
            channel.postMessage({ tipo: 'adicionar_coordenada', reg:data, asv_id:asv.id});
            ambientalDispatch({type:'ADD_PONTO_ASV',payload:{novaarea:data}})
            ambientalDispatch({type:'TOGGLE_MODAL'})
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
    const loadFormData = () => {
      setFormData({...formData, identificacao_area: data.identificacao_area, area_total: data.area_total})
    }
    if (type === 'edit'){
      if(!formData.area_total){   
        loadFormData()
      }
    }

  },[])

  return (
    <>
      <Form onSubmit={handleSubmit} className='row'>

        <Form.Group className="mb-2" as={Col} lg={3}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Identificação Área*</Form.Label>}
          <Form.Control
            placeholder={!hasLabel ? 'Identificação Área' : ''}
            value={formData.identificacao_area || ''}
            name="identificacao_area"
            onChange={handleFieldChange}
            type="text"
          />
          <label className='text-danger'>{message && (message.identificacao_area)}</label>
        </Form.Group>

        <Form.Group className="mb-2" as={Col} lg={3}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Área Total (ha)</Form.Label>}
          <Form.Control
            placeholder={!hasLabel ? 'Área Total' : ''}
            value={formData.area_total || ''}
            name="area_total"
            onChange={handleFieldChange}
            type="number"
          />
          <label className='text-danger'>{message && (message.area_total)}</label>
        </Form.Group>

        <Form.Group className="mb-2" as={Col} lg={3}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Arquivo KML*</Form.Label>}
          <Form.Control
            placeholder={!hasLabel ? 'Arquivo PDF' : ''}
            name="file"
            onChange={handleFileChange}
            type="file"
          />
          <label className='text-danger'>{message ? message.file : ''}</label>
        </Form.Group>

        <label className='text-danger'>{message && (message.non_field_errors)}</label>
        <Form.Group className="mb-0 text-end">
          <Button
            className="w-40"
            type="submit"
          >
            {type === 'edit' ? "Atualizar Ponto"
            : "Cadastrar Ponto"}
          </Button>
        </Form.Group>           
      </Form>
      <ModalGMS show={showModal.show} type={showModal.type} changemodal={setShowModal} formData={formData} changeform={setFormData}/>
    </>
  );
};

AreaForm.propTypes = {
  hasLabel: PropTypes.bool
};

export default AreaForm;

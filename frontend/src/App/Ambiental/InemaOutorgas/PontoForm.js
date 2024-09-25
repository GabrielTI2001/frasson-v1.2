import React, { useEffect, useState, useContext } from 'react';
import PropTypes from 'prop-types';
import { useNavigate} from 'react-router-dom';
import { toast } from 'react-toastify';
import { Button, Form, Spinner} from 'react-bootstrap';
import ModalGMS from '../../../components/Custom/ModalGMS';
import { AmbientalContext } from '../../../context/Context';
import { RedirectToLogin } from '../../../Routes/PrivateRoute';
import { sendData } from '../../../helpers/Data';
import { fieldsPontoOutorga } from '../Data';
import RenderFields from '../../../components/Custom/RenderFields';

const PontoForm = ({ hasLabel, type, data, update}) => {
  const {ambientalState:{outorga}, ambientalDispatch} = useContext(AmbientalContext)
  const [formData, setFormData] = useState({processo: outorga.id});
  const [showModal, setShowModal] = useState({show:false, type:''});
  const [message, setMessage] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  
  const handleApi = async (dadosform) => {
    const {resposta, dados} = await sendData({type:type, url:'environmental/inema/outorga/coordenadas-detail', keyfield: type === 'edit' ? data.id : null,
      dadosform:dadosform
    })
    if(resposta.status === 400){
      setMessage({...dados})
    }
    else if (resposta.status === 401){
      RedirectToLogin(navigate)
    }
    else if (resposta.status === 201 || resposta.status === 200){
      if (type === 'edit'){
        toast.success("Registro Atualizado com Sucesso!")
        ambientalDispatch({type:'UPDATE_PONTO', payload:{id:dados.id, updatedPonto:dados}})
      }
      else{
        toast.success("Registro Adicionado com Sucesso!")
        ambientalDispatch({type:'ADD_PONTO',payload:{novoponto:dados}})
      }
      update()
    }
    setIsLoading(false)
  };

  const handleSubmit = e => {
    setMessage(null)
    setIsLoading(true)
    e.preventDefault();
    handleApi(formData);
  };

  const handleFieldChange = e => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  useEffect(()=>{
    const loadFormData = () => {
      setFormData({...formData, ...data})
    }
    if (type === 'edit'){
      if(!formData.descricao_ponto){   
        loadFormData()
      }
    }

  },[])

  return (
    <>
      <Form onSubmit={handleSubmit} className='row'>
        <RenderFields fields={fieldsPontoOutorga} formData={formData} changefield={handleFieldChange}
          hasLabel={hasLabel} message={message} type={type} setform={setFormData}
        />
        <label className='text-danger'>{message && (message.non_field_errors)}</label>
        <Form.Group className="mb-0 text-end">
          <Button className="w-40" type="submit" disabled={!formData.latitude_gd || !formData.longitude_gd || isLoading}>
            {isLoading ? <Spinner size='sm' className='p-0 mx-4' style={{height:'12px', width:'12px'}}/> : 
            type === 'edit' ? "Atualizar Ponto": "Cadastrar Ponto"}
          </Button>
        </Form.Group>           
      </Form>
      <ModalGMS show={showModal.show} type={showModal.type} changemodal={setShowModal} formData={formData} changeform={setFormData}/>
    </>
  );
};

PontoForm.propTypes = {
  hasLabel: PropTypes.bool
};

export default PontoForm;

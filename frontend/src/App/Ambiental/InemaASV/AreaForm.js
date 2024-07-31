import React, { useEffect, useState, useContext } from 'react';
import PropTypes from 'prop-types';
import { useNavigate} from 'react-router-dom';
import { toast } from 'react-toastify';
import { Button, Form, Col} from 'react-bootstrap';
import ModalGMS from '../../../components/Custom/ModalGMS';
import { AmbientalContext } from '../../../context/Context';
import { RedirectToLogin } from '../../../Routes/PrivateRoute';
import { sendData } from '../../../helpers/Data';

const AreaForm = ({ hasLabel, type, data, update}) => {
  const {ambientalState:{asv}, ambientalDispatch} = useContext(AmbientalContext)
  const [formData, setFormData] = useState({
    processo: asv.id
  });
  const [showModal, setShowModal] = useState({show:false, type:''});
  const [message, setMessage] = useState();
  const navigate = useNavigate();
  
  const handleApi = async (dadosform) => {
    const {resposta, dados} = await sendData({type:type, url:'environmental/inema/asv/areas-detail', keyfield: type === 'edit' ? data.id : null,
      dadosform:dadosform, is_json:false
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
        ambientalDispatch({type:'UPDATE_PONTO_ASV', payload:{id:dados.id, updatedArea:dados}})
      }
      else{
        toast.success("Registro Adicionado com Sucesso!")
        ambientalDispatch({type:'ADD_PONTO_ASV',payload:{novaarea:dados}})
      }
      update()
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

        <Form.Group className="mb-2" as={Col} xl={12}>
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

        <Form.Group className="mb-2" as={Col} xl={12}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Área Total (ha)*</Form.Label>}
          <Form.Control
            placeholder={!hasLabel ? 'Área Total' : ''}
            value={formData.area_total || ''}
            name="area_total"
            onChange={handleFieldChange}
            type="number"
          />
          <label className='text-danger'>{message && (message.area_total)}</label>
        </Form.Group>

        <Form.Group className="mb-2" as={Col} xl={12}>
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
            {type === 'edit' ? "Atualizar Área"
            : "Cadastrar Área"}
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

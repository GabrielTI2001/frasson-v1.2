import React, { useEffect, useState, useContext } from 'react';
import PropTypes from 'prop-types';
import { useNavigate} from 'react-router-dom';
import { toast } from 'react-toastify';
import { Button, Form, Row, Col} from 'react-bootstrap';
import ModalGMS from '../../../components/Custom/ModalGMS';
import { AmbientalContext } from '../../../context/Context';
import { RedirectToLogin } from '../../../Routes/PrivateRoute';
import { sendData } from '../../../helpers/Data';

const PontoForm = ({ hasLabel, type, data, update}) => {
  const {ambientalState:{outorga}, ambientalDispatch} = useContext(AmbientalContext)
  const [formData, setFormData] = useState({
    processo: outorga.id
  });
  const [showModal, setShowModal] = useState({show:false, type:''});
  const [message, setMessage] = useState();
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
  };

  const handleSubmit = e => {
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

        <Form.Group className="mb-2" as={Col} lg={3}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Descrição Ponto*</Form.Label>}
            <Form.Control
              placeholder={!hasLabel ? 'Descrição Ponto' : ''}
              value={formData.descricao_ponto || ''}
              name="descricao_ponto"
              onChange={handleFieldChange}
              type="text"
            />
            <label className='text-danger'>{message && (message.descricao_ponto)}</label>
          </Form.Group>

        <Form.Group className="mb-2" as={Col} lg={3} sm={6}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Latitude (GD)*</Form.Label>}
          <Form.Control
            placeholder={!hasLabel ? 'latitude (GD)' : ''}
            value={formData.latitude_gd || ''}
            name="latitude_gd"
            onChange={handleFieldChange}
            type="text"
          />
          <label className='text-danger'>{message && (message.latitude_gd)}</label>
        </Form.Group>
        <Form.Group className="mb-2 d-flex align-items-center" as={Col} lg={'auto'} xxl={'auto'} sm={6}>
          <Button onClick={() => {setShowModal({show:true, type: 'latitude'});}}>GMS</Button>
        </Form.Group>
        
        <Form.Group className="mb-2" as={Col} lg={3} sm={6}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Longitude (GD)*</Form.Label>}
            <Form.Control
              placeholder={!hasLabel ? 'Longitude (GD)' : ''}
              value={formData.longitude_gd || ''}
              name="longitude_gd"
              onChange={handleFieldChange}
              type="text"
            />
          <label className='text-danger'>{message && (message.longitude_gd)}</label>
        </Form.Group>
        <Form.Group className="mb-2 d-flex align-items-center" as={Col} lg={'auto'} xxl={'auto'} sm={6}>
          <Button onClick={() => {setShowModal({show:true, type: 'longitude'})}}>GMS</Button>
        </Form.Group>

        <Form.Group className="mb-2" as={Col} lg={3} sm={6}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Vazão Máxima (m<sup>3</sup>/dia)*</Form.Label>}
            <Form.Control
              placeholder={!hasLabel ? 'Vazão Máxima' : ''}
              value={formData.vazao_m3_dia || ''}
              name="vazao_m3_dia"
              onChange={handleFieldChange}
              type="text"
            />
          <label className='text-danger'>{message && (message.vazao_m3_dia)}</label>
        </Form.Group>

        <Form.Group className="mb-2" as={Col} lg={3} sm={6}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Horas Bombeamento*</Form.Label>}
            <Form.Control
              placeholder={!hasLabel ? 'Bombeamento' : ''}
              value={formData.bombeamento_h || ''}
              name="bombeamento_h"
              onChange={handleFieldChange}
              type="text"
            />
          <label className='text-danger'>{message && (message.bombeamento_h)}</label>
        </Form.Group>

        <Row className='px-0 mx-auto'>
          <Form.Group className="mb-2" as={Col} lg={3} sm={6}>
            {hasLabel && <Form.Label className='fw-bold mb-1'>JAN (m<sup>3</sup>/dia)</Form.Label>}
              <Form.Control
                placeholder={!hasLabel ? 'Vazão Jan' : ''}
                value={formData.vazao_m3_dia_jan || ''}
                name="vazao_m3_dia_jan"
                onChange={handleFieldChange}
                type="text"
              />
            <label className='text-danger'>{message && (message.vazao_m3_dia_jan)}</label>
          </Form.Group>

          <Form.Group className="mb-2" as={Col} lg={3} sm={6}>
            {hasLabel && <Form.Label className='fw-bold mb-1'>FEV (m<sup>3</sup>/dia)</Form.Label>}
              <Form.Control
                placeholder={!hasLabel ? 'Vazão Fev' : ''}
                value={formData.vazao_m3_dia_fev || ''}
                name="vazao_m3_dia_fev"
                onChange={handleFieldChange}
                type="text"
              />
            <label className='text-danger'>{message && (message.vazao_m3_dia_fev)}</label>
          </Form.Group>

          <Form.Group className="mb-2" as={Col} lg={3} sm={6}>
            {hasLabel && <Form.Label className='fw-bold mb-1'>MAR (m<sup>3</sup>/dia)</Form.Label>}
              <Form.Control
                placeholder={!hasLabel ? 'Vazão Mar' : ''}
                value={formData.vazao_m3_dia_mar || ''}
                name="vazao_m3_dia_mar"
                onChange={handleFieldChange}
                type="text"
              />
            <label className='text-danger'>{message && (message.vazao_m3_dia_mar)}</label>
          </Form.Group>

          <Form.Group className="mb-2" as={Col} lg={3} sm={6}>
            {hasLabel && <Form.Label className='fw-bold mb-1'>ABR (m<sup>3</sup>/dia)</Form.Label>}
              <Form.Control
                placeholder={!hasLabel ? 'Vazão Abr' : ''}
                value={formData.vazao_m3_dia_abr || ''}
                name="vazao_m3_dia_abr"
                onChange={handleFieldChange}
                type="text"
              />
            <label className='text-danger'>{message && (message.vazao_m3_dia_abr)}</label>
          </Form.Group>

          <Form.Group className="mb-2" as={Col} lg={3} sm={6}>
            {hasLabel && <Form.Label className='fw-bold mb-1'>MAI (m<sup>3</sup>/dia)</Form.Label>}
              <Form.Control
                placeholder={!hasLabel ? 'Vazão Mai' : ''}
                value={formData.vazao_m3_dia_mai || ''}
                name="vazao_m3_dia_mai"
                onChange={handleFieldChange}
                type="text"
              />
            <label className='text-danger'>{message && (message.vazao_m3_dia_mai)}</label>
          </Form.Group>

          <Form.Group className="mb-2" as={Col} lg={3} sm={6}>
            {hasLabel && <Form.Label className='fw-bold mb-1'>JUN (m<sup>3</sup>/dia)</Form.Label>}
              <Form.Control
                placeholder={!hasLabel ? 'Vazão Jun' : ''}
                value={formData.vazao_m3_dia_jun || ''}
                name="vazao_m3_dia_jun"
                onChange={handleFieldChange}
                type="text"
              />
            <label className='text-danger'>{message && (message.vazao_m3_dia_jun)}</label>
          </Form.Group>

          <Form.Group className="mb-2" as={Col} lg={3} sm={6}>
            {hasLabel && <Form.Label className='fw-bold mb-1'>JUN (m<sup>3</sup>/dia)</Form.Label>}
              <Form.Control
                placeholder={!hasLabel ? 'Vazão Jul' : ''}
                value={formData.vazao_m3_dia_jul || ''}
                name="vazao_m3_dia_jul"
                onChange={handleFieldChange}
                type="text"
              />
            <label className='text-danger'>{message && (message.vazao_m3_dia_jul)}</label>
          </Form.Group>

          <Form.Group className="mb-2" as={Col} lg={3} sm={6}>
            {hasLabel && <Form.Label className='fw-bold mb-1'>AGO (m<sup>3</sup>/dia)</Form.Label>}
              <Form.Control
                placeholder={!hasLabel ? 'Vazão Ago' : ''}
                value={formData.vazao_m3_dia_ago || ''}
                name="vazao_m3_dia_ago"
                onChange={handleFieldChange}
                type="text"
              />
            <label className='text-danger'>{message && (message.vazao_m3_dia_ago)}</label>
          </Form.Group>

          <Form.Group className="mb-2" as={Col} lg={3} sm={6}>
            {hasLabel && <Form.Label className='fw-bold mb-1'>SET (m<sup>3</sup>/dia)</Form.Label>}
              <Form.Control
                placeholder={!hasLabel ? 'Vazão Set' : ''}
                value={formData.vazao_m3_dia_set || ''}
                name="vazao_m3_dia_set"
                onChange={handleFieldChange}
                type="text"
              />
            <label className='text-danger'>{message && (message.vazao_m3_dia_set)}</label>
          </Form.Group>

          <Form.Group className="mb-2" as={Col} lg={3} sm={6}>
            {hasLabel && <Form.Label className='fw-bold mb-1'>OUT (m<sup>3</sup>/dia)</Form.Label>}
              <Form.Control
                placeholder={!hasLabel ? 'Vazão Out' : ''}
                value={formData.vazao_m3_dia_out || ''}
                name="vazao_m3_dia_out"
                onChange={handleFieldChange}
                type="text"
              />
            <label className='text-danger'>{message && (message.vazao_m3_dia_out)}</label>
          </Form.Group>

          <Form.Group className="mb-2" as={Col} lg={3} sm={6}>
            {hasLabel && <Form.Label className='fw-bold mb-1'>NOV (m<sup>3</sup>/dia)</Form.Label>}
              <Form.Control
                placeholder={!hasLabel ? 'Vazão Nov' : ''}
                value={formData.vazao_m3_dia_nov|| ''}
                name="vazao_m3_dia_nov"
                onChange={handleFieldChange}
                type="text"
              />
            <label className='text-danger'>{message && (message.vazao_m3_dia_nov)}</label>
          </Form.Group>

          <Form.Group className="mb-2" as={Col} lg={3} sm={6}>
            {hasLabel && <Form.Label className='fw-bold mb-1'>DEZ (m<sup>3</sup>/dia)</Form.Label>}
              <Form.Control
                placeholder={!hasLabel ? 'Vazão Dez' : ''}
                value={formData.vazao_m3_dia_dez || ''}
                name="vazao_m3_dia_dez"
                onChange={handleFieldChange}
                type="text"
              />
            <label className='text-danger'>{message && (message.vazao_m3_dia_dez)}</label>
          </Form.Group>
        </Row>
        <label className='text-danger'>{message && (message.non_field_errors)}</label>
        <Form.Group className="mb-0 text-end">
          <Button
            className="w-40"
            type="submit"
            disabled={
                !formData.latitude_gd ||
                !formData.longitude_gd
              }
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

PontoForm.propTypes = {
  hasLabel: PropTypes.bool
};

export default PontoForm;

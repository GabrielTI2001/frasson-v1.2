import React, { useEffect, useState, useContext } from 'react';
import PropTypes from 'prop-types';
import { useNavigate} from 'react-router-dom';
import { toast } from 'react-toastify';
import { Button, Form, Col} from 'react-bootstrap';
import ModalGMS from '../ModalGMS';
import { AmbientalContext } from '../../../context/Context';
import { fetchFinalidade } from './../Data';
import AsyncSelect from 'react-select/async';
import { useAppContext } from '../../../Main';
import customStyles, {customStylesDark} from '../../../components/Custom/SelectStyles';

const PontoForm = ({ hasLabel, type, data}) => {
  const channel = new BroadcastChannel('meu_canal');
  const {config: {theme}} = useAppContext();
  const {ambientalState:{appo}, ambientalDispatch} = useContext(AmbientalContext)

  const [formData, setFormData] = useState({processo: appo.id});

  const [showModal, setShowModal] = useState({show:false, type:''});
  const [defaultoptions, setDefaultOptions] = useState()
  const [message, setMessage] = useState();
  const navigate = useNavigate();
  const token = localStorage.getItem("token")

  const handleApi = async (dadosform) => {
    const link = `${process.env.REACT_APP_API_URL}/environmental/inema/appo/coordenadas-detail/${type === 'edit'?data.id+'/':''}`
    const method = type === 'edit' ? 'PUT' : 'POST'
    
    try {
        const response = await fetch(link, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(dadosform)
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
            ambientalDispatch({type:'UPDATE_PONTO_APPO', payload:{id:data.id, updatedPonto:data}})
            ambientalDispatch({type:'TOGGLE_MODAL'})
          }
          else{
            toast.success("Registro Adicionado com Sucesso!")
            channel.postMessage({ tipo: 'adicionar_coordenada', reg:data, appo_id:appo.id});
            ambientalDispatch({type:'ADD_PONTO_APPO',payload:{novoponto:data}})
            ambientalDispatch({type:'TOGGLE_MODAL'})
          }
        }
    } catch (error) {
        console.error('Erro:', error);
    }
  };

  const handleSubmit = e => {
    if (formData.data_perfuracao === ''){
      setFormData({...formData, data_perfuracao:undefined})
    }
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
      setFormData({...formData, processo: data.processo, numero_poco: data.numero_poco, latitude_gd: data.latitude_gd,
        longitude_gd: data.longitude_gd, vazao_m3_dia: data.vazao_m3_dia, finalidade: data.finalidade, profundidade_poco: data.profundidade_poco,
        data_perfuracao: data.data_perfuracao, poco_perfurado: data.poco_perfurado, nivel_estatico: data.nivel_estatico,
        nivel_dinamico: data.nivel_dinamico
      })

      setDefaultOptions({finalidade:{value: data.finalidade, label: data.str_finalidade}});
    }
    if (type === 'edit' && !defaultoptions){
      if(!formData.numero_poco){   
        loadFormData()
      }
    }
    else{
      if(!defaultoptions){
        setDefaultOptions({finalidade:{}})
      }
    }

  },[])

  return (
    <>
      <Form onSubmit={handleSubmit} className='row'>

        <Form.Group className="mb-2" as={Col} lg={3}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Número Poço*</Form.Label>}
            <Form.Control
              placeholder={!hasLabel ? 'Número Poço' : ''}
              value={formData.numero_poco || ''}
              name="numero_poco"
              onChange={handleFieldChange}
              type="text"
            />
            <label className='text-danger'>{message && (message.numero_poco)}</label>
          </Form.Group>

        <Form.Group className="mb-2" as={Col} lg={3} xl={2}>
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
        <Form.Group className="mb-2 d-flex align-items-center" as={Col} lg={'auto'} xxl={'auto'}>
          <Button onClick={() => {setShowModal({show:true, type: 'latitude'});}}>GMS</Button>
        </Form.Group>
        
        <Form.Group className="mb-2" as={Col} lg={3} xl={2}>
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
        <Form.Group className="mb-2 d-flex align-items-center" as={Col} lg={'auto'} xxl={'auto'}>
          <Button onClick={() => {setShowModal({show:true, type: 'longitude'})}}>GMS</Button>
        </Form.Group>

        <Form.Group className="mb-2" as={Col} lg={3}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Expect. Vazão (m<sup>3</sup>/dia)*</Form.Label>}
            <Form.Control
              placeholder={!hasLabel ? 'Vazão Máxima' : ''}
              value={formData.vazao_m3_dia || ''}
              name="vazao_m3_dia"
              onChange={handleFieldChange}
              type="text"
            />
          <label className='text-danger'>{message && (message.vazao_m3_dia)}</label>
        </Form.Group>

        {defaultoptions && (
            <Form.Group className="mb-2" as={Col} lg={3}>
              {hasLabel && <Form.Label className='fw-bold mb-1'>Finalidade Outorga*</Form.Label>}
              <AsyncSelect loadOptions={fetchFinalidade} name='finalidade' styles={theme === 'light'? customStyles : customStylesDark} classNamePrefix="select"
                defaultValue={type === 'edit' ? (defaultoptions ? defaultoptions.finalidade : null) : null }
                onChange={(selected) => {
                  setFormData((prevFormData) => ({
                    ...prevFormData,
                    finalidade: selected.value
                  }));
                }}>
              </AsyncSelect>
              <label className='text-danger'>{message ? message.finalidade : ''}</label>
            </Form.Group>
        )}

        <Form.Group className="mb-2" as={Col} lg={3}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Poço Perfurado?</Form.Label>}
            <Form.Select                   
              placeholder={!hasLabel ? 'Conduzido Frasson?' : ''}
              value={formData.poco_perfurado || ''}
              name="poco_perfurado"
              onChange={handleFieldChange}
              type="select"
            >
              <option value={false}>Não</option>
              <option value={true}>Sim</option>
            </Form.Select>
          <label className='text-danger'>{message ? message.poco_perfurado : ''}</label>

        </Form.Group>

        <Form.Group className="mb-2" as={Col} lg={3}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Data Perfuração</Form.Label>}
            <Form.Control
              placeholder={!hasLabel ? 'Data Perfuração' : ''}
              value={formData.data_perfuracao|| ''}
              name="data_perfuracao"
              onChange={handleFieldChange}
              type="date"
            />
          <label className='text-danger'>{message ? message.data_perfuracao : ''}</label>
        </Form.Group>

        <Form.Group className="mb-2" as={Col} lg={3}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Prof. Poço (m)</Form.Label>}
            <Form.Control
              placeholder={!hasLabel ? 'Profundidade' : ''}
              value={formData.profundidade_poco || ''}
              name="profundidade_poco"
              onChange={handleFieldChange}
              type="text"
            />
          <label className='text-danger'>{message && (message.profundidade_poco)}</label>
        </Form.Group>

        <Form.Group className="mb-2" as={Col} lg={3}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Nível Estático (m)</Form.Label>}
            <Form.Control
              placeholder={!hasLabel ? 'Nível Estático' : ''}
              value={formData.nivel_estatico || ''}
              name="nivel_estatico"
              onChange={handleFieldChange}
              type="text"
            />
          <label className='text-danger'>{message && (message.nivel_estatico)}</label>
        </Form.Group>

        <Form.Group className="mb-2" as={Col} lg={3}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Nível Dinâmico (m)</Form.Label>}
            <Form.Control
              placeholder={!hasLabel ? 'Nível Dinâmico' : ''}
              value={formData.nivel_dinamico || ''}
              name="nivel_dinamico"
              onChange={handleFieldChange}
              type="text"
            />
          <label className='text-danger'>{message && (message.nivel_dinamico)}</label>
        </Form.Group>
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
              {type === 'edit' ? "Atualizar Poço"
              : "Cadastrar Poço"}
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

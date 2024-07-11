import React, { useEffect, useState} from 'react';
import AsyncSelect from 'react-select/async';
import { useNavigate} from 'react-router-dom';
import { toast } from 'react-toastify';
import { Button, Form, Col} from 'react-bootstrap';
import { fetchMunicipio } from '../../Ambiental/Data';
import customStyles, {customStylesDark} from '../../../components/Custom/SelectStyles';
import ModalGMS from '../../../components/Custom/ModalGMS';
import { useAppContext } from '../../../Main';
import { SelectSearchOptions, sendData } from '../../../helpers/Data';

const PivotForm = ({ hasLabel, type, submit, data}) => {
  const {config: {theme}} = useAppContext();
  const user = JSON.parse(localStorage.getItem('user'))
  const [formData, setFormData] = useState({
    created_by: user.id, lamina_bruta_21_h:10
  });
  const [message, setMessage] = useState()
  const [showModal, setShowModal] = useState({show:false, type:''})
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const uuid = data ? data.uuid : '';
  const [defaultoptions, setDefaultOptions] = useState();

  const handleApi = async (dadosform) => {
    const {response, dados} = await sendData({type:type, url:'irrigation/pivots', keyfield:type === 'edit' ? uuid : null, 
      dadosform:dadosform, is_json:false})
    if(response.status === 400){
      setMessage({...dados})
    }
    else if (response.status === 401){
      navigate("/auth/login");
    }
    else if (response.status === 201 || response.status === 200){
      if (type === 'edit'){
        submit('edit', dados)
        toast.success("Registro Atualizado com Sucesso!")
      }
      else{
        submit('add', dados)
        toast.success("Registro Efetuado com Sucesso!")
      }
    }
  };

  const handleSubmit = async e => {
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
        {defaultoptions && (
          <Form.Group className="mb-2" as={Col} xl={4} sm={6}>
            {hasLabel && <Form.Label className='fw-bold mb-1'>Proprietário*</Form.Label>}
            <AsyncSelect 
              name='proprietario' 
              loadOptions={(value) => SelectSearchOptions(value, 'register/pessoal', 'razao_social')}
              styles={theme === 'light'? customStyles : customStylesDark} classNamePrefix="select"
              defaultValue={ type === 'edit' ? (defaultoptions ? defaultoptions.proprietario : null) : null }
              onChange={(selected) => {
                setFormData((prevFormData) => ({
                  ...prevFormData,
                  proprietario: selected.value
                }));
              }}>
            </AsyncSelect>
            <label className='text-danger'>{message ? message.proprietario : ''}</label>
          </Form.Group>        
        )}

        <Form.Group className="mb-2" as={Col} xl={4} sm={6}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Propriedade Localização*</Form.Label>}
          <Form.Control
            placeholder={!hasLabel ? 'Propriedade Localização' : ''}
            value={formData.propriedade_localizacao || ''}
            name="propriedade_localizacao"
            onChange={handleFieldChange}
            type="text"
          />
          <label className='text-danger'>{message ? message.propriedade_localizacao : ''}</label>
        </Form.Group>

        {defaultoptions && (
          <Form.Group className="mb-2" as={Col} xl={4} sm={6}>
            {hasLabel && <Form.Label className='fw-bold mb-1'>Município Localização*</Form.Label>}
            <AsyncSelect loadOptions={(value) => SelectSearchOptions(value, 'register/municipios', 'nome_municipio', 'sigla_uf')} 
              styles={theme === 'light'? customStyles : customStylesDark} classNamePrefix="select"
              defaultValue={ type === 'edit' ? (defaultoptions ? defaultoptions.municipio_localizacao : null) : null }
              onChange={(selected) => {
                setFormData((prevFormData) => ({
                  ...prevFormData,
                  municipio_localizacao: selected.value
                }));
              }}>
            </AsyncSelect>
            <label className='text-danger'>{message ? message.municipio_localizacao : ''}</label>
          </Form.Group>        
        )}

        <Form.Group className="mb-2" as={Col} xl={4} sm={6}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Identificação Pivot*</Form.Label>}
          <Form.Control
            placeholder={!hasLabel ? 'Identificação Pivot' : ''}
            value={formData.identificacao_pivot || ''}
            name="identificacao_pivot"
            onChange={handleFieldChange}
            type="text"
          />
          <label className='text-danger'>{message ? message.identificacao_pivot : ''}</label>
        </Form.Group>

        {defaultoptions && (
          <Form.Group className="mb-2" as={Col} xl={4} sm={6}>
            {hasLabel && <Form.Label className='fw-bold mb-1'>Fabricante Pivot*</Form.Label>}
            <AsyncSelect 
              loadOptions={(value) => SelectSearchOptions(value, 'irrigation/fabricantes-pivots', 'nome_fabricante')} 
              name='fabricante_pivot' 
              styles={theme === 'light'? customStyles : customStylesDark} classNamePrefix="select"
              defaultValue={ type === 'edit' ? (defaultoptions ? defaultoptions.fabricante_pivot : null) : null }
              onChange={(selected) => {
                setFormData((prevFormData) => ({
                  ...prevFormData,
                  fabricante_pivot: selected.value
                }));
              }}>
            </AsyncSelect>
            <label className='text-danger'>{message ? message.fabricante_pivot : ''}</label>
          </Form.Group>        
        )}

        <Form.Group className="mb-2" as={Col} xl={3} sm={6}> 
          {hasLabel && <Form.Label className='fw-bold mb-1'>Área Circular (ha)*</Form.Label>}
          <Form.Control
            placeholder={!hasLabel ? 'Área Circular (ha)' : ''}
            value={formData.area_circular_ha || ''}
            name="area_circular_ha"
            onChange={handleFieldChange}
            type="number"
          />
          <label className='text-danger'>{message ? message.area_circular_ha : ''}</label>
        </Form.Group>

        <Form.Group className="mb-2" as={Col} sm={3} xl={3} xxl={2}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Latitude (GD)*</Form.Label>}
          <Form.Control
            placeholder={!hasLabel ? 'Latitude (GD)' : ''}
            value={formData.lat_center_gd || ''}
            name="lat_center_gd"
            onChange={handleFieldChange}
            type="number"
          />
          <label className='text-danger'>{message ? message.lat_center_gd : ''}</label>
        </Form.Group>
        <Form.Group className="mb-2 d-flex align-items-start p-3" as={Col} xl={1} sm={2}>
          <Button onClick={() => {setShowModal({show:true, type: 'latitude'})}} className='mt-2'>GMS</Button>
        </Form.Group>

        <Form.Group className="mb-2" as={Col} sm={3} xl={3} xxl={2}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Longitude (GD)*</Form.Label>}
          <Form.Control
            placeholder={!hasLabel ? 'Longitude (GD)' : ''}
            value={formData.long_center_gd || ''}
            name="long_center_gd"
            onChange={handleFieldChange}
            type="number"
          />
          <label className='text-danger'>{message ? message.long_center_gd : ''}</label>
        </Form.Group>
        <Form.Group className="mb-2 d-flex align-items-start pt-3" as={Col} xl={1} sm={2}>
          <Button onClick={() => {setShowModal({show:true, type: 'longitude'})}} className='mt-2'>GMS</Button>
        </Form.Group>

        <Form.Group className="mb-2" as={Col} xl={3} sm={6}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Lâmina Bruta 21h (mm/dia)*</Form.Label>}
          <Form.Control
            placeholder={!hasLabel ? 'Lâmina Bruta 21h (mm/dia)' : ''}
            value={formData.lamina_bruta_21_h || ''}
            name="lamina_bruta_21_h"
            onChange={handleFieldChange}
            type="number"
          />
          <label className='text-danger'>{message ? message.lamina_bruta_21_h : ''}</label>
        </Form.Group>

        <Form.Group className="mb-2" as={Col} xl={3} sm={6}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Período de giro 100% (h)</Form.Label>}
          <Form.Control
            placeholder={!hasLabel ? 'Período de giro 100% (h)' : ''}
            value={formData.periodo_rele_100 || ''}
            name="periodo_rele_100"
            onChange={handleFieldChange}
            type="number"
          />
          <label className='text-danger'>{message ? message.periodo_rele_100 : ''}</label>
        </Form.Group>

        <Form.Group className="mb-2" as={Col} xl={3} sm={6}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Comprimento Adutora (m)</Form.Label>}
          <Form.Control
            placeholder={!hasLabel ? 'Comprimento Adutora (m)' : ''}
            value={formData.comprimento_adutora_m || ''}
            name="comprimento_adutora_m"
            onChange={handleFieldChange}
            type="number"
          />
          <label className='text-danger'>{message ? message.comprimento_adutora_m : ''}</label>
        </Form.Group>

        <Form.Group className="mb-2" as={Col} xl={3} sm={6}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Diâmetro Adutora (mm)</Form.Label>}
          <Form.Control
            placeholder={!hasLabel ? 'Diâmetro Adutora (mm)' : ''}
            value={formData.diametro_adutora_mm || ''}
            name="diametro_adutora_mm"
            onChange={handleFieldChange}
            type="number"
          />
          <label className='text-danger'>{message ? message.diametro_adutora_mm : ''}</label>
        </Form.Group>

        {defaultoptions && (
          <Form.Group className="mb-2" as={Col} xl={4} sm={6}>
            {hasLabel && <Form.Label className='fw-bold mb-1'>Fabricante Bomba*</Form.Label>}
            <AsyncSelect 
              loadOptions={(value) => SelectSearchOptions(value, 'irrigation/fabricantes-bombas', 'nome_fabricante')} 
              name='fabricante_bomba' 
              styles={theme === 'light'? customStyles : customStylesDark} classNamePrefix="select"
              defaultValue={ type === 'edit' ? (defaultoptions ? defaultoptions.fabricante_bomba : null) : null }
              onChange={(selected) => {
                setFormData((prevFormData) => ({
                  ...prevFormData,
                  fabricante_bomba: selected.value
                }));
              }}>
            </AsyncSelect>
            <label className='text-danger'>{message ? message.fabricante_bomba : ''}</label>
          </Form.Group>        
        )}

        <Form.Group className="mb-2" as={Col} xl={3} sm={6}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Modelo Bomba</Form.Label>}
          <Form.Control
            placeholder={!hasLabel ? 'Modelo Bomba' : ''}
            value={formData.modelo_bomba || ''}
            name="modelo_bomba"
            onChange={handleFieldChange}
            type="text"
          />
          <label className='text-danger'>{message ? message.modelo_bomba : ''}</label>
        </Form.Group>

        <Form.Group className="mb-2" as={Col} xl={3} sm={6}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Potência Motor (CV)*</Form.Label>}
          <Form.Control
            placeholder={!hasLabel ? 'Potência Motor (CV)*' : ''}
            value={formData.pot_motor_cv || ''}
            name="pot_motor_cv"
            onChange={handleFieldChange}
            type="number"
          />
          <label className='text-danger'>{message ? message.pot_motor_cv : ''}</label>
        </Form.Group>

        <Form.Group className="mb-2" as={Col} xl={3} sm={6}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Fabricante Motor</Form.Label>}
          <Form.Control
            placeholder={!hasLabel ? 'Fabricante Motor' : ''}
            value={formData.fabricante_motor || ''}
            name="fabricante_motor"
            onChange={handleFieldChange}
            type="text"
          />
          <label className='text-danger'>{message ? message.fabricante_motor : ''}</label>
        </Form.Group>

        <Form.Group className="mb-2" as={Col} lg={3} xl={3} xxl={2}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Início Operação</Form.Label>}
          <Form.Control
            placeholder={!hasLabel ? 'Início Operação' : ''}
            value={formData.data_montagem_pivot || ''}
            name="data_montagem_pivot"
            onChange={handleFieldChange}
            type="date"
          />
          <label className='text-danger'>{message ? message.data_montagem_pivot : ''}</label>
        </Form.Group>

        <Form.Group className="mb-2" as={Col} lg={3}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>PDF Ficha </Form.Label>}
          <Form.Control
            name="file"
            onChange={handleFileChange}
            type="file"
          />
          <label className='text-danger'>{message ? message.file : ''}</label>
        </Form.Group>

        <Form.Group className={`mb-0 ${type === 'edit' ? 'text-start' : 'text-end'}`}>
          <Button
            className="w-40"
            type="submit"
            >
              {type === 'edit' ? "Atualizar Pivot" : "Cadastrar Pivot"}
          </Button>
        </Form.Group>    
      </Form>
      <ModalGMS show={showModal.show} type={showModal.type} changemodal={setShowModal} formData={formData} changeform={setFormData} 
        fields={['lat_center_gd','long_center_gd']}
      />
    </>
  );
};

export default PivotForm;

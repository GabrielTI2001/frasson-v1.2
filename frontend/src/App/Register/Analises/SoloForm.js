import React, { useEffect, useState} from 'react';
import AsyncSelect from 'react-select/async';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Button, Form, Col} from 'react-bootstrap';
import { fetchImoveisRurais} from '../Data';
import { fetchPessoal } from '../../Pipeline/Data';
import customStyles, {customStylesDark} from '../../../components/Custom/SelectStyles';
import ModalGMS from '../../../components/Custom/ModalGMS';
import { useAppContext } from '../../../Main';

const AnaliseSoloForm = ({ hasLabel, type, submit, data}) => {
  const {config: {theme}} = useAppContext();
  const user = JSON.parse(localStorage.getItem('user'))
  const [formData, setFormData] = useState({
    created_by: user.id
  });
  const [message, setMessage] = useState()
  const [showModal, setShowModal] = useState({show:false, type:''})
  const channel = new BroadcastChannel('meu_canal');
  const navigate = useNavigate();
  const token = localStorage.getItem("token")
  const {uuid} = useParams()
  const [defaultoptions, setDefaultOptions] = useState()

  const handleApi = async (dadosform) => {
    const link = `${process.env.REACT_APP_API_URL}/register/analysis-soil/${type === 'edit' ? uuid+'/':''}`
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
            channel.postMessage({ tipo: 'atualizar_machinery', reg:data});
            toast.success("Registro Atualizado com Sucesso!")
          }
          else{
            submit('add', data)
            toast.success("Registro Efetuado com Sucesso!")
          }
        }
    } catch (error) {
        console.error('Erro:', error);
    }
  };

  const handleSubmit = async e => {
    setMessage(null)
    e.preventDefault();
    const formDataToSend = new FormData();
    for (const key in formData) {
      if (key === 'file') {
        // Percorrer a lista de arquivos enviados
        for (let i = 0; i < formData[key].length; i++) {
          formDataToSend.append('file', formData[key][i]);
        }
      } else {
        formDataToSend.append(key, formData[key]);
      }
    }
    await handleApi(formDataToSend);
  };

  const handleFileChange = (e) => {
    setFormData({...formData, [e.target.name]:e.target.files})
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
        setFormData({...formData, farm:data.farm, type:data.type, data_construcao:data.data_construcao, 
          valor_estimado: data.valor_estimado?data.valor_estimado:'', tamanho: data.tamanho?data.tamanho:''})
        setDefaultOptions({farm:{value:data.farm, label: data.str_farm}}); 
      }
    }

    if (type === 'edit' && (!defaultoptions || !data)){
      loadFormData()
    }
    else{
      if(!defaultoptions){
        loadFormData()
        setDefaultOptions({farm:{}})
      }
    }

  },[])

  return (
    <>
      <Form onSubmit={handleSubmit} className='row' encType='multipart/form-data'>
        <Form.Group className="mb-2" as={Col} lg={3} xl={3} xxl={2}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Data Coleta</Form.Label>}
          <Form.Control
            placeholder={!hasLabel ? 'Data Coleta' : ''}
            value={formData.data_construcao || ''}
            name="data_coleta"
            onChange={handleFieldChange}
            type="date"
          />
          <label className='text-danger'>{message ? message.data_coleta : ''}</label>
        </Form.Group>
        {defaultoptions && (
          <Form.Group className="mb-2" as={Col} lg={3}>
            {hasLabel && <Form.Label className='fw-bold mb-1'>Fazenda*</Form.Label>}
            <AsyncSelect loadOptions={fetchImoveisRurais} name='farm' styles={theme === 'light'? customStyles : customStylesDark} classNamePrefix="select"
              defaultValue={ type === 'edit' ? (defaultoptions ? defaultoptions.farm : null) : null }
              onChange={(selected) => {
              setFormData((prevFormData) => ({
                ...prevFormData,
                farm: selected.value
                }));
              }}>
            </AsyncSelect>
            <label className='text-danger'>{message ? message.farm : ''}</label>
          </Form.Group>        
        )}

        {defaultoptions && (
          <Form.Group className="mb-2" as={Col} lg={3}>
            {hasLabel && <Form.Label className='fw-bold mb-1'>Cliente*</Form.Label>}
            <AsyncSelect loadOptions={fetchPessoal} name='farm' styles={theme === 'light'? customStyles : customStylesDark} classNamePrefix="select"
              defaultValue={ type === 'edit' ? (defaultoptions ? defaultoptions.cliente : null) : null }
              onChange={(selected) => {
              setFormData((prevFormData) => ({
                ...prevFormData,
                cliente: selected.value
                }));
              }}>
            </AsyncSelect>
            <label className='text-danger'>{message ? message.cliente : ''}</label>
          </Form.Group>        
        )}

        <Form.Group className="mb-2" as={Col} lg={3} xxl={2}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Identificação Amostra*</Form.Label>}
          <Form.Control
            placeholder={!hasLabel ? 'Identificação Amostra' : ''}
            value={formData.identificacao_amostra || ''}
            name="identificacao_amostra"
            onChange={handleFieldChange}
            type="text"
          />
          <label className='text-danger'>{message ? message.identificacao_amostra : ''}</label>
        </Form.Group>

        <Form.Group className="mb-2" as={Col} lg={3} xl={2} xxl={2}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Latitude (GD)*</Form.Label>}
          <Form.Control
            placeholder={!hasLabel ? 'Latitude (GD)' : ''}
            value={formData.latitude_gd || ''}
            name="latitude_gd"
            onChange={handleFieldChange}
            type="number"
          />
          <label className='text-danger'>{message ? message.latitude_gd : ''}</label>
        </Form.Group>
        <Form.Group className="mb-2 d-flex align-items-center" as={Col} lg={'auto'} xxl={'auto'}>
          <Button onClick={() => {setShowModal({show:true, type: 'latitude'})}}>GMS</Button>
        </Form.Group>

        <Form.Group className="mb-2" as={Col} lg={3} xl={2} xxl={2}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Longitude (GD)*</Form.Label>}
          <Form.Control
            placeholder={!hasLabel ? 'Longitude (GD)' : ''}
            value={formData.longitude_gd || ''}
            name="longitude_gd"
            onChange={handleFieldChange}
            type="number"
          />
          <label className='text-danger'>{message ? message.longitude_gd : ''}</label>
        </Form.Group>
        <Form.Group className="mb-2 d-flex align-items-center" as={Col} lg={'auto'} xxl={'auto'}>
          <Button onClick={() => {setShowModal({show:true, type: 'longitude'})}}>GMS</Button>
        </Form.Group>

        <Form.Group className="mb-2" as={Col} lg={3} xl={2} xxl={2}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Profundidade (cm)*</Form.Label>}
          <Form.Control
            placeholder={!hasLabel ? 'Profundidade (cm)' : ''}
            value={formData.profundidade || ''}
            name="profundidade"
            onChange={handleFieldChange}
            type="number"
          />
          <label className='text-danger'>{message ? message.profundidade : ''}</label>
        </Form.Group>

        <Form.Group className="mb-2" as={Col} lg={3} xxl={2}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Número da Amostra</Form.Label>}
          <Form.Control
            placeholder={!hasLabel ? 'Número da Amostra' : ''}
            value={formData.numero_controle || ''}
            name="numero_controle"
            onChange={handleFieldChange}
            type="text"
          />
          <label className='text-danger'>{message ? message.numero_controle : ''}</label>
        </Form.Group>

        <Form.Group className="mb-2" as={Col} lg={3} xxl={2}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Responsável pela Coleta*</Form.Label>}
          <Form.Control
            placeholder={!hasLabel ? 'Responsável pela Coleta' : ''}
            value={formData.reponsavel || ''}
            name="reponsavel"
            onChange={handleFieldChange}
            type="text"
          />
          <label className='text-danger'>{message ? message.reponsavel : ''}</label>
        </Form.Group>

        <Form.Group className="mb-2" as={Col} lg={3} xxl={2}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Laboratório de Análise*</Form.Label>}
          <Form.Control
            placeholder={!hasLabel ? 'Laboratório de Análise' : ''}
            value={formData.laboratorio_analise || ''}
            name="reponsavel"
            onChange={handleFieldChange}
            type="text"
          />
          <label className='text-danger'>{message ? message.laboratorio_analise : ''}</label>
        </Form.Group>

        <Form.Group className="mb-2" as={Col} lg={3}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Arquivo PDF</Form.Label>}
          <Form.Control
            name="file"
            onChange={handleFileChange}
            type="file"
          />
          <label className='text-danger'>{message ? message.file : ''}</label>
        </Form.Group>

        <hr className='ms-3'></hr>
        <h4 style={{fontSize:'14px'}} className='fw-700'>Resultados</h4>
      
        <Form.Group className={`mb-0 ${type === 'edit' ? 'text-start' : 'text-end'}`}>
          <Button
            className="w-40"
            type="submit"
            >
              {type === 'edit' ? "Atualizar Análise Solo" : "Cadastrar Análise Solo"}
          </Button>
        </Form.Group>    

      </Form>
      <ModalGMS show={showModal.show} type={showModal.type} changemodal={setShowModal} formData={formData} changeform={setFormData}/>
    </>
  );
};

export default AnaliseSoloForm;

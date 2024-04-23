import React, { useEffect, useState} from 'react';
import AsyncSelect from 'react-select/async';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Button, Form, Col} from 'react-bootstrap';
import { fetchImoveisRurais, fetchTipoBenfeitoria} from '../Data';
import customStyles, {customStylesDark} from '../../../components/Custom/SelectStyles';
import { useAppContext } from '../../../Main';

const BenfeitoriaForm = ({ hasLabel, type, submit, data}) => {
  const {config: {theme}} = useAppContext();
  const user = JSON.parse(localStorage.getItem('user'))
  const [formData, setFormData] = useState({
    created_by: user.id
  });
  const [message, setMessage] = useState()
  const channel = new BroadcastChannel('meu_canal');
  const navigate = useNavigate();
  const token = localStorage.getItem("token")
  const {uuid} = useParams()
  const [defaultoptions, setDefaultOptions] = useState()
  const [tipos, setTipos] = useState()

  const handleApi = async (dadosform) => {
    const link = `${process.env.REACT_APP_API_URL}/register/farm-assets/${type === 'edit' ? uuid+'/':''}`
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

  const handleImageChange = (e) => {
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
      if(!tipos){
        const types = await fetchTipoBenfeitoria();
        setTipos(types)
      }
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

        <Form.Group className="mb-2" as={Col} xl={2} lg={2}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Tipo de Benfeitoria*</Form.Label>}
          <Form.Select
            placeholder={!hasLabel ? 'Tipo de Benfeitoria' : ''}
            value={formData.type || ''}
            name="type"
            onChange={handleFieldChange}
            type="select"
          >
            <option value={undefined}>----</option>
            {tipos &&( tipos.map( c =>(
              <option key={c.value} value={c.value}>{c.label}</option>
            )))}
          </Form.Select>
          <label className='text-danger'>{message ? message.type : ''}</label>
        </Form.Group>

        <Form.Group className="mb-2" as={Col} lg={3} xl={3} xxl={2}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Data Construção</Form.Label>}
          <Form.Control
            placeholder={!hasLabel ? 'Data Construção' : ''}
            value={formData.data_construcao || ''}
            name="data_construcao"
            onChange={handleFieldChange}
            type="date"
          />
          <label className='text-danger'>{message ? message.data_construcao : ''}</label>
        </Form.Group>

        <Form.Group className="mb-2" as={Col} lg={3} xl={2} xxl={2}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Tamanho (m<sup>2</sup>)*</Form.Label>}
          <Form.Control
            placeholder={!hasLabel ? 'Tamanho' : ''}
            value={formData.tamanho || ''}
            name="tamanho"
            onChange={handleFieldChange}
            type="number"
          />
          <label className='text-danger'>{message ? message.tamanho : ''}</label>
        </Form.Group>

        <Form.Group className="mb-2" as={Col} lg={3} xl={2} xxl={2}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Valor Estimado (R$)*</Form.Label>}
          <Form.Control
            placeholder={!hasLabel ? 'Valor Estimado' : ''}
            value={formData.valor_estimado || ''}
            name="valor_estimado"
            onChange={handleFieldChange}
            type="number"
          />
          <label className='text-danger'>{message ? message.valor_estimado : ''}</label>
        </Form.Group>

        {type == 'add' && <Form.Group className="mb-2" as={Col} lg={3}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Fotos*</Form.Label>}
          <Form.Control
            placeholder={!hasLabel ? 'Arquivo PDF' : ''}
            name="file"
            onChange={handleImageChange}
            type="file"
            multiple={true}
          />
          <label className='text-danger'>{message ? message.file : ''}</label>
        </Form.Group>}
        
        <Form.Group className={`mb-0 ${type === 'edit' ? 'text-start' : 'text-end'}`}>
          <Button
            className="w-40"
            type="submit"
            >
              {type === 'edit' ? "Atualizar Benfeitoria"
              : "Cadastrar Benfeitoria"}
          </Button>
        </Form.Group>           
      </Form>
    </>
  );
};

export default BenfeitoriaForm;

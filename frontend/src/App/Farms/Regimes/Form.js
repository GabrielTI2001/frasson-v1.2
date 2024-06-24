import React, { useEffect, useState} from 'react';
import AsyncSelect from 'react-select/async';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Button, Form, Col, OverlayTrigger, Tooltip} from 'react-bootstrap';
import { fetchPessoal, FetchImoveisRurais } from '../../Pipefy/Data';
import customStyles, {customStylesDark} from '../../../components/Custom/SelectStyles';
import { useAppContext } from '../../../Main';
import { faCircleQuestion, faFilePdf } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { GetRecord, SelectOptions, SelectSearchOptions } from '../../../helpers/Data';
import { Option } from 'react-bootstrap-icons';

const RegimeForm = ({ hasLabel, type, submit, data}) => {
  const {config: {theme}} = useAppContext();
  const user = JSON.parse(localStorage.getItem('user'))
  const [formData, setFormData] = useState({
    created_by: user.id, regime:"PR", atividades:"AGRI"
  });
  const [message, setMessage] = useState()
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [defaultoptions, setDefaultOptions] = useState();

  const handleApi = async (dadosform) => {
    const link = `${process.env.REACT_APP_API_URL}/farms/regime/${type === 'edit' ? data.uuid+'/':''}`
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
          submit('edit', data, data.id)
          toast.success("Registro Atualizado com Sucesso!")
        }
        else{
          submit('add', {matricula_imovel:data.farm_data.matricula, uuid:data.uuid, nome_imovel:data.farm_data.nome,
            regime:data.regime, atividade_display:data.str_atividade, area:data.area, data_inicio:data.data_inicio, data_termino:data.data_termino
          })
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
      if (type === 'edit'){
        if(data && Object.keys(data)){
          //Pega os atributos não nulos de data
          const filteredData = Object.entries(data)
            .filter(([key, value]) => value !== null)
            .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
          
          const {instrumento_cessao, coordenadas, str_quem_explora, farm_data, str_instituicao, ...restData } = filteredData;
          setFormData({...formData, ...restData})
          setDefaultOptions({
            quem_explora:{value:data.quem_explora, label:str_quem_explora}, 
            imovel:{value:data.imovel, label:farm_data.nome+' - '+farm_data.matricula},
            instituicao:{value:data.instituicao, label:str_instituicao}
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
        <Form.Group className="mb-2" as={Col} xl={4} sm={6}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Regime de Exploração*</Form.Label>}
          <Form.Select
            value={formData.regime || ''}
            name="regime"
            onChange={handleFieldChange}
          >
            <option value='PR'>Próprio</option>
            <option value='AR'>Arrendamento</option>
            <option value='CO'>Comodato</option>
            <option value='PA'>Parceria</option>
            <option value='AN'>Anuência</option>
            <option value='CCA'>Condomínio com Anuência</option>
            <option value='CSA'>Condomínio sem Anuência</option>
          </Form.Select>
          <label className='text-danger'>{message ? message.regime : ''}</label>
        </Form.Group>

        {defaultoptions && 
          <Form.Group className="mb-2" as={Col} xl={4} sm={6}>
            {hasLabel && <Form.Label className='fw-bold mb-1'>Imóvel Rural*</Form.Label>}
            <AsyncSelect loadOptions={(value) => SelectSearchOptions(value, 'farms/farms', 'nome', 'matricula')} 
              name='imovel' styles={theme === 'light'? customStyles : customStylesDark} classNamePrefix="select"
              defaultValue={ type === 'edit' ? (defaultoptions ? defaultoptions.imovel :'') : ''}
              onChange={(selected) => {
              setFormData((prevFormData) => ({
                ...prevFormData,
                imovel: selected.value
                }));
              }}>
            </AsyncSelect>
            <label className='text-danger'>{message ? message.imovel : ''}</label>
          </Form.Group> 
        }       

        <Form.Group className="mb-2" as={Col} xl={3} sm={6}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Área (ha)*</Form.Label>}
          <Form.Control
            value={formData.area || ''}
            name="area"
            onChange={handleFieldChange}
            type="number"
          />
          <label className='text-danger'>{message ? message.area : ''}</label>
        </Form.Group>

        <Form.Group className="mb-2" as={Col} xl={3} sm={6}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Data Início*</Form.Label>}
          <Form.Control
            value={formData.data_inicio || ''}
            name="data_inicio"
            onChange={handleFieldChange}
            type="date"
          />
          <label className='text-danger'>{message ? message.data_inicio : ''}</label>
        </Form.Group>

        <Form.Group className="mb-2" as={Col} xl={3} sm={6}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Data Término</Form.Label>}
          <Form.Control
            value={formData.data_termino || ''}
            name="data_termino"
            onChange={handleFieldChange}
            type="date"
          />
          <label className='text-danger'>{message ? message.data_termino : ''}</label>
        </Form.Group>

        {defaultoptions && 
          <Form.Group className="mb-2" as={Col} xl={4} sm={6}>
            {hasLabel && <Form.Label className='fw-bold mb-1'>Quem Explora?*</Form.Label>}
            <AsyncSelect loadOptions={(value) => SelectSearchOptions(value, 'register/pessoal', 'razao_social')} 
              name='quem_explora' styles={theme === 'light'? customStyles : customStylesDark} classNamePrefix="select"
              defaultValue={ type === 'edit' ? (defaultoptions ? defaultoptions.quem_explora : '') : ''}
              onChange={(selected) => {
              setFormData((prevFormData) => ({
                ...prevFormData,
                quem_explora: selected.value
                }));
              }}>
            </AsyncSelect>
            <label className='text-danger'>{message ? message.quem_explora : ''}</label>
          </Form.Group> 
        }  

        {defaultoptions && 
          <Form.Group className="mb-2" as={Col} xl={4} sm={6}>
            {hasLabel && <Form.Label className='fw-bold mb-1'>Instituição*</Form.Label>}
            <AsyncSelect loadOptions={(value) => SelectSearchOptions(value, 'register/instituicoes-razaosocial', 'razao_social')} 
              name='instituicao' styles={theme === 'light'? customStyles : customStylesDark} classNamePrefix="select"
              defaultValue={ type === 'edit' ? (defaultoptions ? defaultoptions.instituicao : '') : ''}
              onChange={(selected) => {
              setFormData((prevFormData) => ({
                ...prevFormData,
                instituicao: selected.value
                }));
              }}>
            </AsyncSelect>
            <label className='text-danger'>{message ? message.instituicao : ''}</label>
          </Form.Group> 
        }  

        <Form.Group className="mb-2" as={Col} xl={4} sm={6}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Atividades Exploradas*</Form.Label>}
          <Form.Select
            value={formData.atividades || ''}
            name="atividades"
            onChange={handleFieldChange}
          >
            <option value='AGRI'>Agricultura</option>
            <option value='PEC'>Pecuária</option>
            <option value='AGP'>Agricultura e Pecuária</option>
            <option value='O'>Outras</option>
          </Form.Select>
          <label className='text-danger'>{message ? message.atividades : ''}</label>
        </Form.Group>

        <Form.Group className="mb-2" as={Col} xl={3} sm={6}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Instrumento de Cessão</Form.Label>}
          <Form.Control
            name="instrumento_cessao"
            onChange={handleFileChange}
            type="file"
          />
          <label className='text-danger'>{message ? message.instrumento_cessao : ''}</label>
        </Form.Group>


        <Form.Group className="mb-2" as={Col} xl={12}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Detalhamento</Form.Label>}
          <Form.Control
            as='textarea'
            value={formData.detalhamento || ''}
            name="detalhamento"
            onChange={handleFieldChange}
            type="text"
          />
          <label className='text-danger'>{message ? message.detalhamento : ''}</label>
        </Form.Group>

        <Form.Group className="mb-2" as={Col} xl={3} sm={6}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>KML*</Form.Label>}
          <Form.Control
            name="kml"
            onChange={handleFileChange}
            type="file"
          />
          <label className='text-danger'>{message ? message.kml : ''}</label>
        </Form.Group>

        <Form.Group className={`mb-0 text-end`}>
          <Button
            className="w-40"
            type="submit"
            >
              {type === 'edit' ? "Atualizar Regime" : "Cadastrar Regime"}
          </Button>
        </Form.Group>    
      </Form>
    </>
  );
};

export default RegimeForm;

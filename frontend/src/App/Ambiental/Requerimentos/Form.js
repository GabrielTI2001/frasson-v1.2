import React, { useEffect, useState} from 'react';
import AsyncSelect from 'react-select/async';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Button, Form, Col, Row} from 'react-bootstrap';
import { fetchMunicipio } from '../Data';
import customStyles, {customStylesDark} from '../../../components/Custom/SelectStyles';
import { useAppContext } from '../../../Main';
import GoogleMap from '../../../components/map/GoogleMap';
import { MapInfoDetail } from './MapInfo';

const RequerimentoAPPOForm = ({ hasLabel, type, submit, data}) => {
  const {config: {theme}} = useAppContext();
  const user = JSON.parse(localStorage.getItem('user'))
  const [formData, setFormData] = useState({
    created_by: user.id, frasson: false
  });
  const [formPDF, setFormPDF] = useState({})
  const [message, setMessage] = useState()
  const navigate = useNavigate();
  const token = localStorage.getItem("token")
  const {uuid} = useParams()
  const [defaultoptions, setDefaultOptions] = useState()
  const [coordenadas, setCoordenadas] = useState([])
  const [tokenmaps, setTokenMaps] = useState()

  const handleApi = async (dadosform, handlepdf) => {
    const link = handlepdf ? `${process.env.REACT_APP_API_URL}/environmental/inema/requerimento/appo/read/pdf/` :
    `${process.env.REACT_APP_API_URL}/environmental/inema/requerimento/appos/${type === 'edit' ? uuid+'/':''}`

    const method = handlepdf ? 'POST' : type === 'edit' ? 'PUT' : 'POST'
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
          if (handlepdf){
            const { coordinates, ...rest} = data;
            setFormData({...formData, ...rest})
            setCoordenadas(coordinates)
            setDefaultOptions({municipio:{value:data.municipio, label:data.str_municipio}})
          }
          else{
            if (type === 'edit'){
              toast.success("Registro Atualizado com Sucesso!")
            }
            else{
              submit('add', data)
              toast.success("Registro Efetuado com Sucesso!")
            }
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
      formDataToSend.append(key, formData[key]);
    }
    await handleApi(formDataToSend);
  };

  const handlePDFsubmit = async e => {
    setMessage(null)
    e.preventDefault();
    const formDataToSend = new FormData();
    for (const key in formPDF) {
      formDataToSend.append(key, formPDF[key]);
    }
    await handleApi(formDataToSend, true);
  };

  const handleFileChange = (e) => {
    setFormPDF({...formPDF, [e.target.name]:e.target.files[0]})
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
      }
    }
    const getTokenMaps = async () => {
      try{
          const response = await fetch(`${process.env.REACT_APP_API_URL}/token/maps/`, {
              method: 'GET'
          });
          if (response.status === 200){
              const data = await response.json();
              setTokenMaps(data.token)
          }
      } catch (error){
          console.error("Erro: ",error)
      }
    }


    if (type === 'edit' && (!defaultoptions || !data)){
      loadFormData()
    }
    else{
      if(!defaultoptions){
        loadFormData()
        setDefaultOptions({municipio:{}})
      }
    }
    if (!tokenmaps){
      getTokenMaps()
    }

  },[])

  return (
    <>
      <Form onSubmit={handlePDFsubmit} className='row' encType='multipart/form-data'>
        {type === 'add' && <Form.Group className="mb-0" as={Col} lg={5}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Arquivo PDF do Requerimento*</Form.Label>}
          <Form.Control
            placeholder={!hasLabel ? 'Arquivo PDF' : ''}
            name="file"
            onChange={handleFileChange}
            type="file"
          />
          <label className='text-danger'>{message ? message.file : ''}</label>
        </Form.Group>}
        <Form.Group className={`d-flex align-items-center`} as={Col} lg={3}>
          <Button
            className="w-40"
            type="submit"
            style={{marginTop: '0px'}}
          >
              Extrair Informações
          </Button>
        </Form.Group>    
        <div>Selecione o PDF do requerimento de APPO e clique no botão para extrair as informações...</div>
      </Form>
      <hr className='mb-2 mt-1'></hr>
      <Row xl={2} sm={2} style={{height: '66vh'}} className='gy-1 d-flex align-items-start'>

        <Form onSubmit={handleSubmit} className='row' encType='multipart/form-data'>

          <Form.Group className="mb-1" as={Col} xl={6} xxl={2}>
            {hasLabel && <Form.Label className='fw-bold mb-1'>Data Requerimento*</Form.Label>}
            <Form.Control
              placeholder={!hasLabel ? 'Data Requerimento' : ''}
              value={formData.data_requerimento || ''}
              name="data_requerimento"
              onChange={handleFieldChange}
              type="date"
            />
            <label className='text-danger'>{message ? message.data_requerimento : ''}</label>
          </Form.Group>
          
          <Form.Group className="mb-1" as={Col} xl={6} xxl={2}>
            {hasLabel && <Form.Label className='fw-bold mb-1'>N° Requerimento*</Form.Label>}
            <Form.Control
              placeholder={!hasLabel ? 'N° Requerimento' : ''}
              value={formData.numero_requerimento || ''}
              name="numero_requerimento"
              onChange={handleFieldChange}
              type="text"
            />
            <label className='text-danger'>{message ? message.numero_requerimento : ''}</label>
          </Form.Group>

          <Form.Group className="mb-1" as={Col} xl={6} xxl={2}>
            {hasLabel && <Form.Label className='fw-bold mb-1'>CPF/CNPJ*</Form.Label>}
            <Form.Control
              placeholder={!hasLabel ? 'CPF/CNPJ' : ''}
              value={formData.cpf_cnpj || ''}
              name="cpf_cnpj"
              onChange={handleFieldChange}
              type="text"
            />
            <label className='text-danger'>{message ? message.cpf_cnpj : ''}</label>
          </Form.Group>
          
          <Form.Group className="mb-1" as={Col} xl={6} xxl={2}>
            {hasLabel && <Form.Label className='fw-bold mb-1'>Nome Requerente*</Form.Label>}
            <Form.Control
              placeholder={!hasLabel ? 'Requerente' : ''}
              value={formData.nome_requerente || ''}
              name="nome_requerente"
              onChange={handleFieldChange}
              type="text"
            />
            <label className='text-danger'>{message ? message.nome_requerente : ''}</label>
          </Form.Group>

          {defaultoptions && (
            <Form.Group className="mb-2" as={Col} xl={6}>
              {hasLabel && <Form.Label className='fw-bold mb-1'>Município localização*</Form.Label>}
              <AsyncSelect loadOptions={fetchMunicipio} name='farm' styles={theme === 'light'? customStyles : customStylesDark} classNamePrefix="select"
                defaultValue={defaultoptions.municipio || ''}
                value={defaultoptions.municipio || ''}
                onChange={(selected) => {
                setFormData((prevFormData) => ({
                  ...prevFormData,
                  municipio: selected.value
                  }));
                setDefaultOptions({municipio:selected})
                }}>
              </AsyncSelect>
              <label className='text-danger'>{message ? message.municipio : ''}</label>
            </Form.Group>        
          )}

          <Form.Group className="mb-1" as={Col} xl={6} xxl={2}>
            {hasLabel && <Form.Label className='fw-bold mb-1'>Email*</Form.Label>}
            <Form.Control
              placeholder={!hasLabel ? 'Email' : ''}
              value={formData.email || ''}
              name="email"
              onChange={handleFieldChange}
              type="text"
            />
            <label className='text-danger'>{message ? message.email : ''}</label>
          </Form.Group>

          <Form.Group className="mb-1" as={Col} xl={6} xxl={2}>
            {hasLabel && <Form.Label className='fw-bold mb-1'>Data Formação*</Form.Label>}
            <Form.Control
              placeholder={!hasLabel ? 'Data Formação' : ''}
              value={formData.data_formacao || ''}
              name="data_formacao"
              onChange={handleFieldChange}
              type="date"
            />
            <label className='text-danger'>{message ? message.data_formacao : ''}</label>
          </Form.Group>

          <Form.Group className="mb-1" as={Col} xl={6} xxl={2}>
            {hasLabel && <Form.Label className='fw-bold mb-1'>N° Processo INEMA*</Form.Label>}
            <Form.Control
              placeholder={!hasLabel ? 'N° Processo INEMA' : ''}
              value={formData.numero_processo || ''}
              name="numero_processo"
              onChange={handleFieldChange}
              type="text"
            />
            <label className='text-danger'>{message ? message.numero_processo : ''}</label>
          </Form.Group>

          <Form.Group className="mb-2" as={Col} lg={6}>
            {hasLabel && <Form.Label className='fw-bold mb-1'>Conduzido Frasson?*</Form.Label>}
            <Form.Select
              placeholder={!hasLabel ? 'Finalidade Outorga' : ''}
              value={formData.processo_frasson || ''}
              name="processo_frasson"
              onChange={handleFieldChange}
              type="select"
            >
              <option value={false}>Não</option>
              <option value={true}>Sim</option>
            </Form.Select>
            <label className='text-danger'>{message ? message.processo_frasson : ''}</label>
          </Form.Group>

          <Form.Group className={`mb-0 ${type === 'edit' ? 'text-start' : 'text-end'}`}>
            <Button
              className="w-40"
              type="submit"
              >
                {type === 'edit' ? "Atualizar Requerimento"
                : "Cadastrar Requerimento"}
            </Button>
          </Form.Group>           
        </Form>
        {tokenmaps && <GoogleMap
          initialCenter={{
            lat: -13.7910,
            lng: -45.6814
          }}
          mapStyle="Default"
          className="rounded-soft mt-0 google-maps-s container-map-s"
          token_api={tokenmaps}
          mapTypeId='satellite'
          coordenadas={coordenadas}
        >
            {/* < MapInfoDetail type={type}/> */}
        </GoogleMap>}
      </Row>
    </>
  );
};

export default RequerimentoAPPOForm;

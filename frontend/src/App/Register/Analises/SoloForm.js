import React, { useEffect, useState} from 'react';
import AsyncSelect from 'react-select/async';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Button, Form, Col, OverlayTrigger, Tooltip} from 'react-bootstrap';
import { fetchImoveisRurais} from '../Data';
import { fetchPessoal } from '../../Pipeline/Data';
import customStyles, {customStylesDark} from '../../../components/Custom/SelectStyles';
import ModalGMS from '../../../components/Custom/ModalGMS';
import { useAppContext } from '../../../Main';
import { faCircleQuestion } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

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
        formDataToSend.append('file', formData[key]);
      } else {
        formDataToSend.append(key, formData[key]);
      }
    }
    // submit('add', {data_coleta:formData.data_coleta, cliente:formData.cl})
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
            value={formData.data_coleta || ''}
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
              defaultValue={ type === 'edit' ? (defaultoptions ? defaultoptions.fazenda : null) : null }
              onChange={(selected) => {
              setFormData((prevFormData) => ({
                ...prevFormData,
                fazenda: selected.value
                }));
              }}>
            </AsyncSelect>
            <label className='text-danger'>{message ? message.fazenda : ''}</label>
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
            value={formData.responsavel || ''}
            name="responsavel"
            onChange={handleFieldChange}
            type="text"
          />
          <label className='text-danger'>{message ? message.responsavel : ''}</label>
        </Form.Group>

        <Form.Group className="mb-2" as={Col} lg={3} xxl={2}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Laboratório de Análise*</Form.Label>}
          <Form.Control
            placeholder={!hasLabel ? 'Laboratório de Análise' : ''}
            value={formData.laboratorio_analise || ''}
            name="laboratorio_analise"
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

        <Form.Group className="mb-2" as={Col} lg={3} xl={2} xxl={2}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Ca<sup>2+</sup> (cmolc/dm<sup>3</sup>)
            <OverlayTrigger overlay={
              <Tooltip style={{ position: 'fixed', fontSize: '10px', padding: '2px !important' }} id="overlay-trigger-example">
                Informe aqui o teor de Cálcio no resultado da amostra. Atente-se para a unidade de medida.
              </Tooltip>
            }>
              <FontAwesomeIcon className='ms-2' icon={faCircleQuestion}/>
            </OverlayTrigger>
          </Form.Label>}
          <Form.Control
            placeholder={!hasLabel ? 'Cálcio' : ''}
            value={formData.calcio_cmolc_dm3 || ''}
            name="calcio_cmolc_dm3"
            onChange={handleFieldChange}
            type="number"
          />
          <label className='text-danger'>{message ? message.calcio_cmolc_dm3 : ''}</label>
        </Form.Group>

        <Form.Group className="mb-2" as={Col} lg={3} xl={2} xxl={2}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Mg<sup>2+</sup> (cmolc/dm<sup>3</sup>)
            <OverlayTrigger overlay={
              <Tooltip style={{ position: 'fixed', fontSize: '10px', padding: '2px !important' }} id="overlay-trigger-example">
                Informe aqui o teor de Magnésio no resultado da amostra. Atente-se para a unidade de medida.
              </Tooltip>
            }>
              <FontAwesomeIcon className='ms-2' icon={faCircleQuestion}/>
            </OverlayTrigger>
          </Form.Label>}
          <Form.Control
            placeholder={!hasLabel ? 'Magnésio' : ''}
            value={formData.magnesio_cmolc_dm3 || ''}
            name="magnesio_cmolc_dm3"
            onChange={handleFieldChange}
            type="number"
          />
          <label className='text-danger'>{message ? message.magnesio_cmolc_dm3 : ''}</label>
        </Form.Group>

        <Form.Group className="mb-2" as={Col} lg={3} xl={2} xxl={2}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>K<sup>2+</sup> (cmolc/dm<sup>3</sup>)
            <OverlayTrigger overlay={
              <Tooltip style={{ position: 'fixed', fontSize: '10px', padding: '2px !important' }} id="overlay-trigger-example">
                Informe aqui o teor de Potássio no resultado da amostra. Atente-se para a unidade de medida.
              </Tooltip>
            }>
              <FontAwesomeIcon className='ms-2' icon={faCircleQuestion}/>
            </OverlayTrigger>
          </Form.Label>}
          <Form.Control
            placeholder={!hasLabel ? 'Potássio' : ''}
            value={formData.potassio_cmolc_dm3 || ''}
            name="potassio_cmolc_dm3"
            onChange={handleFieldChange}
            type="number"
          />
          <label className='text-danger'>{message ? message.potassio_cmolc_dm3 : ''}</label>
        </Form.Group>

        <Form.Group className="mb-2" as={Col} lg={3} xl={2} xxl={2}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>P (mg/dm<sup>3</sup>)
            <OverlayTrigger overlay={
              <Tooltip style={{ position: 'fixed', fontSize: '10px', padding: '2px !important' }} id="overlay-trigger-example">
                Informe aqui o teor de Fósforo no resultado da amostra (Estimado pelo extrator Mehlich-1). Atente-se para a unidade de medida.
              </Tooltip>
            }>
              <FontAwesomeIcon className='ms-2' icon={faCircleQuestion}/>
            </OverlayTrigger>
          </Form.Label>}
          <Form.Control
            placeholder={!hasLabel ? 'Fósforo' : ''}
            value={formData.fosforo || ''}
            name="fosforo"
            onChange={handleFieldChange}
            type="number"
          />
          <label className='text-danger'>{message ? message.fosforo : ''}</label>
        </Form.Group>

        <Form.Group className="mb-2" as={Col} lg={3} xl={2} xxl={2}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>P-rem. (mg/dm<sup>3</sup>)
            <OverlayTrigger overlay={
              <Tooltip style={{ position: 'fixed', fontSize: '10px', padding: '2px !important' }} id="overlay-trigger-example">
                Informe aqui o teor de Fósforo Remanescente no resultado da amostra. O P-rem é a quantidade de fósforo adicionado que fica na solução de equilíbrio, 
                  após certo tempo de contato com o solo, em resposta a uma aplicação de P. Atente-se para a unidade.
              </Tooltip>
            }>
              <FontAwesomeIcon className='ms-2' icon={faCircleQuestion}/>
            </OverlayTrigger>
          </Form.Label>}
          <Form.Control
            placeholder={!hasLabel ? 'Fósforo Rem.' : ''}
            value={formData.fosforo_rem || ''}
            name="fosforo_rem"
            onChange={handleFieldChange}
            type="number"
          />
          <label className='text-danger'>{message ? message.fosforo_rem : ''}</label>
        </Form.Group>

        <Form.Group className="mb-2" as={Col} lg={3} xl={2} xxl={2}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Al<sup>3+</sup> (cmolc/dm<sup>3</sup>)
            <OverlayTrigger overlay={
              <Tooltip style={{ position: 'fixed', fontSize: '10px', padding: '2px !important' }} id="overlay-trigger-example">
                Informe aqui o teor de Alumínio no resultado da amostra. Atente-se para a unidade de medida.
              </Tooltip>
            }>
              <FontAwesomeIcon className='ms-2' icon={faCircleQuestion}/>
            </OverlayTrigger>
          </Form.Label>}
          <Form.Control
            placeholder={!hasLabel ? 'Alumínio' : ''}
            value={formData.aluminio_cmolc_dm3 || ''}
            name="aluminio_cmolc_dm3"
            onChange={handleFieldChange}
            type="number"
          />
          <label className='text-danger'>{message ? message.aluminio_cmolc_dm3 : ''}</label>
        </Form.Group>

        <Form.Group className="mb-2" as={Col} lg={3} xl={2} xxl={2}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>S (cmolc/dm<sup>3</sup>)
            <OverlayTrigger overlay={
              <Tooltip style={{ position: 'fixed', fontSize: '10px', padding: '2px !important' }} id="overlay-trigger-example">
                Informe aqui o teor de Enxofre no resultado da amostra. Atente-se para a unidade de medida.
              </Tooltip>
            }>
              <FontAwesomeIcon className='ms-2' icon={faCircleQuestion}/>
            </OverlayTrigger>
          </Form.Label>}
          <Form.Control
            placeholder={!hasLabel ? 'Enxofre' : ''}
            value={formData.enxofre || ''}
            name="enxofre"
            onChange={handleFieldChange}
            type="number"
          />
          <label className='text-danger'>{message ? message.enxofre : ''}</label>
        </Form.Group>

        <Form.Group className="mb-2" as={Col} lg={3} xl={2} xxl={2}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Zn (cmolc/dm<sup>3</sup>)
            <OverlayTrigger overlay={
              <Tooltip style={{ position: 'fixed', fontSize: '10px', padding: '2px !important' }} id="overlay-trigger-example">
                Informe aqui o teor de Zinco no resultado da amostra. Atente-se para a unidade de medida.
              </Tooltip>
            }>
              <FontAwesomeIcon className='ms-2' icon={faCircleQuestion}/>
            </OverlayTrigger>
          </Form.Label>}
          <Form.Control
            placeholder={!hasLabel ? 'Zinco' : ''}
            value={formData.zinco || ''}
            name="zinco"
            onChange={handleFieldChange}
            type="number"
          />
          <label className='text-danger'>{message ? message.zinco : ''}</label>
        </Form.Group>

        <Form.Group className="mb-2" as={Col} lg={3} xl={2} xxl={2}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Fe (cmolc/dm<sup>3</sup>)
            <OverlayTrigger overlay={
              <Tooltip style={{ position: 'fixed', fontSize: '10px', padding: '2px !important' }} id="overlay-trigger-example">
                Informe aqui o teor de Ferro no resultado da amostra. Atente-se para a unidade de medida.
              </Tooltip>
            }>
              <FontAwesomeIcon className='ms-2' icon={faCircleQuestion}/>
            </OverlayTrigger>
          </Form.Label>}
          <Form.Control
            placeholder={!hasLabel ? 'Ferro' : ''}
            value={formData.ferro || ''}
            name="ferro"
            onChange={handleFieldChange}
            type="number"
          />
          <label className='text-danger'>{message ? message.ferro : ''}</label>
        </Form.Group>

        <Form.Group className="mb-2" as={Col} lg={3} xl={2} xxl={2}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Cu (cmolc/dm<sup>3</sup>)
            <OverlayTrigger overlay={
              <Tooltip style={{ position: 'fixed', fontSize: '10px', padding: '2px !important' }} id="overlay-trigger-example">
                Informe aqui o teor de Cobre no resultado da amostra. Atente-se para a unidade de medida.
              </Tooltip>
            }>
              <FontAwesomeIcon className='ms-2' icon={faCircleQuestion}/>
            </OverlayTrigger>
          </Form.Label>}
          <Form.Control
            placeholder={!hasLabel ? 'Cobre' : ''}
            value={formData.cobre || ''}
            name="cobre"
            onChange={handleFieldChange}
            type="number"
          />
          <label className='text-danger'>{message ? message.cobre : ''}</label>
        </Form.Group>

        <Form.Group className="mb-2" as={Col} lg={3} xl={2} xxl={2}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Mn (cmolc/dm<sup>3</sup>)
            <OverlayTrigger overlay={
              <Tooltip style={{ position: 'fixed', fontSize: '10px', padding: '2px !important' }} id="overlay-trigger-example">
                Informe aqui o teor de Manganês no resultado da amostra. Atente-se para a unidade de medida.
              </Tooltip>
            }>
              <FontAwesomeIcon className='ms-2' icon={faCircleQuestion}/>
            </OverlayTrigger>
          </Form.Label>}
          <Form.Control
            placeholder={!hasLabel ? 'Cobre' : ''}
            value={formData.manganes || ''}
            name="manganes"
            onChange={handleFieldChange}
            type="number"
          />
          <label className='text-danger'>{message ? message.manganes : ''}</label>
        </Form.Group>

        <Form.Group className="mb-2" as={Col} lg={3} xl={2} xxl={2}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>B (cmolc/dm<sup>3</sup>)
            <OverlayTrigger overlay={
              <Tooltip style={{ position: 'fixed', fontSize: '10px', padding: '2px !important' }} id="overlay-trigger-example">
                Informe aqui o teor de Boro no resultado da amostra. Atente-se para a unidade de medida.
              </Tooltip>
            }>
              <FontAwesomeIcon className='ms-2' icon={faCircleQuestion}/>
            </OverlayTrigger>
          </Form.Label>}
          <Form.Control
            placeholder={!hasLabel ? 'Boro' : ''}
            value={formData.boro || ''}
            name="boro"
            onChange={handleFieldChange}
            type="number"
          />
          <label className='text-danger'>{message ? message.boro : ''}</label>
        </Form.Group>

        <Form.Group className="mb-2" as={Col} lg={3} xl={2} xxl={2}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>H+Al
            <OverlayTrigger overlay={
              <Tooltip style={{ position: 'fixed', fontSize: '10px', padding: '2px !important' }} id="overlay-trigger-example">
                Informe aqui o teor total de Acidez Potencial no resultado da amostra. Atente-se para a unidade de medida.
              </Tooltip>
            }>
              <FontAwesomeIcon className='ms-2' icon={faCircleQuestion}/>
            </OverlayTrigger>
          </Form.Label>}
          <Form.Control
            placeholder={!hasLabel ? 'Acidez Potencial' : ''}
            value={formData.h_mais_al || ''}
            name="h_mais_al"
            onChange={handleFieldChange}
            type="number"
          />
          <label className='text-danger'>{message ? message.h_mais_al : ''}</label>
        </Form.Group>

        <Form.Group className="mb-2" as={Col} lg={4} xl={3} xxl={2}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Matéria Orgânica (dag/dm<sup>3</sup>)
            <OverlayTrigger overlay={
              <Tooltip style={{ position: 'fixed', fontSize: '10px', padding: '2px !important' }} id="overlay-trigger-example">
                Informe aqui o teor Matéria Orgânica no resultado da amostra. Atente-se para a unidade de medida.
              </Tooltip>
            }>
              <FontAwesomeIcon className='ms-2' icon={faCircleQuestion}/>
            </OverlayTrigger>
          </Form.Label>}
          <Form.Control
            placeholder={!hasLabel ? 'Mat. Orgânica' : ''}
            value={formData.mat_org_dag_dm3 || ''}
            name="mat_org_dag_dm3"
            onChange={handleFieldChange}
            type="number"
          />
          <label className='text-danger'>{message ? message.mat_org_dag_dm3 : ''}</label>
        </Form.Group>

        <Form.Group className="mb-2" as={Col} lg={3} xl={2} xxl={2}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>pH H<sub>2</sub>O
            <OverlayTrigger overlay={
              <Tooltip style={{ position: 'fixed', fontSize: '10px', padding: '2px !important' }} id="overlay-trigger-example">
                Informe aqui o pH em Água.
              </Tooltip>
            }>
              <FontAwesomeIcon className='ms-2' icon={faCircleQuestion}/>
            </OverlayTrigger>
          </Form.Label>}
          <Form.Control
            placeholder={!hasLabel ? 'pH Água' : ''}
            value={formData.ph_h2O || ''}
            name="ph_h2O"
            onChange={handleFieldChange}
            type="number"
          />
          <label className='text-danger'>{message ? message.ph_h2O : ''}</label>
        </Form.Group>

        <Form.Group className="mb-2" as={Col} lg={3} xl={2} xxl={2}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>pH CaCl<sub>2</sub>
            <OverlayTrigger overlay={
              <Tooltip style={{ position: 'fixed', fontSize: '10px', padding: '2px !important' }} id="overlay-trigger-example">
                Informe aqui o pH em CaCl.
              </Tooltip>
            }>
              <FontAwesomeIcon className='ms-2' icon={faCircleQuestion}/>
            </OverlayTrigger>
          </Form.Label>}
          <Form.Control
            placeholder={!hasLabel ? 'pH CaCl' : ''}
            value={formData.ph_cacl2 || ''}
            name="ph_cacl2"
            onChange={handleFieldChange}
            type="number"
          />
          <label className='text-danger'>{message ? message.ph_cacl2 : ''}</label>
        </Form.Group>

        <Form.Group className="mb-2" as={Col} lg={3} xl={2} xxl={2}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Argila (%)</Form.Label>}
          <Form.Control
            placeholder={!hasLabel ? 'Argila' : ''}
            value={formData.argila_percentual || ''}
            name="argila_percentual"
            onChange={handleFieldChange}
            type="number"
          />
          <label className='text-danger'>{message ? message.argila_percentual : ''}</label>
        </Form.Group>

        <Form.Group className="mb-2" as={Col} lg={3} xl={2} xxl={2}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Silte (%)</Form.Label>}
          <Form.Control
            placeholder={!hasLabel ? 'Silte' : ''}
            value={formData.silte_percentual || ''}
            name="silte_percentual"
            onChange={handleFieldChange}
            type="number"
          />
          <label className='text-danger'>{message ? message.silte_percentual : ''}</label>
        </Form.Group>

        <Form.Group className="mb-2" as={Col} lg={3} xl={2} xxl={2}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Areia (%)</Form.Label>}
          <Form.Control
            placeholder={!hasLabel ? 'Areia' : ''}
            value={formData.areia_percentual || ''}
            name="areia_percentual"
            onChange={handleFieldChange}
            type="number"
          />
          <label className='text-danger'>{message ? message.areia_percentual : ''}</label>
        </Form.Group>

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

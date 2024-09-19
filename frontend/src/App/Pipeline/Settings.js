import React, { useEffect, useState } from 'react';
import { GetRecord, SelectSearchOptions } from '../../helpers/Data';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button, Col, Form } from 'react-bootstrap';
import AsyncSelect from 'react-select/async';
import customStyles, { customStyle, customStylesDark } from '../../components/Custom/SelectStyles';
import { useAppContext } from '../../Main';
import api from '../../context/data';
import { toast } from 'react-toastify';
import CustomBreadcrumb from '../../components/Custom/Commom';
import { RedirectToLogin } from '../../Routes/PrivateRoute';

const SettingsPipe = () => {
  const [dados, setDados] = useState()
  const [formData, setFormData] = useState({})
  const [formDataFase, setFormDataFase] = useState({})
  const [defaultoptions, setDefaultOptions] = useState()
  const [selected, setSelected] = useState([])
  const {config: {theme}} = useAppContext();
  const {pipe} = useParams()
  const [message, setMessage] = useState()
  const navigate = useNavigate()
  const token = localStorage.getItem("token")

  const handleSubmit = async e => {
    setMessage(null)
    e.preventDefault();
    api.put(`pipeline/pipes/${pipe}/`, formData, {headers: {Authorization: `Bearer ${token}`}})
    .then((response) => {
      toast.success("Pipe Atualizado com Sucesso!")
    })
    .catch((erro) => {
      if (erro.response.status === 400){
        setMessage(erro.response.data)
      }
      if (erro.response.status === 401){
        RedirectToLogin(navigate)
      }
      console.error('erro: '+erro);
    })
  };

  const handleSubmitFase = async e => {
    setMessage(null)
    e.preventDefault();
    api.put(`pipeline/fases/${formDataFase.fase}/`, formDataFase, {headers: {Authorization: `Bearer ${token}`}})
    .then((response) => {
      toast.success("Fase Atualizada com Sucesso!")
      setDefaultOptions({...defaultoptions, 
        fases:defaultoptions.fases.map(f => f.id === response.data.id 
          ? {...f, responsaveis:response.data.list_responsaveis, dias_prazo:response.data.dias_prazo} : f)
        }
      )
    })
    .catch((erro) => {
      if (erro.response.status === 400){
        setMessage(erro.response.data)
      }
      if (erro.response.status === 401){
        RedirectToLogin(navigate)
      }
      console.error('erro: '+erro);
    })
  };

  useEffect(() => {
    setFormDataFase({...formDataFase, responsaveis:selected.map(s => s.value)})
  }, [selected])

  useEffect(() => {
      const getdata = async () =>{
        const dados = await GetRecord(pipe, 'pipeline/pipe-data')
        if (!dados) {RedirectToLogin(navigate)}
        else{
          setDados(dados)
          setFormData(dados)
          setDefaultOptions({pessoas:dados.list_pessoas, fases:dados.list_fases})
          setFormDataFase({fase:dados.list_fases[0].id, dias_prazo:dados.list_fases[0].dias_prazo})
          setSelected(dados.list_fases[0].responsaveis)
        }
      }
      getdata()
  }, []);

  return (
  <>
    <CustomBreadcrumb >
      <span className="breadcrumb-item fw-bold">
        <Link className="link-fx text-primary fs--1" to={'/home'}>Home</Link>
      </span>
      <span className="breadcrumb-item fw-bold fs--1" aria-current="page">
        Configurações Fluxo {dados && dados.descricao}
      </span>  
    </CustomBreadcrumb>
    <Form onSubmit={handleSubmit} className='row'>
      {defaultoptions && (
        <Form.Group className="mb-2" as={Col} xl={5} sm={5}>
          <Form.Label className='fw-bold mb-1'>Pessoas Autorizadas*</Form.Label>
          <AsyncSelect loadOptions={(v) => SelectSearchOptions(v, 'users/users', 'first_name', 'last_name', true)} 
            isMulti
            styles={theme === 'light'? customStyles : customStylesDark} classNamePrefix="select"
            defaultValue={defaultoptions ? defaultoptions.pessoas : ''}
            onChange={(selected) => {
              setFormData((prevFormData) => ({
                ...prevFormData,
                pessoas: selected.map(s => s.value)
              }));
            }}>
          </AsyncSelect>
          <label className='text-danger'>{message ? message.pessoas : ''}</label>
        </Form.Group>        
      )}
      <Form.Group className={`mb-0 col-auto py-3 d-flex align-items-center`}>
        <Button className="w-40" type="submit">Atualizar Pipe</Button>
      </Form.Group>    
    </Form>
    <hr className='my-1'></hr>
    <h5 className='fw-bold fs-0'>Fases</h5>
    {defaultoptions && defaultoptions.fases && 
      <Form onSubmit={handleSubmitFase} className='row'>
        <Form.Group className="mb-2" as={Col} xl={4} sm={3}>
          <Form.Label className='fw-bold mb-1'>Fase</Form.Label>
          <Form.Select name='fase' 
            onChange={(e) => {
              setFormDataFase({...formDataFase, [e.target.name]:parseInt(e.target.value), 
                dias_prazo: defaultoptions.fases.find(f => f.id === parseInt(e.target.value)).dias_prazo
              })
              setMessage(null)
              setSelected(defaultoptions.fases.find(f => f.id === parseInt(e.target.value)).responsaveis)
            }}
          >
            {defaultoptions.fases.map(f => 
              <option key={f.id} value={f.id}>{f.descricao}</option>
            )}
          </Form.Select>
        </Form.Group> 

        <Form.Group as={Col} xl={4} sm={6}>
          <Form.Label className='fw-bold mb-1'>Responsáveis</Form.Label>
          <AsyncSelect loadOptions={(v) => SelectSearchOptions(v, 'users/users', 'first_name', 'last_name', true)} 
            isMulti value={selected}
            styles={customStyle(theme, message && message.responsaveis)} classNamePrefix="select"
            onChange={(selected) => {
              setFormDataFase({...formDataFase, responsaveis: selected.map(s => s.value)});
              setSelected(selected)
            }}>
          </AsyncSelect>
          <label className='text-danger'>{message ? message.responsaveis : ''}</label>
        </Form.Group> 

        <Form.Group as={Col} xl={2} sm={3}>
          <Form.Label className='fw-bold mb-1'>Dias Prazo</Form.Label>
          <Form.Control type='number' name='dias_prazo' value={formDataFase.dias_prazo || 5}
            onChange={(e) => setFormDataFase({...formDataFase, [e.target.name]:e.target.value})}
          />
          <label className='text-danger'>{message ? message.dias_prazo : ''}</label>
        </Form.Group> 

        <Form.Group className={`mb-0 text-end col-auto d-flex align-items-center`}>
          <Button className="w-40" type="submit">Atualizar Fase</Button>
        </Form.Group>    
      </Form>       
    }
  </>
  );
};

export default SettingsPipe;
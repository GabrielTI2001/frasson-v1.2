import React, { useEffect, useState } from 'react';
import { GetRecord, SelectSearchOptions } from '../../helpers/Data';
import { Link, useParams } from 'react-router-dom';
import { Button, Col, Form } from 'react-bootstrap';
import AsyncSelect from 'react-select/async';
import customStyles, { customStylesDark } from '../../components/Custom/SelectStyles';
import { useAppContext } from '../../Main';
import api from '../../context/data';
import { toast } from 'react-toastify';
import CustomBreadcrumb from '../../components/Custom/Commom';

const SettingsPipe = () => {
  const [dados, setDados] = useState()
  const [formData, setFormData] = useState({})
  const [defaultoptions, setDefaultOptions] = useState()
  const {config: {theme}} = useAppContext();
  const {pipe} = useParams()
  const [message, setMessage] = useState()
  const token = localStorage.getItem("token")

  const handleSubmit = async e => {
    setMessage(null)
    e.preventDefault();
    api.put(`pipeline/pipes/${pipe}/`, formData, {headers: {Authorization: `Bearer ${token}`}})
    .then((response) => {
      toast.success("Pipe Atualizado com Sucesso!")
    })
    .catch((erro) => {
      console.error('erro: '+erro);
    })

  };

  useEffect(() => {
      const getdata = async () =>{
        const dados = await GetRecord(pipe, 'pipeline/pipe-data')
        setDados(dados)
        setFormData(dados)
        setDefaultOptions({pessoas:dados.list_pessoas})
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
          Configurações Pipe {dados && dados.descricao}
        </span>  
    </CustomBreadcrumb>
    <Form onSubmit={handleSubmit} className='row'>
        {defaultoptions && (
          <Form.Group className="mb-2" as={Col} xl={5}>
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

        <Form.Group className={`mb-0 text-end`}>
          <Button
            className="w-40"
            type="submit"
            >
              Atualizar Pipe
          </Button>
        </Form.Group>    
      </Form>
  </>
  );
};

export default SettingsPipe;
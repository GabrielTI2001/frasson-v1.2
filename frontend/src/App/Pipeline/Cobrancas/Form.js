import React,{useEffect, useState} from 'react';
import { useNavigate } from "react-router-dom";
import { Button, Col} from 'react-bootstrap';
import {Form} from 'react-bootstrap';
import { toast } from 'react-toastify';
import AsyncSelect from 'react-select/async';
import { SelectSearchOptions } from '../../../helpers/Data';
import customStyles, { customStylesDark } from '../../../components/Custom/SelectStyles';
import { useAppContext } from '../../../Main';
import { useDropzone } from 'react-dropzone';
import { faCloudArrowUp } from '@fortawesome/free-solid-svg-icons';
import Flex from '../../../components/common/Flex';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { RedirectToLogin } from '../../../Routes/PrivateRoute';

const FormCobranca = ({type, data, submit, card}) => {
    const {config: {theme}} = useAppContext();
    const navigate = useNavigate()
    const token = localStorage.getItem("token")
    const user = JSON.parse(localStorage.getItem("user"))
    const [message, setMessage] = useState();
    const [formData, setformData] = useState({created_by:user.id, fluxo_ambiental:card ? card.id : '', status:'AD',
      contrato:card.contrato, cliente:card.beneficiario
    });
    const [defaultoptions, setDefaultOptions] = useState();

    const handleApi = async (dadosform) => {
        const link = `${process.env.REACT_APP_API_URL}/finances/revenues/${type === 'edit' ? data.id+'/' : ''}`
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
              RedirectToLogin(navigate);
            }
            else if (response.status === 201 || response.status === 200){
                type === 'edit' ? submit('edit', data) : submit('add', data)
                toast.success("Registro Atualizado com Sucesso!")
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
            for (let i = 0; i < formData[key].length; i++) {
              formDataToSend.append('file', formData[key][i]);
            }
          }
          else if (Array.isArray(formData[key])) {
            formData[key].forEach(value => {
              formDataToSend.append(key, value);
            });
          } else {
            formDataToSend.append(key, formData[key]);
          }
        }
        await handleApi(formDataToSend);
    };
    const handleFieldChange = e => {
      setformData({
        ...formData,
        [e.target.name]: e.target.value
      })
    };

    useEffect(() =>{
        const setform = () =>{
          setformData({...data, ...formData})
        }
        if(type === 'edit' && !formData.atividade){
            setform()
        }
        else{
            if(!defaultoptions){
                setDefaultOptions({})
            }
        }
    },[])

    return (
    <Form onSubmit={handleSubmit} className='row' encType='multipart/form-data'>
        <Form.Group className="mb-1" as={Col} xl={12}>
            <Form.Label className='fw-bold mb-1'>Status*</Form.Label>
            <Form.Select
              value={formData.status || ''}
              name="status"
              onChange={handleFieldChange}
              type="select"
            >
              <option value={undefined}>----</option>
              <option value='EA'>Em Aberto</option>
              <option value='P'>Pago</option>
            </Form.Select>
            <label className='text-danger'>{message ? message.status : ''}</label>
        </Form.Group>

        {defaultoptions && 
          <Form.Group className="mb-2" as={Col} xl={12}>
            <Form.Label className='fw-bold mb-1'>Serviço*</Form.Label>
            <AsyncSelect 
              loadOptions={(value) => SelectSearchOptions(value, 'register/detalhamentos', 'detalhamento_servico', null, false, `contratogai=${card.contrato}`)} 
              name='servicos' styles={theme === 'light'? customStyles : customStylesDark} classNamePrefix="select"
              defaultValue={ type === 'edit' ? (defaultoptions ? defaultoptions.servicos : '') : ''}
              onChange={(selected) => {
                setformData((prevFormData) => ({
                  ...prevFormData,
                  servico: selected.value
                  }));
              }}>
            </AsyncSelect>
            <label className='text-danger'>{message ? message.servicos : ''}</label>
          </Form.Group> 
        }  

        <Form.Group className="mb-1" as={Col} xl={12}>
            <Form.Label className='fw-bold mb-1'>Etapa*</Form.Label>
            <Form.Select
              value={formData.etapa || ''}
              name="etapa"
              onChange={handleFieldChange}
              type="select"
            >
              <option value={undefined}>----</option>
              <option value='A'>Assinatura Contrato</option>
              <option value='P'>Protocolo</option>
              <option value='E'>Encerramento</option>
            </Form.Select>
            <label className='text-danger'>{message ? message.etapa : ''}</label>
        </Form.Group>

        {defaultoptions && 
          <Form.Group className="mb-2" as={Col} xl={12}>
            <Form.Label className='fw-bold mb-1'>Caixa*</Form.Label>
            <AsyncSelect 
              loadOptions={(value) => SelectSearchOptions(value, 'finances/caixas', 'nome', null, false)} 
              name='servicos' styles={theme === 'light'? customStyles : customStylesDark} classNamePrefix="select"
              defaultValue={ type === 'edit' ? (defaultoptions ? defaultoptions.servicos : '') : ''}
              onChange={(selected) => {
                setformData((prevFormData) => ({
                  ...prevFormData,
                  servico: selected.value
                  }));
              }}>
            </AsyncSelect>
            <label className='text-danger'>{message ? message.servicos : ''}</label>
          </Form.Group> 
        }  

        {/* {defaultoptions && (
          <Form.Group className="mb-1" as={Col} xl={12}>
            <Form.Label className='fw-bold mb-1'>Responsáveis*</Form.Label>
            <AsyncSelect isMulti
              loadOptions={(value) => SelectSearchOptions(value, 'users/users', 'first_name', 'last_name', true, `pipe=${card.pipe_code}`)}
              styles={theme === 'light'? customStyles : customStylesDark} classNamePrefix="select"
              defaultValue={type === 'edit' ? defaultoptions.responsaveis || '' : ''}
              onChange={(selected) => {
                setformData((prevFormData) => ({
                  ...prevFormData,
                  responsaveis: selected.map(s => s.value)
                }));
              }}>
            </AsyncSelect>
            <label className='text-danger'>{message ? message.responsaveis : ''}</label>
          </Form.Group>        
        )} */}
        {/* <label className='fw-bold mb-0'>Anexos</label>
        <Form.Group as={Col} xl={12} className='mb-2'>
          <div {...getRootProps({ className: `dropzone-area py-2 container container-fluid ${isDragActive ? 'dropzone-active' : ''}`})}>
            <input {...getInputProps()} />
            <Flex justifyContent="center" alignItems="center">
              <span className='text-midle'><FontAwesomeIcon icon={faCloudArrowUp} className='mt-1 fs-2 text-warning' /></span>
              <p className="fs-9 mb-0 text-700 ms-2">
                {!formData.file ? 'Arraste os arquivos aqui' : formData.file.length+' Arquivo(s) Selecionado(s)'}
              </p>
            </Flex>
          </div>
        </Form.Group> */}

        <Form.Group as={Col} className='text-end' xl={12}>
            <Button type='submit'>Cadastrar</Button>
        </Form.Group>
    </Form>
    );
};
  
export default FormCobranca;
  


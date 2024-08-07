import React,{useEffect, useState} from 'react';
import { useNavigate } from "react-router-dom";
import { Button, Col} from 'react-bootstrap';
import {Form} from 'react-bootstrap';
import { toast } from 'react-toastify';
import AsyncSelect from 'react-select/async';
import { SelectSearchOptions, sendData } from '../../../helpers/Data';
import customStyles, { customStylesDark } from '../../../components/Custom/SelectStyles';
import { useAppContext } from '../../../Main';
import { useDropzone } from 'react-dropzone';
import { faCloudArrowUp } from '@fortawesome/free-solid-svg-icons';
import Flex from '../../../components/common/Flex';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { RedirectToLogin } from '../../../Routes/PrivateRoute';

const FormPVTEC = ({type, data, submit, card}) => {
    const {config: {theme}} = useAppContext();
    const navigate = useNavigate()
    const user = JSON.parse(localStorage.getItem("user"))
    const [message, setMessage] = useState();
    const [formData, setformData] = useState({created_by:user.id, fluxo_ambiental:card ? card.id : '', status:'EA',
      phase_origem:card.phase
    });
    const [defaultoptions, setDefaultOptions] = useState();
    const [isDragActive, setIsDragActive] = useState();

    const { getRootProps: getRootProps, getInputProps: getInputProps } = useDropzone({
      multiple: true,
      onDrop: (acceptedFiles) => {
        setformData({ ...formData, file: acceptedFiles });
      },
      onDragEnter: () => setIsDragActive(true),
      onDragLeave: () => setIsDragActive(false),
      onDropAccepted: () => setIsDragActive(false),
      onDropRejected: () => setIsDragActive(false),
    });
  

    const handleApi = async (dadosform) => {
      const {resposta, dados} = await sendData({type:type, url:'pipeline/pvtec', keyfield:type === 'edit' && data.id, dadosform:dadosform, 
        is_json:false})
      if(resposta.status === 400){
        setMessage({...dados})
      }
      else if (resposta.status === 401){
        RedirectToLogin(navigate)
      }
      else if (resposta.status === 201 || resposta.status === 200){
        type === 'edit' ? submit('edit', data) : submit('add', data)
        toast.success("Registro Atualizado com Sucesso!")
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
            <Form.Label className='fw-bold mb-1'>Atividade*</Form.Label>
            <Form.Select
              value={formData.atividade || ''}
              name="atividade"
              onChange={handleFieldChange}
              type="select"
            >
              <option value={undefined}>----</option>
              <option value='AC'>Ação com Cliente</option>
              <option value='AT'>Ação com Terceiros</option>
              <option value='ET'>Entrega Técnica</option>
              <option value='LLC'>LITEC - Levantamento de Campo</option>
              <option value='LPT'>LITEC - PTC</option>
              <option value='LNT'>LITEC - NT</option>
              <option value='FB'>Feedback</option>
              <option value='RC'>Renovação de Contrato</option>
              <option value='ND'>Novas Demandas</option>
              <option value='MT'>Make Time</option>
              <option value='FOC'>Formalização Operação de Crédito</option>
              <option value='OF'>Outras Frentes</option>
            </Form.Select>
            <label className='text-danger'>{message ? message.atividade : ''}</label>
        </Form.Group>

        {defaultoptions && (
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
        )}
        <Form.Group as={Col} xl={12} className='mb-1'>
            <Form.Label className='mb-0 fw-bold'>Orientações*</Form.Label>
            <Form.Control 
                as='textarea' 
                rows={5} className='fs--1'
                value={formData.orientacoes || ''} 
                onChange={handleFieldChange}
                name='orientacoes'
            />
            <label className='text-danger'>{message ? message.orientacoes : ''}</label>
        </Form.Group>
        <label className='fw-bold mb-0'>Anexos</label>
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
        </Form.Group>

        <Form.Group as={Col} className='text-end' xl={12}>
            <Button type='submit'>Cadastrar</Button>
        </Form.Group>
    </Form>
    );
};
  
export default FormPVTEC;
  


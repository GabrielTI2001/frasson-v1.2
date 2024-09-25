import React,{useEffect, useState} from 'react';
import { useNavigate } from "react-router-dom";
import { Button, Col, Spinner} from 'react-bootstrap';
import {Form} from 'react-bootstrap';
import { toast } from 'react-toastify';
import { sendData } from '../../../helpers/Data';
import { useAppContext } from '../../../Main';
import { useDropzone } from 'react-dropzone';
import { faCloudArrowUp } from '@fortawesome/free-solid-svg-icons';
import Flex from '../../../components/common/Flex';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { RedirectToLogin } from '../../../Routes/PrivateRoute';

const FormAT = ({type, data, submit, card}) => {
    const {config: {theme}} = useAppContext();
    const navigate = useNavigate()
    const user = JSON.parse(localStorage.getItem("user"))
    const [message, setMessage] = useState();
    const [formData, setformData] = useState({created_by:user.id, fluxo_prospect:card ? card.id : '', tipo:'LC',
      phase_origem:card.phase
    });
    const [defaultoptions, setDefaultOptions] = useState();
    const [isLoading, setIsLoading] = useState(false);
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
      const {resposta, dados} = await sendData({type:type, url:'pipeline/analise-tecnica', keyfield:type === 'edit' && data.id, dadosform:dadosform, 
        is_json:false})
      if(resposta.status === 400){
        setMessage({...dados})
      }
      else if (resposta.status === 401){
        RedirectToLogin(navigate)
      }
      else if (resposta.status === 201 || resposta.status === 200){
        type === 'edit' ? submit('edit', dados) : submit('add', dados)
        toast.success("Registro Atualizado com Sucesso!")
      }
      setIsLoading(false)
    };

    const handleSubmit = async e => {
        setMessage(null)
        setIsLoading(true)
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
            <Form.Label className='fw-bold mb-1'>Tipo*</Form.Label>
            <Form.Select
              value={formData.tipo || ''}
              name="tipo"
              onChange={handleFieldChange}
              type="select"
            >
              <option value='LC'>Levantamento de Campo</option>
              <option value='PA'>Procedimentos Alternativos</option>
              <option value='AT'>Análise Técnica</option>
            </Form.Select>
            <label className='text-danger'>{message ? message.tipo : ''}</label>
        </Form.Group>
        <Form.Group as={Col} xl={12} className='mb-1'>
            <Form.Label className='mb-0 fw-bold'>Observações</Form.Label>
            <Form.Control 
                as='textarea' 
                rows={5} className='fs--1'
                value={formData.observacoes || ''} 
                onChange={handleFieldChange}
                name='observacoes'
            />
            <label className='text-danger'>{message ? message.observacoes : ''}</label>
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
          <Button type='submit' disabled={isLoading}>
            {isLoading ? <Spinner size='sm' className='p-0 mx-3' style={{height:'12px', width:'12px'}}/> :<span>Cadastrar</span>}
          </Button>
        </Form.Group>
    </Form>
    );
};
  
export default FormAT;
  


import React,{useEffect, useState} from 'react';
import { useNavigate } from "react-router-dom";
import { Button, Col, Spinner} from 'react-bootstrap';
import {Form} from 'react-bootstrap';
import { toast } from 'react-toastify';
import { SelectOptions, sendData } from '../../../helpers/Data';
import { useAppContext } from '../../../Main';
import { useDropzone } from 'react-dropzone';
import { faCloudArrowUp } from '@fortawesome/free-solid-svg-icons';
import Flex from '../../../components/common/Flex';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { RedirectToLogin } from '../../../Routes/PrivateRoute';

export const fieldsProcesso = [
  {name:'data_requerimento', label:'Data Requerimento*', type:'date'},
  {name:'requerimento', label:'N° Requerimento*', type:'text'},
  {name:'data_enquadramento', label:'Data Enquadramento', type:'date'},
  {name:'data_validacao', label:'Data Validação', type:'date'},
  {name:'valor_boleto', label:'Valor Boleto (R$)', type:'text', isnumber:true},
  {name:'vencimento_boleto', label:'Vencimento Boleto', type:'date'},
  {name:'data_formacao', label:'Data Formação', type:'date'},
  {name:'numero_processo', label:'N° Processo', type:'text'},
  {name:'processo_sei', label:'N° Processo SEI', type:'text'},
]

const FormAcomp = ({submit, card}) => {
    const {config: {theme}} = useAppContext();
    const navigate = useNavigate()
    const user = JSON.parse(localStorage.getItem("user"))
    const [statuslist, setStatuslist] = useState();
    const [message, setMessage] = useState();
    const [formData, setformData] = useState({created_by:user.id, fluxo_ambiental:card ? card.id : '',
      phase_origem:card.phase
    });
    const [isDragActive, setIsDragActive] = useState();
    const [isLoading, setIsLoading] = useState(false);

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
      const {resposta, dados} = await sendData({type:'add', url:'processes/acompanhamentos', keyfield:null, dadosform:dadosform, is_json:false})
      if(resposta.status === 400){
        setMessage({...dados})
      }
      else if (resposta.status === 401){
        RedirectToLogin(navigate);
      }
      else if (resposta.status === 201 || resposta.status === 200){
        submit('add', {...dados, data: new Date(dados.data).toLocaleDateString('pt-BR', {timeZone: 'UTC'}), status:dados.str_status})
        toast.success("Registro Adicionado com Sucesso!")
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
          }else {
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
      const getoptions = async () =>{
          const options = await SelectOptions('processes/status-acompanhamento', 'description')
          setStatuslist(options)
      }
      if (!statuslist){
          getoptions()
      }
    },[])

    return (
    <Form onSubmit={handleSubmit} className='row' encType='multipart/form-data'>
<       Form.Group as={Col} className='mb-3' xl={12}>
          <Form.Label className='mb-0 fw-bold'>Data*</Form.Label>
          <Form.Control type='date' value={formData.data || ''} 
              onChange={handleFieldChange}
              name='data'
          />
          <label className='text-danger'>{message ? message.data : ''}</label>
        </Form.Group>

        <Form.Group className="mb-2" as={Col} xl={12}>
          <Form.Label className='fw-bold mb-1'>Status*</Form.Label>
          <Form.Select
            value={formData.status || ''}
            name="status"
            onChange={handleFieldChange}
            type="select"
          >
            <option value={undefined}>----</option>
            {statuslist &&( statuslist.map( c =>(
              <option key={c.value} value={c.value}>{c.label}</option>
            )))}
          </Form.Select>
          <label className='text-danger'>{message ? message.status : ''}</label>
        </Form.Group>

        <Form.Group as={Col} className='mb-3' xl={12}>
          <Form.Label className='mb-0 fw-bold'>Detalhamento</Form.Label>
          <Form.Control as='textarea' value={formData.detalhamento || ''} 
              onChange={handleFieldChange}
              name='detalhamento'
          />
          <label className='text-danger'>{message ? message.detalhamento : ''}</label>
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

        <Form.Group className={`mb-0 text-center fixed-footer ${theme === 'light' ? 'bg-white' : 'bg-dark'}`}>
          <Button className="w-50" type="submit" disabled={isLoading}>
            {isLoading ? <Spinner size='sm' className='p-0' style={{marginBottom:'-4px'}}/> : 'Registrar'}
          </Button>
        </Form.Group>
    </Form>
    );
};
  
export default FormAcomp;
  


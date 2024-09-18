import React, { useEffect, useState} from 'react';
import AsyncSelect from 'react-select/async';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Button, Form, Col, FormGroup, Spinner} from 'react-bootstrap';
import customStyles, {customStylesDark} from '../../../components/Custom/SelectStyles';
import { useAppContext } from '../../../Main';
import { SelectSearchOptions, sendData } from '../../../helpers/Data';
import ServicoEtapa from './ServicoEtapa';
import { useDropzone } from 'react-dropzone';
import { faCloudArrowUp } from '@fortawesome/free-solid-svg-icons';
import Flex from '../../../components/common/Flex';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { RedirectToLogin } from '../../../Routes/PrivateRoute';

export const FormCreateEtapa = ({ servico, submit}) => {
  const [formData, setFormData] = useState({})
  const handleSubmit = async e => {
    e.preventDefault()
    submit(formData.nome)
    setFormData({})
  }
  return (
    <div className='row gx-2 mt-2'>            
      <Form.Group as={Col} xl={7} sm={7} className='mb-1'>
        <Form.Control
          type='text' placeholder='Nome Etapa Extra'
          value={formData.nome || ''}
          onChange={(e) => setFormData({...formData, nome:e.target.value})}
          name={`nome`}
        />
      </Form.Group>
      <Form.Group as={Col} xl='auto' sm='auto' className='mb-1'>
        <Button className='py-1' type='submit' variant='success' onClick={handleSubmit}>Criar Etapa Extra</Button> 
      </Form.Group>
    </div>
  )
}

const ContratoForm = ({ hasLabel, type, submit, prospect, produto}) => {
  const {config: {theme}} = useAppContext();
  const user = JSON.parse(localStorage.getItem('user'))
  const [formData, setFormData] = useState({
    created_by: user.id, prospect: prospect ? prospect.id : ''
  });
  const [message, setMessage] = useState()
  const navigate = useNavigate();
  const [selectedServices, setSelectedServices] = useState([]);
  const [isDragActive, setIsDragActive] = useState();
  const [isLoading, setIsLoading] = useState(false);

  const { getRootProps, getInputProps } = useDropzone({
    multiple: true,
    onDrop: (acceptedFiles) => {
      setFormData({ ...formData, file: acceptedFiles });
    },
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false),
    onDropAccepted: () => setIsDragActive(false),
    onDropRejected: () => setIsDragActive(false),
  });

  const handleApi = async (dadosform) => {
    const endpoint = produto === 'GC' ? 'contratos-credito' : 'contratos-ambiental'
    const {resposta, dados} = await sendData({type:type, url:`finances/${endpoint}`, keyfield:null, dadosform:dadosform, is_json:false})
    if(resposta.status === 400){
      setMessage({...dados})
      if (dados.non_fields_errors){
        toast.error(dados.non_fields_errors, {autoClose:4000})
      }
      if (dados.percentual){
        toast.error(dados.percentual[0], {autoClose:4000})
      }
    }
    else if (resposta.status === 401){
      RedirectToLogin(navigate)
    }
    else if (resposta.status === 201 || resposta.status === 200){
      submit('add', {...dados, str_contratante:dados.info_contratante.label,
        str_servicos:dados.list_servicos.map(s => s.label).join(', '), status:{'text': 'Em Andamento', 'color': 'warning'}, 
      })
      toast.success("Registro Efetuado com Sucesso!")
    }
    setIsLoading(false)
  };

  const handleSubmit = async e => {
    setIsLoading(true)
    setMessage(null)
    e.preventDefault();
    const formDataToSend = new FormData();
    for (const key in formData) {
      if (key === 'servicos_etapas') {
        let valor_total = 0
        formData[key].forEach(value => {
          const filtered = {...value, dados:value.dados.filter(v => v.percentual !== '')}
          valor_total+= Number(filtered.valor)
          formDataToSend.append(`${key}`, JSON.stringify(filtered));
        });
        formDataToSend.append('valor', valor_total)
      } 
      else {
        if (Array.isArray(formData[key])) {
          formData[key].forEach(value => {
            formDataToSend.append(key, value);
          });
        }
        else{
          formDataToSend.append(key, formData[key]);
        }
      }
    }
    await handleApi(formDataToSend);
  };

  const handleFieldChange = e => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <>
      <Form onSubmit={handleSubmit} className='row' encType='multipart/form-data'>
        <Form.Group className="mb-2" as={Col} xl={12}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Contratante*</Form.Label>}
          <AsyncSelect loadOptions={(value) => SelectSearchOptions(value, 'register/pessoal', 'razao_social', 'cpf_cnpj')} 
            name='contratante' styles={theme === 'light'? customStyles : customStylesDark} classNamePrefix="select"
            onChange={(selected) => {
            setFormData((prevFormData) => ({
              ...prevFormData,
              contratante: selected.value
              }));
            }}>
          </AsyncSelect>
          <label className='text-danger'>{message ? message.contratante : ''}</label>
        </Form.Group> 

        <Form.Group className="mb-2" as={Col} xl={12}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Serviço(s) Contratado(s)*</Form.Label>}
          <AsyncSelect 
            loadOptions={(value) => SelectSearchOptions(value, 'register/detalhamentos', 'detalhamento_servico', null, 
              false, `produto=${produto || 'GAI'}`, navigate)} 
            isMulti
            name='servicos' styles={theme === 'light'? customStyles : customStylesDark} classNamePrefix="select"
            onChange={(selected) => {
              setFormData((prevFormData) => ({
                ...prevFormData,
                servicos: selected.map(s => s.value)
                }));
              setSelectedServices(selected)
            }}>
          </AsyncSelect>
          <label className='text-danger'>{message ? message.servicos : ''}</label>
        </Form.Group> 

        <Form.Group>
          <ServicoEtapa servicos={selectedServices}
            change={(data) => setFormData({...formData, servicos_etapas:data})}
          />
        </Form.Group>

        <Form.Group className="mb-2" as={Col} xl={12}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Data Assinatura*</Form.Label>}
          <Form.Control
            value={formData.data_assinatura || ''}
            name="data_assinatura"
            onChange={handleFieldChange}
            type="date"
          />
          <label className='text-danger'>{message ? message.data_assinatura : ''}</label>
        </Form.Group>

        {produto === 'GC' && 
          <Form.Group className="mb-2" as={Col} xl={12}>
            {hasLabel && <Form.Label className='fw-bold mb-1'>Data Vencimento*</Form.Label>}
            <Form.Control
              value={formData.data_vencimento || ''}
              name="data_vencimento"
              onChange={handleFieldChange}
              type="date"
            />
            <label className='text-danger'>{message ? message.data_vencimento : ''}</label>
          </Form.Group>
        }

        <Form.Group className="mb-2" as={Col} xl={12}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Detalhes Negociação</Form.Label>}
          <Form.Control
            as='textarea' rows={5}
            value={formData.detalhes || ''}
            name="detalhes"
            onChange={handleFieldChange}
            type="text"
          />
          <label className='text-danger'>{message ? message.detalhes : ''}</label>
        </Form.Group>

        <label className='fw-bold mb-0'>Anexos</label>
        <Form.Group as={Col} xl={12} className='mb-3'>
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
            {isLoading ? <Spinner size='sm' className='p-0' style={{marginBottom:'-4px'}}/>: 'Cadastrar Contrato'}
          </Button>
        </Form.Group>     
      </Form>
    </>
  );
};

export default ContratoForm;

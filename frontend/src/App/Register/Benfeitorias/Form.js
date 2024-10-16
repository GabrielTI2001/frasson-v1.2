import React, { useEffect, useState} from 'react';
import AsyncSelect from 'react-select/async';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Button, Form, Col, Spinner} from 'react-bootstrap';
import customStyles, {customStylesDark} from '../../../components/Custom/SelectStyles';
import { useAppContext } from '../../../Main';
import { SelectOptions, SelectSearchOptions, sendData } from '../../../helpers/Data';
import { useDropzone } from 'react-dropzone';
import { faCloudArrowUp } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Flex from '../../../components/common/Flex';
import { RedirectToLogin } from '../../../Routes/PrivateRoute';

const BenfeitoriaForm = ({ hasLabel, type, submit, data}) => {
  const {config: {theme}} = useAppContext();
  const user = JSON.parse(localStorage.getItem('user'))
  const [formData, setFormData] = useState({
    created_by: user.id
  });
  const [message, setMessage] = useState()
  const navigate = useNavigate();
  const [defaultoptions, setDefaultOptions] = useState()
  const [tipos, setTipos] = useState()
  const [isLoading, setIsLoading] = useState(false);

  const handleApi = async (dadosform) => {
    const {resposta, dados} = await sendData({type:type, url:'register/farm-assets', keyfield:null, dadosform:dadosform, is_json:false})
    if(resposta.status === 400){
      setMessage({...dados})
    }
    else if (resposta.status === 401){
      RedirectToLogin(navigate)
    }
    else if (resposta.status === 201 || resposta.status === 200){
      submit('add', dados)
      toast.success("Registro Efetuado com Sucesso!")
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
        // Percorrer a lista de arquivos enviados
        for (let i = 0; i < formData[key].length; i++) {
          formDataToSend.append('file', formData[key][i]);
        }
      } else {
        formDataToSend.append(key, formData[key]);
      }
    }
    await handleApi(formDataToSend);
  };

  const handleImageChange = (e) => {
    setFormData({...formData, [e.target.name]:e.target.files})
  };

  const handleFieldChange = e => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  useEffect(()=>{
    const loadFormData = async () => {
      if(!tipos){
        const types = await SelectOptions('register/types-farm-assets', 'description');
        setTipos(types)
      }
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
      <Form onSubmit={handleSubmit} className='row row-cols-1' encType='multipart/form-data'>
        {defaultoptions && (
          <Form.Group className="mb-2" as={Col}>
            {hasLabel && <Form.Label className='fw-bold mb-1'>Fazenda*</Form.Label>}
            <AsyncSelect loadOptions={(v) => SelectSearchOptions(v, 'farms/farms', 'nome', 'matricula') } name='farm' styles={theme === 'light'? customStyles : customStylesDark} classNamePrefix="select"
              defaultValue={ type === 'edit' ? (defaultoptions ? defaultoptions.farm : null) : null }
              onChange={(selected) => {
              setFormData((prevFormData) => ({
                ...prevFormData,
                farm: selected.value
                }));
              }}>
            </AsyncSelect>
            <label className='text-danger'>{message ? message.farm : ''}</label>
          </Form.Group>        
        )}

        <Form.Group className="mb-2" as={Col}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Tipo de Benfeitoria*</Form.Label>}
          <Form.Select
            placeholder={!hasLabel ? 'Tipo de Benfeitoria' : ''}
            value={formData.type || ''}
            name="type"
            onChange={handleFieldChange}
            type="select"
          >
            <option value={undefined}>----</option>
            {tipos &&( tipos.map( c =>(
              <option key={c.value} value={c.value}>{c.label}</option>
            )))}
          </Form.Select>
          <label className='text-danger'>{message ? message.type : ''}</label>
        </Form.Group>

        <Form.Group className="mb-2" as={Col}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Data Construção*</Form.Label>}
          <Form.Control
            placeholder={!hasLabel ? 'Data Construção' : ''}
            value={formData.data_construcao || ''}
            name="data_construcao"
            onChange={handleFieldChange}
            type="date"
          />
          <label className='text-danger'>{message ? message.data_construcao : ''}</label>
        </Form.Group>

        <Form.Group className="mb-2" as={Col}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Tamanho (m<sup>2</sup>)*</Form.Label>}
          <Form.Control
            placeholder={!hasLabel ? 'Tamanho' : ''}
            value={formData.tamanho || ''}
            name="tamanho"
            onChange={handleFieldChange}
            type="number"
          />
          <label className='text-danger'>{message ? message.tamanho : ''}</label>
        </Form.Group>

        <Form.Group className="mb-2" as={Col}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Valor Estimado (R$)*</Form.Label>}
          <Form.Control
            placeholder={!hasLabel ? 'Valor Estimado' : ''}
            value={formData.valor_estimado || ''}
            name="valor_estimado"
            onChange={handleFieldChange}
            type="number"
          />
          <label className='text-danger'>{message ? message.valor_estimado : ''}</label>
        </Form.Group>

        {type === 'add' && <Form.Group className="mb-2" as={Col}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Fotos*</Form.Label>}
          <Form.Control
            name="file"
            onChange={handleImageChange}
            type="file"
            multiple={true}
          />
          <label className='text-danger'>{message ? message.file : ''}</label>
        </Form.Group>}
        
        <Form.Group className={`mb-0 text-center fixed-footer ${theme === 'light' ? 'bg-white' : 'bg-dark'}`}>
          <Button className="w-50" type="submit" disabled={isLoading}>
              {isLoading ? <Spinner size='sm' className='p-0' style={{marginBottom:'-4px'}}/> : 'Cadastrar Benfeitoria'}
          </Button>
        </Form.Group>            
      </Form>
    </>
  );
};

export const ImgForm = ({submit}) =>{
  const [newimg, setNewImg] = useState({})
  const [isDragActive, setIsDragActive] = useState();
  const { getRootProps: getRootProps, getInputProps: getInputProps } = useDropzone({
    multiple: true,
    onDrop: (acceptedFiles) => {
      setNewImg({file: acceptedFiles });
    },
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false),
    onDropAccepted: () => setIsDragActive(false),
    onDropRejected: () => setIsDragActive(false),
  });

  return (<>
    <h3 className="fs-0 fw-bold">Adicionar Fotos</h3>
    <Form onSubmit={(e) => {submit(e, newimg); setNewImg({})}}>
        <div {...getRootProps({className: `dropzone-area py-2 container container-fluid ${isDragActive ? 'dropzone-active' : ''}`})}>
          <input {...getInputProps()} />
            <Flex justifyContent="center" alignItems="center">
              <span className='text-midle'><FontAwesomeIcon icon={faCloudArrowUp} className='mt-1 fs-2 text-warning' /></span>
              <p className="fs-9 mb-0 text-700 ms-2">
                {!newimg.file ? 'Arraste os arquivos aqui' : newimg.file.length+' Arquivo(s) Selecionado(s)'}
              </p>
            </Flex>
        </div>
        <Form.Group className='mt-2'>
            <Button type="submit">Enviar</Button>
        </Form.Group>
    </Form>
  </>)
}

export default BenfeitoriaForm;

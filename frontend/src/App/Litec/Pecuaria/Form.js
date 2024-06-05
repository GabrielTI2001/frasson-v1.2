import React, { useEffect, useState } from 'react';
import AsyncSelect from 'react-select/async';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Button, Form, Col, Row} from 'react-bootstrap';
import customStyles, {customStylesDark} from '../../../components/Custom/SelectStyles';
import { useAppContext } from '../../../Main';
import { SelectSearchOptions } from '../../../helpers/Data';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilePdf, faTrash } from '@fortawesome/free-solid-svg-icons';
import ModalDelete from '../../../components/Custom/ModalDelete';

const FormProdPecuaria = ({ hasLabel, data, type, submit}) => {
  const {config: {theme}} = useAppContext();
  const user = JSON.parse(localStorage.getItem('user'))
  const navigate = useNavigate();
  const {id} = useParams()
  const [formData, setFormData] = useState({user: user.id, gleba:id, ano:2022, tipo_producao:'P'});
  const [message, setMessage] = useState()
  const [anos, setAnos] = useState([])
  const token = localStorage.getItem("token")
  const [defaultoptions, setDefaultOptions] = useState()
  const [modal, setModal] = useState({show:false})

  const handleApi = async (dadosform) => {
    const link = `${process.env.REACT_APP_API_URL}/litec/pecuaria/${type === 'edit' ? data.id+'/' : ''}`
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
            toast.success("Registro Atualizado com Sucesso!")
            submit('edit', data)
          }
          else{
            toast.success("Registro Efetuado com Sucesso!")
            submit('add', data)
          }
        }
    } catch (error) {
        console.error('Erro:', error);
    }
  };

  const handleSubmit = e => {
    setMessage(null)
    e.preventDefault();
    const formDataToSend = new FormData();
    for (const key in formData) {
      formDataToSend.append(key, formData[key]);
    }  
    handleApi(formDataToSend);
  };

  const handleFieldChange = e => {
    const { name, value } = e.target;
      setFormData(prevState => ({
        ...prevState,
        [name]: value
    }));
  };

  const handleFileChange = (e) => {
    setFormData({...formData, [e.target.name]:e.target.files[0]})
  };

  useEffect(()=>{
    const loadFormData = async () => {
      const filteredData = Object.entries(data)
        .filter(([key, value]) => value !== null)
        .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

      const {str_sistema_producao, str_unidade_producao, str_produto_principal, file, ...rest} = filteredData;
      setFormData({...formData, ...rest})
      setDefaultOptions({
        sistema_producao:{value:data.sistema_producao, label:str_sistema_producao}, 
        unidade_producao:{value:data.unidade_producao, label:str_unidade_producao},
        produto_principal:{value:data.produto_principal, label:str_produto_principal}
      })
    }
    const currentYear = new Date().getFullYear();
    const newChoices = [];
    for (let ano = 2022; ano <= currentYear+1; ano++) {
        newChoices.push({ value: ano, label: ano });
    }
    setAnos(newChoices);

    if (type === 'edit' && (!defaultoptions)){
      loadFormData()
    }
    else{
      if(!defaultoptions){
        setDefaultOptions({})
      }
    }

  },[])

  return (
    <>
      <Form onSubmit={handleSubmit} className='row sectionform'> 
        {defaultoptions && (
          <Form.Group className="mb-2" as={Col} xl={3} sm={6}>
            {hasLabel && <Form.Label className='fw-bold mb-1'>Sistema de Produção*</Form.Label>}
            <AsyncSelect loadOptions={(v) => SelectSearchOptions(v, 'litec/sistema-producao', 'description')} name='sistema_producao' 
              styles={theme === 'light'? customStyles : customStylesDark} classNamePrefix="select"
              defaultValue={type === 'edit' ? (defaultoptions ? defaultoptions.sistema_producao : '') : '' }
              onChange={(selected) => {
                setFormData((prevFormData) => ({
                  ...prevFormData,
                  sistema_producao: selected.value
                }));
              }} />
            <label className='text-danger'>{message ? message.sistema_producao : ''}</label>
          </Form.Group>
        )}

        {defaultoptions && (
          <Form.Group className="mb-2" as={Col} xl={3} sm={6}>
            {hasLabel && <Form.Label className='fw-bold mb-1'>Unidade de Produção*</Form.Label>}
            <AsyncSelect loadOptions={(v) => SelectSearchOptions(v, 'litec/unidade-producao', 'description')} name='unidade_producao' 
              styles={theme === 'light'? customStyles : customStylesDark} classNamePrefix="select"
              defaultValue={type === 'edit' ? (defaultoptions ? defaultoptions.unidade_producao : '') : '' }
              onChange={(selected) => {
                setFormData((prevFormData) => ({
                  ...prevFormData,
                  unidade_producao: selected.value
                }));
              }} />
            <label className='text-danger'>{message ? message.unidade_producao : ''}</label>
          </Form.Group>
        )}

        {defaultoptions && (
          <Form.Group className="mb-2" as={Col} xl={3} sm={6}>
            {hasLabel && <Form.Label className='fw-bold mb-1'>Produto Principal*</Form.Label>}
            <AsyncSelect loadOptions={(v) => SelectSearchOptions(v, 'litec/produto-principal', 'description')} name='produto_principal' 
              styles={theme === 'light'? customStyles : customStylesDark} classNamePrefix="select"
              defaultValue={type === 'edit' ? (defaultoptions ? defaultoptions.produto_principal : '') : '' }
              onChange={(selected) => {
                setFormData((prevFormData) => ({
                  ...prevFormData,
                  produto_principal: selected.value
                }));
              }} />
            <label className='text-danger'>{message ? message.produto_principal : ''}</label>
          </Form.Group>
        )}

        <Form.Group className="mb-2" as={Col} xl={3} sm={6}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Ano*</Form.Label>}
          <Form.Select
            value={formData.ano || ''}
            name="ano"
            onChange={handleFieldChange}
            type="text"
          >
            {anos.map(s => 
              <option key={s.value} value={s.value}>{s.label}</option>
            )}
          </Form.Select>
          <label className='text-danger'>{message ? message.ano : ''}</label>
        </Form.Group>

        <Form.Group className="mb-2" as={Col} xl={3} sm={6}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Tipo de Produção*</Form.Label>}
          <Form.Select
            value={formData.tipo_producao || ''}
            name="tipo_producao"
            onChange={handleFieldChange}
          >
            <option value='P'>Prevista</option>
            <option value='O'>Obtida</option>
          </Form.Select>
          <label className='text-danger'>{message ? message.tipo_producao : ''}</label>
        </Form.Group>

        <Form.Group className="mb-2" as={Col} xl={3} sm={6}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Quantidade (Unid. Prod)*</Form.Label>}
          <Form.Control
            value={formData.quantidade || ''}
            name="quantidade"
            onChange={handleFieldChange}
            type='number'
          />
          <label className='text-danger'>{message ? message.quantidade : ''}</label>
        </Form.Group>

        <Form.Group className="mb-2" as={Col} xl={6} sm={12}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Produtos Secundários</Form.Label>}
          <Form.Control
            value={formData.produtos_secundarios || ''}
            name="produtos_secundarios"
            onChange={handleFieldChange}
            as='textarea'
          />
          <label className='text-danger'>{message ? message.produtos_secundarios : ''}</label>
        </Form.Group>

        <Form.Group className="mb-2" as={Col} xl={6} sm={12}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Observações</Form.Label>}
          <Form.Control
            value={formData.observacoes || ''}
            name="observacoes"
            onChange={handleFieldChange}
            as='textarea'
          />
          <label className='text-danger'>{message ? message.observacoes : ''}</label>
        </Form.Group>

        <Form.Group className="mb-2" as={Col} xl={6} sm={12}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Arquivo PDF</Form.Label>}
          <Form.Control
            name="file"
            onChange={handleFileChange}
            type='file'
          />
          <label className='text-danger'>{message ? message.file : ''}</label>
        </Form.Group>

        <Form.Group className={`mb-1 ${type === 'edit' ? 'text-start' : 'text-end'}`} as={Col} xl='auto' xs='auto' sm='auto'>
          <Button className="w-40" type="submit">
            {type === 'edit' ? "Atualizar Produção" : "Cadastrar Produção"}
          </Button>
        </Form.Group>     

        {type === 'edit' &&
          <Form.Group className={`mb-0 ${type === 'edit' ? 'text-start' : 'text-end'}`} as={Col} xl='auto' xs='auto' sm='auto'>
            <Button className="w-40 btn-danger" onClick={() => setModal({show:true, id:data.id})}>
              <FontAwesomeIcon icon={faTrash} className="me-2"></FontAwesomeIcon>Excluir
            </Button>
          </Form.Group> 
        }  
        {type === 'edit' && data.file &&
          <Form.Group className="mb-2" as={Col} lg={3}>
          <div className='mt-2'>     
              <Link to={`${data.file}`} target="__blank" className="px-0 fw-bold text-danger">
                <FontAwesomeIcon icon={faFilePdf} className="me-2"></FontAwesomeIcon>Visualizar PDF
              </Link>
          </div>
        </Form.Group>}      
      </Form>
      {type ===  'edit' &&
        <ModalDelete show={modal.show} link={`${process.env.REACT_APP_API_URL}/litec/pecuaria/${data.id}/`} close={() => setModal({show:false})} 
          update={submit} 
        />
      }
    </>
  );
};

export default FormProdPecuaria;

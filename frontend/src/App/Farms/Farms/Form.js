import React, { useEffect, useState} from 'react';
import AsyncSelect from 'react-select/async';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Button, Form, Col} from 'react-bootstrap';
import customStyles, {customStylesDark} from '../../../components/Custom/SelectStyles';
import { useAppContext } from '../../../Main';
import { SelectSearchOptions } from '../../../helpers/Data';

const FarmForm = ({ hasLabel, type, submit, data}) => {
  const {config: {theme}} = useAppContext();
  const user = JSON.parse(localStorage.getItem('user'))
  const [formData, setFormData] = useState({
    created_by: user.id
  });
  const [message, setMessage] = useState()
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [defaultoptions, setDefaultOptions] = useState();
  const [categorias, setCategorias] = useState([]);

  const handleApi = async (dadosform) => {
    const link = `${process.env.REACT_APP_API_URL}/farms/farms/${type === 'edit' ? data.uuid+'/':''}`
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
          submit('edit', data, data.id)
          toast.success("Registro Atualizado com Sucesso!")
        }
        else{
          submit('add', {matricula:data.matricula, uuid:data.uuid, municipio_localizacao:data.municipio_localizacao, nome:data.nome,
            str_proprietarios:data.str_proprietarios.map(p => p.razao_social).join(', '), area_total:data.area_total
          })
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
      if (Array.isArray(formData[key])) {
        formData[key].forEach(value => {
          formDataToSend.append(key, value);
        });
      } else {
        formDataToSend.append(key, formData[key]);
      }
    }

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
      if (type === 'edit'){
        if(data && Object.keys(data)){
          //Pega os atributos não nulos de data
          const filteredData = Object.entries(data)
            .filter(([key, value]) => value !== null)
            .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
          
          const { kml, str_proprietarios, municipio_localizacao, str_cartorio, ...restData } = filteredData;
          setFormData({...formData, ...restData})
          setDefaultOptions({proprietarios:str_proprietarios.map(p => ({value:p.id, label:p.razao_social})), 
            cartorio:str_cartorio ? {value:data.cartorio_registro, label:str_cartorio}:null, municipio:{value:data.municipio, label:municipio_localizacao}
          })
        }
      }
    }

    if (type === 'edit' && (!defaultoptions || !data)){
      loadFormData()
    }
    else{
      if(!defaultoptions){
        loadFormData()
        setDefaultOptions({municipio:{}, grupo:{}})
      }
    }

  },[])

  return (
    <>
      <Form onSubmit={handleSubmit} className='row' encType='multipart/form-data'>
        <Form.Group className="mb-2" as={Col} xl={4} sm={6}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Localização da Reserva Legal*</Form.Label>}
          <Form.Select
            value={formData.localizacao_reserva || ''}
            name="localizacao_reserva"
            onChange={handleFieldChange}
          >
            <option value='AM'>Mesma Matrícula</option>
            <option value='AE'>Área Externa</option>
            <option value='AP'>Área Externa Parcial</option>
          </Form.Select>
          <label className='text-danger'>{message ? message.localizacao_reserva : ''}</label>
        </Form.Group>

        <Form.Group className="mb-2" as={Col} xl={4} sm={6}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Nome*</Form.Label>}
          <Form.Control
            value={formData.nome || ''}
            name="nome"
            onChange={handleFieldChange}
            type="text"
          />
          <label className='text-danger'>{message ? message.nome : ''}</label>
        </Form.Group>

        <Form.Group className="mb-2" as={Col} xl={4} sm={6}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Matrícula*</Form.Label>}
          <Form.Control
            value={formData.matricula || ''}
            name="matricula"
            onChange={handleFieldChange}
            type="text"
          />
          <label className='text-danger'>{message ? message.matricula : ''}</label>
        </Form.Group>

        {defaultoptions && 
          <Form.Group className="mb-2" as={Col} xl={4} sm={6}>
            {hasLabel && <Form.Label className='fw-bold mb-1'>Município*</Form.Label>}
            <AsyncSelect loadOptions={(value) => SelectSearchOptions(value, 'register/municipios', 'nome_municipio', 'sigla_uf')} 
              name='municipio' styles={theme === 'light'? customStyles : customStylesDark} classNamePrefix="select"
              defaultValue={ type === 'edit' ? (defaultoptions ? defaultoptions.municipio :'') : ''}
              onChange={(selected) => {
              setFormData((prevFormData) => ({
                ...prevFormData,
                municipio: selected.value
                }));
              }}>
            </AsyncSelect>
            <label className='text-danger'>{message ? message.municipio : ''}</label>
          </Form.Group> 
        }       

        {defaultoptions && 
          <Form.Group className="mb-2" as={Col} xl={4} sm={6}>
            {hasLabel && <Form.Label className='fw-bold mb-1'>Cartório Registro</Form.Label>}
            <AsyncSelect loadOptions={(value) => SelectSearchOptions(value, 'register/cartorios', 'razao_social')} 
              name='cartorio_registro' styles={theme === 'light'? customStyles : customStylesDark} classNamePrefix="select"
              defaultValue={ type === 'edit' ? (defaultoptions ? defaultoptions.cartorio : '') : ''}
              onChange={(selected) => {
              setFormData((prevFormData) => ({
                ...prevFormData,
                cartorio_registro: selected.value
                }));
              }}>
            </AsyncSelect>
            <label className='text-danger'>{message ? message.cartorio_registro : ''}</label>
          </Form.Group> 
        }  

        {defaultoptions && 
          <Form.Group className="mb-2" as={Col} xl={4} sm={6}>
            {hasLabel && <Form.Label className='fw-bold mb-1'>Proprietário(s)*</Form.Label>}
            <AsyncSelect loadOptions={(value) => SelectSearchOptions(value, 'register/pessoal', 'razao_social')} isMulti
              name='proprietarios' styles={theme === 'light'? customStyles : customStylesDark} classNamePrefix="select"
              defaultValue={ type === 'edit' ? (defaultoptions ? defaultoptions.proprietarios : '') : ''}
              onChange={(selected) => {
              setFormData((prevFormData) => ({
                ...prevFormData,
                proprietarios: selected.map(s => s.value)
                }));
              }}>
            </AsyncSelect>
            <label className='text-danger'>{message ? message.proprietarios : ''}</label>
          </Form.Group> 
        }  

        <Form.Group className="mb-2" as={Col} xl={4} sm={6}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Livro Registro</Form.Label>}
          <Form.Control
            value={formData.livro_registro || ''}
            name="livro_registro"
            onChange={handleFieldChange}
            type="text"
          />
          <label className='text-danger'>{message ? message.livro_registro : ''}</label>
        </Form.Group>

        <Form.Group className="mb-2" as={Col} xl={4} sm={6}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Número Registro</Form.Label>}
          <Form.Control
            value={formData.numero_registro || ''}
            name="numero_registro"
            onChange={handleFieldChange}
            type="text"
          />
          <label className='text-danger'>{message ? message.numero_registro : ''}</label>
        </Form.Group>

        <Form.Group className="mb-2" as={Col} xl={4} sm={6}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>CNS</Form.Label>}
          <Form.Control
            value={formData.cns || ''}
            name="cns"
            onChange={handleFieldChange}
            type="text"
          />
          <label className='text-danger'>{message ? message.cns : ''}</label>
        </Form.Group>

        <Form.Group className="mb-2" as={Col} xl={3} sm={6}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Data Registro</Form.Label>}
          <Form.Control
            value={formData.data_registro || ''}
            name="data_registro"
            onChange={handleFieldChange}
            type="date"
          />
          <label className='text-danger'>{message ? message.data_registro : ''}</label>
        </Form.Group>

        <Form.Group className="mb-2" as={Col} xl={3} sm={6}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>CEP</Form.Label>}
          <Form.Control
            value={formData.cep || ''}
            name="cep"
            onChange={handleFieldChange}
            type="text"
          />
          <label className='text-danger'>{message ? message.cep : ''}</label>
        </Form.Group>

        <Form.Group className="mb-2" as={Col} xl={6}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Endereco*</Form.Label>}
          <Form.Control
            value={formData.endereco || ''}
            name="endereco"
            onChange={handleFieldChange}
            type="text"
          />
          <label className='text-danger'>{message ? message.endereco : ''}</label>
        </Form.Group>

        <Form.Group className="mb-2" as={Col} xl={4} sm={6}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Título de Posse</Form.Label>}
          <Form.Control
            value={formData.titulo_posse || ''}
            name="titulo_posse"
            onChange={handleFieldChange}
            type="text"
          />
          <label className='text-danger'>{message ? message.titulo_posse : ''}</label>
        </Form.Group>

        <Form.Group className="mb-2" as={Col} xl={4} sm={6}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>N° NIRF</Form.Label>}
          <Form.Control
            value={formData.numero_nirf || ''}
            name="numero_nirf"
            onChange={handleFieldChange}
            type="text"
          />
          <label className='text-danger'>{message ? message.numero_nirf : ''}</label>
        </Form.Group>

        <Form.Group className="mb-2" as={Col} xl={4} sm={6}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Código Imóvel</Form.Label>}
          <Form.Control
            value={formData.codigo_imovel || ''}
            name="codigo_imovel"
            onChange={handleFieldChange}
            type="text"
          />
          <label className='text-danger'>{message ? message.codigo_imovel : ''}</label>
        </Form.Group>

        <Form.Group className="mb-2" as={Col} xl={4} sm={6}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Código CAR</Form.Label>}
          <Form.Control
            value={formData.codigo_car || ''}
            name="codigo_car"
            onChange={handleFieldChange}
            type="text"
          />
          <label className='text-danger'>{message ? message.codigo_car : ''}</label>
        </Form.Group>

        <Form.Group className="mb-2" as={Col} xl={3} sm={6}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Área Total (ha)</Form.Label>}
          <Form.Control
            value={formData.area_total || ''}
            name="area_total"
            onChange={handleFieldChange}
            type="number"
          />
          <label className='text-danger'>{message ? message.area_total : ''}</label>
        </Form.Group>

        <Form.Group className="mb-2" as={Col} xl={3} sm={6}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Área Explorada (ha)</Form.Label>}
          <Form.Control
            value={formData.area_explorada || ''}
            name="area_explorada"
            onChange={handleFieldChange}
            type="number"
          />
          <label className='text-danger'>{message ? message.area_explorada : ''}</label>
        </Form.Group>

        <Form.Group className="mb-2" as={Col} xl={3} sm={6}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Módulos Fiscais</Form.Label>}
          <Form.Control
            value={formData.modulos_fiscais || ''}
            name="modulos_fiscais"
            onChange={handleFieldChange}
            type="number"
          />
          <label className='text-danger'>{message ? message.modulos_fiscais : ''}</label>
        </Form.Group>

        <Form.Group className="mb-2" as={Col} xl={3} sm={6}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Área Reserva (ha)</Form.Label>}
          <Form.Control
            value={formData.area_reserva || ''}
            name="area_reserva"
            onChange={handleFieldChange}
            type="number"
          />
          <label className='text-danger'>{message ? message.area_reserva : ''}</label>
        </Form.Group>

        <Form.Group className="mb-2" as={Col} xl={3} sm={6}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Área APP (ha)</Form.Label>}
          <Form.Control
            value={formData.area_app || ''}
            name="area_app"
            onChange={handleFieldChange}
            type="number"
          />
          <label className='text-danger'>{message ? message.area_app : ''}</label>
        </Form.Group>

        <Form.Group className="mb-2" as={Col} xl={3} sm={6}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Área Veg. Nativa (ha)</Form.Label>}
          <Form.Control
            value={formData.area_veg_nat || ''}
            name="area_veg_nat"
            onChange={handleFieldChange}
            type="number"
          />
          <label className='text-danger'>{message ? message.area_veg_nat : ''}</label>
        </Form.Group>

        <Form.Group className="mb-2" as={Col} xl={3} sm={6}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Área Explorada (ha)</Form.Label>}
          <Form.Control
            value={formData.area_explorada || ''}
            name="area_explorada"
            onChange={handleFieldChange}
            type="number"
          />
          <label className='text-danger'>{message ? message.area_explorada : ''}</label>
        </Form.Group>

        <Form.Group className="mb-2" as={Col} xl={12}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Roteiro de Acesso</Form.Label>}
          <Form.Control
            as='textarea'
            value={formData.codigo_car || ''}
            name="codigo_car"
            onChange={handleFieldChange}
            type="text"
          />
          <label className='text-danger'>{message ? message.codigo_car : ''}</label>
        </Form.Group>

        <Form.Group className="mb-2" as={Col} xl={3} sm={6}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>KML*</Form.Label>}
          <Form.Control
            name="kml"
            onChange={handleFileChange}
            type="file"
          />
          <label className='text-danger'>{message ? message.kml : ''}</label>
        </Form.Group>

        <Form.Group className={`mb-0 text-end`}>
          <Button
            className="w-40"
            type="submit"
            >
              {type === 'edit' ? "Atualizar Imóvel Rural" : "Cadastrar Imóvel Rural"}
          </Button>
        </Form.Group>    
      </Form>
    </>
  );
};

export default FarmForm;

import React, { useEffect, useState, useContext } from 'react';
import PropTypes from 'prop-types';
import AsyncSelect from 'react-select/async';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Button, Form, Col} from 'react-bootstrap';
import { FetchImoveisRurais, fetchPessoal} from '../Pipefy/Data';
import { fetchAgenciasBancarias, fetchProdutoAgricola, fetchTipoArmazenagem, fetchTipoClassificacao } from './Data';
import { fetchMunicipio } from '../Ambiental/Data';
import customStyles, {customStylesDark} from '../../components/Custom/SelectStyles';
import { useAppContext } from '../../Main';

const FormAlongamento = ({ hasLabel, data, type, submit}) => {
  const {config: {theme}} = useAppContext();
  const user = JSON.parse(localStorage.getItem('user'))
  const navigate = useNavigate();
  const [formData, setFormData] = useState({user: user.id});
  const [message, setMessage] = useState()
  const token = localStorage.getItem("token")
  const [defaultoptions, setDefaultOptions] = useState()
  const [agencias, setAgencias] = useState()
  const [produtos, setProdutos] = useState()
  const [tipoarmazenagens, setTipoarmazenagens] = useState()
  const [tipoclassificacoes, setTipoclassificacoes] = useState()

  const handleApi = async (dadosform) => {
    const link = `${process.env.REACT_APP_API_URL}/alongamentos/index/${type === 'edit' ? data.id+'/' : ''}`
    const method = type === 'edit' ? 'PUT' : 'POST'
    try {
        const response = await fetch(link, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(dadosform)
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
            submit(data)
          }
          else{
            toast.success("Registro Efetuado com Sucesso!")
            submit(data)
          }
        }
    } catch (error) {
        console.error('Erro:', error);
    }
  };

  const handleSubmit = e => {
    if (formData.data_validade === ''){
      setFormData({...formData, data_validade:undefined})
    }
    if (formData.data_publicacao === ''){
      setFormData({...formData, data_publicacao:undefined})
    }
    setMessage(null)
    e.preventDefault();
    handleApi(formData);
  };

  const handleFieldChange = e => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  useEffect(()=>{
    const loadFormData = async () => {
      const {info_operacao, ...rest} = data;
      setFormData({...formData, ...rest})
      setDefaultOptions({municipio:{value:data.municipio_propriedade, label: data.str_municipio}, 
        propriedade: data.str_propriedade, 
        testemunha01:{value:data.testemunha01, label:data.str_testemunha01}, 
        testemunha02:{value:data.testemunha02,label:data.str_testemunha02},
        fiel_depositario:{value:data.fiel_depositario,label:data.str_fiel_depositario},
      }); 
    
    }
    const buscar = async () =>{
      const data_agencias = await fetchAgenciasBancarias()
      setAgencias(data_agencias)
      const dado_produtos = await fetchProdutoAgricola()
      setProdutos(dado_produtos)
      const armazenagem = await fetchTipoArmazenagem()
      setTipoarmazenagens(armazenagem)
      const dados_c = await fetchTipoClassificacao()
      setTipoclassificacoes(dados_c)
    }
    buscar()
    if (type === 'edit' && (!defaultoptions)){
      loadFormData()
    }
    else{
      if(!defaultoptions){
        setDefaultOptions({propriedade:{}, finalidade:{}})
      }
    }

  },[])

  return (
    <>
      <Form onSubmit={handleSubmit} className='row sectionform'>
        <span className='fw-bold text-primary mb-1'>Cálculo Alongamento</span>
        <Form.Group className="mb-2" as={Col} lg={3}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Percentual de Garantia*</Form.Label>}
          <Form.Control
            value={formData.percentual || ''}
            name="percentual"
            onChange={handleFieldChange}
            type="number"
          />
          <label className='text-danger'>{message ? message.percentual : ''}</label>
        </Form.Group>

        <Form.Group className="mb-2" as={Col} lg={3}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Valor Unitário (R$/Kg)*</Form.Label>}
          <Form.Control
            value={formData.valor_unitario || ''}
            name="valor_unitario"
            onChange={handleFieldChange}
            type="number"
          />
          <label className='text-danger'>{message ? message.valor_unitario : ''}</label>
        </Form.Group>

        <Form.Group className="mb-2" as={Col} lg={3}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Valor Total Along. (R$)*</Form.Label>}
          <Form.Control
            value={formData.valor_total || ''}
            name="valor_total"
            onChange={handleFieldChange}
            type="number"
          />
          <label className='text-danger'>{message ? message.valor_total : ''}</label>
        </Form.Group>

        <Form.Group className="mb-2" as={Col} lg={3}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Qtd. Penhor (kg)*</Form.Label>}
          <Form.Control
            value={formData.quant_penhor_kg || ''}
            name="quant_penhor_kg"
            onChange={handleFieldChange}
            type="number"
          />
          <label className='text-danger'>{message ? message.quant_penhor_kg : ''}</label>
        </Form.Group>

        <Form.Group className="mb-2" as={Col} lg={3}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Qtd. Penhor (tons)*</Form.Label>}
          <Form.Control
            value={formData.quant_penhor_tons || ''}
            name="quant_penhor_tons"
            onChange={handleFieldChange}
            type="number"
          />
          <label className='text-danger'>{message ? message.quant_penhor_tons : ''}</label>
        </Form.Group>

        <Form.Group className="mb-2" as={Col} lg={3}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Qtd. Sacas (60 kg)*</Form.Label>}
          <Form.Control
            value={formData.quant_sacas_60_kg || ''}
            name="quant_sacas_60_kg"
            onChange={handleFieldChange}
            type="number"
          />
          <label className='text-danger'>{message ? message.quant_sacas_60_kg : ''}</label>
        </Form.Group>
        <hr style={{width:'96%'}} className='ms-3'></hr>

        <span className='fw-bold text-primary mb-1'>Outras Informações</span>
        <Form.Group className="mb-2" as={Col} lg={3}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Data Alongamento*</Form.Label>}
          <Form.Control
            value={formData.data || ''}
            name="data"
            onChange={handleFieldChange}
            type="date"
          />
          <label className='text-danger'>{message ? message.data : ''}</label>
        </Form.Group>

        <Form.Group className="mb-2" as={Col} lg={3}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Agência Bancária*</Form.Label>}
          <Form.Select
            value={formData.agencia_bancaria || ''}
            name="agencia_bancaria"
            onChange={handleFieldChange}
            type="select"
          >
            <option value={undefined}>----</option>
            {agencias &&( agencias.map( c =>(
              <option key={c.value} value={c.value}>{c.label}</option>
            )))}
          </Form.Select>
          <label className='text-danger'>{message ? message.agencia_bancaria : ''}</label>
        </Form.Group>

        {defaultoptions && (
        <Form.Group className="mb-2" as={Col} lg={3}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Município*</Form.Label>}
          <AsyncSelect loadOptions={fetchMunicipio} name='municipio_propriedade' styles={theme === 'light'? customStyles : customStylesDark} classNamePrefix="select"
            defaultValue={type === 'edit' ? (defaultoptions ? defaultoptions.municipio : null) : null }
            onChange={(selected) => {
              setFormData((prevFormData) => ({
                ...prevFormData,
                municipio_propriedade: selected.value
              }));
            }}>
          </AsyncSelect>
          <label className='text-danger'>{message ? message.municipio_propriedade : ''}</label>
        </Form.Group>
        )}

        {defaultoptions && (
        <Form.Group className="mb-2" as={Col} lg={3}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Fiel Depositário*</Form.Label>}
          <AsyncSelect loadOptions={fetchPessoal} name='fiel_depositario' styles={theme === 'light'? customStyles : customStylesDark} classNamePrefix="select"
            defaultValue={type === 'edit' ? (defaultoptions ? defaultoptions.fiel_depositario : null) : null }
            onChange={(selected) => {
              setFormData((prevFormData) => ({
                ...prevFormData,
                fiel_depositario: selected.value
              }));
            }}>
          </AsyncSelect>
          <label className='text-danger'>{message ? message.fiel_depositario : ''}</label>
        </Form.Group>
        )}

        <Form.Group className="mb-2" as={Col} lg={3}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Produto Agrícola*</Form.Label>}
          <Form.Select
            value={formData.produto_agricola || ''}
            name="produto_agricola"
            onChange={handleFieldChange}
            type="select"
          >
            <option value={undefined}>----</option>
            {produtos &&( produtos.map( c =>(
              <option key={c.value} value={c.value}>{c.label}</option>
            )))}
          </Form.Select>
          <label className='text-danger'>{message ? message.produto_agricola : ''}</label>
        </Form.Group>

        <Form.Group className="mb-2" as={Col} lg={3}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Tipo Armazenagem*</Form.Label>}
          <Form.Select
            value={formData.tipo_armazenagem || ''}
            name="tipo_armazenagem"
            onChange={handleFieldChange}
            type="select"
          >
            <option value={undefined}>----</option>
            {tipoarmazenagens &&( tipoarmazenagens.map( c =>(
              <option key={c.value} value={c.value}>{c.label}</option>
            )))}
          </Form.Select>
          <label className='text-danger'>{message ? message.tipo_armazenagem : ''}</label>
        </Form.Group>

        <Form.Group className="mb-2" as={Col} lg={3}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Capacidade Estática (scs 60 kg)*</Form.Label>}
          <Form.Control
            value={formData.capacidade_estatica_sacas_60_kg || ''}
            name="capacidade_estatica_sacas_60_kg"
            onChange={handleFieldChange}
            type="number"
          />
          <label className='text-danger'>{message ? message.capacidade_estatica_sacas_60_kg : ''}</label>
        </Form.Group>

        <Form.Group className="mb-2" as={Col} lg={3}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Tipo Classificação*</Form.Label>}
          <Form.Select
            value={formData.tipo_classificacao || ''}
            name="tipo_classificacao"
            onChange={handleFieldChange}
            type="select"
          >
            <option value={undefined}>----</option>
            {tipoclassificacoes &&( tipoclassificacoes.map( c =>(
              <option key={c.value} value={c.value}>{c.label}</option>
            )))}
          </Form.Select>
          <label className='text-danger'>{message ? message.tipo_classificacao : ''}</label>
        </Form.Group>

        {defaultoptions && (
        <Form.Group className="mb-2" as={Col} lg={3}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Testemunha 01*</Form.Label>}
          <AsyncSelect loadOptions={fetchPessoal} name='testemunha01' styles={theme === 'light'? customStyles : customStylesDark} classNamePrefix="select"
            defaultValue={type === 'edit' ? (defaultoptions ? defaultoptions.testemunha01 : null) : null }
            onChange={(selected) => {
              setFormData((prevFormData) => ({
                ...prevFormData,
                testemunha01: selected.value
              }));
            }}>
          </AsyncSelect>
          <label className='text-danger'>{message ? message.testemunha01 : ''}</label>
        </Form.Group>
        )}

        {defaultoptions && (
        <Form.Group className="mb-2" as={Col} lg={3}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Testemunha 02*</Form.Label>}
          <AsyncSelect loadOptions={fetchPessoal} name='testemunha02' styles={theme === 'light'? customStyles : customStylesDark} classNamePrefix="select"
            defaultValue={type === 'edit' ? (defaultoptions ? defaultoptions.testemunha02 : null) : null }
            onChange={(selected) => {
              setFormData((prevFormData) => ({
                ...prevFormData,
                testemunha02: selected.value
              }));
            }}>
          </AsyncSelect>
          <label className='text-danger'>{message ? message.testemunha02 : ''}</label>
        </Form.Group>
        )}

        {defaultoptions && (
        <Form.Group className="mb-2" as={Col} lg={3}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Fazenda*</Form.Label>}
          <AsyncSelect loadOptions={FetchImoveisRurais} name='propriedade' styles={theme === 'light'? customStyles : customStylesDark} classNamePrefix="select"
            defaultValue={type === 'edit' ? (defaultoptions ? defaultoptions.propriedade : null) : null } isMulti
            onChange={(selected) => {
              setFormData((prevFormData) => ({
                ...prevFormData,
                propriedade: selected.value
              }));
            }}>
          </AsyncSelect>
          <label className='text-danger'>{message ? message.propriedade : ''}</label>
        </Form.Group>
        )}

        <Form.Group className={`mb-0 ${type === 'edit' ? 'text-start' : 'text-end'}`}>
          <Button className="w-40" type="submit">
            {type === 'edit' ? "Atualizar Alongamento"
            : "Cadastrar Alongamento"}
          </Button>
        </Form.Group>           
      </Form>
    </>
  );
};

export default FormAlongamento;

import React, { useEffect, useState} from 'react';
import AsyncSelect from 'react-select/async';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Button, Form, Col} from 'react-bootstrap';
import customStyles, {customStylesDark} from '../../components/Custom/SelectStyles';
import { useAppContext } from '../../Main';
import { SelectSearchOptions } from '../../helpers/Data';

const OperacoesForm = ({ hasLabel, type, submit, data}) => {
  const {config: {theme}} = useAppContext();
  const user = JSON.parse(localStorage.getItem('user'))
  const [formData, setFormData] = useState({
    created_by: user.id
  });
  const [message, setMessage] = useState()
  const navigate = useNavigate();
  const token = localStorage.getItem("token")
  const {uuid} = useParams()
  const [defaultoptions, setDefaultOptions] = useState()

  const handleApi = async (dadosform) => {
    const link = `${process.env.REACT_APP_API_URL}/credit/operacoes-contratadas/${type === 'edit' ? uuid+'/':''}`
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
            submit('edit', data)
            toast.success("Registro Atualizado com Sucesso!")
          }
          else{
            submit('add', data)
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
      if (key === 'file') {
        // Percorrer a lista de arquivos enviados
        for (let i = 0; i < formData[key].length; i++) {
          formDataToSend.append('file', formData[key][i]);
        }
      } else {
        if (Array.isArray(formData[key])) {
          formData[key].forEach(value => {
            formDataToSend.append(key, value);
          });
        } else {
          formDataToSend.append(key, formData[key]);
        }
      }
    }
    await handleApi(formDataToSend);
  };

  const handleFileChange = (e) => {
    setFormData({...formData, [e.target.name]:e.target.files})
  };

  const handleKmlChange = (e) => {
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
      if(data){
        const filteredData = Object.entries(data)
        .filter(([key, value]) => value !== null)
        .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
        const {list_imoveis, coordenadas, str_item_financiado, str_beneficiario, str_instituicao, cedulas, ...rest} = filteredData;
        setFormData({...formData, ...rest})
        setDefaultOptions({imoveis_beneficiados:list_imoveis.map(i => ({value:i.id, label:i.nome})), 
          item_financiado:{value:data.item_financiado, label:str_item_financiado}, beneficiario:{value:data.beneficiario, label:str_beneficiario},
          instituicao:{value:data.instituicao, label:str_instituicao}
        }); 
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
      <Form onSubmit={handleSubmit} className='row' encType='multipart/form-data'>

        <Form.Group className="mb-2" as={Col} xl={3} sm={6}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Número da Operação*</Form.Label>}
          <Form.Control
            value={formData.numero_operacao || ''}
            name="numero_operacao"
            onChange={handleFieldChange}
            type="text"
          />
          <label className='text-danger'>{message ? message.numero_operacao : ''}</label>
        </Form.Group>

        {defaultoptions && (
          <Form.Group className="mb-2" as={Col} xl={4}>
            {hasLabel && <Form.Label className='fw-bold mb-1'>Item Financiado*</Form.Label>}
            <AsyncSelect loadOptions={(v) => SelectSearchOptions(v, 'credit/itens-financiados', 'item')} name='item_financiado' 
              styles={theme === 'light'? customStyles : customStylesDark} classNamePrefix="select"
              defaultValue={ type === 'edit' ? (defaultoptions ? defaultoptions.item_financiado : null) : null }
              onChange={(selected) => {
              setFormData((prevFormData) => ({
                ...prevFormData,
                item_financiado: selected.value
                }));
              }}>
            </AsyncSelect>
            <label className='text-danger'>{message ? message.item_financiado : ''}</label>
          </Form.Group>        
        )}

        {defaultoptions && (
          <Form.Group className="mb-2" as={Col} xl={4}>
            {hasLabel && <Form.Label className='fw-bold mb-1'>Beneficiário*</Form.Label>}
            <AsyncSelect loadOptions={(v) => SelectSearchOptions(v, 'register/pessoal', 'razao_social', 'cpf_cnpj')} name='beneficiario' 
              styles={theme === 'light'? customStyles : customStylesDark} classNamePrefix="select"
              defaultValue={ type === 'edit' ? (defaultoptions ? defaultoptions.beneficiario : null) : null }
              onChange={(selected) => {
              setFormData((prevFormData) => ({
                ...prevFormData,
                beneficiario: selected.value
                }));
              }}>
            </AsyncSelect>
            <label className='text-danger'>{message ? message.beneficiario : ''}</label>
          </Form.Group>        
        )}

        {defaultoptions && (
          <Form.Group className="mb-2" as={Col} xl={4}>
            {hasLabel && <Form.Label className='fw-bold mb-1'>Instituição*</Form.Label>}
            <AsyncSelect loadOptions={(v) => SelectSearchOptions(v, 'register/instituicoes', 'razao_social')} name='instituicao' 
              styles={theme === 'light'? customStyles : customStylesDark} classNamePrefix="select"
              defaultValue={ type === 'edit' ? (defaultoptions ? defaultoptions.instituicao : null) : null }
              onChange={(selected) => {
              setFormData((prevFormData) => ({
                ...prevFormData,
                instituicao: selected.value
                }));
              }}>
            </AsyncSelect>
            <label className='text-danger'>{message ? message.instituicao : ''}</label>
          </Form.Group>        
        )}

        <Form.Group className="mb-2" as={Col} xl={3} sm={6}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Valor da Operação (R$)*</Form.Label>}
          <Form.Control
            value={formData.valor_operacao || ''}
            name="valor_operacao"
            onChange={handleFieldChange}
            type="number"
          />
          <label className='text-danger'>{message ? message.valor_operacao : ''}</label>
        </Form.Group>

        {defaultoptions && (
          <Form.Group className="mb-2" as={Col} xl={5}>
            {hasLabel && <Form.Label className='fw-bold mb-1'>Imóveis Beneficiados*</Form.Label>}
            <AsyncSelect loadOptions={(v) => SelectSearchOptions(v, 'farms/farms', 'nome', 'matricula')} name='instituicao' 
              styles={theme === 'light'? customStyles : customStylesDark} classNamePrefix="select" isMulti
              defaultValue={ type === 'edit' ? (defaultoptions ? defaultoptions.imoveis_beneficiados : null) : null }
              onChange={(selected) => {
              setFormData((prevFormData) => ({
                ...prevFormData,
                imoveis_beneficiados: selected.map(s => s.value)
                }));
              }}>
            </AsyncSelect>
            <label className='text-danger'>{message ? message.imoveis_beneficiados : ''}</label>
          </Form.Group>        
        )}


        <Form.Group className="mb-2" as={Col} xl={3} sm={6}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Área Total Beneficiada (ha)*</Form.Label>}
          <Form.Control
            value={formData.area_beneficiada || ''}
            name="area_beneficiada"
            onChange={handleFieldChange}
            type="number"
          />
          <label className='text-danger'>{message ? message.area_beneficiada : ''}</label>
        </Form.Group>

        <Form.Group className="mb-2" as={Col} xl={3} sm={6}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Quantidade (Kg)</Form.Label>}
          <Form.Control
            value={formData.quantidade_kg || ''}
            name="quantidade_kg"
            onChange={handleFieldChange}
            type="number"
          />
          <label className='text-danger'>{message ? message.quantidade_kg : ''}</label>
        </Form.Group>

        <Form.Group className="mb-2" as={Col} xl={3} sm={6}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Variedade Semente</Form.Label>}
          <Form.Control
            value={formData.varidade_semente || ''}
            name="varidade_semente"
            onChange={handleFieldChange}
            type="text"
          />
          <label className='text-danger'>{message ? message.varidade_semente : ''}</label>
        </Form.Group>

        <Form.Group className="mb-2" as={Col} xl={3} sm={6}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Produtividade Esperada (Kg/ha)</Form.Label>}
          <Form.Control
            value={formData.prod_esperada_kg_ha || ''}
            name="prod_esperada_kg_ha"
            onChange={handleFieldChange}
            type="number"
          />
          <label className='text-danger'>{message ? message.prod_esperada_kg_ha : ''}</label>
        </Form.Group>
        
        <Form.Group className="mb-2" as={Col} xl={6} sm={6}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Adubação Total</Form.Label>}
          <Form.Control
            value={formData.adubacao_total || ''}
            name="adubacao_total"
            onChange={handleFieldChange}
            type="text"
          />
          <label className='text-danger'>{message ? message.adubacao_total : ''}</label>
        </Form.Group>

        <Form.Group className="mb-2" as={Col} xl={4} sm={6}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Fonte Recurso</Form.Label>}
          <Form.Control
            value={formData.fonte_recurso || ''}
            name="fonte_recurso"
            onChange={handleFieldChange}
            type="text"
          />
          <label className='text-danger'>{message ? message.fonte_recurso : ''}</label>
        </Form.Group>

        <Form.Group className="mb-2" as={Col} xl={3} sm={6}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Data Emissão Cédula*</Form.Label>}
          <Form.Control
            value={formData.data_emissao_cedula || ''}
            name="data_emissao_cedula"
            onChange={handleFieldChange}
            type="date"
          />
          <label className='text-danger'>{message ? message.data_emissao_cedula : ''}</label>
        </Form.Group>

        <Form.Group className="mb-2" as={Col} xl={3} sm={6}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Data Primeiro Vencimento</Form.Label>}
          <Form.Control
            value={formData.data_primeiro_vencimento || ''}
            name="data_primeiro_vencimento"
            onChange={handleFieldChange}
            type="date"
          />
          <label className='text-danger'>{message ? message.data_primeiro_vencimento : ''}</label>
        </Form.Group>

        <Form.Group className="mb-2" as={Col} xl={3} sm={6}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Data Prod. Armazenado</Form.Label>}
          <Form.Control
            value={formData.data_prod_armazenado || ''}
            name="data_prod_armazenado"
            onChange={handleFieldChange}
            type="date"
          />
          <label className='text-danger'>{message ? message.data_prod_armazenado : ''}</label>
        </Form.Group>

        <Form.Group className="mb-2" as={Col} xl={3} sm={6}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Data Vencimento*</Form.Label>}
          <Form.Control
            value={formData.data_vencimento || ''}
            name="data_vencimento"
            onChange={handleFieldChange}
            type="date"
          />
          <label className='text-danger'>{message ? message.data_vencimento : ''}</label>
        </Form.Group>

        <Form.Group className="mb-2" as={Col} xl={3} sm={6}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Taxa Juros (%)</Form.Label>}
          <Form.Control
            value={formData.taxa_juros || ''}
            name="taxa_juros"
            onChange={handleFieldChange}
            type="number"
          />
          <label className='text-danger'>{message ? message.taxa_juros : ''}</label>
        </Form.Group>

        <Form.Group className="mb-2" as={Col} xl={4} sm={6}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Safra</Form.Label>}
          <Form.Control
            value={formData.safra || ''}
            name="safra"
            onChange={handleFieldChange}
            type="text"
          />
          <label className='text-danger'>{message ? message.safra : ''}</label>
        </Form.Group>

        <Form.Group className="mb-2" as={Col} xl={12} sm={12}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>Garantia</Form.Label>}
          <Form.Control
            as='textarea'
            value={formData.safra || ''}
            name="safra"
            onChange={handleFieldChange}
            type="text"
          />
          <label className='text-danger'>{message ? message.safra : ''}</label>
        </Form.Group>

        {type === 'add' && <Form.Group className="mb-2" as={Col} xl={3} sm={6}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>PDFs Cédulas</Form.Label>}
          <Form.Control
            name="file"
            onChange={handleFileChange}
            type="file"
            multiple={true}
          />
          <label className='text-danger'>{message ? message.file : ''}</label>
        </Form.Group>}
        
        <Form.Group className="mb-2" as={Col} xl={3} sm={6}>
          {hasLabel && <Form.Label className='fw-bold mb-1'>KML*</Form.Label>}
          <Form.Control
            name="kml"
            onChange={handleKmlChange}
            type="file"
          />
          <label className='text-danger'>{message ? message.kml : ''}</label>
        </Form.Group>
        
        <Form.Group className={`mb-0 ${type === 'edit' ? 'text-start' : 'text-end'}`}>
          <Button
            className="w-40"
            type="submit"
            >
              {type === 'edit' ? "Atualizar Operação"
              : "Cadastrar Operação"}
          </Button>
        </Form.Group>           
      </Form>
    </>
  );
};

export default OperacoesForm;

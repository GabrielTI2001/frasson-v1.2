import React, { useEffect, useState} from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Button, Form} from 'react-bootstrap';
import { useAppContext } from '../../Main';
import RenderFields from '../../components/Custom/RenderFields';
import { fieldsOperacoes } from './Data';

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
        <RenderFields fields={fieldsOperacoes} formData={formData} changefile={handleKmlChange} changefield={handleFieldChange} 
          defaultoptions={defaultoptions} hasLabel={hasLabel} message={message} type={type} changefilemulti={handleFileChange}
        />
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

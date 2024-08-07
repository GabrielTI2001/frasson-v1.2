import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Button, Form, Spinner } from 'react-bootstrap';
import { useAppContext } from '../../Main';
import { SelectOptions, sendData } from '../../helpers/Data';
import { RedirectToLogin } from '../../Routes/PrivateRoute';
import { fieldsAlongamento } from './Data';
import RenderFields from '../../components/Custom/RenderFields';

const FormAlongamento = ({ hasLabel, data, type, submit, operacao}) => {
  const {config: {theme}} = useAppContext();
  const user = JSON.parse(localStorage.getItem('user'))
  const navigate = useNavigate();
  const [formData, setFormData] = useState({created_by: user.id});
  const [message, setMessage] = useState()
  const [defaultoptions, setDefaultOptions] = useState()
  const [options, setOptions] = useState()
  const [isLoading, setIsLoading] = useState(false);

  const handleApi = async (dadosform) => {
    const {resposta, dados} = await sendData({type:type, url:'alongamentos/index', keyfield:type === 'edit' ? data.id : null, 
      dadosform:dadosform})
    if(resposta.status === 400){
      setMessage({...dados})
    }
    else if (resposta.status === 401){
      RedirectToLogin(navigate)
    }
    else if (resposta.status === 201 || resposta.status === 200){
      if (type === 'edit'){
        toast.success("Registro Atualizado com Sucesso!")
      }
      else{
        toast.success("Registro Efetuado com Sucesso!")
      }
      submit(dados)
    }
    setIsLoading(false)
  };

  const handleSubmit = e => {
    setMessage(null)
    setIsLoading(true)
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
        propriedades: data.str_propriedade, 
        testemunha01:{value:data.testemunha01, label:data.str_testemunha01}, 
        testemunha02:{value:data.testemunha02, label:data.str_testemunha02},
        agencia_bancaria:{value:data.agencia_bancaria, label:data.str_agencia},
        fiel_depositario:{value:data.fiel_depositario, label:data.str_fiel_depositario},
      }); 
    
    }
    const buscar = async () =>{
      const dado_produtos = await SelectOptions('alongamentos/produtos-agricolas', 'description');
      if (!dado_produtos){
        RedirectToLogin(navigate)
      }
      const armazenagem = await SelectOptions('alongamentos/tipo-armazenagem', 'description');
      const dados_c = await SelectOptions('alongamentos/tipo-classificacao', 'description');
      setOptions({produto_agricola:dado_produtos, tipo_armazenagem:armazenagem, tipo_classificacao:dados_c})
    }
    buscar()
    if (type === 'edit' && (!defaultoptions)){
      loadFormData()
    }
    else{
      setFormData({...formData, operacao:operacao.id})
      if(!defaultoptions){
        setDefaultOptions({})
      }
    }

  },[])

  return (
    <>
      <Form onSubmit={handleSubmit} className='row sectionform'>
        <span className='fw-bold text-primary mb-1'>Cálculo Alongamento</span>
        <RenderFields fields={fieldsAlongamento.slice(0, 6)} formData={formData} changefield={handleFieldChange}
          hasLabel={hasLabel} message={message} type={type} defaultvalues={defaultoptions} options={options} 
        />
        <span className='fw-bold text-primary mb-1'>Outras Informações</span>
        {(options) && 
          <RenderFields fields={fieldsAlongamento.slice(6)} formData={formData} changefield={handleFieldChange}
            hasLabel={hasLabel} message={message} type={type} defaultvalues={defaultoptions} options={options} 
          />
        }
        <Form.Group className={`mb-0 text-center fixed-footer ${theme === 'light' ? 'bg-white' : 'bg-dark'}`}>
          <Button className="w-50" type="submit" disabled={isLoading} >
            {isLoading 
              ? <Spinner size='sm' className='p-0' style={{marginBottom:'-4px'}}/> 
              : type === 'edit' ? 'Cadastrar' : 'Atualizar'+' Alongamento'
            }
          </Button>
        </Form.Group>      
      </Form>
    </>
  );
};

export default FormAlongamento;

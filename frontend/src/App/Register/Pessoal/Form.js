import React, { useEffect, useState} from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Button, Form, Col, Row, Spinner} from 'react-bootstrap';
import { useAppContext } from '../../../Main';
import { SelectOptions, sendData } from '../../../helpers/Data';
import { fieldsPessoal } from '../Data';
import RenderFields from '../../../components/Custom/RenderFields';

const PessoaForm = ({ hasLabel, type, submit}) => {
  const {config: {theme}} = useAppContext();
  const user = JSON.parse(localStorage.getItem('user'))
  const [formData, setFormData] = useState({
    created_by: user.id, natureza:'PF'
  });
  const [message, setMessage] = useState()
  const navigate = useNavigate();
  const [categorias, setCategorias] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleApi = async (dadosform) => {
    const {resposta, dados} = await sendData({type:type, url:'register/pessoal', keyfield:null, dadosform:dadosform, is_json:false})
    if(resposta.status === 400){
      setMessage({...dados})
    }
    else if (resposta.status === 401){
      navigate("/auth/login");
    }
    else if (resposta.status === 201 || resposta.status === 200){
      submit('add', {razao_social:dados.razao_social, uuid:dados.uuid, str_municipio:dados.str_municipio, numero_rg:dados.numero_rg,
        cpf_cnpj:dados.cpf_cnpj, grupo_info:dados.grupo_info, natureza:dados.str_natureza
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
      if (key === 'file') {
        formDataToSend.append('file', formData[key]);
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
      const cat = await SelectOptions('register/categorias-cadastro', 'categoria')
      setCategorias(cat)
    }
    loadFormData()
  },[])

  return (
    <>
      <Form onSubmit={handleSubmit} encType='multipart/form-data'>
        <Row>
        {categorias && 
          <RenderFields fields={fieldsPessoal} formData={formData} changefield={handleFieldChange}  changefile={handleFileChange}
            hasLabel={hasLabel} message={message} type={type} options={{categoria:categorias}}
          />
        }
        </Row>
        <Form.Group as={Col} className={`mb-0 text-center fixed-footer text-center ${theme === 'light' ? 'bg-white' : 'bg-dark'}`}>
          <Button className="w-50" disabled={isLoading} type="submit">
            {isLoading ? 
              <Spinner size='sm' className='p-0' style={{marginBottom:'-4px'}}/>
            : 
              'Cadastrar Pessoa'
            }
          </Button>
        </Form.Group> 
      </Form>
    </>
  );
};

export default PessoaForm;

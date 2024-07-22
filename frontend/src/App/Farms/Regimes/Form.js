import React, { useEffect, useState} from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Button, Form } from 'react-bootstrap';
import { useAppContext } from '../../../Main';
import { sendData } from '../../../helpers/Data';
import RenderFields from '../../../components/Custom/RenderFields';
import { fieldsRegime } from '../Data';

const RegimeForm = ({ hasLabel, type, submit, data}) => {
  const {config: {theme}} = useAppContext();
  const user = JSON.parse(localStorage.getItem('user'))
  const [formData, setFormData] = useState({
    created_by: user.id, regime:"PR", atividades:"AGRI"
  });
  const [message, setMessage] = useState()
  const navigate = useNavigate();
  const [defaultoptions, setDefaultOptions] = useState();

  const handleApi = async (dadosform) => {
    const {resposta, dados} = await sendData({type:type, url:'farms/regime', keyfield:data ? data.uuid : null, dadosform:dadosform, is_json:false})
    if(resposta.status === 400){
      setMessage({...dados})
    }
    else if (resposta.status === 401){
      navigate("/auth/login");
    }
    else if (resposta.status === 201 || resposta.status === 200){
      submit('add', {matricula_imovel:dados.farm_data.matricula, uuid:dados.uuid, nome_imovel:dados.farm_data.nome,
        str_regime:dados.str_regime, atividade_display:dados.str_atividade, area:dados.area, data_inicio:dados.data_inicio, 
        data_termino:dados.data_termino
      })
      toast.success("Registro Efetuado com Sucesso!")
    }
  };

  const handleSubmit = async e => {
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
      if (type === 'edit'){
        if(data && Object.keys(data)){
          //Pega os atributos não nulos de data
          const filteredData = Object.entries(data)
            .filter(([key, value]) => value !== null)
            .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
          
          const {instrumento_cessao, coordenadas, str_quem_explora, farm_data, str_instituicao, ...restData } = filteredData;
          setFormData({...formData, ...restData})
          setDefaultOptions({
            quem_explora:{value:data.quem_explora, label:str_quem_explora}, 
            imovel:{value:data.imovel, label:farm_data.nome+' - '+farm_data.matricula},
            instituicao:{value:data.instituicao, label:str_instituicao}
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
        <RenderFields fields={fieldsRegime} formData={formData} changefile={handleFileChange} changefield={handleFieldChange} 
          defaultoptions={defaultoptions} hasLabel={hasLabel} message={message} type={type}
        />
        <Form.Group className={`mb-0 text-end`}>
          <Button
            className="w-40"
            type="submit"
            >
              {type === 'edit' ? "Atualizar Regime" : "Cadastrar Regime"}
          </Button>
        </Form.Group>    
      </Form>
    </>
  );
};

export default RegimeForm;

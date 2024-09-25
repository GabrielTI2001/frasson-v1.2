import React, { useEffect, useState, useContext } from 'react';
import PropTypes from 'prop-types';
import { useNavigate} from 'react-router-dom';
import { toast } from 'react-toastify';
import { Button, Form, Spinner} from 'react-bootstrap';
import { AmbientalContext } from '../../../context/Context';
import { fieldsPontoAPPO } from './../Data';
import { RedirectToLogin } from '../../../Routes/PrivateRoute';
import { sendData } from '../../../helpers/Data';
import RenderFields from '../../../components/Custom/RenderFields';

const PontoForm = ({ hasLabel, type, data, update}) => {
  const {ambientalState:{appo}, ambientalDispatch} = useContext(AmbientalContext)
  const [formData, setFormData] = useState({processo: appo.id});
  const [defaultoptions, setDefaultOptions] = useState()
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState();
  const navigate = useNavigate();

  const handleApi = async (dadosform) => {
    const {resposta, dados} = await sendData({type:type, url:'environmental/inema/appo/coordenadas-detail', keyfield: type === 'edit' ? data.id : null,
      dadosform:dadosform
    })
    if(resposta.status === 400){
      setMessage({...dados})
    }
    else if (resposta.status === 401){
      RedirectToLogin(navigate)
    }
    else if (resposta.status === 201 || resposta.status === 200){
      if (type === 'edit'){
        toast.success("Registro Atualizado com Sucesso!")
        ambientalDispatch({type:'UPDATE_PONTO_APPO', payload:{id:dados.id, updatedPonto:dados}})
      }
      else{
        toast.success("Registro Adicionado com Sucesso!")
        ambientalDispatch({type:'ADD_PONTO_APPO',payload:{novoponto:dados}})
      }
      update()
    }
    setIsLoading(false)
  };

  const handleSubmit = e => {
    if (formData.data_perfuracao === ''){
      setFormData({...formData, data_perfuracao:undefined})
    }
    setIsLoading(true)
    setMessage(null)
    e.preventDefault();
    handleApi(formData);
  };

  const handleFieldChange = e => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  useEffect(()=>{
    const loadFormData = () => {
      setFormData({...formData, ...data})
      setDefaultOptions({finalidade:{value: data.finalidade, label: data.str_finalidade}});
    }
    if (type === 'edit' && !defaultoptions){
      if(!formData.numero_poco){   
        loadFormData()
      }
    }
    else{
      if(!defaultoptions){
        setDefaultOptions({finalidade:{}})
      }
    }

  },[])

  return (
    <>
      <Form onSubmit={handleSubmit} className='row'>
        <RenderFields fields={fieldsPontoAPPO} formData={formData} changefield={handleFieldChange}
          hasLabel={hasLabel} message={message} type={type} setform={setFormData}
        />
        <label className='text-danger'>{message && (message.non_field_errors)}</label>
        <Form.Group className="mb-0 text-end">
          <Button className="w-40" type="submit" disabled={!formData.latitude_gd || !formData.longitude_gd || isLoading}>
            {isLoading ? <Spinner size='sm' className='p-0 mx-3' style={{height:'12px', width:'12px'}}/>
            : type === 'edit' ? "Atualizar Poço": "Cadastrar Poço"}
          </Button>
        </Form.Group>           
      </Form>
    </>
  );
};

PontoForm.propTypes = {
  hasLabel: PropTypes.bool
};

export default PontoForm;

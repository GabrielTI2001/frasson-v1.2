import React, { useEffect, useState, useContext } from 'react';
import PropTypes from 'prop-types';
import AsyncSelect from 'react-select/async';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Button, Form, Col, Row} from 'react-bootstrap';
import { fetchAquifero, fieldsAPPO} from './../Data';
import { AmbientalContext } from '../../../context/Context';
import { useAppContext } from '../../../Main';
import RenderFields from '../../../components/Custom/RenderFields';
import { sendData } from '../../../helpers/Data';

const APPOForm = ({ hasLabel, type, addpoint, submit}) => {
  const {config: {theme}} = useAppContext();
  const user = JSON.parse(localStorage.getItem('user'))
  const {ambientalState, ambientalDispatch} = useContext(AmbientalContext)
  const [formData, setFormData] = useState({
    created_by: user.id, processo_frasson: false
  });
  const [message, setMessage] = useState()
  const navigate = useNavigate();
  const {uuid} = useParams()
  const [defaultoptions, setDefaultOptions] = useState()
  const [aquifero, setAquifero] = useState([])

  const handleApi = async (dadosform) => {
    const {resposta, dados} = await sendData({type:type, url:'environmental/inema/appos', keyfield: type === 'edit' ? uuid : null, 
      dadosform:dadosform, is_json:false})

    if(resposta.status === 400){
      setMessage({...dados})
    }
    else if (resposta.status === 401){
      localStorage.setItem("login", JSON.stringify(false));
      localStorage.setItem('token', "");
      const next = window.location.href.toString().split(process.env.REACT_APP_HOST)[1]
      navigate(`/auth/login?next=${next}`);
    }
    else if (resposta.status === 201 || resposta.status === 200){
      if (type === 'edit'){
        ambientalDispatch({type:'SET_DATA', payload:{
          appo: {coordenadas:ambientalState.appo.coordenadas, ...dados}
        }})
        toast.success("Registro Atualizado com Sucesso!")
      }
      else{
        toast.success("Registro Efetuado com Sucesso!")
        submit('add', dados)
        navigate(`/ambiental/inema/appos/${dados.uuid}`);
      }
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
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handlePDFChange = (e) => {
    setFormData({...formData, [e.target.name]:e.target.files[0]})
  };

  useEffect(()=>{
    const loadFormData = async () => {
      if(ambientalState){
          setFormData({...formData, numero_processo:ambientalState.appo.numero_processo,
            nome_requerente: ambientalState.appo.nome_requerente, municipio: ambientalState.appo.municipio, 
            data_documento: ambientalState.appo.data_documento, data_vencimento:ambientalState.appo.data_vencimento, 
            aquifero: ambientalState.appo.aquifero, cpf_cnpj: ambientalState.appo.cpf_cnpj,
            nome_fazenda: ambientalState.appo.nome_fazenda, processo_frasson: ambientalState.appo.processo_frasson
          })
          setDefaultOptions({municipio: {value: ambientalState.appo.municipio, label: ambientalState.appo.nome_municipio},
            aquifero: {value:ambientalState.appo.aquifero, label: ambientalState.appo.str_tipo_aquifero}
          }); 
      }
    
    }
    const buscar = async () =>{
      const data = await fetchAquifero();
      if (data.status === 401){
        const next = window.location.href.toString().split(process.env.REACT_APP_HOST)[1]
        navigate(`/auth/login?next=${next}`);
      }
      setAquifero(data.dados)
    }

    if (aquifero.length === 0){
      buscar()
    }
    if (type === 'edit' && (!defaultoptions || !ambientalState.appo)){
      loadFormData()
    }
    else{
      if(!defaultoptions){
        setDefaultOptions({municipio:{}})
      }
    }

  }, [])

  return (
    <>
      <Form onSubmit={handleSubmit} className='row'>
        {aquifero && 
          <RenderFields fields={fieldsAPPO} formData={formData} changefield={handleFieldChange}  changefile={handlePDFChange}
            defaultoptions={defaultoptions} hasLabel={hasLabel} message={message} type={type} options={{aquifero:aquifero}}
          />
        }
        <Row>
          <Form.Group className={`mb-2 pe-1 ${type === 'edit' ? 'text-start' : 'text-end'}`} as={Col} xl='auto' sm='auto' xs={12}>
            <Button
              className="w-40"
              type="submit"
              disabled={!formData.nome_requerente || !formData.numero_processo}
            >
              {type === 'edit' ? "Atualizar Processo" : "Cadastrar Processo"}
            </Button>
          </Form.Group>   
          {type === 'edit' &&
            <Form.Group className={`mb-0`} as={Col} xl='auto' sm='auto' xs={12}>
              <Button onClick={addpoint} className='btn-success'>Adicionar Ponto</Button>
            </Form.Group>   
          }
        </Row>     
      </Form>
    </>
  );
};

APPOForm.propTypes = {
  hasLabel: PropTypes.bool
};

export default APPOForm;

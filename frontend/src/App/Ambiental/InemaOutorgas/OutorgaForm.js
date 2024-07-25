import React, { useEffect, useState, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Button, Form, Col, Row} from 'react-bootstrap';
import { fieldsOutorga} from './../Data';
import { AmbientalContext } from '../../../context/Context';
import { useAppContext } from '../../../Main';
import { SelectOptions, sendData } from '../../../helpers/Data';
import RenderFields from '../../../components/Custom/RenderFields';

const OutorgaForm = ({ hasLabel, type, submit}) => {
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
  const [captacao, setCaptacao] = useState()

  const handleApi = async (dadosform) => {
    const {resposta, dados} = await sendData({type:type, url:'environmental/inema/outorgas', keyfield: type === 'edit' ? uuid : null, 
      dadosform:dadosform})
    if(resposta.status === 400){
      setMessage({...dados})
    }
    else if (resposta.status === 401){
      navigate("/auth/login");
    }
    else if (resposta.status === 201 || resposta.status === 200){
      if (type === 'edit'){
        ambientalDispatch({type:'SET_DATA', payload:{
          outorga: {coordenadas:ambientalState.outorga.coordenadas,...formData}
        }})
        toast.success("Registro Atualizado com Sucesso!")
      }
      else{
        toast.success("Registro Efetuado com Sucesso!")
        submit('add', dados)
      }
    }
  };

  const handleSubmit = e => {
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
      if(ambientalState){
        setFormData({...formData, numero_portaria:ambientalState.outorga.numero_portaria, numero_processo:ambientalState.outorga.numero_processo,
          nome_requerente: ambientalState.outorga.nome_requerente, municipio: ambientalState.outorga.municipio, data_publicacao: ambientalState.outorga.data_publicacao,
          data_validade:ambientalState.outorga.data_validade, captacao: ambientalState.outorga.captacao, finalidade: ambientalState.outorga.finalidade, cpf_cnpj: ambientalState.outorga.cpf_cnpj,
          nome_propriedade: ambientalState.outorga.nome_propriedade, bacia_hidro: ambientalState.outorga.bacia_hidro, area_ha: ambientalState.outorga.area_ha, processo_frasson: ambientalState.outorga.processo_frasson
        })
        setDefaultOptions({ municipio: {value: ambientalState.outorga.municipio, label: ambientalState.outorga.nome_municipio}, 
          finalidade: {value: ambientalState.outorga.finalidade, label: ambientalState.outorga.str_finalidade}}); 
      }
    
    }
    const buscar = async () =>{
      const data = await SelectOptions('environmental/inema/captacao', 'description');
      if (data === 401){
        navigate("auth/login")
      }
      setCaptacao(data)
    }

    if (!captacao){
      buscar()
    }
    if (type === 'edit' && (!defaultoptions || !ambientalState)){
      loadFormData()
    }
    else{
      if(!defaultoptions){
        setDefaultOptions({municipio:{}, finalidade:{}})
      }
    }

  },[])

  return (
    <>
      <Form onSubmit={handleSubmit} className='row'>
        {captacao && 
          <RenderFields fields={fieldsOutorga} formData={formData} changefield={handleFieldChange} 
            defaultoptions={defaultoptions} hasLabel={hasLabel} message={message} type={type} options={{captacao:captacao}}
          />
        }
        <Row>
          <Form.Group className={`mb-2 pe-1 ${type === 'edit' ? 'text-start' : 'text-end'}`} as={Col} xl='auto' sm='auto' xs={12}>
            <Button className="w-40" type="submit">
              {type === 'edit' ? "Atualizar Portaria" : "Cadastrar Portaria"}
            </Button>
          </Form.Group>   
        </Row>
      </Form>
    </>
  );
};

export default OutorgaForm;

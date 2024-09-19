import React, { useEffect, useState } from 'react';
import { Spinner } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { useAppContext } from '../../../Main';
import { HandleSearch } from '../../../helpers/Data';
import api from '../../../context/data';
import { toast } from 'react-toastify';
import ModalDelete from '../../../components/Custom/ModalDelete';
import { Link } from 'react-router-dom';
import ExpandableCard from '../../../components/Custom/ExpandableCard';
import {CardTitle} from '../CardInfo';
import { Anexos } from '../FollowUp/Anexos';
import EditFormModal from '../../../components/Custom/EditForm';
import FormAT from './Form';

const IndexAT = ({card, updatedactivity}) => {
  const [analises, setAnalises] = useState();
  const {config: {theme}} = useAppContext();
  const token = localStorage.getItem("token")
  const [showmodal, setShowModal] = useState({show:false})
  const [modaldel, setModaldel] = useState({show:false})
  const [showForm, setShowForm] = useState({})

  const submit = (type, data) => {
    if (type === 'add'){
      setAnalises([data, ...analises])
    } 
    setShowModal({show:false})
    updatedactivity({type:'ch', campo:'Análises Técnicas', created_at:data.created_at, user:{name:data.str_created_by}})
  }

  const handleEdit = (key) =>{
    setShowForm(prevState => ({
      ...prevState,
      [key]: !prevState[key]
    }));
  }

  const handleSubmit = (formData, uuid) =>{
    if (formData){
      const formDataToSend = new FormData();
      for (const key in formData) {
        if (key === 'file') {
          for (let i = 0; i < formData[key].length; i++) {
            formDataToSend.append('file', formData[key][i]);
          }
        }
        else if (Array.isArray(formData[key])) {
          formData[key].forEach(value => {
            formDataToSend.append(key, value);
          });
        } else {
          formDataToSend.append(key, formData[key]);
        }
      }
      api.put(`pipeline/analise-tecnica/${uuid}/`, formDataToSend, {headers: {Authorization: `Bearer ${token}`}})
      .then((response) => {
        toast.success("Análise Atualizada com Sucesso!")
        setAnalises(analises.map(p => p.uuid === uuid ? response.data : p))
        setShowForm({})
        if (response.data.activity){
          updatedactivity(response.data.activity)
        }
      })
      .catch((erro) => {
        if (erro.response.status === 400){
          toast.error(Object.values(erro.response.data)[0][0])
        }
        console.error('erro: '+erro);
      })
    }
  }

  const handledelete = (type, data) =>{
    setAnalises(analises.filter(c => c.uuid !== data))
  }

  useEffect(() =>{
    const getusers = async () =>{
      if (!analises){
        HandleSearch('', 'pipeline/analise-tecnica',(data) => {setAnalises(data)}, `?prospect=${card.id}`)
      }
    }
    getusers()
  },[])

  return (
    <>
    <div className='row mx-0 mb-0 gx-0'>
      <h5 className="col-auto mb-0 fs-0 fw-bold p-2 ps-0">Análises</h5>
      <Link className="text-decoration-none nav nav-link shadow-none fs--1 p-2 col-auto rounded-1" onClick={() =>{setShowModal({show:true})}}>
        <FontAwesomeIcon icon={faPlus} />Novo Cadastro
      </Link>
    </div>
    {showmodal.show &&
      <ExpandableCard title='Nova Análise Técnica' auto close={() => setShowModal({show:false})}>
        <FormAT type='add' hasLabel submit={submit} card={card}/>
      </ExpandableCard>
    }
    {analises && analises.length === 0 &&
      <span className='text-uppercase d-block' style={{fontWeight:'500'}}>Nenhum registro cadastrado</span>
    }
    {analises ? analises.map(p =>
      <ExpandableCard data={p} attr1={'tipo_display'} key={p.id}
        footer={`Criado por ${p.str_created_by} em ${new Date(p.created_at).toLocaleDateString('pt-BR', {year:"numeric", month: "short", day: "numeric", 
        timeZone:'UTC'})} às ${new Date(p.created_at).toLocaleTimeString('pt-BR', {hour:"numeric", minute:"numeric"})}`}
        clickdelete={() => {setModaldel({show:true, link:`${process.env.REACT_APP_API_URL}/pipeline/analise-tecnica/${p.uuid}/`})}}
      >
        {!showForm.observacoes ?
          <div className='my-2'>
            <CardTitle title='Observações' click={handleEdit} field='observacoes'/>
            <div className='text-justify'>{p.observacoes}</div>
          </div>
          :
          <EditFormModal show={showForm} setShow={setShowForm} record={p} onSubmit={(d) => handleSubmit(d, p.uuid)}
            field={{name:'observacoes', label:'Observações', type:'textarea', rows:3}}
          />
        }
        <div className='mt-2'><Anexos param='analisetecnica' value={p.id}/></div>
      </ExpandableCard>
      ) : <div className='text-center mb-4'><Spinner /></div> 
    }
    <ModalDelete show={modaldel.show} link={modaldel.link} update={handledelete} close={() => setModaldel({show:false})}/>
    </>
  );
};

export default IndexAT;

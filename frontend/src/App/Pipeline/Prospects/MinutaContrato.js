import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { useAppContext } from '../../../Main';
import api from '../../../context/data';
import { toast } from 'react-toastify';
import ModalDelete from '../../../components/Custom/ModalDelete';
import { Link, useNavigate } from 'react-router-dom';
import ExpandableCard from '../../../components/Custom/ExpandableCard';
import {CardInfo2, CardTitle} from '../CardInfo';
import ContratoForm from '../../Finances/Contratos/FormContrato';
import { RedirectToLogin } from '../../../Routes/PrivateRoute';
import { fieldsContrato } from '../../Finances/Data';
import EditFormModal from '../../../components/Custom/EditForm';
import { Anexos } from '../FollowUp/Anexos';
import { RetrieveRecord } from '../../../helpers/Data';

const MinutaContrato = ({card, updatedactivity, setcard}) => {
  const [contrato, setContrato] = useState();
  const {config: {theme}} = useAppContext();
  const token = localStorage.getItem("token")
  const [showmodal, setShowModal] = useState({show:false})
  const [modaldel, setModaldel] = useState({show:false})
  const [showForm, setShowForm] = useState({})
  const navigate = useNavigate()
  const endpoint = card.info_produto.acronym === 'GC' ? 'contratos-credito' : 'contratos-ambiental'

  const submit = (type, data) => {
    if (type === 'add'){
      setContrato(data)
      api.put(`pipeline/fluxos/prospects/${card.code}/`, {[card.info_produto.acronym === 'GC' ? 'contrato_gc' : 'contrato_gai']:data.id}, 
        {headers: {Authorization: `Bearer ${token}`}})
        .then((response) => {
          setcard(response.data)
        })
        .catch((erro) => {
          if (erro.response.status === 400){
            toast.error(Object.values(erro.response.data)[0][0])
          }
          console.error('erro: '+erro);
        })
      updatedactivity({type:'ch', campo:'Contratos', created_at:data.created_at, user:{name:data.str_created_by}})
    } 
    setShowModal({show:false})
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
      api.put(`finances/${endpoint}/${uuid}/`, formDataToSend, {headers: {Authorization: `Bearer ${token}`}})
      .then((response) => {
        toast.success("PVTEC Atualizada com Sucesso!")
        setContrato(contrato)
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
    setContrato({})
    setcard({...card, info_contrato:null, contrato_gai:null, contrato_gc:null})
  }

  useEffect(() =>{
    const getusers = async () =>{
      if (!contrato){
        if (!card.info_contrato){
          setContrato({})
        }
        else{
          const status = await RetrieveRecord(card.info_contrato.uuid, `finances/${endpoint}`, (data) => {setContrato(data)})
          if (status === 404) setContrato({})
          if (status === 401) RedirectToLogin(navigate)
        }
      }
    }
    getusers()
  },[])

  return (
    <>
    <div className='row mx-0 mb-0 gx-0'>
      <h5 className="col-auto mb-0 fs-0 fw-bold p-2 ps-0">Contrato</h5>
      {contrato && Object.keys(contrato).length === 0 &&
        <Link className="text-decoration-none nav nav-link shadow-none fs--1 p-2 col-auto rounded-1" onClick={() =>{setShowModal({show:true})}}>
          <FontAwesomeIcon icon={faPlus} /> Novo Cadastro
        </Link>
      }
    </div>

    {showmodal.show &&
      <ExpandableCard title='Novo Contrato' auto close={() => setShowModal({show:false})}>
        <ContratoForm type='add' hasLabel submit={submit} prospect={card} produto={card.info_produto.acronym}/>
      </ExpandableCard>
    }

    {contrato && (Object.keys(contrato).length === 0 ? <span>Nenhum Contrato Vinculado</span> :
      <ExpandableCard data={contrato} title={contrato.info_contratante && contrato.info_contratante.label} key={contrato.id} 
        url={`finances/contracts/${card.info_produto.acronym === 'GC'? 'credit' : 'environmental'}`}
        footer={`Criado por ${contrato.str_created_by} em ${new Date(contrato.created_at).toLocaleDateString('pt-BR', {year:"numeric", month: "short", day: "numeric", 
        timeZone:'UTC'})} às ${new Date(contrato.created_at).toLocaleTimeString('pt-BR', {hour:"numeric", minute:"numeric"})}`}
        clickdelete={() => {setModaldel({show:true, link:`${process.env.REACT_APP_API_URL}/finances/${endpoint}/${contrato.uuid}/`})}}
      >
        {fieldsContrato.filter(f => f.type !== 'file').map(f => (
          !showForm[f.name] ?
          <div className="rounded-top-lg pt-1 pb-0 mb-2" key={f.name}>
            <CardTitle title={f.label.replace('*','')} field={f.name} click={handleEdit}/>
            {f.type === 'select2' ? f.ismulti ? 
                <div className="fs--1 row-10">{contrato[f.list].map(l => l[f.string]).join(', ')}</div>
              : 
              f.string ?
                <div className="fs--1 row-10">{contrato[f.string] || '-'}</div>
              :
                <div className="fs--1 row-10">{contrato[f.data] && contrato[f.data][f.attr_data]}</div>
            : f.type === 'select' ? (
                f.boolean 
                  ? <div className="fs--1 row-10">{contrato[f.name] === true ? 'Sim' : 'Não'}</div>
                  : <div className="fs--1 row-10">{contrato[f.string]}</div>
                )
            : f.type === 'date' ? 
              <div className="fs--1 row-10">{contrato[f.name] ? new Date(contrato[f.name]).toLocaleDateString('pt-BR', {timeZone:'UTC'}) : '-'}</div>
            : f.type === 'dropdown' ?
              <div className="fs--1 row-10">{f.icon && f.icon[contrato[f.name]]} {contrato[f.string] || '-'}</div>
            : 
              <div className="fs--1 row-10">
                {contrato[f.name] ? (f.isnumber ? Number(contrato[f.name]).toLocaleString('pt-br', {minimumFractionDigits:2}) : contrato[f.name]) : '-'}
              </div>
            }
          </div>
          :
          <EditFormModal
            onSubmit={(formData) => handleSubmit(formData, contrato.uuid)} 
            show={showForm[f.name]} record={contrato} field={f}
            setShow={setShowForm}
          />
        ))}
        <div>
          <Anexos param={'contrato'+card.info_produto.acronym.toLowerCase()} value={contrato.id} url={'finances/anexos'}
            formparam={card.info_produto.acronym === 'GC' ? 'contrato_credito' : 'contrato_ambiental'}
          />
        </div>
      </ExpandableCard>
    )}
    <ModalDelete show={modaldel.show} link={modaldel.link} update={handledelete} close={() => setModaldel({show:false})}/>
    </>
  );
};

export default MinutaContrato;

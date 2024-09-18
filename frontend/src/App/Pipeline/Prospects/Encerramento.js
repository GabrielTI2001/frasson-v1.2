import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { useAppContext } from '../../../Main';
import { HandleSearch } from '../../../helpers/Data';
import api from '../../../context/data';
import { toast } from 'react-toastify';
import ModalDelete from '../../../components/Custom/ModalDelete';
import { Link, useNavigate } from 'react-router-dom';
import ExpandableCard from '../../../components/Custom/ExpandableCard';
import {CardInfo2, CardTitle} from '../CardInfo';
import { RedirectToLogin } from '../../../Routes/PrivateRoute';
import EditFormModal from '../../../components/Custom/EditForm';
import { Anexos } from '../FollowUp/Anexos';
import ProductForm from '../GAI/Form';
import { fieldsFluxoGAI } from '../Data';

const Encerramento = ({card, updatedactivity}) => {
  const [fluxos, setFluxos] = useState();
  const {config: {theme}} = useAppContext();
  const token = localStorage.getItem("token")
  const [showmodal, setShowModal] = useState({show:false})
  const [modaldel, setModaldel] = useState({show:false})
  const [showForm, setShowForm] = useState({})
  const navigate = useNavigate()
  const endpoint = card.info_produto.acronym === 'GC' ? 'fluxos/gestao-ambiental' : 'fluxos/gestao-ambiental'
  const fields = card.info_produto.acronym === 'GC' ? fieldsFluxoGAI : fieldsFluxoGAI

  const submit = (type, data) => {
    if (type === 'add'){
      setFluxos([data, ...fluxos])
      updatedactivity({type:'ch', campo:'Produtos', created_at:data.created_at, user:{name:data.str_created_by}})
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
      api.put(`pipeline/${endpoint}/${uuid}/`, formDataToSend, {headers: {Authorization: `Bearer ${token}`}})
      .then((response) => {
        toast.success("Produto Atualizado com Sucesso!")
        setFluxos(fluxos.map(p => p.code === uuid ? response.data : p))
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
    setFluxos(fluxos.filter(c => c.uuid !== data))
  }

  useEffect(() =>{
    const getusers = async () =>{
      if (!fluxos){
        if (!card.info_contrato){
          setFluxos([])
        }
        else{
          const status = await HandleSearch('', `pipeline/${endpoint}`,(data) => {setFluxos(data)}, 
          `?contrato=${card[card.info_produto.acronym === 'GC' ? 'contrato_gc' : 'contrato_gai']}`)
          if (status === 401) RedirectToLogin(navigate)
        }
      }
    }
    getusers()
  },[])

  return (
    <>
    <div className='row mx-0 mb-0 gx-0'>
      <h5 className="col-auto mb-0 fs-0 fw-bold p-2 ps-0">Fluxos ({fluxos && fluxos.length})</h5>
      <Link className="text-decoration-none nav nav-link shadow-none fs--1 p-2 col-auto rounded-1" onClick={() =>{setShowModal({show:true})}}>
        <FontAwesomeIcon icon={faPlus} /> Novo Cadastro
      </Link>
    </div>
    {showmodal.show &&
      <ExpandableCard title={`Novo Produto ${card.info_produto.acronym}`} auto close={() => setShowModal({show:false})}>
        {card.info_produto.acronym === 'GC' ? 
          <ProductForm onSubmit={submit} fase={1} data={{contrato:card.contrato_gc}}/>
        :
          <ProductForm onSubmit={submit} fase={1} data={{contrato:card.contrato_gai}}/>
        }
      </ExpandableCard>
    }

    {fluxos && fluxos.map(p =>
      <ExpandableCard data={p} title={p.info_detalhamento.detalhamento_servico} key={p.id} 
        url={`pipeline/${card.info_produto.acronym === 'GC'? '518984721' : '518984721'}`}
        footer={`Criado por ${p.str_created_by} em ${new Date(p.created_at).toLocaleDateString('pt-BR', {year:"numeric", month: "short", day: "numeric", 
        timeZone:'UTC'})} às ${new Date(p.created_at).toLocaleTimeString('pt-BR', {hour:"numeric", minute:"numeric"})}`}
        clickdelete={() => {setModaldel({show:true, link:`${process.env.REACT_APP_API_URL}/pipeline/${endpoint}/${p.uuid}/`})}}
      >
        {fields.filter(f => f.type !== 'file').map(f => (
          !showForm[f.name] ?
          <div className="rounded-top-lg pt-1 pb-0 mb-2" key={f.name}>
            <CardTitle title={f.label.replace('*','')} field={f.name} click={handleEdit}/>
            {f.type === 'select2' ? 
              f.ismulti ? 
                <div className="fs--1 row-10">{p[f.list].map(l => l[f.string]).join(', ')}</div>
              : f.string ?
                <div className="fs--1 row-10">{p[f.string] || '-'}</div>
              :
                <div className="fs--1 row-10">{p[f.data] && p[f.data][f.attr_data]}</div>
            : f.type === 'date' ? 
              <div className="fs--1 row-10">{p[f.name] ? new Date(p[f.name]).toLocaleDateString('pt-BR', {timeZone:'UTC'}) : '-'}</div>
            : f.type === 'dropdown' ?
              <div className="fs--1 row-10">{f.icon && f.icon[p[f.name]]} {p[f.string] || '-'}</div>
            : 
              <div className="fs--1 row-10">
                {p[f.name] ? (f.isnumber ? Number(p[f.name]).toLocaleString('pt-br', {minimumFractionDigits:2}) : p[f.name]) : '-'}
              </div>
            }
          </div>
          :
          <EditFormModal
            onSubmit={(formData) => handleSubmit(formData, p.code)} 
            show={showForm[f.name]} record={p} field={f}
            setShow={setShowForm}
          />
        ))}
      </ExpandableCard>
    )}
    <ModalDelete show={modaldel.show} link={modaldel.link} update={handledelete} close={() => setModaldel({show:false})}/>
    </>
  );
};

export default Encerramento;

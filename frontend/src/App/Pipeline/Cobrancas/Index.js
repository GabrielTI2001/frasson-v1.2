import React, { useEffect, useState } from 'react';
import { Spinner } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { useAppContext } from '../../../Main';
import { HandleSearch } from '../../../helpers/Data';
import api from '../../../context/data';
import { toast } from 'react-toastify';
import ModalDelete from '../../../components/Custom/ModalDelete';
import FormCobranca from './Form';
import { Link } from 'react-router-dom';
import ExpandableCard from '../../../components/Custom/ExpandableCard';
import {CardTitle} from '../CardInfo';
import { fieldsCobranca } from '../../Finances/Data';
import EditFormModal from '../../../components/Custom/EditForm';

const fields = ['status', 'saldo_devedor', 'data_previsao']

const Cobrancas = ({card, updatedactivity, isgc}) => {
  const [cobrancas, setCobrancas] = useState();
  const {config: {theme, isRTL}} = useAppContext();
  const token = localStorage.getItem("token")
  const [showmodal, setShowModal] = useState({show:false})
  const [modaldel, setModaldel] = useState({show:false})
  const [showForm, setShowForm] = useState({})

  const submit = (type, data) => {
    if (type === 'add'){
      setCobrancas([data, ...cobrancas])
    } 
    setShowModal({show:false})
    updatedactivity({type:'ch', campo:'Cobranças', created_at:data.created_at, user:data.user})
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
      api.put(`finances/revenues/${uuid}/`, formDataToSend, {headers: {Authorization: `Bearer ${token}`}})
      .then((response) => {
        toast.success("Cobrança Atualizada com Sucesso!")
        setCobrancas(cobrancas.map(p => p.uuid === uuid ? response.data : p))
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
    setCobrancas(cobrancas.filter(c => c.uuid !== data))
  }

  useEffect(() =>{
    const getusers = async () =>{
      if (!cobrancas){
        const param = isgc ? 'fluxogc' : 'fluxogai'
        HandleSearch('', 'finances/revenues',(data) => {setCobrancas(data.cobrancas)}, `?${param}=${card.id}`)
      }
    }
    getusers()
  },[])

  return (
    <>
    <div className='row mx-0 mb-0 gx-0'>
      <h5 className="col-auto mb-0 fs-0 fw-bold p-2 ps-0">Cobranças</h5>
      <Link className="text-decoration-none nav nav-link shadow-none fs--1 p-2 col-auto rounded-1" onClick={() =>{setShowModal({show:true})}}>
        <FontAwesomeIcon icon={faPlus} /> Novo Cadastro
      </Link>
    </div>
    {showmodal.show &&
      <ExpandableCard title='Nova Cobrança' auto close={() => setShowModal({show:false})}>
        <FormCobranca type='add' hasLabel submit={submit} card={card}/>
      </ExpandableCard>
    }

    {cobrancas && cobrancas.filter(p => p.status !== 'PG').length > 0 &&
      <span className='text-uppercase d-block' style={{fontWeight:'500'}}>
        Em Aberto ({cobrancas.filter(p => p.status !== 'PG').length})
      </span>
    }
    {cobrancas ? cobrancas.filter(p => p.status !== 'PG').map(p =>
      <ExpandableCard data={p} attr1='str_etapa' key={p.id} url='finances/revenues'
        footer={`Criado por ${p.str_created_by} em ${new Date(p.created_at).toLocaleDateString('pt-BR', {year:"numeric", month: "short", day: "numeric", 
        timeZone:'UTC'})} às ${new Date(p.created_at).toLocaleTimeString('pt-BR', {hour:"numeric", minute:"numeric"})}`}
        clickdelete={() => {setModaldel({show:true, link:`${process.env.REACT_APP_API_URL}/finances/revenues/${p.uuid}/`})}}
      >
        {fieldsCobranca.filter(f => fields.some(n => f.name === n)).map(f => 
          !showForm[f.name] ?
            <div className='my-2' key={f.name}>
              <CardTitle title={f.label.replace('*', '')} click={f.name === 'saldo_devedor' ? null : handleEdit} field={f.name}/>
              {f.type === 'date' ? 
                <div className="fs--1 row-10">{p[f.name] ? new Date(p[f.name]).toLocaleDateString('pt-BR', {timeZone:'UTC'}) : '-'}</div>
              : 
                <div className="fs--1 row-10">{p[f.name] ? f.is_number 
                  ? Number(p[f.name]).toLocaleString('pt-BR', {minimumFractionDigits:2}) : p[f.name] : '-'}
                </div>
              }
            </div>
          : 
          <EditFormModal key={f.name}
            onSubmit={(formData) => handleSubmit(formData, p.uuid)} 
            show={showForm[f.name]} fieldkey={f.name} setShow={setShowForm} 
            record={p} field={f}
          />
        )}
        <CardTitle title={'Status'}/>
        <div><span className={`badge bg-warning fs--2 p-1 px-2`}>{p.str_status || '-'}</span></div>
      </ExpandableCard>
    ) : 
    <div className='text-center mb-4'>
      <Spinner />
    </div> 
    }

    {cobrancas && cobrancas.filter(p => p.status === 'PG').length > 0 &&
      <span className='text-uppercase' style={{fontWeight:'500'}}>
        Pago ({cobrancas.filter(p => p.status === 'PG').length})
      </span>
    }
    {cobrancas && cobrancas.filter(p => p.status === 'PG').map(p =>
      <ExpandableCard data={p} attr1='str_etapa' key={p.id} url='finances/revenues'
        footer={`Criado em ${new Date(p.created_at).toLocaleDateString('pt-BR', {year:"numeric", month: "short", day: "numeric", 
        timeZone:'UTC'})} às ${new Date(p.created_at).toLocaleTimeString('pt-BR', {hour:"numeric", minute:"numeric"})}`}
        clickdelete={() => {setModaldel({show:true, link:`${process.env.REACT_APP_API_URL}/finances/revenues/${p.uuid}/`})}}
      >
        {fieldsCobranca.filter(f => fields.some(n => f.name === n)).map(f => 
          !showForm[f.name] ?
            <div className='my-2' key={f.name}>
              <CardTitle title={f.label.replace('*', '')} click={f.name === 'saldo_devedor' ? null : handleEdit} field={f.name}/>
              {f.type === 'date' ? 
                <div className="fs--1 row-10">{p[f.name] ? new Date(p[f.name]).toLocaleDateString('pt-BR', {timeZone:'UTC'}) : '-'}</div>
              : 
                <div className="fs--1 row-10">{p[f.name] ? f.is_number 
                  ? Number(p[f.name]).toLocaleString('pt-BR', {minimumFractionDigits:2}) : p[f.name] : '-'}
                </div>
              }
            </div>
          : 
          <EditFormModal key={f.name}
            onSubmit={(formData) => handleSubmit(formData, p.uuid)} 
            show={showForm[f.name]} fieldkey={f.name} setShow={setShowForm} 
            record={p} field={f}
          />
        )}
        <CardTitle title={'Status'}/>
        <div><span className={`badge bg-success fs--2 p-1 px-2`}>{p.str_status || '-'}</span></div>
      </ExpandableCard>
    )}
    <ModalDelete show={modaldel.show} link={modaldel.link} update={handledelete} close={() => setModaldel({show:false})}/>
    </>
  );
};

export default Cobrancas;

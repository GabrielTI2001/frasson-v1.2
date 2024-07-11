import React, { useEffect, useState } from 'react';
import { Spinner } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { useAppContext } from '../../../Main';
import { HandleSearch } from '../../../helpers/Data';
import api from '../../../context/data';
import { toast } from 'react-toastify';
import ModalDelete from '../../../components/Custom/ModalDelete';
import FormPVTEC from './Form';
import { Link } from 'react-router-dom';
import ExpandableCard from '../../../components/Custom/ExpandableCard';
import { Anexos } from './Anexos';
import EditForm from './EditForm';
import {CardTitle} from '../CardInfo';

const indexAcompGAI = ({card, updatedactivity}) => {
  const user = JSON.parse(localStorage.getItem('user'))
  const [users, setUsers] = useState([]);
  const [acomp, setAcomp] = useState();
  const [updatesacomp, setUpdatesAcomp] = useState();
  const {config: {theme, isRTL}} = useAppContext();
  const token = localStorage.getItem("token")
  const [showmodal, setShowModal] = useState({show:false})
  const [modaldel, setModaldel] = useState({show:false})
  const [showForm, setShowForm] = useState({})

  const submit = (type, data) => {
    if (type === 'add'){
      setUpdatesAcomp([{...data, str_responsaveis:data.list_responsaveis.map(l => l.nome).join(', ')}, ...updatesacomp])
    } 
    setShowModal({show:false})
    updatedactivity({type:'ch', campo:'PVTECs', created_at:data.created_at, user:data.user})
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
      api.put(`pipeline/pvtec/${uuid}/`, formDataToSend, {headers: {Authorization: `bearer ${token}`}})
      .then((response) => {
        toast.success("PVTEC Atualizada com Sucesso!")
        setUpdatesAcomp(updatesacomp.map(p => p.uuid === uuid ? response.data : p))
        if (response.data.activity){
          updatedactivity(response.data.activity)
        }
      })
      .catch((erro) => {
        console.error('erro: '+erro);
      })
    }
    setShowForm({...showForm, 'orientacoes':false, 'status':false, 'atividade':false, 'responsaveis':false, 
    'instituicao':false, 'contrato':false})
  }

  const handledelete = (type, data) =>{
    setUpdatesAcomp(updatesacomp.filter(c => c.uuid !== data))
  }

  useEffect(() =>{
    const getdata = async () =>{
      if (acomp && !updatesacomp){
        HandleSearch('', 'pipeline/followup/atualizacoes-gai',(data) => {setUpdatesAcomp(data)}, `?acomp=${acomp[0].id}`)
      }
      HandleSearch('', 'pipeline/followup/acompanhamentos-gai', (data) => {setAcomp(data)}, `?fluxogai=${card.id}`)
    }
    getdata()
  },[acomp])

  return (
    <>
    <div className='row mx-0 mb-0 gx-0'>
      <h5 className="col-auto mb-0 fs-0 fw-bold p-2 ps-0">PVTEC</h5>
      <Link className="text-decoration-none nav nav-link shadow-none fs--1 p-2 col-auto rounded-1" onClick={() =>{setShowModal({show:true})}}>
        <FontAwesomeIcon icon={faPlus} /> Novo Cadastro
      </Link>
    </div>
    {showmodal.show &&
      <ExpandableCard title='Nova PVTEC' auto close={() => setShowModal({show:false})}>
        <FormPVTEC type='add' hasLabel submit={submit} card={card}/>
      </ExpandableCard>
    }

    {updatesacomp &&
      <span className='text-uppercase d-block' style={{fontWeight:'500'}}>
        Atualizações de Acompanhamento ({updatesacomp.length})
      </span>
    }
    {updatesacomp ? updatesacomp.map(p =>
      <ExpandableCard data={p} attr1='atividade_display' key={p.id} url='pipeline/pvtec'
        footer={`Criado por ${p.user.name} em ${new Date(p.created_at).toLocaleDateString('pt-BR', {year:"numeric", month: "short", day: "numeric", 
        timeZone:'UTC'})} às ${new Date(p.created_at).toLocaleTimeString('pt-BR', {hour:"numeric", minute:"numeric"})}`}
        clickdelete={() => {setModaldel({show:true, link:`${process.env.REACT_APP_API_URL}/pipeline/pvtec/${p.uuid}/`})}}
      >
        {!showForm.orientacoes &&
          <div className='my-2'>
            <CardTitle title='Orientações' click={handleEdit} field='orientacoes'/>
            <div className='text-justify'>
              {p.orientacoes}
            </div>
          </div>
        }
        <EditForm 
          onSubmit={(formData) => handleSubmit(formData, p.uuid)} 
          show={showForm['orientacoes']}
          fieldkey='orientacoes'
          setShow={setShowForm}
          data={p.orientacoes}
          pipe={card}
        />
        {!showForm.status &&
          <div className='my-2'>
            <CardTitle title='Status' click={handleEdit} field='status'/>
            <div>
              <span className={`badge bg-${p.status_display === 'Concluído' ? 'success' : 'warning'} fs--2 p-1`}>{p.status_display}</span>
            </div>
          </div>
        }
        <EditForm 
          onSubmit={(formData) => handleSubmit(formData, p.uuid)} 
          show={showForm['status']}
          fieldkey='status'
          setShow={setShowForm}
          data={p.status}
          pipe={card.pipe_code}
        />
        {!showForm.responsaveis &&
          <div className='my-2'>
            <CardTitle title='Responsáveis' click={handleEdit} field='responsaveis'/>
            <div>
              {p.list_responsaveis.map(r => r.nome).join(', ')}
            </div>
          </div>
        }
        <EditForm 
          onSubmit={(formData) => handleSubmit(formData, p.uuid)} 
          show={showForm['responsaveis']}
          fieldkey='responsaveis'
          setShow={setShowForm}
          data={p.list_responsaveis}
          pipe={card.pipe_code}
        />
        <div>
          <Anexos pvtec={p} />
        </div>
      </ExpandableCard>
    ) : 
    <div className='text-center mb-4'>
      <Spinner />
    </div> 
    }
    <ModalDelete show={modaldel.show} link={modaldel.link} update={handledelete} close={() => setModaldel({show:false})}/>
    </>
  );
};

export default indexAcompGAI;

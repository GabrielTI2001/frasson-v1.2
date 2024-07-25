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
import { Anexos } from './Anexos';
import EditForm from './EditForm';
import {CardTitle} from '../CardInfo';

const Cobrancas = ({card, updatedactivity, isgc}) => {
  const user = JSON.parse(localStorage.getItem('user'))
  const [users, setUsers] = useState([]);
  const [cobrancas, setCobrancas] = useState();
  const {config: {theme, isRTL}} = useAppContext();
  const token = localStorage.getItem("token")
  const [showmodal, setShowModal] = useState({show:false})
  const [modaldel, setModaldel] = useState({show:false})
  const [showForm, setShowForm] = useState({})

  const submit = (type, data) => {
    if (type === 'add'){
      setCobrancas([{...data, str_responsaveis:data.list_responsaveis.map(l => l.nome).join(', ')}, ...cobrancas])
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

    {cobrancas && cobrancas.filter(p => p.status === 'EA').length > 0 &&
      <span className='text-uppercase d-block' style={{fontWeight:'500'}}>
        Em Aberto ({cobrancas.filter(p => p.status === 'EA').length})
      </span>
    }
    {cobrancas && cobrancas.filter(p => p.status === 'EA').length > 0 ? cobrancas.filter(p => p.status === 'EA').map(p =>
      <ExpandableCard data={p} attr1='str_cliente' key={p.id} url='finances/revenues'
        footer={`Criado por ${p.str_created_by} em ${new Date(p.created_at).toLocaleDateString('pt-BR', {year:"numeric", month: "short", day: "numeric", 
        timeZone:'UTC'})} às ${new Date(p.created_at).toLocaleTimeString('pt-BR', {hour:"numeric", minute:"numeric"})}`}
        clickdelete={() => {setModaldel({show:true, link:`${process.env.REACT_APP_API_URL}/finances/revenues/${p.uuid}/`})}}
      >
        {!showForm.status &&
          <div className='my-2'>
            <CardTitle title='Status' click={handleEdit} field='status'/>
            <div>
              <span className={`badge bg-${p.status === 'P' ? 'success' : 'warning'} fs--2 p-1`}>
                {p.status === 'P' ? 'Paga' : 'Em Aberto'}
              </span>
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
        {/* <div>
          <Anexos pvtec={p} />
        </div> */}
      </ExpandableCard>
    ) : 
    <div className='text-center mb-4'>
      <Spinner />
    </div> 
    }

    {cobrancas && cobrancas.filter(p => p.status === 'P').length > 0 &&
      <span className='text-uppercase' style={{fontWeight:'500'}}>
        Pago ({cobrancas.filter(p => p.status === 'P').length})
      </span>
    }
    {cobrancas && cobrancas.filter(p => p.status === 'P').map(p =>
      <ExpandableCard data={p} attr1='atividade_display' key={p.id} url='finances/revenues'
        footer={`Criado em ${new Date(p.created_at).toLocaleDateString('pt-BR', {year:"numeric", month: "short", day: "numeric", 
        timeZone:'UTC'})} às ${new Date(p.created_at).toLocaleTimeString('pt-BR', {hour:"numeric", minute:"numeric"})}`}
        clickdelete={() => {setModaldel({show:true, link:`${process.env.REACT_APP_API_URL}/finances/revenues/${p.uuid}/`})}}
      >
        {!showForm.atividade &&
          <div className='my-2'>
            <CardTitle title='Atividade' click={handleEdit} field='atividade'/>
            <div>
              {p.atividade_display}
            </div>
          </div>
        }
        <EditForm 
          onSubmit={(formData) => handleSubmit(formData, p.uuid)} 
          show={showForm['atividade']}
          fieldkey='atividade'
          setShow={setShowForm}
          data={p.atividade}
          pipe={card.pipe_code}
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
            <CardTitle title='Responsáveis:' click={handleEdit} field='responsaveis'/>
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
        {/* <div>
          <Anexos pvtec={p} />
        </div> */}
      </ExpandableCard>
    )}
    <ModalDelete show={modaldel.show} link={modaldel.link} update={handledelete} close={() => setModaldel({show:false})}/>
    </>
  );
};

export default Cobrancas;

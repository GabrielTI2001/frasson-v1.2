import React, { useState, useEffect } from 'react';
import { CloseButton, Col, Modal, Row, Tab } from 'react-bootstrap';
import api from '../../../context/data.js';
import { GetRecord, HandleSearch } from '../../../helpers/Data.js';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAppContext } from '../../../Main.js';
import {CardTitle} from '../../Pipeline/CardInfo.js';
import { SkeletBig } from '../../../components/Custom/Skelet.js';
import NavModal, { NavModalPagamento } from './Nav.js';
import { RedirectToLogin } from '../../../Routes/PrivateRoute.js';
import { fieldsCobranca, fieldsPagamentos } from '../Data.js';
import EditFormModal from '../../../components/Custom/EditForm.js';
import ModalSidebarPagamentos, { ModalSidebarCobranca } from './ModalSidebar.js';
import SubtleBadge from '../../../components/common/SubtleBadge.js';
import ModalMediaContent from '../../Pipeline/ModalMediaContent.js';
import ModalActivityContent from '../../Pipeline/ModalActivityContent.js';
import ModalCommentContent from '../../Pipeline/ModalCommentContent.js';
import { DropMenu, DropMenuPagamento } from './Menu.js';

const ModalRecord = ({show, reducer}) => {
  const [showForm, setShowForm] = useState({});
  const navigate = useNavigate()
  const token = localStorage.getItem("token")
  const {uuid} = useParams()
  const [record, setRecord] = useState();
  const {config: {theme}} = useAppContext();
  const [activeTab, setActiveTab] = useState('main');
  const [activities, setActivities] = useState();
  const fields = record && (record.status === 'AG' || record.status === 'PG' ? fieldsCobranca : fieldsCobranca.slice(0, 6))

  const handleClose = () => {
    navigate('/finances/revenues')
    setRecord(null)
    setActivities(null)
  };

  const handleTabSelect = async (key) => {
    setActiveTab(key)
  }

  useEffect(() =>{
    const getData = async () =>{
      const reg = await GetRecord(uuid, 'finances/revenues')
      if (!reg){
        handleClose()
        RedirectToLogin(navigate)
      }
      else{
        if (Object.keys(reg).length === 0){
          handleClose()
          navigate("/error/404")
        }
        setRecord(reg)
        if (!activities){
          HandleSearch('', 'finances/activities',(data) => {setActivities(data)}, `?cobranca=${reg.id}`)
        }
      }
    }
    if(show && uuid && !record){getData()}
  }, [show])

  const handleEdit = (key) =>{
    setShowForm(prevState => ({
      ...prevState,
      [key]: !prevState[key]
    }));
  }

  const handleSubmit = (formData) =>{
    if (formData){
      api.put(`finances/revenues/${uuid}/`, formData, {headers: {Authorization: `Bearer ${token}`}})
      .then((response) => {
        reducer('edit', {...response.data, data:response.data.data_pagamento || response.data.data_vencimento})
        toast.success("Cobrança Atualizada com Sucesso!")
        setRecord(response.data)
        setShowForm({})
        if (response.data.activity){
          setActivities([response.data.activity, ...activities])
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

  return (
    <Modal
      show={show}
      onHide={handleClose}
      size='lm'
      contentClassName="border-0"
      dialogClassName="mt-2 modal-custom modal-xl mb-0"
    >
      <div className="position-absolute d-flex top-0 end-0 mt-1 me-1" style={{ zIndex: 1000 }}>
        <DropMenu record={record} reducer={reducer}/>
        <CloseButton
          onClick={handleClose}
          className="btn btn-sm btn-circle d-flex flex-center transition-base ms-2"
        />
      </div>
      <Modal.Body className="pt-2">
        <Row className='p-2 gy-1'>
          <Col className='border-1 px-0 overflow-auto modal-column-scroll pe-2' id='infocard' lg={5}>
            {record ? <>
              <div className="rounded-top-lg pt-1 pb-0 ps-3 mb-3">
                <h4 className="mb-1 fs-1 fw-bold">{record.str_cliente}</h4>
                <h6 className="mb-1 fs--1 fw-bold">{record.str_cpf_cnpj}</h6>
              </div>
              <Tab.Container id="left-tabs-example" defaultActiveKey="main" onSelect={handleTabSelect}>
                <div className='ms-3 my-2'>
                  <NavModal record={record} />
                </div>
                <div className='ms-3 mt-3'>
                  <Tab.Content>
                    <Tab.Pane eventKey="main">
                      <h5 className="mb-0 fs-0 fw-bold">Informações da Cobrança</h5>
                      <div className='text-secondary fs--2 mb-2'>Criado por {record.str_created_by} em {' '}
                        {new Date(record.created_at).toLocaleDateString('pt-BR', {year:"numeric", month: "short", day: "numeric", timeZone: 'UTC'})}
                        {' às '+new Date(record.created_at).toLocaleTimeString('pt-BR', {hour:"numeric", minute:"numeric"})}
                      </div>

                      {(record.etapa_ambiental || record.etapa_credito) && 
                        <>
                          <CardTitle title={'Detalhamento do Contrato'}/>
                          <div className="fs--1 row-10 mb-1">{record.str_detalhe || '-'}</div>
                          <CardTitle title={'Cliente do Contrato'}/>
                          <div className="fs--1 row-10 mb-1">{record.str_cliente || '-'}</div>
                          <CardTitle title={'Valor no Contrato'}/>
                          <div className="fs--1 row-10 mb-1">{Number(record.saldo_devedor).toLocaleString('pt-BR', {minimumFractionDigits:2}) || '-'}</div>
                        </> 
                      }
                      {fields.filter(f => (record.etapa_ambiental || record.etapa_credito) 
                       ? !['detalhamento', 'cliente', 'saldo_devedor'].some(l => l === f.name): f).map(f => 
                        !showForm[f.name] ?
                          <div className="rounded-top-lg pt-1 pb-0 mb-2" key={f.name}>
                            <CardTitle title={f.label.replace('*','')} field={f.name} click={handleEdit}/>
                            {f.type === 'select' ?
                              <div className="fs--1 row-10">{record[f.string] || '-'}</div>
                            : f.type === 'select2' ?
                              f.string ?
                                <div className="fs--1 row-10">{record[f.string] || '-'}</div>
                              :
                                <div className="fs--1 row-10">{record[f.data] && record[f.data][f.attr_data]}</div>
                            : f.type === 'date' ? 
                              <div className="fs--1 row-10">{record[f.name] ? new Date(record[f.name]).toLocaleDateString('pt-BR', {timeZone:'UTC'}) : '-'}</div>
                            : 
                              <div className="fs--1 row-10">{record[f.name] ? f.is_number 
                                ? Number(record[f.name]).toLocaleString('pt-BR', {minimumFractionDigits:2}) 
                                : record[f.name] : '-'}
                              </div>
                            }
                          </div>
                        :
                          <EditFormModal key={f.name}
                            onSubmit={(formData) => handleSubmit(formData, record.uuid)} 
                            show={showForm[f.name]} fieldkey={f.name} setShow={setShowForm} 
                            record={record} field={f}
                          />
                      )}
                    </Tab.Pane>
                    <Tab.Pane eventKey="comments">
                      <ModalMediaContent title='Comentários'> 
                        {activeTab === 'comments' &&
                          <ModalCommentContent card={record} updatedactivity={(a) => setActivities([a, ...activities])}
                            link='finances/comments' param={'cobranca'}
                          />
                        }
                      </ModalMediaContent>
                    </Tab.Pane>
                  </Tab.Content>
                </div>
              </Tab.Container></>
            : uuid &&
              <SkeletBig />
            }
            
          </Col>
          <Col lg={4} className='overflow-auto modal-column-scroll border border-bottom-0 border-top-0'>
            {record ? <>
              <div className="rounded-top-lg pt-1 pb-0 mb-2">
                <span className="mb-1 fs-0 fw-bold d-inline-block me-2">Status</span>
                <SubtleBadge bg={`${record.status === 'AD' ? 'warning' : 'success'}`}>{record.str_status}</SubtleBadge>
              </div>
              <ModalMediaContent title='Atividades'>
                <ModalActivityContent card={record} atividades={activities}/>
              </ModalMediaContent>
              </>
            : uuid &&
              <SkeletBig />
            }
          </Col>
          <Col lg={3} className='mb-1 overflow-auto modal-column-scroll actionscard'>
            {record ?
              <ModalSidebarCobranca card={record} reducer={(type, data) => {reducer(type, data); setRecord(null); setActivities(null)}}/>
            : uuid &&
              <SkeletBig />
            }
          </Col>
        </Row>
      </Modal.Body>
    </Modal>
  );
}

export default ModalRecord;

export const ModalPagamento = ({show, reducer}) => {
  const [showForm, setShowForm] = useState({});
  const navigate = useNavigate()
  const token = localStorage.getItem("token")
  const {uuid} = useParams()
  const [record, setRecord] = useState();
  const {config: {theme}} = useAppContext();
  const [activeTab, setActiveTab] = useState('main');
  const [activities, setActivities] = useState();
  const fields = record && (record.status !== 'AD' ? fieldsPagamentos : fieldsPagamentos.slice(0, 7))

  const handleClose = () => {
    navigate('/finances/billings')
    setRecord(null)
    setActivities(null)
  };

  const handleTabSelect = async (key) => {
    setActiveTab(key)
  }

  useEffect(() =>{
    const getData = async () =>{
      const reg = await GetRecord(uuid, 'finances/billings')
      if (!reg){
        handleClose()
        RedirectToLogin(navigate)
      }
      else{
        if (Object.keys(reg).length === 0){
          handleClose()
          navigate("/error/404")
        }
        setRecord(reg)
        if (!activities){
          HandleSearch('', 'finances/activities',(data) => {setActivities(data)}, `?pagamento=${reg.id}`)
        }
      }
    }
    if(show && uuid && !record){getData()}
  }, [show])

  const handleEdit = (key) =>{
    setShowForm(prevState => ({
      ...prevState,
      [key]: !prevState[key]
    }));
  }

  const handleSubmit = (formData) =>{
    if (formData){
      api.put(`finances/billings/${uuid}/`, formData, {headers: {Authorization: `Bearer ${token}`}})
      .then((response) => {
        reducer('edit', {...response.data, data:response.data.data_pagamento || response.data.data_vencimento})
        toast.success("Pagamento Atualizado com Sucesso!")
        setRecord(response.data)
        setShowForm({})
        if (response.data.activity){
          setActivities([response.data.activity, ...activities])
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

  return (
    <Modal
      show={show}
      onHide={handleClose}
      size='lm'
      contentClassName="border-0"
      dialogClassName="mt-2 modal-custom modal-xl mb-0"
    >
      <div className="position-absolute d-flex top-0 end-0 mt-1 me-1" style={{ zIndex: 1000 }}>
        <DropMenuPagamento record={record} reducer={reducer}/>
        <CloseButton
          onClick={handleClose}
          className="btn btn-sm btn-circle d-flex flex-center transition-base ms-2"
        />
      </div>
      <Modal.Body className="pt-2">
        <Row className='p-2 gy-1'>
          <Col className='border-1 px-0 overflow-auto modal-column-scroll pe-2' id='infocard' lg={5}>
            {record ? <>
              <div className="rounded-top-lg pt-1 pb-0 ps-3 mb-3">
                <h4 className="mb-1 fs-1 fw-bold">{record.str_beneficiario}</h4>
                <h6 className="mb-1 fs--1 fw-bold">{record.str_cpf_cnpj}</h6>
              </div>
              <Tab.Container id="left-tabs-example" defaultActiveKey="main" onSelect={handleTabSelect}>
                <div className='ms-3 my-2'>
                  <NavModalPagamento record={record} />
                </div>
                <div className='ms-3 mt-3'>
                  <Tab.Content>
                    <Tab.Pane eventKey="main">
                      <h5 className="mb-0 fs-0 fw-bold">Informações do Pagamento</h5>
                      <div className='text-secondary fs--2 mb-2'>Criado por {record.str_created_by} em {' '}
                        {new Date(record.created_at).toLocaleDateString('pt-BR', {year:"numeric", month: "short", day: "numeric", timeZone: 'UTC'})}
                        {' às '+new Date(record.created_at).toLocaleTimeString('pt-BR', {hour:"numeric", minute:"numeric"})}
                      </div>

                      {(record.etapa_ambiental || record.etapa_credito) && 
                        <>
                          <CardTitle title={'Detalhamento do Contrato'}/>
                          <div className="fs--1 row-10">{record.str_detalhe || '-'}</div>
                        </> 
                      }
                      {fields.map(f => 
                        !showForm[f.name] ?
                          <div className="rounded-top-lg pt-1 pb-0 mb-2" key={f.name}>
                            <CardTitle title={f.label.replace('*','')} field={f.name} click={handleEdit}/>
                            {f.type === 'select' ?
                              <div className="fs--1 row-10">{record[f.string] || '-'}</div>
                            : f.type === 'select2' ?
                              f.string ?
                                <div className="fs--1 row-10">{record[f.string] || '-'}</div>
                              :
                                <div className="fs--1 row-10">{record[f.data] && record[f.data][f.attr_data]}</div>
                            : f.type === 'date' ? 
                              <div className="fs--1 row-10">{record[f.name] ? new Date(record[f.name]).toLocaleDateString('pt-BR', {timeZone:'UTC'}) : '-'}</div>
                            : 
                              <div className="fs--1 row-10">{record[f.name] ? f.is_number 
                                ? Number(record[f.name]).toLocaleString('pt-BR', {minimumFractionDigits:2}) 
                                : record[f.name] : '-'}
                              </div>
                            }
                          </div>
                        :
                          <EditFormModal key={f.name}
                            onSubmit={(formData) => handleSubmit(formData, record.uuid)} 
                            show={showForm[f.name]} fieldkey={f.name} setShow={setShowForm} 
                            record={record} field={f}
                          />
                      )}
                    </Tab.Pane>
                    <Tab.Pane eventKey="comments">
                      <ModalMediaContent title='Comentários'> 
                        {activeTab === 'comments' &&
                          <ModalCommentContent card={record} updatedactivity={(a) => setActivities([a, ...activities])}
                            link='finances/comments' param={'pagamento'}
                          />
                        }
                      </ModalMediaContent>
                    </Tab.Pane>
                  </Tab.Content>
                </div>
              </Tab.Container></>
            : uuid &&
              <SkeletBig />
            }
            
          </Col>
          <Col lg={4} className='overflow-auto modal-column-scroll border border-bottom-0 border-top-0'>
            {record ? <>
              <div className="rounded-top-lg pt-1 pb-0 mb-2">
                <span className="mb-1 fs-0 fw-bold d-inline-block me-2">Status</span>
                <SubtleBadge bg={`${record.status === 'AD' ? 'warning' : 'success'}`}>{record.str_status}</SubtleBadge>
              </div>
              <ModalMediaContent title='Atividades'>
                <ModalActivityContent card={record} atividades={activities}/>
              </ModalMediaContent>
              </>
            : uuid &&
              <SkeletBig />
            }
          </Col>
          <Col lg={3} className='mb-1 overflow-auto modal-column-scroll actionscard'>
            {record ?
              <ModalSidebarPagamentos card={record} reducer={(type, data) => {reducer(type, data); setRecord(null); setActivities(null)}}/>
            : uuid &&
              <SkeletBig />
            }
          </Col>
        </Row>
      </Modal.Body>
    </Modal>
  );
}

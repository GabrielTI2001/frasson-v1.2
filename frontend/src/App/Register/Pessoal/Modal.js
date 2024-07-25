import React, { useState, useEffect } from 'react';
import { CloseButton, Col, Modal, Row, Tab } from 'react-bootstrap';
import ModalMediaContent from '../../Pipeline/ModalMediaContent.js';
import api from '../../../context/data.js';
import { GetRecord, SelectOptions } from '../../../helpers/Data.js';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import {CardTitle} from '../../Pipeline/CardInfo.js';
import { DropMenu } from './Menu.js';
import { SkeletBig } from '../../../components/Custom/Skelet.js';
import Avatar from '../../../components/common/Avatar.js';
import NavModal from './Nav.js'
import ListContas from './ListContas.js';
import ListProcessos from './ListProcessos.js';
import ListOperacoes from './ListOperacoes.js';
import { fieldsPessoal } from '../Data.js';
import EditFormModal from '../../../components/Custom/EditForm.js';

const ModalPessoal = ({show, reducer}) => {
  const [showForm, setShowForm] = useState({});
  const navigate = useNavigate()
  const token = localStorage.getItem("token")
  const {uuid} = useParams()
  const [record, setRecord] = useState();
  const [message, setMessage] = useState();
  const [activeTab, setActiveTab] = useState('main');
  const [categorias, setCategorias] = useState([]);

  const handleClose = () => {
    navigate('/register/pessoal')
    setRecord(null)
  };
  const handleTabSelect = async (key) => {
    setActiveTab(key)
  }
  const calcIdade = (data_nasc) =>{
    const idade = new Date() - new Date(data_nasc)
    return Math.floor(idade/((1000 * 3600 * 24 * 365)))
  }

  useEffect(() =>{
    const getData = async () =>{
      const reg = await GetRecord(uuid, 'register/pessoal')
      const cat = await SelectOptions('register/categorias-cadastro', 'categoria')
      setCategorias(cat)
      if (!reg){
        handleClose()
        navigate("/auth/login")
      }
      else{
        if (Object.keys(reg).length === 0){
          handleClose()
          navigate("/error/404")
        }
        setRecord(reg)
      }
    }
    if(show && uuid){getData()}
  }, [show])

  const handleEdit = (key) =>{
    setShowForm(prevState => ({
      ...prevState,
      [key]: !prevState[key]
    }));
  }

  const handleSubmit = (formData) =>{
    const formDataToSend = new FormData();
    for (const key in formData) {
      if (Array.isArray(formData[key])) {
        formData[key].forEach(value => {
          formDataToSend.append(key, value);
        });
      }
      else{
        formDataToSend.append(key, formData[key]);
      }
    }
    if (formData){
      api.put(`register/pessoal/${uuid}/`, formDataToSend, {headers: {Authorization: `Bearer ${token}`}})
      .then((response) => {
        reducer('edit', response.data)
        toast.success("Cadastro Atualizado com Sucesso!")
        setShowForm({})
        setRecord(response.data)
        setMessage()
      })
      .catch((erro) => {
        if (erro.response.status === 400){
          toast.error(erro.response.data.non_fields_errors, {autoClose:4000})
          setMessage(erro.response.data)
        }
        if (erro.response.status === 401){
          localStorage.setItem("login", JSON.stringify(false));
          localStorage.setItem('token', "");
          navigate("/auth/login")
        }
        console.error('erro: '+erro);
      })
    }
  }

  return (
    <Modal
      show={show}
      onHide={handleClose}
      contentClassName="border-0"
      dialogClassName="mt-2 modal-custom modal-lm mb-0"
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
          <Col className='border-1 px-0 overflow-auto modal-column-scroll pe-2' id='infocard' lg={6}>
            {record ? <>
              <div className="rounded-top-lg pt-1 pb-0 ps-3 mb-2">
                <h4 className="mb-1 fs-1 fw-bold">{record.razao_social}</h4>
              </div>
              <Tab.Container id="left-tabs-example" defaultActiveKey="main" onSelect={handleTabSelect}>
                <div className='ms-3 my-2'>
                  <NavModal record={record} />
                </div>
                <div className='ms-3 mt-2'>
                  <Tab.Content>
                    <Tab.Pane eventKey="main">
                      <h5 className="mb-0 fs-0 fw-bold">Informações da Pessoa</h5>
                      <div className='text-secondary fs--2 mb-2'>Criado por {record.str_created_by} em {' '}
                        {new Date(record.created_at).toLocaleDateString('pt-BR', {year:"numeric", month: "short", day: "numeric", timeZone: 'UTC'})}
                        {' às '+new Date(record.created_at).toLocaleTimeString('pt-BR', {hour:"numeric", minute:"numeric"})}
                      </div>

                      <Avatar src={`${process.env.REACT_APP_API_URL}/media/avatars/clients/default-avatar.jpg`} size={'3xl'}/>
                      {fieldsPessoal.map(f => 
                          !showForm[f.name] ?
                            <div className="rounded-top-lg pt-1 pb-0 mb-2" key={f.name}>
                              <CardTitle title={f.label.replace('*','')} field={f.name} click={handleEdit}/>
                              {f.type === 'select' ? (
                                f.boolean 
                                  ? <div className="fs--1 row-10">{record[f.name] === true ? 'Sim' : 'Não'}</div>
                                  : <div className="fs--1 row-10">{record[f.string] || '-'}</div>
                                )
                              : f.type === 'select2' ? f.ismulti ? 
                                  <div className="fs--1 row-10">{f.list.map(l => l[f.string]).join(', ')}</div>
                                : 
                                f.string ?
                                  <div className="fs--1 row-10">{record[f.string] || '-'}</div>
                                :
                                  <div className="fs--1 row-10">{record[f.data] && record[f.data][f.attr_data] || '-'}</div>
                              : f.type === 'date' ? 
                                <div className="fs--1 row-10">
                                  {record[f.name] ? new Date(record[f.name]).toLocaleDateString('pt-BR', {timeZone:'UTC'})+
                                    ` (${calcIdade(record[f.name])} anos)` : '-'
                                  }
                                </div>
                              : f.type === 'file' ? <div className="fs--1 row-10"></div>
                              : 
                                <div className="fs--1 row-10">{record[f.name] || '-'}</div>}
                            </div>
                            :
                            <EditFormModal key={f.name}
                              onSubmit={(formData) => handleSubmit(formData, record.uuid)} 
                              show={showForm[f.name]} fieldkey={f.name} setShow={setShowForm} 
                              record={record} field={f} options={{categoria:categorias}}
                            />
                        )}

                    </Tab.Pane>
                    <Tab.Pane eventKey="processos">
                      {activeTab === 'processos' && 
                        <ModalMediaContent title='Processos'>
                          <ListProcessos record={record} />
                        </ModalMediaContent>
                      }
                    </Tab.Pane>
                    <Tab.Pane eventKey="operacoes">
                      {activeTab === 'operacoes' && 
                        <ModalMediaContent title='Operações de Crédito'>
                            <ListOperacoes record={record}/>
                        </ModalMediaContent>
                      }
                    </Tab.Pane>
                    <Tab.Pane eventKey="contas">
                        <ModalMediaContent title='Contas Bancárias'>
                          <ListContas contas={record.contas_bancarias}/>
                        </ModalMediaContent>
                    </Tab.Pane>
                  </Tab.Content>
                </div>
              </Tab.Container></>
            : uuid &&
              <SkeletBig />
            }
            
          </Col>
          <Col lg={6} className='overflow-auto modal-column-scroll border border-bottom-0 border-top-0 border-end-0'>
            {record ? <>
              <div className="rounded-top-lg pt-1 pb-0 mb-2">
                <span className="mb-1 fs-1 fw-bold d-inline-block me-2">-</span>
              </div>
              </>
            : uuid &&
              <SkeletBig />
            }
          </Col>
        </Row>
      </Modal.Body>
    </Modal>
  );
}

export default ModalPessoal;

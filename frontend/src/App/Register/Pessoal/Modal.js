import React, { useState, useEffect } from 'react';
import { CloseButton, Col, Modal, Row, Tab } from 'react-bootstrap';
import ModalMediaContent from '../../Pipeline/ModalMediaContent.js';
import api from '../../../context/data.js';
import { GetRecord } from '../../../helpers/Data.js';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import {CardTitle} from '../../Pipeline/CardInfo.js';
import { DropMenu } from './Menu.js';
import { SkeletBig } from '../../../components/Custom/Skelet.js';
import EditForm from './EditForm.js';
import Avatar from '../../../components/common/Avatar.js';
import NavModal from './Nav.js'
import ListContas from './ListContas.js';
import ListProcessos from './ListProcessos.js';
import ListOperacoes from './ListOperacoes.js';

const ModalPessoal = ({show, reducer}) => {
  const [showForm, setShowForm] = useState({'card':false,'data':false,'beneficiario':false, 
    'detalhamento': false, 'instituicao': false, 'others':false});
  const navigate = useNavigate()
  const token = localStorage.getItem("token")
  const {uuid} = useParams()
  const [record, setRecord] = useState();
  const [message, setMessage] = useState();
  const [activeTab, setActiveTab] = useState('main');

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
      api.put(`register/pessoal/${uuid}/`, formDataToSend, {headers: {Authorization: `bearer ${token}`}})
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
                      {!showForm.cpf_cnpj ?
                        <div className="rounded-top-lg pt-1 pb-0 mb-2">
                          <CardTitle title='CPF/CNPJ' field='cpf_cnpj' click={handleEdit}/>
                          <div className="fs--1 row-10">{record.cpf_cnpj}</div>
                        </div>
                        :
                        <EditForm 
                          onSubmit={(formData) => handleSubmit(formData, record.uuid)} 
                          show={showForm['cpf_cnpj']} fieldkey='cpf_cnpj' setShow={setShowForm} data={record.cpf_cnpj}
                        />
                      }
                      {!showForm.numero_rg ?
                        <div className="rounded-top-lg pt-1 pb-0 mb-2">
                          <CardTitle title='RG' field='numero_rg' click={handleEdit}/>
                          <div className="fs--1 row-10">{record.numero_rg || '-'}</div>
                        </div>
                        :
                        <EditForm 
                          onSubmit={(formData) => handleSubmit(formData, record.uuid)} 
                          show={showForm['numero_rg']} fieldkey='numero_rg' setShow={setShowForm} data={record.numero_rg}
                        />
                      }

                      {!showForm.logradouro ?
                        <div className="rounded-top-lg pt-1 pb-0 mb-2">
                          <CardTitle title='Logradouro' field='logradouro' click={handleEdit}/>
                          <div className="fs--1 row-10">{record.logradouro || '-'}</div>
                        </div>
                        :
                        <EditForm 
                          onSubmit={(formData) => handleSubmit(formData, record.uuid)} 
                          show={showForm['logradouro']} fieldkey='logradouro' setShow={setShowForm} data={record.logradouro}
                        />
                      }
                      {!showForm.municipio ?
                        <div className="rounded-top-lg pt-1 pb-0 mb-2">
                          <CardTitle title='Município' field='municipio' click={handleEdit}/>
                          <div className="fs--1 row-10">{record.str_municipio || '-'}</div>
                        </div>
                        :
                        <EditForm 
                          onSubmit={(formData) => handleSubmit(formData, record.uuid)} 
                          show={showForm['municipio']} fieldkey='municipio' setShow={setShowForm} 
                          data={{value: record.municipio, label:record.str_municipio}}
                        />
                      }
                      {!showForm.cep_logradouro ?
                        <div className="rounded-top-lg pt-1 pb-0 mb-2">
                          <CardTitle title='CEP' field='cep_logradouro' click={handleEdit}/>
                          <div className="fs--1 row-10">{record.cep_logradouro || '-'}</div>
                        </div>
                        :
                        <EditForm 
                          onSubmit={(formData) => handleSubmit(formData, record.uuid)} 
                          show={showForm['cep_logradouro']} fieldkey='cep_logradouro' setShow={setShowForm} data={record.cep_logradouro}
                        />
                      }
                      {!showForm.data_nascimento ?
                        <div className="rounded-top-lg pt-1 pb-0 mb-2">
                          <CardTitle title='Data Nascimento' field='data_nascimento' click={handleEdit}/>
                          <div className="fs--1 row-10">{record.data_nascimento ? 
                            `${new Date(record.data_nascimento).toLocaleDateString('pt-BR', {timeZone: 'UTC'})} (${calcIdade(record.data_nascimento)} anos)` 
                            : '-'}
                          </div>
                        </div>
                        :
                        <EditForm 
                          onSubmit={(formData) => handleSubmit(formData, record.uuid)} 
                          show={showForm['data_nascimento']} fieldkey='data_nascimento' setShow={setShowForm} data={record.data_nascimento}
                        />
                      }
                      {!showForm.grupo ?
                        <div className="rounded-top-lg pt-1 pb-0 mb-2">
                          <CardTitle title='Grupo' field='grupo' click={handleEdit}/>
                          <div className="fs--1 row-10">{record.grupo_info || '-'}</div>
                        </div>
                        :
                        <EditForm 
                          onSubmit={(formData) => handleSubmit(formData, record.uuid)} 
                          show={showForm['grupo']} fieldkey='grupo' setShow={setShowForm} 
                          data={{value:record.grupo, label:record.grupo_info}}
                        />
                      }

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

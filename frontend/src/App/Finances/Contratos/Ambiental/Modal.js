import React, { useState, useContext, useEffect } from 'react';
import { CloseButton, Col, Dropdown, Modal, Nav, Row, Tab } from 'react-bootstrap';
import ModalMediaContent from '../../../Pipeline/ModalMediaContent.js';
import api from '../../../../context/data.js';
import { GetRecord, HandleSearch } from '../../../../helpers/Data.js';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import SubtleBadge from '../../../../components/common/SubtleBadge.js';
import { useAppContext } from '../../../../Main.js';
import CardInfo, {CardTitle} from '../../../Pipeline/CardInfo.js';
import { DropMenu } from './Menu.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBolt, faCalendar } from '@fortawesome/free-solid-svg-icons';
import { SkeletBig } from '../../../../components/Custom/Skelet.js';
import NavContract from '../Nav.js';
import EditForm from '../EditForm.js';
import Etapas, { Processos } from '../Etapas.js';
import { Anexos } from '../../Anexos.js';
import ModalActivityContent from '../../../Pipeline/ModalActivityContent.js';
import { RedirectToLogin } from '../../../../Routes/PrivateRoute.js';

const options = {
  month: "short",
  day: "numeric",
  timeZone: 'UTC'
};

const ModalContract = ({show, reducer}) => {
  const [showForm, setShowForm] = useState({'card':false,'data':false,'beneficiario':false, 
    'detalhamento': false, 'instituicao': false, 'others':false});
  const navigate = useNavigate()
  const token = localStorage.getItem("token")
  const {uuid} = useParams()
  const [record, setRecord] = useState();
  const {config: {theme}} = useAppContext();
  const [message, setMessage] = useState();
  const [activities, setActivities] = useState();
  const [activeTab, setActiveTab] = useState('main');

  const handleClose = () => {
    navigate('/finances/contracts/environmental/')
    setRecord(null)
    setActivities(null)
  };

  const handleTabSelect = async (key) => {
    setActiveTab(key)
  }

  useEffect(() =>{
    const getData = async () =>{
      const reg = await GetRecord(uuid, 'finances/contratos-ambiental')
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
          HandleSearch('', 'finances/activities',(data) => {setActivities(data)}, `?contratogai=${reg.id}`)
        }
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
      if (key === 'servicos_etapas') {
        let valor_total = 0
        formData[key].forEach(value => {
          const filtered = {...value, dados:value.dados.filter(v => v.percentual !== '')}
          valor_total+= Number(filtered.valor)
          formDataToSend.append(`${key}`, JSON.stringify(filtered));
        });
        formDataToSend.append('valor', valor_total)
      } 
      else {
        if (Array.isArray(formData[key])) {
          formData[key].forEach(value => {
            formDataToSend.append(key, value);
          });
        }
        else{
          formDataToSend.append(key, formData[key]);
        }
      }
    }
    if (formData){
      api.put(`finances/contratos-ambiental/${uuid}/`, formDataToSend, {headers: {Authorization: `Bearer ${token}`}})
      .then((response) => {
        reducer('edit', {...response.data, info_status:
          {color:response.data.status === 'EA' ? 'warning' : 'success', text:response.data.status_display}
        })
        toast.success("Contrato Atualizado com Sucesso!")
        setShowForm({})
        setRecord(response.data)
        if (response.data.activity){
          setActivities([response.data.activity, ...activities])
        }
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
          RedirectToLogin(navigate)
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
                <h4 className="mb-1 fs-1 fw-bold">{record.info_contratante.label}</h4>
              </div>
              <Tab.Container id="left-tabs-example" defaultActiveKey="main" onSelect={handleTabSelect}>
                <div className='ms-3 my-2'>
                  <NavContract record={record} />
                </div>
                <div className='ms-3 mt-2'>
                  <Tab.Content>
                    <Tab.Pane eventKey="main">
                      <h5 className="mb-0 fs-0 fw-bold">Informações do Contrato</h5>
                      <div className='text-secondary fs--2'>Criado por {record.str_created_by} em {' '}
                        {new Date(record.created_at).toLocaleDateString('pt-BR', {year:"numeric", month: "short", day: "numeric", timeZone: 'UTC'})}
                        {' às '+new Date(record.created_at).toLocaleTimeString('pt-BR', {hour:"numeric", minute:"numeric"})}
                      </div>

                      <div className="rounded-top-lg pt-1 pb-0 mb-2">
                        <CardTitle title='Produto de Origem'/>
                        <div className="fs--1 row-10">{record.str_produtos}</div>
                      </div>

                      {!showForm.contratante ?
                        <div className="rounded-top-lg pt-1 pb-0 mb-2">
                          <CardTitle title='Contratante' field='contratante' click={handleEdit}/>
                          <CardInfo data={record.info_contratante} attr1='label' attr2='cpf_cnpj' url='register/pessoal'/>
                        </div>
                        :
                        <EditForm 
                          onSubmit={(formData) => handleSubmit(formData, record.uuid)} 
                          show={showForm['contratante']}
                          fieldkey='contratante'
                          setShow={setShowForm}
                          data={record.info_contratante}
                        />
                      }

                      {!showForm.servicos ?
                        <div className="rounded-top-lg pt-1 pb-0 mb-2">
                          <CardTitle title='Serviços' field='servicos' click={handleEdit}/>
                          {record.list_servicos.map ((s) =>
                            <CardInfo data={s} attr1='label' attr2='produto' key={s.value}/>
                          )}
                        </div>
                        :
                        <EditForm 
                          onSubmit={(formData) => handleSubmit(formData, record.uuid)} 
                          show={showForm['servicos']}
                          fieldkey='servicos'
                          setShow={(data) => {setShowForm(data); setMessage()}}
                          data={record.list_servicos}
                          contrato={record}
                        />
                      }
                      {message && <label className='text-danger'>{message.servicos}</label>}

                      <div className="rounded-top-lg pt-1 pb-0 mb-2">
                        <CardTitle title='Valor do Contrato'/>
                        <div className="fs--1 row-10">{Number(record.valor).toLocaleString('pt-BR', {style:'currency', currency:'BRL'})}</div>
                      </div>
                      
                      {!showForm.data_assinatura ?
                        <div className="rounded-top-lg pt-1 pb-0 mb-2">
                          <CardTitle title='Data Assinatura' field='data_assinatura' click={handleEdit}/>
                          <div className="fs--1 row-10">{new Date(record.data_assinatura).toLocaleDateString('pt-BR', {timeZone:'UTC'})}</div>
                        </div>
                        :
                        <EditForm 
                          onSubmit={(formData) => handleSubmit(formData, record.uuid)} 
                          show={showForm['data_assinatura']}
                          fieldkey='data_assinatura'
                          setShow={setShowForm}
                          data={record.data_assinatura}
                        />
                      }

                      {!showForm.detalhes ?
                        <div className="rounded-top-lg pt-1 pb-0 mb-2">
                          <CardTitle title='Detalhes Negociação' field='detalhes' click={handleEdit}/>
                          <div className="fs--1 row-10">{record.detalhes || '-'}</div>
                        </div>
                        :
                        <EditForm 
                          onSubmit={(formData) => handleSubmit(formData, record.uuid)} 
                          show={showForm['detalhes']}
                          fieldkey='detalhes'
                          setShow={setShowForm}
                          data={record.detalhes}
                        />
                      }
                      <div>
                        <strong className='fs--1'>Outras Ações</strong>
                        {record.etapas.length > 0 && (record.valor || record.percentual) ?
                            <div className='mt-1'>
                                <Link className='btn btn-sm btn-success py-0 fs--2' 
                                    to={`${process.env.REACT_APP_API_URL}/finances/contracts-pdf/${record.uuid}`}
                                ><FontAwesomeIcon icon={faBolt} className='me-1' />Gerar Contrato</Link>
                            </div>
                        : <div className='text-primary mt-1'>Nenhuma Ação disponível</div>
                        }
                      </div>
                    </Tab.Pane>
                    <Tab.Pane eventKey="anexo">
                      {activeTab === "anexo" && 
                        <ModalMediaContent title='Anexos do Contrato'>
                          <Anexos isgai record={record} updatedactivity={(a) => setActivities([a, ...activities])}/>
                        </ModalMediaContent>
                      }
                    </Tab.Pane>
                    <Tab.Pane eventKey="formas_pagamento">
                        <ModalMediaContent title='Etapas de Pagamento do Contrato'>
                            <Etapas etapas={record.etapas} servicos={record.list_servicos} contrato={record}/>
                        </ModalMediaContent>
                    </Tab.Pane>
                    <Tab.Pane eventKey="processos_vinculados">
                        <ModalMediaContent title='Processos vinculados a este contrato'>
                            <Processos processos={record.list_processos} />
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
                <span className="mb-1 fs-1 fw-bold d-inline-block me-2">Status</span>
                <SubtleBadge>Em Andamento</SubtleBadge>
                <ModalMediaContent title='Atividades'>
                    <ModalActivityContent atividades={activities}/>
                </ModalMediaContent>
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

export default ModalContract;

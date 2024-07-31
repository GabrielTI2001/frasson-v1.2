import React, { useState, useContext, useEffect } from 'react';
import { CloseButton, Col, Dropdown, Modal, Nav, Row, Tab } from 'react-bootstrap';
import ModalMediaContent from '../../Pipeline/ModalMediaContent.js';
import api from '../../../context/data.js';
import { GetRecord, HandleSearch } from '../../../helpers/Data.js';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import SubtleBadge from '../../../components/common/SubtleBadge.js';
import { useAppContext } from '../../../Main.js';
import CardInfo, {CardTitle} from '../../Pipeline/CardInfo.js';
import { DropMenu } from './Menu.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendar } from '@fortawesome/free-solid-svg-icons';
import { SkeletBig } from '../../../components/Custom/Skelet.js';
import NavPVTEC from './Nav.js';
import EditForm from '../../Pipeline/PVTEC/EditForm.js';
import { Anexos } from '../../Pipeline/Anexos.js';
import ModalActivityContent from '../../Pipeline/ModalActivityContent.js';
import ModalCommentContent from '../../Pipeline/ModalCommentContent.js';
import ModalSidebar from './ModalSidebar.js';
import { RedirectToLogin } from '../../../Routes/PrivateRoute.js';

const options = {
  month: "short",
  day: "numeric",
  timeZone: 'UTC'
};

const PVTECModal = ({show, reducer}) => {
  const [showForm, setShowForm] = useState({});
  const navigate = useNavigate()
  const token = localStorage.getItem("token")
  const {uuid} = useParams()
  const [record, setRecord] = useState();
  const [activities, setActivities] = useState();
  const {config: {theme}} = useAppContext();
  const [activeTab, setActiveTab] = useState('processo');

  const handleClose = () => {
    navigate('/comercial/pvtec/')
    setRecord(null)
    setActivities(null)
  };

  const handleTabSelect = async (key) => {
    setActiveTab(key)
  }

  useEffect(() =>{
    const getData = async () =>{
      const reg = await GetRecord(uuid, 'pipeline/pvtec')
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
          HandleSearch('', 'pipeline/card-activities',(data) => {setActivities(data)}, `?pvtec=${reg.id}`)
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
    if (formData){
      api.put(`pipeline/pvtec/${uuid}/`, formDataToSend, {headers: {Authorization: `Bearer ${token}`}})
      .then((response) => {
        reducer()
        toast.success("PVTEC Atualizada com Sucesso!")
        setRecord(response.data)
        if (response.data.activity){
          setActivities([response.data.activity, ...activities])
        }
      })
      .catch((erro) => {
        console.error('erro: '+erro);
      })
    }
    setShowForm({...showForm, 'status':false, 'orientacoes':false, 'atividade':false, 'responsaveis':false})
  }

  return (
    <Modal
      show={show}
      onHide={handleClose}
      contentClassName="border-0"
      dialogClassName="mt-2 modal-custom modal-custom modal-lm mb-0"
    >
      <div className="position-absolute d-flex top-0 end-0 mt-1 me-1" style={{ zIndex: 1000 }}>
        <DropMenu record={record}/>
        <CloseButton
          onClick={handleClose}
          className="btn btn-sm btn-circle d-flex flex-center transition-base ms-2"
        />
      </div>
      <Modal.Body className="pt-2">
        <Row className='p-2 gy-1'>
          <Col className='border-1 px-0 overflow-auto modal-column-scroll pe-2' id='infocard' lg={5}>
            {record ? <>
              <div className="rounded-top-lg pt-1 pb-0 ps-3 mb-2">
                <h4 className="mb-1 fs-1 fw-bold">{record.info_detalhamento.detalhamento}</h4>
              </div>
              <Dropdown className='mb-2'>
                <Dropdown.Toggle as={Nav}
                  className='dropdown-caret-none p-0 ms-3 cursor-pointer w-50'
                >
                  <div onClick={() => handleEdit('others')} className='d-flex'>
                  </div>
                </Dropdown.Toggle>
                <Dropdown.Menu className='text-body px-3'  style={{ width: '400px' }}>

                </Dropdown.Menu>
              </Dropdown>
              <Tab.Container id="left-tabs-example" defaultActiveKey="main" onSelect={handleTabSelect}>
                <div className='ms-3 my-2'>
                  <NavPVTEC record={record} />
                </div>
                <div className='ms-3 mt-3'>
                  <Tab.Content>
                    <Tab.Pane eventKey="main">
                      <h5 className="mb-0 fs-0 fw-bold">Informações da PVTEC</h5>
                      <div className='text-secondary fs--2'>Criado por {record.str_created_by} em {' '}
                        {new Date(record.created_at).toLocaleDateString('pt-BR', {year:"numeric", month: "short", day: "numeric", timeZone: 'UTC'})}
                        {' às '+new Date(record.created_at).toLocaleTimeString('pt-BR', {hour:"numeric", minute:"numeric"})}
                      </div>
                      <div className="rounded-top-lg pt-1 pb-0 mb-2">
                        <CardTitle title='Produto de Origem'/>
                        <div className="fs--1 row-10">{record.info_detalhamento.produto}</div>
                      </div>
                      <div className="rounded-top-lg pt-1 pb-0 mb-2">
                        <CardTitle title='Detalhamento de Demanda'/>
                        <div className="fs--1 row-10">{record.info_detalhamento.detalhamento}</div>
                      </div>
                      <div className="rounded-top-lg pt-1 pb-0 mb-2">
                        <CardTitle title='Cliente'/>
                        <div className="fs--1 row-10">{record.str_cliente}</div>
                      </div>
                        
                      {!showForm.atividade ?
                        <div className="rounded-top-lg pt-1 pb-0 mb-2">
                          <CardTitle title='Atividade' field='atividade' click={handleEdit}/>
                          <div className="fs--1 row-10">{record.atividade_display}</div>
                        </div>
                        :
                        <EditForm 
                          onSubmit={(formData) => handleSubmit(formData, record.uuid)} 
                          show={showForm['atividade']}
                          fieldkey='atividade'
                          setShow={setShowForm}
                          data={record.atividade}
                        />
                      }
                        
                      {!showForm.orientacoes ?
                        <div className="rounded-top-lg pt-1 pb-0 mb-2">
                          <CardTitle title='Orientações' field='orientacoes' click={handleEdit}/>
                          <div className="fs--1 row-10">{record.orientacoes}</div>
                        </div>
                        :
                        <EditForm 
                          onSubmit={(formData) => handleSubmit(formData, record.uuid)} 
                          show={showForm['orientacoes']}
                          fieldkey='orientacoes'
                          setShow={setShowForm}
                          data={record.orientacoes}
                        />
                      }
                      {!showForm.responsaveis ?
                        <div className='my-2'>
                          <CardTitle title='Responsáveis:' click={handleEdit} field='responsaveis'/>
                          <div className='fs--1'>
                            {record.list_responsaveis.map(r => r.nome).join(', ')}
                          </div>
                        </div>
                        :
                        <EditForm 
                          onSubmit={(formData) => handleSubmit(formData, record.uuid)} 
                          show={showForm['responsaveis']}
                          fieldkey='responsaveis'
                          setShow={setShowForm}
                          data={record.list_responsaveis}
                        />
                      }
                    </Tab.Pane>
                    <Tab.Pane eventKey="anexosrequest">
                      <Anexos card={record} updatedactivity={(a) => setActivities([a, ...activities])} ispvtec/>
                    </Tab.Pane>
                    <Tab.Pane eventKey="anexosresponse">
                      <Anexos card={record} updatedactivity={(a) => setActivities([a, ...activities])} ispvtec pvtecresponse/>
                    </Tab.Pane>
                    <Tab.Pane eventKey="comments">
                      <ModalMediaContent title='Comentários'> 
                        {activeTab === 'comments' &&
                          <ModalCommentContent card={record} updatedactivity={(a) => setActivities([a, ...activities])} ispvtec/>
                        }
                      </ModalMediaContent>
                    </Tab.Pane>
                    <Tab.Pane eventKey="pvtec">

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
                <SubtleBadge bg={`${record.status === 'EA' ? 'warning' : 'success'}`}>{record.status_display}</SubtleBadge>
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
              <ModalSidebar card={record} reducer={(data) => {setRecord(data); setActivities([data.activity, ...activities]);
                reducer('edit')
              }}/>
            : uuid &&
              <SkeletBig />
            }
          </Col>
        </Row>
      </Modal.Body>
    </Modal>
  );
}

export default PVTECModal;

import React, { useState, useEffect } from 'react';
import { CloseButton, Col, Dropdown, Modal, Nav, Row, Tab } from 'react-bootstrap';
import api from '../../../context/data.js';
import { GetRecord } from '../../../helpers/Data.js';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import {CardTitle} from '../../Pipeline/CardInfo.js';
import { DropMenu } from './Menu.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { SkeletBig } from '../../../components/Custom/Skelet.js';
import { Car, Coordenadas, NavModal2, Sigef } from './Nav.js';
import NavModal from './Nav.js';
import { fieldsFarm } from '../Data.js';
import { faGlobeAmericas } from '@fortawesome/free-solid-svg-icons';
import EditFormModal from '../../../components/Custom/EditForm.js';
import { RedirectToLogin } from '../../../Routes/PrivateRoute.js';

const ModalRecord = ({show, reducer}) => {
  const [showForm, setShowForm] = useState({});
  const navigate = useNavigate()
  const token = localStorage.getItem("token")
  const {uuid} = useParams()
  const [record, setRecord] = useState();
  const [activeTab, setActiveTab] = useState('main');

  const handleClose = () => {
    navigate('/farms/farms/')
    setRecord(null)
  };

  const handleTabSelect = async (key) => {
    setActiveTab(key)
  }

  useEffect(() =>{
    const getData = async () =>{
      const reg = await GetRecord(uuid, 'farms/farms')
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
    if (formData){
      api.put(`farms/farms/${uuid}/`, formData, {headers: {Authorization: `Bearer ${token}`}})
      .then((response) => {
        reducer('edit', {...response.data})
        toast.success("Imóvel Rural Atualizado com Sucesso!")
        setRecord(response.data)
        setShowForm({})
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
      size='xl'
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
          <Col className='border-1 px-0 overflow-auto modal-column-scroll pe-2' id='infocard' lg={4}>
            {record ? <>
              <div className="rounded-top-lg pt-1 pb-0 ps-3 mb-2">
                <h4 className="mb-1 fs-1 fw-bold">{record.nome}</h4>
                <h6 className="mb-1 fs--1 fw-bold">Mat. {record.matricula}</h6>
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
                  <NavModal record={record} />
                </div>
                <div className='ms-3 mt-3'>
                  <Tab.Content>
                    <Tab.Pane eventKey="main">
                      <h5 className="mb-0 fs-0 fw-bold">Informações do Imóvel Rural</h5>
                      <div className='text-secondary fs--2 mb-2'>Criado por {record.str_created_by} em {' '}
                        {new Date(record.created_at).toLocaleDateString('pt-BR', {year:"numeric", month: "short", day: "numeric", timeZone: 'UTC'})}
                        {' às '+new Date(record.created_at).toLocaleTimeString('pt-BR', {hour:"numeric", minute:"numeric"})}
                      </div>
                      {fieldsFarm.map(f => 
                        !showForm[f.name] ?
                          <div className="rounded-top-lg pt-1 pb-0 mb-2" key={f.name}>
                            <CardTitle title={f.label.replace('*','')} field={f.name} click={handleEdit}/>
                            {f.type === 'select' ?
                              <div className="fs--1 row-10">{record[f.string] || '-'}</div>
                            : f.type === 'select2' ? f.ismulti ? 
                                <div className="fs--1 row-10">{record[f.list].map(l => l[f.string]).join(', ')}</div>
                              : 
                              f.string ?
                                <div className="fs--1 row-10">{record[f.string] || '-'}</div>
                              :
                                <div className="fs--1 row-10">{record[f.data] && record[f.data][f.attr_data]}</div>
                            : f.type === 'file' && f.name === 'kml' ? 
                              <div><Link>Baixar KML</Link></div>
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
                      <div>
                        <div className="mb-2">
                            <div className="fw-bold fs--1">Sincronização CAR</div>
                            {record.registro_car 
                              ? <span className="badge bg-success fw-normal">Concluída</span>
                              : <span className="badge bg-danger fw-normal">Pendente</span>
                            }
                        </div>
                        <div className="mb-2">
                            <div className="fw-bold fs--1">Sincronização SIGEF</div>
                            {record.registro_sigef 
                              ? <span className="badge bg-success fw-normal">Concluída</span>
                              : <span className="badge bg-danger fw-normal">Pendente</span>
                            }
                        </div>
                    </div>
                    </Tab.Pane>
                  </Tab.Content>
                </div>
              </Tab.Container></>
            : uuid &&
              <SkeletBig />
            }
            
          </Col>
          <Col lg={8} className='overflow-auto modal-column-scroll border border-bottom-0 border-top-0 border-end-0'>
            {record ? <>
              <div className="rounded-top-lg pt-1 pb-0 mb-2">
                <span className="mb-1 fs-0 fw-bold d-inline-block me-2">Mapas</span>
              </div>
              <Tab.Container id="right-tabs-example" defaultActiveKey="matricula" onSelect={handleTabSelect}>
                <NavModal2 record={record} />
                <Tab.Pane eventKey="matricula">
                    <Coordenadas record={record}/>
                </Tab.Pane>
                <Tab.Pane eventKey="car">
                  {activeTab === 'card' && 
                    <Car record={record} />
                  }
                </Tab.Pane>
                <Tab.Pane eventKey="sigef">
                  {activeTab === 'sigef' && 
                    <Sigef record={record} />
                  }
                </Tab.Pane>
              </Tab.Container>
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

export default ModalRecord;

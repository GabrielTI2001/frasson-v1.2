import React, { useState, useEffect } from 'react';
import { CloseButton, Col, Dropdown, Modal, Row, Tab } from 'react-bootstrap';
import api from '../../context/data.js';
import { GetRecord } from '../../helpers/Data.js';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAppContext } from '../../Main.js';
import {CardTitle} from '../Pipeline/CardInfo.js';
import { DropMenu } from './Menu.js';
import { SkeletBig } from '../../components/Custom/Skelet.js';
import NavModal from './Nav.js';
import EditFormModal from '../../components/Custom/EditForm.js';
import { fieldsLicenca } from './Data.js';
import { RedirectToLogin } from '../../Routes/PrivateRoute.js';

const ModalRecord = ({show, reducer}) => {
  const [showForm, setShowForm] = useState({});
  const navigate = useNavigate()
  const token = localStorage.getItem("token")
  const {uuid} = useParams()
  const [record, setRecord] = useState();
  const {config: {theme}} = useAppContext();
  const [activeTab, setActiveTab] = useState('coordenadas');

  const handleClose = () => {
    navigate('/licenses')
    setRecord(null)
  };

  const handleTabSelect = async (key) => {
    setActiveTab(key)
  }

  useEffect(() =>{
    const getData = async () =>{
      const reg = await GetRecord(uuid, 'licenses/index')
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
      api.put(`licenses/index/${uuid}/`, {...record, ...formData}, {headers: {Authorization: `Bearer ${token}`}})
      .then((response) => {
        reducer('edit', {...response.data, list_propriedades:response.data.list_propriedades.map(l => l.label).join(', ')})
        toast.success("Licença Atualizada com Sucesso!")
        setRecord(response.data)
      })
      .catch((erro) => {
        console.error('erro: '+erro);
      })
    }
    setShowForm({})
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
          <Col className='border-1 px-0 overflow-auto modal-column-scroll pe-2' id='infocard' lg={6}>
            {record ? <>
              <div className="pt-1 pb-0 ps-3 mb-3"><h4 className="mb-1 fs-1 fw-bold">{record.str_beneficiario}</h4></div>
              <Tab.Container id="left-tabs-example" defaultActiveKey="main" onSelect={handleTabSelect}>
                <div className='ms-3 my-1'>
                  <NavModal record={record} />
                </div>
                <div className='ms-3 mt-3'>
                  <Tab.Content>
                    <Tab.Pane eventKey="main">
                      <h5 className="mb-0 fs-0 fw-bold">Informações da Licença</h5>
                      <div className='text-secondary fs--2 mb-2'>Criado por {record.info_user.first_name} {record.info_user.last_name} em {' '}
                        {new Date(record.created_at).toLocaleDateString('pt-BR', {year:"numeric", month: "short", day: "numeric", timeZone: 'UTC'})}
                        {' às '+new Date(record.created_at).toLocaleTimeString('pt-BR', {hour:"numeric", minute:"numeric"})}
                      </div>

                      {fieldsLicenca.map(f => 
                        !showForm[f.name] ?
                          <div className="rounded-top-lg pt-1 pb-0 mb-2" key={f.name}>
                            <CardTitle title={f.label.replace('*','')} field={f.name} click={handleEdit}/>
                            {f.type === 'select2' ? f.ismulti ? 
                                <div className="fs--1 row-10">{record[f.list].map(l => l[f.string]).join(', ')}</div>
                              : 
                              f.string ?
                                <div className="fs--1 row-10">{record[f.string] || '-'}</div>
                              :
                                <div className="fs--1 row-10">{record[f.data] && record[f.data][f.attr_data]}</div>
                            : f.type === 'date' ? 
                              <div className="fs--1 row-10">{record[f.name] ? new Date(record[f.name]).toLocaleDateString('pt-BR', {timeZone:'UTC'}) : '-'}</div>
                            : 
                            <div className="fs--1 row-10">{record[f.name] ? (f.is_number 
                              ? Number(record[f.name]).toLocaleString('pt-BR', {minimumFractionDigits:2}) 
                              : record[f.name]) : '-'}
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
                        <strong className="d-block text-dark fs--1 fw-bold">Status Licença</strong>
                        <span className={`badge fs--2 bg-${record.status.color} mt-0`}>{record.status.text}</span>
                      </div>
                      <div className='mt-2'>
                        <strong className="d-block text-dark fs--1 fw-bold">Data Limite Renovação</strong>
                        <span>{record.data_renovacao
                            ? new Date(record.data_renovacao).toLocaleDateString('pt-BR', {timeZone:'UTC'}) 
                        : '-'}</span>
                        <span className={`ms-2 badge fs--2 bg-${record.status.color}`}>{record.status.text}</span>
                      </div>
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
                <span className="mb-1 fs-0 fw-bold d-inline-block me-2">Outras Informações</span>
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

export default ModalRecord;

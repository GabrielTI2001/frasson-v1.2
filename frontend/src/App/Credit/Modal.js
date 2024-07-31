import React, { useState, useContext, useEffect } from 'react';
import { Button, CloseButton, Col, Dropdown, Form, Modal, Nav, Row, Tab } from 'react-bootstrap';
import ModalMediaContent from '../Pipeline/ModalMediaContent.js';
import api from '../../context/data.js';
import { GetRecord, sendData } from '../../helpers/Data.js';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAppContext } from '../../Main.js';
import {CardTitle} from '../Pipeline/CardInfo.js';
import { DropMenu } from './Menu.js';
import { SkeletBig } from '../../components/Custom/Skelet.js';
import NavModal, { Alongamentos } from './Nav.js'
import ModalDelete from '../../components/Custom/ModalDelete.js';
import PolygonMap from '../../components/map/PolygonMap.js';
import { fieldsOperacoes } from './Data.js';
import { faDownload, faGlobeAmericas } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import EditFormModal from '../../components/Custom/EditForm.js';
import { Cedulas } from './Cedulas.js';
import { RedirectToLogin } from '../../Routes/PrivateRoute.js';

const ModalRecord = ({show, reducer}) => {
  const [showForm, setShowForm] = useState({});
  const navigate = useNavigate()
  const token = localStorage.getItem("token")
  const {uuid} = useParams()
  const [record, setRecord] = useState();
  const {config: {theme}} = useAppContext();
  const [message, setMessage] = useState();
  const [cedulas, setCedulas] = useState()
  const [activeTab, setActiveTab] = useState('main');

  const handleClose = () => {
    navigate('/credit')
    setRecord(null)
  };
  const handleTabSelect = async (key) => {
    setActiveTab(key)
  }

  useEffect(() =>{
    const getData = async () =>{
      const reg = await GetRecord(uuid, 'credit/operacoes-contratadas')
      if (!reg){
        handleClose()
        RedirectToLogin(navigate)
      }
      else{
        if (Object.keys(reg).length === 0){
          handleClose()
          RedirectToLogin(navigate)
        }
        setRecord(reg)
        if(!cedulas){
          const files = reg.cedulas.map(pdf => ({
              id:pdf.id, url:`${process.env.REACT_APP_API_URL}${pdf.url}`
          }))
          setCedulas(files)
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
      api.put(`credit/operacoes-contratadas/${uuid}/`, formDataToSend, {headers: {Authorization: `Bearer ${token}`}})
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
          <Col className='border-1 px-0 overflow-auto modal-column-scroll pe-2' id='infocard' lg={4}>
            {record ? <>
              <div className="rounded-top-lg pt-1 pb-0 ps-3 mb-2">
                <h4 className="mb-1 fs-0 fw-bold">{record.str_beneficiario+' ('+record.numero_operacao+')'}</h4>
              </div>
              <Tab.Container id="left-tabs-example" defaultActiveKey={activeTab} onSelect={handleTabSelect}>
                <div className='ms-3 my-2'>
                  <NavModal record={record} />
                </div>
                <div className='ms-3 mt-2'>
                  <Tab.Content>
                    <Tab.Pane eventKey="main">
                      <h5 className="mb-0 fs-0 fw-bold">Informações da Operação</h5>
                      <div className='text-secondary fs--2 mb-2'>Criado por {record.str_created_by} em {' '}
                        {new Date(record.created_at).toLocaleDateString('pt-BR', {year:"numeric", month: "short", day: "numeric", timeZone: 'UTC'})}
                        {' às '+new Date(record.created_at).toLocaleTimeString('pt-BR', {hour:"numeric", minute:"numeric"})}
                      </div>
                      {fieldsOperacoes.filter(f => f.name !== 'file').map(f => 
                        !showForm[f.name] ?
                          <div className="rounded-top-lg pt-1 pb-0 mb-2" key={f.name}>
                            <CardTitle title={f.label.replace('*','')} field={f.name} click={handleEdit}/>
                            {f.type === 'select' ?
                              <div className="fs--1 row-10">{record[f.string]}</div>
                            : f.type === 'select2' ? f.ismulti ? 
                                <div className="fs--1 row-10">{record[f.list].map(l => l[f.string]).join(', ')}</div>
                              : 
                              f.string ?
                                <div className="fs--1 row-10">{record[f.string] || '-'}</div>
                              :
                                <div className="fs--1 row-10">{record[f.data] && record[f.data][f.attr_data]}</div>
                            : f.type === 'file' && f.name === 'kml' ? 
                              <div></div>
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
                    <Tab.Pane eventKey="cedulas">
                        <ModalMediaContent title='Cédulas'>
                          <Cedulas card={record} cedulas={record.cedulas} />
                        </ModalMediaContent>  
                    </Tab.Pane>
                    <Tab.Pane eventKey="alongamentos">
                      <Alongamentos record={record} reducer={
                        (alongamento) => {setRecord({...record, alongamento:{...record.alongamento, ...alongamento}}); setActiveTab('alongamentos')}
                      }/>
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
                <span className="mb-1 fs-0 fw-bold d-inline-block me-2">Glebas Beneficiadas</span>
              </div>
              <div className='align-items-center justify-content-between p-2 py-1 rounded-top d-flex' style={{backgroundColor: '#cee9f0'}}>
                {record.coordenadas.length > 0 ? <>  
                  <Link className='fs-0'
                      to={`${process.env.REACT_APP_API_URL}/credit/kml/operacoes/${record.uuid}`}
                  >
                      <FontAwesomeIcon icon={faDownload} />
                  </Link>
                  </>
                  : <strong className="fs--1">Sem KML</strong>
                }
              </div>
              <PolygonMap
                initialCenter={{
                    lat: record.coordenadas.length > 0 ? Number(record.coordenadas[0]['lat']) : -13.7910,
                    lng: record.coordenadas.length > 0 ? Number(record.coordenadas[0]['lng']) : -45.6814
                }}
                mapStyle="Default"
                className="rounded-soft google-maps-l container-map"
                token_api={record.token_apimaps}
                mapTypeId='satellite'
                polygons={[{path:record.coordenadas}]}
                zoom={13}
              />
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

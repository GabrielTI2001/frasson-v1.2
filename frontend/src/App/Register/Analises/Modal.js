import React, { useState, useEffect } from 'react';
import { CloseButton, Col, Modal, Row, Tab } from 'react-bootstrap';
import ModalMediaContent from '../../Pipeline/ModalMediaContent.js';
import api from '../../../context/data.js';
import { GetRecord } from '../../../helpers/Data.js';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAppContext } from '../../../Main.js';
import {CardTitle} from '../../Pipeline/CardInfo.js';
import { DropMenu } from './Menu.js';
import { SkeletBig } from '../../../components/Custom/Skelet.js';
import NavModal, { NavModal2 } from './Nav.js';
import ResultAnaliseSolo, { OtherInfo } from './SoloResults.js';
import GoogleMap from '../../../components/map/GoogleMap';
import MapInfo from './MapInfo.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFile } from '@fortawesome/free-solid-svg-icons';
import { fieldsAnaliseSolo } from '../Data.js';
import EditFormModal from '../../../components/Custom/EditForm.js';
import { RedirectToLogin } from '../../../Routes/PrivateRoute.js';
import { Anexos } from '../Anexos.js';

const ModalRecord = ({show, reducer}) => {
  const [showForm, setShowForm] = useState({});
  const navigate = useNavigate()
  const token = localStorage.getItem("token")
  const {uuid} = useParams()
  const [record, setRecord] = useState();
  const {config: {theme}} = useAppContext();
  const [activeTab, setActiveTab] = useState('results');

  const handleClose = () => {
    navigate('/databases/analysis/soil')
    setRecord(null)
  };

  const handleTabSelect = async (key) => {
    setActiveTab(key)
  }

  useEffect(() =>{
    const getData = async () =>{
      const reg = await GetRecord(uuid, 'register/analysis-soil')
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
    const formDataToSend = new FormData();
    for (const key in formData) {
      if (key === 'file') {
        formDataToSend.append('file', formData['file'][0]);
      }
      else if (Array.isArray(formData[key])) {
        formData[key].forEach(value => {
          formDataToSend.append(key, value);
        });
      }
      else{
        formDataToSend.append(key, formData[key]);
      }
    }
    if (formData){
      api.put(`register/analysis-soil/${uuid}/`, formDataToSend, {headers: {Authorization: `Bearer ${token}`}})
      .then((response) => {
        reducer('edit', {...response.data, status:
          {color:response.data.status === 'EA' ? 'warning' : 'success', text:response.data.status_display}
        })
        toast.success("Análise Atualizada com Sucesso!")
        setRecord(response.data)
        setShowForm({})
      })
      .catch((erro) => {
        if (erro.response.status === 400){
          toast.error(erro.response.data[Object.keys(formData)[1]][0])
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
      size='xl'
      contentClassName="border-0"
      dialogClassName="mt-2 modal-custom modal-xl mb-0"
    >
      <div className="position-absolute d-flex top-0 end-0 mt-1 me-1" style={{ zIndex: 1000 }}>
        <DropMenu record={record} reducer={reducer}/>
        <CloseButton onClick={handleClose} className="btn btn-sm btn-circle d-flex flex-center transition-base ms-2"/>
      </div>
      <Modal.Body className="pt-2">
        <Row className='p-2 gy-1'>
          <Col className='border-1 px-0 overflow-auto modal-column-scroll pe-2' id='infocard' lg={4}>
            {record ? <>
              <div className="rounded-top-lg pt-1 pb-0 ps-3 mb-2">
                <h4 className="mb-1 fs-1 fw-bold">{record.localizacao}</h4>
              </div>
              <Tab.Container id="left-tabs-example" defaultActiveKey="main" onSelect={handleTabSelect}>
                <div className='ms-3 my-2'>
                  <NavModal record={record} />
                </div>
                <div className='ms-3 mt-3'>
                  <Tab.Content>
                    <Tab.Pane eventKey="main">
                      <h5 className="mb-0 fs-0 fw-bold">Informações da Análise</h5>
                      <div className='text-secondary fs--2 mb-2'>Criado por {record.creation.created_by} em {' '}
                        {new Date(record.creation.created_at).toLocaleDateString('pt-BR', {year:"numeric", month: "short", day: "numeric", timeZone: 'UTC'})}
                        {' às '+new Date(record.creation.created_at).toLocaleTimeString('pt-BR', {hour:"numeric", minute:"numeric"})}
                      </div>

                      {fieldsAnaliseSolo.slice(0, 10).map(f => 
                        !showForm[f.name] ?
                          <div className="rounded-top-lg pt-1 pb-0 mb-2" key={f.name}>
                            <CardTitle title={f.label.replace('*','')} field={f.name} click={handleEdit}/>
                            {
                              f.type === 'select2' ? 
                                  <div className="fs--1 row-10">{record[f.string] || '-'}</div>
                              : f.type === 'date' ? 
                                <div className="fs--1 row-10">
                                  {record[f.name] ? new Date(record[f.name]).toLocaleDateString('pt-BR', {timeZone:'UTC'}) : '-'}
                                </div>
                              : 
                                <div className="fs--1 row-10">{record[f.name] ? f.is_number 
                                  ? Number(record[f.name]).toLocaleString('pt-BR', {minimumFractionDigits:2}) 
                                  : record[f.name] : '-'}
                                </div>
                            }
                          </div>
                        :
                          <EditFormModal key={f.name} onSubmit={(formData) => handleSubmit(formData, record.uuid)} 
                            show={showForm[f.name]} fieldkey={f.name} setShow={setShowForm} record={record} field={f}
                          />
                      )}
                    </Tab.Pane>
                    <Tab.Pane eventKey="anexos">
                      <Anexos record={record} analisesolo/>
                    </Tab.Pane>
                  </Tab.Content>
                </div>
              </Tab.Container></>
            : uuid &&
              <SkeletBig />
            }
            
          </Col>
          <Col lg={8} className='overflow-auto modal-column-scroll border border-bottom-0 border-top-0 border-end-0'>
            <Tab.Container id="right-tabs-example" defaultActiveKey="results" onSelect={handleTabSelect}>
              <NavModal2 record={record} />
              <Tab.Content>
                <Tab.Pane eventKey="results">
                  {record ? 
                    <>
                    <span className="mb-1 fs-0 fw-bold d-inline-block me-2">Resultados</span>
                    <Row xl={2}>
                      {fieldsAnaliseSolo.slice(11).map(f => 
                        !showForm[f.name] ?
                          <ResultAnaliseSolo record={record} field={f} click={handleEdit} key={f.name}/>
                        :
                          <EditFormModal key={f.name} onSubmit={(formData) => handleSubmit(formData, record.uuid)} show={showForm[f.name]} 
                            fieldkey={f.name} setShow={setShowForm} record={record} field={f}
                          />
                      )}
                    </Row>
                    <div className="mt-3 fw-normal" style={{fontSize: '11px'}}>
                      <span>* Níveis ideais de nutrientes no solo conforme interpretação da Embrapa Cerrados.</span>
                    </div>
                    </>
                  : uuid && <SkeletBig />
                  }
                </Tab.Pane>
                <Tab.Pane eventKey="map">
                  <ModalMediaContent title='Mapa'> 
                    {record && activeTab === 'map' && 
                      <GoogleMap
                        initialCenter={{
                            lat: Number(record.latitude_gd),
                            lng: Number(record.longitude_gd)
                        }}
                        infounlink
                        mapStyle="Default"
                        className="rounded-soft mt-2 google-maps container-map"
                        token_api={record.token_apimaps}
                        mapTypeId='satellite'
                        coordenadas={[{id: record.id,latitude_gd:record.latitude_gd, longitude_gd:record.longitude_gd}]}
                      >
                        <MapInfo/>
                      </GoogleMap>
                    }
                  </ModalMediaContent>
                </Tab.Pane>
                <Tab.Pane eventKey="more">
                  {record && <OtherInfo info={record.other_info} />}
                </Tab.Pane>
              </Tab.Content>
            </Tab.Container>               
          </Col>
        </Row>
      </Modal.Body>
    </Modal>
  );
}

export default ModalRecord;

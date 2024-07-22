import React, { useState, useEffect } from 'react';
import { CloseButton, Col, Dropdown, Modal, Nav, Row, Tab } from 'react-bootstrap';
import ModalMediaContent from '../../Pipeline/ModalMediaContent.js';
import api from '../../../context/data.js';
import { GetRecord } from '../../../helpers/Data.js';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import SubtleBadge from '../../../components/common/SubtleBadge.js';
import { useAppContext } from '../../../Main.js';
import CardInfo, {CardTitle} from '../../Pipeline/CardInfo.js';
import { DropMenu } from './Menu.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { SkeletBig } from '../../../components/Custom/Skelet.js';
import NavPVTEC, { Fazenda } from './Nav.js';
import { fieldsRegime } from '../Data.js';
import EditFormModal from '../../../components/Custom/EditForm.js';
import PolygonMap from '../../../components/map/PolygonMap.js';
import { faFile, faGlobeAmericas } from '@fortawesome/free-solid-svg-icons';

const ModalRecord = ({show, reducer}) => {
  const [showForm, setShowForm] = useState({});
  const navigate = useNavigate()
  const token = localStorage.getItem("token")
  const {uuid} = useParams()
  const [record, setRecord] = useState();
  const {config: {theme}} = useAppContext();
  const [activeTab, setActiveTab] = useState('main');

  const handleClose = () => {
    navigate('/farms/regime/')
    setRecord(null)
  };

  const handleTabSelect = async (key) => {
    setActiveTab(key)
  }

  useEffect(() =>{
    const getData = async () =>{
      const reg = await GetRecord(uuid, 'farms/regime')
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
    if (formData){
      api.put(`farms/regime/${uuid}/`, formData, {headers: {Authorization: `bearer ${token}`}})
      .then((response) => {
        reducer('edit', {...response.data, info_status:
          {color:response.data.status === 'EA' ? 'warning' : 'success', text:response.data.status_display}
        })
        setShowForm({})
        toast.success("Regime Atualizado com Sucesso!")
        setRecord(response.data)
      })
      .catch((erro) => {
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
          <Col className='border-1 px-0 overflow-auto modal-column-scroll pe-2' id='infocard' lg={5}>
            {record ? <>
              <div className="rounded-top-lg pt-1 pb-0 ps-3 mb-2">
                <h4 className="mb-1 fs-1 fw-bold">{record.farm_data.nome}</h4>
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
                      <h5 className="mb-0 fs-0 fw-bold">Informações do Regime</h5>
                      <div className='text-secondary fs--2 mb-2'>Criado por {record.str_created_by} em {' '}
                        {new Date(record.created_at).toLocaleDateString('pt-BR', {year:"numeric", month: "short", day: "numeric", timeZone: 'UTC'})}
                        {' às '+new Date(record.created_at).toLocaleTimeString('pt-BR', {hour:"numeric", minute:"numeric"})}
                      </div>

                      {fieldsRegime.map(f => 
                        !showForm[f.name] ?
                          <div className="rounded-top-lg pt-1 pb-0 mb-2" key={f.name}>
                            <CardTitle title={f.label.replace('*','')} field={f.name} click={handleEdit}/>
                            {f.type === 'select' ?
                              <div className="fs--1 row-10">{record[f.string]}</div>
                            : f.type === 'select2' ? f.ismulti ? 
                                <div className="fs--1 row-10">{f.list.map(l => l[f.string]).join(', ')}</div>
                              : 
                              f.string ?
                                <div className="fs--1 row-10">{record[f.string]}</div>
                              :
                                <div className="fs--1 row-10">{record[f.data] && record[f.data][f.attr_data]}</div>
                            : f.type === 'file' && f.name === 'kml' ? 
                              <div>
                                <Link to={`${process.env.REACT_APP_API_URL}/farms/kml/regime/${record.uuid}`} className='btn btn-secondary py-0 px-2 me-2 fs--1'>
                                    <FontAwesomeIcon icon={faGlobeAmericas} className='me-1'/>KML
                                </Link>
                              </div>
                            : f.type === 'file' && f.name === 'instrumento_cessao' ? 
                              record[f.name] ? <div>
                                <Link to={`${process.env.REACT_APP_API_URL}/${record.instrumento_cessao}`} className='btn btn-secondary py-0 px-2 me-2 fs--1'>
                                    <FontAwesomeIcon icon={faFile} className='me-1'/>PDF
                                </Link>
                              </div> : <div>-</div>
                            : f.type === 'date' ? 
                              <div className="fs--1 row-10">{record[f.name] ? new Date(record[f.name]).toLocaleDateString('pt-BR', {timeZone:'UTC'}) : '-'}</div>
                            : 
                              <div className="fs--1 row-10">{record[f.name] || '-'}</div>}
                          </div>
                          :
                          <EditFormModal key={f.name}
                            onSubmit={(formData) => handleSubmit(formData, record.uuid)} 
                            show={showForm[f.name]} fieldkey={f.name} setShow={setShowForm} 
                            record={record} field={f}
                          />
                      )}
                    </Tab.Pane>
                    <Tab.Pane eventKey="farm">
                      <Fazenda record={record}/>
                    </Tab.Pane>
                  </Tab.Content>
                </div>
              </Tab.Container></>
            : uuid &&
              <SkeletBig />
            }
            
          </Col>
          <Col lg={7} className='overflow-auto modal-column-scroll border border-bottom-0 border-top-0 border-end-0'>
            {record ? <>
              <div className="rounded-top-lg pt-1 pb-0 mb-2">
                <span className="mb-1 fs-0 fw-bold d-inline-block me-2">Mapa</span>
                <PolygonMap
                  initialCenter={{
                      lat: record.coordenadas.length > 0 ? Number(record.coordenadas[0]['lat']) : -13.7910,
                      lng: record.coordenadas.length > 0 ? Number(record.coordenadas[0]['lng']) : -45.6814
                  }}
                  mapStyle="Default"
                  className="rounded-soft mt-2 google-maps-l container-map"
                  token_api={record.token_apimaps}
                  mapTypeId='satellite'
                  polygons={[{path:record.coordenadas}]}
                  zoom={11}
                />
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

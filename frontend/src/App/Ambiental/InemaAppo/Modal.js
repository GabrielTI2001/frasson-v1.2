import React, { useState, useEffect, useReducer } from 'react';
import { CloseButton, Col, Dropdown, Modal, Nav, Row, Tab } from 'react-bootstrap';
import api from '../../../context/data.js';
import { GetRecord, GetRecords, SelectOptions } from '../../../helpers/Data.js';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import SubtleBadge from '../../../components/common/SubtleBadge.js';
import { useAppContext } from '../../../Main.js';
import {CardTitle} from '../../Pipeline/CardInfo.js';
import { DropMenu } from './Menu.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { SkeletBig } from '../../../components/Custom/Skelet.js';
import { fieldsAPPO } from '../Data.js';
import EditFormModal from '../../../components/Custom/EditForm.js';
import { faFilePdf } from '@fortawesome/free-solid-svg-icons';
import NavModal, { CoordenadasMap, NavModal2, TablePoints } from './Nav.js';
import { ambientalReducer } from '../../../reducers/ambientalReducer.js';
import { AmbientalContext } from '../../../context/Context.js';

const dif = (data_ren) => {
  const dif = parseInt((new Date(data_ren) - new Date())/(1000 * 60 * 60 * 24))
  const v = dif <= 0 ? 0 : dif;
  return v;
}

const ModalRecord = ({show, reducer}) => {
  const [showForm, setShowForm] = useState({});
  const [ambientalState, ambientalDispatch] = useReducer(ambientalReducer, {modal:{show:false}});
  const navigate = useNavigate()
  const token = localStorage.getItem("token")
  const {uuid} = useParams()
  const record = ambientalState.appo;
  const {config: {theme}} = useAppContext();
  const [activeTab, setActiveTab] = useState('main');
  const [aquifero, setAquifero] = useState()

  const handleClose = () => {
    navigate('/ambiental/inema/appos')
    ambientalDispatch({type:'SET_DATA', payload:{
      appo:null
    }})
  };

  const handleTabSelect = async (key) => {
    setActiveTab(key)
  }

  useEffect(() =>{
    const getData = async () =>{
      const reg = await GetRecord(uuid, 'environmental/inema/appos')
      if (!reg){
        handleClose()
        navigate("/auth/login")
      }
      else{
        if (Object.keys(reg).length === 0){
          handleClose()
          navigate("/error/404")
        }
        else{
          const coordenadas = await GetRecords('environmental/inema/appo/coordenadas-detail', `processo=${reg.id}`)
          ambientalDispatch({type:'SET_DATA', payload:{
            appo:{...reg, coordenadas:coordenadas}
          }})
        }
      }
    }
    if(show && uuid) getData()
    const buscar = async () =>{
      const data = await SelectOptions('environmental/inema/aquifero', 'description');
      if (data === 401){
        navigate("auth/login")
      }
      setAquifero(data)
    }
    if (!aquifero){
      buscar()
    }
  }, [show])

  const handleEdit = (key) =>{
    setShowForm(prevState => ({
      ...prevState,
      [key]: !prevState[key]
    }));
  }

  const handleSubmit = (formData) =>{
    const formDataToSend = new FormData();
    const {file, renovacao, info_user, updated_at, token_apimaps, ...rest} = record;
    const form = {...rest, ...formData}
    for (const key in form) {
      if (Array.isArray(form[key])) {
        form[key].forEach(value => {
          formDataToSend.append(key, value);
        });
      }
      else{
        formDataToSend.append(key, form[key]);
      }
    }
    if (formData){
      api.put(`environmental/inema/appos/${uuid}/`, formDataToSend, {headers: {Authorization: `Bearer ${token}`}})
      .then((response) => {
        reducer('edit', {...response.data})
        setShowForm({})
        toast.success("APPO Atualizada com Sucesso!")
        ambientalDispatch({type:'SET_DATA', payload:{
          appo:{...ambientalState.appo, ...response.data}
        }})
      })
      .catch((erro) => {
        console.error('erro: '+erro);
      })
    }
  }

  return (
    <AmbientalContext.Provider value={{ambientalState, ambientalDispatch}}>
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
                  <h4 className="mb-1 fs-0 fw-bold">Processo {record.numero_processo}</h4>
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
                        <h5 className="mb-0 fs-0 fw-bold">Informações da APPO</h5>
                        <div className='text-secondary fs--2 mb-3'>Criado por {record.str_created_by} em {' '}
                          {new Date(record.created_at).toLocaleDateString('pt-BR', {year:"numeric", month: "short", day: "numeric", timeZone: 'UTC'})}
                          {' às '+new Date(record.created_at).toLocaleTimeString('pt-BR', {hour:"numeric", minute:"numeric"})}
                        </div>

                        <div className='fs--1 mb-2 mt-1'>
                          <strong className='fw-bold me-2'>Status APPO:</strong>
                          {new Date(record.data_vencimento) < new Date()
                              ?<SubtleBadge bg='danger'>Vencida</SubtleBadge>
                              :<SubtleBadge bg='success'>Vigente</SubtleBadge>
                          }
                        </div>
                        <div className='fs--1 mb-2'>
                          <strong className='fw-bold me-2'>Data REAPPO:</strong>
                          {new Date(record.renovacao.data).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}
                        </div>
                        <div className='fs--1 mb-2'>
                          <strong className='fw-bold me-2'>Status REAPPO:</strong>
                          {new Date(record.renovacao.data) < new Date()
                              ?<SubtleBadge bg='danger'>Vencida</SubtleBadge>
                              :<SubtleBadge bg='success'>Vigente</SubtleBadge>
                          }
                        </div>
                        <div className='fs--1 mb-1'>
                          <strong className='fw-bold me-2'>Dias restantes REAPPO:</strong>{dif(record.renovacao.data)}
                        </div>

                        {aquifero && fieldsAPPO.map(f => 
                          !showForm[f.name] ?
                            <div className="rounded-top-lg pt-1 pb-0 mb-2" key={f.name}>
                              <CardTitle title={f.label.replace('*','')} field={f.name} click={handleEdit}/>
                              {f.type === 'select' ? (
                                f.boolean 
                                  ? <div className="fs--1 row-10">{record[f.name] === true ? 'Sim' : 'Não'}</div>
                                  : <div className="fs--1 row-10">{record[f.string]}</div>
                                )
                              : f.type === 'select2' ? f.ismulti ? 
                                  <div className="fs--1 row-10">{f.list.map(l => l[f.string]).join(', ')}</div>
                                : 
                                f.string ?
                                  <div className="fs--1 row-10">{record[f.string]}</div>
                                :
                                  <div className="fs--1 row-10">{record[f.data] && record[f.data][f.attr_data]}</div>
                              : f.type === 'file' ? (record[f.name] ? 
                                <div>
                                  <Link to={`${process.env.REACT_APP_API_URL}/${record.file}`} className='btn btn-secondary py-0 px-2 me-2 fs--1'>
                                      <FontAwesomeIcon icon={faFilePdf} className='me-1'/>Arquivo PDF
                                  </Link>
                                </div> : <div>-</div>)
                              : f.type === 'date' ? 
                                <div className="fs--1 row-10">{record[f.name] ? new Date(record[f.name]).toLocaleDateString('pt-BR', {timeZone:'UTC'}) : '-'}</div>
                              : 
                                <div className="fs--1 row-10">{record[f.name] || '-'}</div>}
                            </div>
                            :
                            <EditFormModal key={f.name}
                              onSubmit={(formData) => handleSubmit(formData, record.uuid)} 
                              show={showForm[f.name]} fieldkey={f.name} setShow={setShowForm} 
                              record={record} field={f} options={{aquifero:aquifero}}
                            />
                        )}
                      </Tab.Pane>
                      <Tab.Pane eventKey="farm">
        
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
                  <span className="mb-1 fs-0 fw-bold d-inline-block me-2">Coordenadas</span>
                  <Tab.Container id="right-tabs-example" defaultActiveKey="mapa" onSelect={handleTabSelect}>
                    <NavModal2 record={record} />
                    <Tab.Content>
                      <Tab.Pane eventKey="mapa">
                        <CoordenadasMap />
                      </Tab.Pane>
                      <Tab.Pane eventKey="points">
                        {activeTab === "points" && 
                          <TablePoints />
                        }
                      </Tab.Pane>
                    </Tab.Content>
                  </Tab.Container>
                </div>
                </>
              : uuid &&
                <SkeletBig />
              }
            </Col>
          </Row>
        </Modal.Body>
      </Modal>
    </AmbientalContext.Provider>
  );
}

export default ModalRecord;

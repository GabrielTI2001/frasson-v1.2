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
import { SkeletBig } from '../../../components/Custom/Skelet.js';
import NavModal from './Nav.js';
import EditForm from './EditForm.js';
import ResultAnaliseSolo, { OtherInfo } from './SoloResults.js';
import GoogleMap from '../../../components/map/GoogleMap';
import MapInfo from './MapInfo.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFile } from '@fortawesome/free-solid-svg-icons';

const ModalRecord = ({show, reducer}) => {
  const [showForm, setShowForm] = useState({'card':false,'data':false,'beneficiario':false, 
    'detalhamento': false, 'instituicao': false, 'others':false});
  const navigate = useNavigate()
  const token = localStorage.getItem("token")
  const {uuid} = useParams()
  const [record, setRecord] = useState();
  const {config: {theme}} = useAppContext();
  const [activeTab, setActiveTab] = useState('main');

  const handleClose = () => {
    navigate('/register/analysis/soil')
    setRecord(null)
  };

  const handleTabSelect = async (key) => {
    setActiveTab(key)
  }

  useEffect(() =>{
    const getData = async () =>{
      const reg = await GetRecord(uuid, 'register/analysis-soil-results')
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
      api.put(`register/analysis-soil-results/${uuid}/`, formDataToSend, {headers: {Authorization: `bearer ${token}`}})
      .then((response) => {
        reducer('edit', {...response.data, info_status:
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
        <DropMenu record={record}/>
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
                      {!showForm.cliente ?
                        <div className="rounded-top-lg pt-1 pb-0 mb-2">
                          <CardTitle title='Cliente' field='cliente' click={handleEdit}/>
                          <div className="fs--1 row-10">{record.str_cliente}</div>
                        </div>
                        :
                        <EditForm 
                          onSubmit={(formData) => handleSubmit(formData, record.uuid)} 
                          show={showForm['cliente']} fieldkey='cliente' setShow={setShowForm} 
                          data={{value:record.cliente, label:record.str_cliente}}
                        />
                      }
                      {!showForm.fazenda ?
                        <div className="rounded-top-lg pt-1 pb-0 mb-2">
                          <CardTitle title='Localização' field='fazenda' click={handleEdit}/>
                          <div className="fs--1 row-10">{record.localizacao}</div>
                        </div>
                        :
                        <EditForm 
                          onSubmit={(formData) => handleSubmit(formData, record.uuid)} 
                          show={showForm['fazenda']} fieldkey='fazenda' setShow={setShowForm} 
                          data={{value:record.fazenda, label:record.localizacao}}
                        />
                      }
                      {!showForm.data_coleta ?
                        <div className="rounded-top-lg pt-1 pb-0 mb-2">
                          <CardTitle title='Data Coleta' field='data_coleta' click={handleEdit}/>
                          <div className="fs--1 row-10">{record.data_coleta ? 
                            `${new Date(record.data_coleta).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}` 
                            : '-'}
                          </div>
                        </div>
                        :
                        <EditForm 
                          onSubmit={(formData) => handleSubmit(formData, record.uuid)} 
                          show={showForm['data_coleta']} fieldkey='data_coleta' setShow={setShowForm} data={record.data_coleta}
                        />
                      }
                      {!showForm.identificacao_amostra ?
                        <div className="rounded-top-lg pt-1 pb-0 mb-2">
                          <CardTitle title='Identificação Amostra' field='identificacao_amostra' click={handleEdit}/>
                          <div className="fs--1 row-10">{record.identificacao_amostra}</div>
                        </div>
                        :
                        <EditForm 
                          onSubmit={(formData) => handleSubmit(formData, record.uuid)} 
                          show={showForm['identificacao_amostra']} fieldkey='identificacao_amostra' setShow={setShowForm} 
                          data={record.identificacao_amostra}
                        />
                      }
                      {!showForm.responsavel ?
                        <div className="rounded-top-lg pt-1 pb-0 mb-2">
                          <CardTitle title='Responsável Coleta' field='responsavel' click={handleEdit}/>
                          <div className="fs--1 row-10">{record.responsavel}</div>
                        </div>
                        :
                        <EditForm 
                          onSubmit={(formData) => handleSubmit(formData, record.uuid)} 
                          show={showForm['responsavel']} fieldkey='responsavel' setShow={setShowForm} 
                          data={record.responsavel}
                        />
                      }
                      {!showForm.laboratorio_analise ?
                        <div className="rounded-top-lg pt-1 pb-0 mb-2">
                          <CardTitle title='Laboratório de Análise' field='laboratorio_analise' click={handleEdit}/>
                          <div className="fs--1 row-10">{record.laboratorio_analise}</div>
                        </div>
                        :
                        <EditForm 
                          onSubmit={(formData) => handleSubmit(formData, record.uuid)} 
                          show={showForm['laboratorio_analise']} fieldkey='laboratorio_analise' setShow={setShowForm} 
                          data={record.laboratorio_analise}
                        />
                      }
                      {!showForm.numero_controle ?
                        <div className="rounded-top-lg pt-1 pb-0 mb-2">
                          <CardTitle title='Número Controle' field='numero_controle' click={handleEdit}/>
                          <div className="fs--1 row-10">{record.numero_controle || '-'}</div>
                        </div>
                        :
                        <EditForm 
                          onSubmit={(formData) => handleSubmit(formData, record.uuid)} 
                          show={showForm['numero_controle']} fieldkey='numero_controle' setShow={setShowForm} 
                          data={record.numero_controle}
                        />
                      }
                      {!showForm.profundidade ?
                        <div className="rounded-top-lg pt-1 pb-0 mb-2">
                          <CardTitle title='Profundidade (cm)' field='profundidade' click={handleEdit}/>
                          <div className="fs--1 row-10">
                            {record.profundidade ? Number(record.profundidade).toLocaleString('pt-BR',
                            {minimumFractionDigits: 2, maximumFractionDigits:2}) :'-'}
                          </div>
                        </div>
                        :
                        <EditForm 
                          onSubmit={(formData) => handleSubmit(formData, record.uuid)} 
                          show={showForm['profundidade']} fieldkey='profundidade' setShow={setShowForm} data={record.profundidade}
                        />
                      }
                      {!showForm.file ?
                          <div className="rounded-top-lg pt-1 pb-0 mb-2">
                            <CardTitle title='Arquivo PDF' field='file' click={handleEdit}/>
                            {record.file ? 
                            <div className='p-1 gx-2 d-flex col rounded-2 my-1 justify-content-between nav-link cursor-pointer hover-children'>
                              <Link target='__blank' to={record.file}
                                className='col-11'
                              >
                                <FontAwesomeIcon icon={faFile} className='me-2 col-auto px-0 fs-1' />
                                <span className='col-10'>Arquivo</span>
                              </Link>
                            </div>
                            : <div className="fs--1 row-10">-</div>}
                          </div>
                          
                        :
                        <EditForm 
                          onSubmit={(formData) => handleSubmit(formData, record.uuid)} 
                          show={showForm['file']} fieldkey='file' setShow={setShowForm} data={record.profundidade}
                        />
                      }
                    </Tab.Pane>
                    <Tab.Pane eventKey="results">
                      <ResultAnaliseSolo dados={record.results} />
                    </Tab.Pane>
                    <Tab.Pane eventKey="map">
                      <ModalMediaContent title='Mapa'> 
                        {activeTab === 'map' && 
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
                        <OtherInfo info={record.other_info} />
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
                <span className="mb-1 fs-0 fw-bold d-inline-block me-2">-</span>
                {/* <SubtleBadge>{record.status.text}</SubtleBadge> */}
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

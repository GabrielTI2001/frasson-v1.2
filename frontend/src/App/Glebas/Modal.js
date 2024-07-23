import React, { useState, useEffect } from 'react';
import { CloseButton, Col, Dropdown, Modal, Nav, Row, Tab } from 'react-bootstrap';
import api from '../../context/data.js';
import { GetRecord } from '../../helpers/Data.js';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAppContext } from '../../Main.js';
import CardInfo, {CardTitle} from '../Pipeline/CardInfo.js';
import { DropMenu } from './Menu.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { SkeletBig } from '../../components/Custom/Skelet.js';
import { Coordenadas, NavModal2 } from './Nav.js';
import NavModal from './Nav.js';
import EditForm from './EditForm.js';
import IndexProdAgricola from '../Litec/Agricola/Index.js';
import IndexProdPecuaria from '../Litec/Pecuaria/Index.js';

const ModalRecord = ({show, reducer}) => {
  const [showForm, setShowForm] = useState({});
  const navigate = useNavigate()
  const token = localStorage.getItem("token")
  const {uuid} = useParams()
  const [record, setRecord] = useState();
  const {config: {theme}} = useAppContext();
  const [activeTab, setActiveTab] = useState('coordenadas');

  const handleClose = () => {
    navigate('/glebas/')
    setRecord(null)
  };

  const handleTabSelect = async (key) => {
    setActiveTab(key)
  }

  useEffect(() =>{
    const getData = async () =>{
      const reg = await GetRecord(uuid, 'glebas/index')
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
        formDataToSend.append('file', formData[key]);
      } else {
        formDataToSend.append(key, formData[key]);
      }
    }
    if (formData){
      api.put(`glebas/index/${uuid}/`, formDataToSend, {headers: {Authorization: `bearer ${token}`}})
      .then((response) => {
        reducer('edit', {...response.data, list_propriedades: response.data.list_propriedades.map(l => l.label).join(", ")})
        toast.success("Gleba Atualizada com Sucesso!")
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
          <Col className='border-1 px-0 overflow-auto modal-column-scroll pe-2' id='infocard' lg={4}>
            {record ? <>
              <div className="rounded-top-lg pt-1 pb-0 ps-3 mb-2">
                <h4 className="mb-1 fs-1 fw-bold">{record.gleba} - {record.list_propriedades.map(l => l.label).join(', ')}</h4>
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
                      <h5 className="mb-0 fs-0 fw-bold">Informações da Gleba</h5>
                      <div className='text-secondary fs--2 mb-2'>Criado por {record.str_created_by} em {' '}
                        {new Date(record.created_at).toLocaleDateString('pt-BR', {year:"numeric", month: "short", day: "numeric", timeZone: 'UTC'})}
                        {' às '+new Date(record.created_at).toLocaleTimeString('pt-BR', {hour:"numeric", minute:"numeric"})}
                      </div>
                      {!showForm.gleba ?
                        <div className="rounded-top-lg pt-1 pb-0 mb-2">
                          <CardTitle title='Gleba' field='gleba' click={handleEdit}/>
                          <div className="fs--1 row-10">{record.gleba || '-'}</div>
                        </div>
                        :
                        <EditForm 
                          onSubmit={(formData) => handleSubmit(formData, record.uuid)} 
                          show={showForm['gleba']} fieldkey='gleba' setShow={setShowForm} 
                          data={record.gleba}
                        />
                      }
                      {!showForm.cliente ?
                        <div className="rounded-top-lg pt-1 pb-0 mb-2">
                          <CardTitle title='Cliente' field='cliente' click={handleEdit}/>
                          <div className="fs--1 row-10">{record.str_cliente || '-'}</div>
                        </div>
                        :
                        <EditForm 
                          onSubmit={(formData) => handleSubmit(formData, record.uuid)} 
                          show={showForm['cliente']} fieldkey='cliente' setShow={setShowForm} 
                          data={{value:record.cliente, label:record.str_cliente}}
                        />
                      }
                      {!showForm.propriedades ?
                        <div className="rounded-top-lg pt-1 pb-0 mb-2">
                          <CardTitle title='Fazendas' field='propriedades' click={handleEdit}/>
                          <div className="fs--1 row-10">{record.list_propriedades.map(p => p.label).join(', ')}</div>
                        </div>
                        :
                        <EditForm 
                          onSubmit={(formData) => handleSubmit(formData, record.uuid)} 
                          show={showForm['propriedades']} fieldkey='propriedades' setShow={setShowForm} 
                          data={record.list_propriedades}
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
                          data={{value:record.municipio, label:record.str_municipio}}
                        />
                      }
                      {!showForm.descricao ?
                        <div className="rounded-top-lg pt-1 pb-0 mb-2">
                          <CardTitle title='Descrição' field='descricao' click={handleEdit}/>
                          <div className="fs--1 row-10">{record.descricao || '-'}</div>
                        </div>
                        :
                        <EditForm 
                          onSubmit={(formData) => handleSubmit(formData, record.uuid)} 
                          show={showForm['descricao']} fieldkey='descricao' setShow={setShowForm} 
                          data={record.descricao}
                        />
                      }
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
                <span className="mb-1 fs-0 fw-bold d-inline-block me-2">Outras Informações</span>
              </div>
              <Tab.Container id="right-tabs-example" defaultActiveKey="coordenadas" onSelect={handleTabSelect}>
                <NavModal2 record={record} />
                <Tab.Pane eventKey="coordenadas">
                  {activeTab === "coordenadas" && 
                    <Coordenadas record={record}/>
                  }
                </Tab.Pane>
                <Tab.Pane eventKey="agricola">
                  {activeTab === "agricola" && 
                    <IndexProdAgricola gleba={record} />
                  }
                </Tab.Pane>
                <Tab.Pane eventKey="pecuaria">
                  {activeTab === "pecuaria" && 
                    <IndexProdPecuaria gleba={record} />
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

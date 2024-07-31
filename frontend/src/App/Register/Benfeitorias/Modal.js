import React, { useState, useContext, useEffect } from 'react';
import { Button, CloseButton, Col, Dropdown, Form, Modal, Nav, Row, Tab } from 'react-bootstrap';
import ModalMediaContent from '../../Pipeline/ModalMediaContent.js';
import api from '../../../context/data.js';
import { GetRecord, sendData } from '../../../helpers/Data.js';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAppContext } from '../../../Main.js';
import {CardTitle} from '../../Pipeline/CardInfo.js';
import { DropMenu } from './Menu.js';
import { SkeletBig } from '../../../components/Custom/Skelet.js';
import EditForm from './EditForm.js';
import Avatar from '../../../components/common/Avatar.js';
import NavModal from './Nav.js'
import PicturesGallery from '../../../components/Custom/Galery.js';
import ModalDelete from '../../../components/Custom/ModalDelete.js';
import { ImgForm } from './Form.js';
import { RedirectToLogin } from '../../../Routes/PrivateRoute.js';

const options = {
  month: "short",
  day: "numeric",
  timeZone: 'UTC'
};

const ModalBenfeitoria = ({show, reducer}) => {
  const [showForm, setShowForm] = useState({'card':false,'data':false,'beneficiario':false, 
    'detalhamento': false, 'instituicao': false, 'others':false});
  const navigate = useNavigate()
  const token = localStorage.getItem("token")
  const {uuid} = useParams()
  const [record, setRecord] = useState();
  const {config: {theme}} = useAppContext();
  const [message, setMessage] = useState();
  const [images, setImages] = useState()
  const [activeTab, setActiveTab] = useState('main');
  const [modal, setModal] = useState({show:false, link:''})

  const handleClose = () => {
    navigate('/register/farm-assets')
    setRecord(null)
  };
  const handleTabSelect = async (key) => {
    setActiveTab(key)
  }

  useEffect(() =>{
    const getData = async () =>{
      const reg = await GetRecord(uuid, 'register/farm-assets')
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
        if(!images){
          const img = reg.pictures.map(picture => ({
              id:picture.id, url:`${process.env.REACT_APP_API_URL}${picture.url}`
          }))
          setImages(img)
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
  const submit = (type, data) =>{
    if (type === 'edit'){
        const formDataToSend = new FormData();
        formDataToSend.append('file', data.file);
        formDataToSend.append('benfeitoria', record.id);
        ApiImg(formDataToSend, data.id, 'edit')
    }
    else if (type === 'delete'){
        setModal({show:true, link:`${process.env.REACT_APP_API_URL}/register/picture-farm-assets/${data}/`})
    }
  }
  const ApiImg = async (dadosform, id, type) => {
    const {resposta, dados} = await sendData({type:type, url:'register/picture-farm-assets', keyfield:type === 'edit' ? id : null, 
      dadosform:dadosform, is_json:false
    })
    if(resposta.status === 400){
      setMessage({...dados})
    }
    else if (resposta.status === 401){
      RedirectToLogin(navigate);
    }
    else if (resposta.status === 201 || resposta.status === 200){
      if (type === 'edit'){
        toast.success("Registro Atualizado com Sucesso!")
        setImages(images.map(img => img.id === dados.id ? {...img, url:dados.file}:img))
      }
      else{
        toast.success("Registro Efetuado com Sucesso!")
        setImages([...images, ...dados.map(d => ({...d, url:`${process.env.REACT_APP_API_URL}${d.url}`}))])
      }
    }
  };
  const posdelete = (type, data) =>{
    setImages(images.filter(i => i.id !== parseInt(data)))
  }
  const formImgsubmit = (e, newimg) =>{
    e.preventDefault();
    const formDataToSend = new FormData();
    for (let i = 0; i < newimg.file.length; i++) {
        formDataToSend.append('file', newimg.file[i]);
    }
    formDataToSend.append('benfeitoria', record.id);
    ApiImg(formDataToSend, null, 'add')
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
      api.put(`register/farm-assets/${uuid}/`, formDataToSend, {headers: {Authorization: `Bearer ${token}`}})
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
          <Col className='border-1 px-0 overflow-auto modal-column-scroll pe-2' id='infocard' lg={6}>
            {record ? <>
              <div className="rounded-top-lg pt-1 pb-0 ps-3 mb-2">
                <h4 className="mb-1 fs-1 fw-bold">{record.str_farm}</h4>
              </div>
              <Tab.Container id="left-tabs-example" defaultActiveKey="main" onSelect={handleTabSelect}>
                <div className='ms-3 my-2'>
                  <NavModal record={record} />
                </div>
                <div className='ms-3 mt-2'>
                  <Tab.Content>
                    <Tab.Pane eventKey="main">
                      <h5 className="mb-0 fs-0 fw-bold">Informações da Benfeitoria</h5>
                      <div className='text-secondary fs--2 mb-2'>Criado por {record.str_created_by} em {' '}
                        {new Date(record.created_at).toLocaleDateString('pt-BR', {year:"numeric", month: "short", day: "numeric", timeZone: 'UTC'})}
                        {' às '+new Date(record.created_at).toLocaleTimeString('pt-BR', {hour:"numeric", minute:"numeric"})}
                      </div>

                      {!showForm.farm ?
                        <div className="rounded-top-lg pt-1 pb-0 mb-2">
                          <CardTitle title='Fazenda' field='farm' click={handleEdit}/>
                          <div className="fs--1 row-10">{record.str_farm}</div>
                        </div>
                        :
                        <EditForm 
                          onSubmit={(formData) => handleSubmit(formData, record.uuid)} 
                          show={showForm['farm']} fieldkey='farm' setShow={setShowForm} 
                          data={{value:record.farm, label:record.str_farm}}
                        />
                      }
                      {!showForm.type ?
                        <div className="rounded-top-lg pt-1 pb-0 mb-2">
                          <CardTitle title='Tipo Benfeitoria' field='type' click={handleEdit}/>
                          <div className="fs--1 row-10">{record.str_type || '-'}</div>
                        </div>
                        :
                        <EditForm 
                          onSubmit={(formData) => handleSubmit(formData, record.uuid)} 
                          show={showForm['type']} fieldkey='type' setShow={setShowForm} data={record.type}
                        />
                      }
                      {!showForm.data_construcao ?
                        <div className="rounded-top-lg pt-1 pb-0 mb-2">
                          <CardTitle title='Data Construção' field='data_construcao' click={handleEdit}/>
                          <div className="fs--1 row-10">{record.data_construcao ? 
                            `${new Date(record.data_construcao).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}` 
                            : '-'}
                          </div>
                        </div>
                        :
                        <EditForm 
                          onSubmit={(formData) => handleSubmit(formData, record.uuid)} 
                          show={showForm['data_construcao']} fieldkey='data_construcao' setShow={setShowForm} data={record.data_construcao}
                        />
                      }
                      {!showForm.tamanho ?
                        <div className="rounded-top-lg pt-1 pb-0 mb-2">
                          <CardTitle title='Tamanho' field='tamanho' click={handleEdit}/>
                          <div className="fs--1 row-10">
                            {record.tamanho ? Number(record.tamanho).toLocaleString('pt-BR',
                            {minimumFractionDigits: 2, maximumFractionDigits:2}) :'-'}
                          </div>
                        </div>
                        :
                        <EditForm 
                          onSubmit={(formData) => handleSubmit(formData, record.uuid)} 
                          show={showForm['tamanho']} fieldkey='tamanho' setShow={setShowForm} data={record.tamanho}
                        />
                      }
                      {!showForm.valor_estimado ?
                        <div className="rounded-top-lg pt-1 pb-0 mb-2">
                          <CardTitle title='Valor Estimado' field='valor_estimado' click={handleEdit}/>
                          <div className="fs--1 row-10">
                            {record.valor_estimado ? Number(record.valor_estimado).toLocaleString('pt-BR',
                            {minimumFractionDigits: 2, maximumFractionDigits:2}) :'-'}
                          </div>
                        </div>
                        :
                        <EditForm 
                          onSubmit={(formData) => handleSubmit(formData, record.uuid)} 
                          show={showForm['valor_estimado']} fieldkey='valor_estimado' setShow={setShowForm} data={record.valor_estimado}
                        />
                      }
                    </Tab.Pane>
                    <Tab.Pane eventKey="fotos">
                        <ModalMediaContent title='Fotos'>
                          {images ? <PicturesGallery images={images} showactions action={submit}/> : <div>Loading...</div>}
                          <hr></hr>
                          <ImgForm submit={formImgsubmit} />
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
                <span className="mb-1 fs-1 fw-bold d-inline-block me-2">-</span>
              </div>
              </>
            : uuid &&
              <SkeletBig />
            }
          </Col>
        </Row>
        <ModalDelete show={modal.show} close={() => setModal({...modal, show:false})} link={modal.link} update={posdelete}/>
      </Modal.Body>
    </Modal>
  );
}

export default ModalBenfeitoria;

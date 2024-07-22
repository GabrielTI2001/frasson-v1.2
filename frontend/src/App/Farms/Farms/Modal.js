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
import { Car, Coordenadas, NavModal2, Sigef } from './Nav.js';
import EditForm from './EditForm.js'
import NavModal from './Nav.js';

const options = {
  month: "short",
  day: "numeric",
  timeZone: 'UTC'
};

const ModalRecord = ({show, reducer}) => {
  const [showForm, setShowForm] = useState({});
  const navigate = useNavigate()
  const token = localStorage.getItem("token")
  const {uuid} = useParams()
  const [record, setRecord] = useState();
  const {config: {theme}} = useAppContext();
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
      api.put(`farms/farms/${uuid}/`, formData, {headers: {Authorization: `bearer ${token}`}})
      .then((response) => {
        reducer('edit', {...response.data, info_status:
          {color:response.data.status === 'EA' ? 'warning' : 'success', text:response.data.status_display}
        })
        toast.success("PVTEC Atualizada com Sucesso!")
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
                <h4 className="mb-1 fs-1 fw-bold">{record.nome}</h4>
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
                      <h5 className="mb-0 fs-0 fw-bold">Informações da Fazenda</h5>
                      <div className='text-secondary fs--2 mb-2'>Criado por {record.str_created_by} em {' '}
                        {new Date(record.created_at).toLocaleDateString('pt-BR', {year:"numeric", month: "short", day: "numeric", timeZone: 'UTC'})}
                        {' às '+new Date(record.created_at).toLocaleTimeString('pt-BR', {hour:"numeric", minute:"numeric"})}
                      </div>
                      {!showForm.nome ?
                        <div className="rounded-top-lg pt-1 pb-0 mb-2">
                          <CardTitle title='Nome da Fazenda' field='nome' click={handleEdit}/>
                          <div className="fs--1 row-10">{record.nome}</div>
                        </div>
                        :
                        <EditForm 
                          onSubmit={(formData) => handleSubmit(formData, record.uuid)} 
                          show={showForm['nome']} fieldkey='nome' setShow={setShowForm} data={record.nome}
                        />
                      }
                      {!showForm.matricula ?
                        <div className="rounded-top-lg pt-1 pb-0 mb-2">
                          <CardTitle title='Matrícula' field='matricula' click={handleEdit}/>
                          <div className="fs--1 row-10">{record.matricula}</div>
                        </div>
                        :
                        <EditForm 
                          onSubmit={(formData) => handleSubmit(formData, record.uuid)} 
                          show={showForm['matricula']} fieldkey='matricula' setShow={setShowForm} data={record.matricula}
                        />
                      }
                      {!showForm.municipio ?
                        <div className="rounded-top-lg pt-1 pb-0 mb-2">
                          <CardTitle title='Município Localização' field='municipio' click={handleEdit}/>
                          <div className="fs--1 row-10">{record.municipio_localizacao || '-'}</div>
                        </div>
                        :
                        <EditForm 
                          onSubmit={(formData) => handleSubmit(formData, record.uuid)} 
                          show={showForm['municipio']} fieldkey='municipio' setShow={setShowForm} 
                          data={{value:record.municipio, label:record.municipio_localizacao}}
                        />
                      }
                      {!showForm.area_total ?
                        <div className="rounded-top-lg pt-1 pb-0 mb-2">
                          <CardTitle title='Área Total (ha)' field='area_total' click={handleEdit}/>
                          <div className="fs--1 row-10">
                            {record.area_total ? Number(record.area_total).toLocaleString('pt-BR', {minimumFractionDigits:2}) : '-'}
                          </div>
                        </div>
                        :
                        <EditForm 
                          onSubmit={(formData) => handleSubmit(formData, record.uuid)} 
                          show={showForm['area_total']} fieldkey='area_total' setShow={setShowForm} data={record.area_total}
                        />
                      }
                      {!showForm.proprietarios ?
                        <div className="rounded-top-lg pt-1 pb-0 mb-2">
                          <CardTitle title='Proprietários' field='proprietarios' click={handleEdit}/>
                          <div className="fs--1 row-10">
                            {record.str_proprietarios.map(p => p.razao_social).join(', ')}
                          </div>
                        </div>
                        :
                        <EditForm 
                          onSubmit={(formData) => handleSubmit(formData, record.uuid)} 
                          show={showForm['proprietarios']} fieldkey='proprietarios' setShow={setShowForm} data={record.str_proprietarios}
                        />
                      }
                      {!showForm.livro_registro ?
                        <div className="rounded-top-lg pt-1 pb-0 mb-2">
                          <CardTitle title='Livro Registro' field='livro_registro' click={handleEdit}/>
                          <div className="fs--1 row-10">{record.livro_registro || '-'}</div>
                        </div>
                        :
                        <EditForm 
                          onSubmit={(formData) => handleSubmit(formData, record.uuid)} 
                          show={showForm['livro_registro']} fieldkey='livro_registro' setShow={setShowForm} data={record.livro_registro}
                        />
                      }
                      {!showForm.numero_registro ?
                        <div className="rounded-top-lg pt-1 pb-0 mb-2">
                          <CardTitle title='Número Registro' field='numero_registro' click={handleEdit}/>
                          <div className="fs--1 row-10">{record.numero_registro || '-'}</div>
                        </div>
                        :
                        <EditForm 
                          onSubmit={(formData) => handleSubmit(formData, record.uuid)} 
                          show={showForm['numero_registro']} fieldkey='numero_registro' setShow={setShowForm} data={record.numero_registro}
                        />
                      }
                      {!showForm.cns ?
                        <div className="rounded-top-lg pt-1 pb-0 mb-2">
                          <CardTitle title='CNS' field='cns' click={handleEdit}/>
                          <div className="fs--1 row-10">{record.cns || '-'}</div>
                        </div>
                        :
                        <EditForm 
                          onSubmit={(formData) => handleSubmit(formData, record.uuid)} 
                          show={showForm['cns']} fieldkey='cns' setShow={setShowForm} data={record.cns}
                        />
                      }
                      {!showForm.data_registro ?
                        <div className="rounded-top-lg pt-1 pb-0 mb-2">
                          <CardTitle title='Data Registro' field='data_registro' click={handleEdit}/>
                          <div className="fs--1 row-10">
                            {record.data_registro ? new Date(record.data_registro).toLocaleDateString('pt-BR', {timeZone:'UTC'}) : '-'}
                          </div>
                        </div>
                        :
                        <EditForm 
                          onSubmit={(formData) => handleSubmit(formData, record.uuid)} 
                          show={showForm['data_registro']} fieldkey='data_registro' setShow={setShowForm} data={record.data_registro}
                        />
                      }
                      {!showForm.cep ?
                        <div className="rounded-top-lg pt-1 pb-0 mb-2">
                          <CardTitle title='CEP' field='cep' click={handleEdit}/>
                          <div className="fs--1 row-10">{record.cep || '-'}</div>
                        </div>
                        :
                        <EditForm 
                          onSubmit={(formData) => handleSubmit(formData, record.uuid)} 
                          show={showForm['cep']} fieldkey='cep' setShow={setShowForm} data={record.cep}
                        />
                      }
                      {!showForm.endereco ?
                        <div className="rounded-top-lg pt-1 pb-0 mb-2">
                          <CardTitle title='Endereço' field='endereco' click={handleEdit}/>
                          <div className="fs--1 row-10">{record.endereco || '-'}</div>
                        </div>
                        :
                        <EditForm 
                          onSubmit={(formData) => handleSubmit(formData, record.uuid)} 
                          show={showForm['endereco']} fieldkey='endereco' setShow={setShowForm} data={record.endereco}
                        />
                      }
                      {!showForm.titulo_posse ?
                        <div className="rounded-top-lg pt-1 pb-0 mb-2">
                          <CardTitle title='Título Posse' field='titulo_posse' click={handleEdit}/>
                          <div className="fs--1 row-10">{record.titulo_posse || '-'}</div>
                        </div>
                        :
                        <EditForm 
                          onSubmit={(formData) => handleSubmit(formData, record.uuid)} 
                          show={showForm['titulo_posse']} fieldkey='titulo_posse' setShow={setShowForm} data={record.titulo_posse}
                        />
                      }
                      {!showForm.area_veg_nat ?
                        <div className="rounded-top-lg pt-1 pb-0 mb-2">
                          <CardTitle title='Área Veg. Nativa (ha)' field='area_veg_nat' click={handleEdit}/>
                          <div className="fs--1 row-10">
                            {record.area_veg_nat ? Number(record.area_veg_nat).toLocaleString('pt-BR', {minimumFractionDigits:2, maximumFractionDigits:2}) : '-'}
                          </div>
                        </div>
                        :
                        <EditForm 
                          onSubmit={(formData) => handleSubmit(formData, record.uuid)} 
                          show={showForm['area_veg_nat']} fieldkey='area_veg_nat' setShow={setShowForm} data={record.area_veg_nat}
                        />
                      }
                      {!showForm.area_app ?
                        <div className="rounded-top-lg pt-1 pb-0 mb-2">
                          <CardTitle title='Área APP (ha)' field='area_app' click={handleEdit}/>
                          <div className="fs--1 row-10">
                            {record.area_app ? Number(record.area_app).toLocaleString('pt-BR', {minimumFractionDigits:2, maximumFractionDigits:2}) : '-'}
                          </div>
                        </div>
                        :
                        <EditForm 
                          onSubmit={(formData) => handleSubmit(formData, record.uuid)} 
                          show={showForm['area_app']} fieldkey='area_app' setShow={setShowForm} data={record.area_app}
                        />
                      }
                      {!showForm.area_reserva ?
                        <div className="rounded-top-lg pt-1 pb-0 mb-2">
                          <CardTitle title='Área RL (ha)' field='area_reserva' click={handleEdit}/>
                          <div className="fs--1 row-10">
                            {record.area_reserva ? Number(record.area_reserva).toLocaleString('pt-BR', {minimumFractionDigits:2, maximumFractionDigits:2}) : '-'}
                          </div>
                        </div>
                        :
                        <EditForm 
                          onSubmit={(formData) => handleSubmit(formData, record.uuid)} 
                          show={showForm['area_reserva']} fieldkey='area_reserva' setShow={setShowForm} data={record.area_reserva}
                        />
                      }
                      {!showForm.area_explorada ?
                        <div className="rounded-top-lg pt-1 pb-0 mb-2">
                          <CardTitle title='Área Explorada (ha)' field='area_explorada' click={handleEdit}/>
                          <div className="fs--1 row-10">
                            {record.area_explorada ? Number(record.area_explorada).toLocaleString('pt-BR', {minimumFractionDigits:2, maximumFractionDigits:2}) : '-'}
                          </div>
                        </div>
                        :
                        <EditForm 
                          onSubmit={(formData) => handleSubmit(formData, record.uuid)} 
                          show={showForm['area_explorada']} fieldkey='area_explorada' setShow={setShowForm} data={record.area_explorada}
                        />
                      }
                      {!showForm.modulos_fiscais ?
                        <div className="rounded-top-lg pt-1 pb-0 mb-2">
                          <CardTitle title='Módulos Fiscais' field='modulos_fiscais' click={handleEdit}/>
                          <div className="fs--1 row-10">
                            {record.modulos_fiscais ? Number(record.modulos_fiscais).toLocaleString('pt-BR', {minimumFractionDigits:2, maximumFractionDigits:2}) : '-'}
                          </div>
                        </div>
                        :
                        <EditForm 
                          onSubmit={(formData) => handleSubmit(formData, record.uuid)} 
                          show={showForm['modulos_fiscais']} fieldkey='modulos_fiscais' setShow={setShowForm} data={record.modulos_fiscais}
                        />
                      }
                      {!showForm.localizacao_reserva ?
                        <div className="rounded-top-lg pt-1 pb-0 mb-2">
                          <CardTitle title='Localização Reserva' field='localizacao_reserva' click={handleEdit}/>
                          <div className="fs--1 row-10">{record.localizacao_reserva || '-'}</div>
                        </div>
                        :
                        <EditForm 
                          onSubmit={(formData) => handleSubmit(formData, record.uuid)} 
                          show={showForm['localizacao_reserva']} fieldkey='localizacao_reserva' setShow={setShowForm} data={record.localizacao_reserva}
                        />
                      }
                      {!showForm.codigo_car ?
                        <div className="rounded-top-lg pt-1 pb-0 mb-2">
                          <CardTitle title='N° CAR' field='codigo_car' click={handleEdit}/>
                          <div className="fs--1 row-10">{record.codigo_car || '-'}</div>
                        </div>
                        :
                        <EditForm 
                          onSubmit={(formData) => handleSubmit(formData, record.uuid)} 
                          show={showForm['codigo_car']} fieldkey='codigo_car' setShow={setShowForm} data={record.codigo_car}
                        />
                      }
                      {!showForm.codigo_imovel ?
                        <div className="rounded-top-lg pt-1 pb-0 mb-2">
                          <CardTitle title='Código Imóvel' field='codigo_imovel' click={handleEdit}/>
                          <div className="fs--1 row-10">{record.codigo_imovel || '-'}</div>
                        </div>
                        :
                        <EditForm 
                          onSubmit={(formData) => handleSubmit(formData, record.uuid)} 
                          show={showForm['codigo_imovel']} fieldkey='codigo_imovel' setShow={setShowForm} data={record.codigo_imovel}
                        />
                      }
                      {!showForm.numero_nirf ?
                        <div className="rounded-top-lg pt-1 pb-0 mb-2">
                          <CardTitle title='N° NIRF' field='numero_nirf' click={handleEdit}/>
                          <div className="fs--1 row-10">{record.numero_nirf || '-'}</div>
                        </div>
                        :
                        <EditForm 
                          onSubmit={(formData) => handleSubmit(formData, record.uuid)} 
                          show={showForm['numero_nirf']} fieldkey='numero_nirf' setShow={setShowForm} data={record.numero_nirf}
                        />
                      }
                      {!showForm.cartorio_registro ?
                        <div className="rounded-top-lg pt-1 pb-0 mb-2">
                          <CardTitle title='Cartório' field='cartorio_registro' click={handleEdit}/>
                          <div className="fs--1 row-10">{record.str_cartorio || '-'}</div>
                        </div>
                        :
                        <EditForm 
                          onSubmit={(formData) => handleSubmit(formData, record.uuid)} 
                          show={showForm['cartorio_registro']} fieldkey='cartorio_registro' setShow={setShowForm} 
                          data={{value:record.cartorio_registro, label:record.str_cartorio}}
                        />
                      }
                      {!showForm.roteiro_acesso ?
                        <div className="rounded-top-lg pt-1 pb-0 mb-2">
                          <CardTitle title='Roteiro Acesso' field='roteiro_acesso' click={handleEdit}/>
                          <div className="fs--1 row-10">{record.roteiro_acesso || '-'}</div>
                        </div>
                        :
                        <EditForm 
                          onSubmit={(formData) => handleSubmit(formData, record.uuid)} 
                          show={showForm['roteiro_acesso']} fieldkey='roteiro_acesso' setShow={setShowForm} data={record.roteiro_acesso}
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
                <span className="mb-1 fs-0 fw-bold d-inline-block me-2">Mapas</span>
              </div>
              <NavModal2 record={record} />
              <Tab.Container id="left-tabs-example" defaultActiveKey="matricula" onSelect={handleTabSelect}>
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

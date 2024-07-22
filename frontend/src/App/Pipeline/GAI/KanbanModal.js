import React, { useState, useContext, useEffect } from 'react';
import { CloseButton, Col, Dropdown, Modal, Nav, Row, Tab } from 'react-bootstrap';
import ModalMediaContent from '../ModalMediaContent';
import GroupMember from '../GroupMember';
import ModalCommentContent from '../ModalCommentContent';
import ModalActivityContent from '../ModalActivityContent';
import { PipeContext } from '../../../context/Context';
import api from '../../../context/data';
import ModalSidebar from '../ModalSidebar';
import EditForm from './EditForm';
import { GetRecord, HandleSearch } from '../../../helpers/Data';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import SubtleBadge from '../../../components/common/SubtleBadge';
import { useAppContext } from '../../../Main';
import CardInfo, {CardTitle} from '../CardInfo';
import { TaskDropMenu } from './TaskCard';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { calcdif } from './TaskCard';
import { faCalendar, faComment, faFilter, faMoneyBill, faPaperclip } from '@fortawesome/free-solid-svg-icons';
import EditFormOthers from './EditFormOthers';
import { SkeletBig } from '../../../components/Custom/Skelet';
import {Anexos} from '../Anexos';
import PVTEC from '../PVTEC/PVTEC';
import NavGai from './Nav';
import Cobrancas from '../Cobrancas/Index';

const options = {
  month: "short",
  day: "numeric",
  timeZone: 'UTC'
};

const KanbanModal = ({show, movercard}) => {
  const [showForm, setShowForm] = useState({'card':false,'data':false,'beneficiario':false, 
    'detalhamento': false, 'instituicao': false, 'others':false});
  const {kanbanState: {kanbanModal}, kanbanDispatch} = useContext(PipeContext);
  const navigate = useNavigate()
  const token = localStorage.getItem("token")
  const {code} = useParams()
  const [card, setCard] = useState();
  const [activities, setActivities] = useState();
  const {config: {theme}} = useAppContext();
  const [activeTab, setActiveTab] = useState('processo');

  const handleClose = () => {
    if (card){
      navigate('/pipeline/'+card.pipe_code)
    }
    kanbanDispatch({ type: 'TOGGLE_KANBAN_MODAL' });
    setCard(null)
    setActivities(null)
  };

  const handleTabSelect = async (key) => {
    setActiveTab(key)
  }

  useEffect(() =>{
    const getData = async () =>{
      const card = await GetRecord(code, 'pipeline/fluxos/gestao-ambiental')
      if (!card){
        handleClose()
        navigate("/auth/login")
      }
      else{
        if (Object.keys(card).length === 0){
          handleClose()
          navigate("/error/404")
        }
        setCard(card)
        if (!activities){
          HandleSearch('', 'pipeline/card-activities',(data) => {setActivities(data)}, `?fluxogai=${card.id}`)
        }
      }
    }
    if(kanbanModal.show && code){getData()}
  }, [kanbanModal])

  const handleEdit = (key) =>{
    setShowForm(prevState => ({
      ...prevState,
      [key]: !prevState[key]
    }));
  }

  const handleSubmit = (formData) =>{
    if (formData){
      api.put(`pipeline/fluxos/gestao-ambiental/${code}/`, formData, {headers: {Authorization: `bearer ${token}`}})
      .then((response) => {
        kanbanDispatch({
          type: 'UPDATE_TASK_CARD',
          payload: {
            updatedCard: {id: response.data.id, card:response.data.card, str_detalhamento:response.data.info_detalhamento.detalhamento_servico,
              str_beneficiario:response.data.list_beneficiario.razao_social, created_at: response.data.created_at, code: response.data.code,
              prioridade:response.data.prioridade, list_responsaveis: response.data.list_responsaveis, data_vencimento: response.data.data_vencimento,
              str_instituicao:response.data.info_instituicao.razao_social
            },
            targetListId: card.phase,
            id: card.id
          }
        })
        toast.success("Card Atualizado com Sucesso!")
        setCard(response.data)
        if (response.data.activity){
          setActivities([response.data.activity, ...activities])
        }
      })
      .catch((erro) => {
        console.error('erro: '+erro);
      })
    }
    setShowForm({...showForm, 'card':false,'data':false,'beneficiario':false,'detalhamento':false, 
    'instituicao':false, 'contrato':false})
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
        <TaskDropMenu card={card}/>
        <CloseButton
          onClick={handleClose}
          className="btn btn-sm btn-circle d-flex flex-center transition-base ms-2"
        />
      </div>
      <Modal.Body className="pt-2">
        <Row className='p-2 gy-1'>
          <Col className='border-1 px-0 overflow-auto modal-column-scroll pe-2' id='infocard' lg={5}>
            {card ? <>
              <div className="rounded-top-lg pt-1 pb-0 ps-3 mb-2">
                {card.info_detalhamento && (
                  <h4 className="mb-1 fs-1 fw-bold">{card.info_detalhamento.detalhamento_servico}</h4>
                )}
              </div>
              <Dropdown className='mb-2 px-3'>
                <Dropdown.Toggle as={Nav}
                  className='dropdown-caret-none p-0 ms-0 row gx-0' style={{width:'100% !important'}}
                >
                    <Col className='cursor-pointer d-flex align-items-center' onClick={() => handleEdit('others')} xl='auto' sm='auto' xs='auto'>
                      <GroupMember users={card.list_responsaveis} className='cursor-pointer col-auto px-0 d-inline-block' onClick={() => handleEdit('others')}/>
                      <span 
                        className={`rounded-circle p-1 px-2 me-1 mb-1 ${calcdif(card.data_vencimento) > 0 ?'bg-success-subtle':'bg-danger-subtle'}`}
                      >
                        <FontAwesomeIcon icon={faCalendar} className={`text-${calcdif(card.data_vencimento) > 0 ?'success':'danger'}`}/>
                      </span>
                      <SubtleBadge bg={calcdif(card.data_vencimento) > 0 ? 'secondary' : 'danger'} className='me-1 fw-normal fs--2 mb-1'>
                        Venc {new Date(card.data_vencimento).toLocaleDateString('pt-BR', options)}
                      </SubtleBadge> 
                    </Col>
                    <Col xl='auto' sm='auto' xs='auto'>
                      {calcdif(card.data_vencimento) > 0 
                        ? <span style={{fontSize:'0.7rem'}}>em {parseInt(calcdif(card.data_vencimento))} dias</span>
                        : <span style={{fontSize:'0.7rem'}}>{parseInt(calcdif(card.data_vencimento)) * -1} dias atrás</span>
                      }
                      <SubtleBadge bg={`${card.prioridade === 'Alta' ? 'danger' : card.prioridade === 'Média' ? 'warning' : 'success'}`} 
                        className='ms-2 fw-normal text-body fs--2'>{card.prioridade}
                      </SubtleBadge>
                    </Col>
                </Dropdown.Toggle>
                <Dropdown.Menu className='text-body px-3'  style={{ width: '400px' }}>
                  <EditFormOthers 
                    onSubmit={handleSubmit}
                    data={{responsaveis:card.list_responsaveis, data_vencimento:card.data_vencimento, prioridade:card.prioridade}} 
                  />
                </Dropdown.Menu>
              </Dropdown>
              <Tab.Container id="left-tabs-example" defaultActiveKey="processo" onSelect={handleTabSelect}>
                <div className='ms-3 my-2'>
                  <NavGai card={card} />
                </div>
                <div className='ms-3 mt-3'>
                  <Tab.Content>
                    <Tab.Pane eventKey="processo">
                      <h5 className="mb-0 fs-0 fw-bold">Informações do Processo</h5>
                      <div className='text-secondary fs--2'>Criado por {card.str_created_by} em {' '}
                        {new Date(card.created_at).toLocaleDateString('pt-BR', {year:"numeric", month: "short", day: "numeric", timeZone: 'UTC'})}
                        {' às '+new Date(card.created_at).toLocaleTimeString('pt-BR', {hour:"numeric", minute:"numeric"})}
                      </div>
                      <div className="rounded-top-lg pt-1 pb-0">
                        <span className='fw-bold fs--1'>Processo</span>
                        <div className="fs--1 row-10">#{card.code}</div>
                      </div>
                      <div className="rounded-top-lg pt-1 pb-0 mb-2">
                        <CardTitle title='Beneficiário*' click={handleEdit} field='beneficiario'/>
                        {card.beneficiario && !showForm['beneficiario'] && card.list_beneficiario.map ((b) =>
                          <CardInfo data={b} attr1='razao_social' attr2='cpf_cnpj' key={b.id} url='register/pessoal'/>
                        )}
                        <EditForm 
                          onSubmit={handleSubmit} 
                          show={showForm['beneficiario']}
                          fieldkey='beneficiario'
                          setShow={setShowForm}
                          data={card.list_beneficiario}
                        />
                      </div>
                      <div className="rounded-top-lg mb-2">
                        <CardTitle title='Detalhamento da Demanda*' click={handleEdit} field='detalhamento'/>
                        {card.info_detalhamento && !showForm['detalhamento'] &&
                          <CardInfo data={card.info_detalhamento} attr1='detalhamento_servico' attr2='produto'/>
                        }
                        <EditForm 
                          onSubmit={handleSubmit} 
                          show={showForm['detalhamento']}
                          fieldkey='detalhamento'
                          setShow={setShowForm}
                          data={card.info_detalhamento}
                        />
                      </div>
                      <div className="rounded-top-lg pt-1 pb-0 mb-2">
                        <CardTitle title='Instituição Vinculada*' click={handleEdit} field='instituicao'/>
                        {card.info_instituicao && !showForm['instituicao'] &&
                          <CardInfo data={card.info_instituicao} attr1='razao_social' attr2='identificacao'/>
                        }
                        <EditForm 
                          onSubmit={handleSubmit} 
                          show={showForm['instituicao']}
                          fieldkey='instituicao'
                          setShow={setShowForm}
                          data={card.info_instituicao}
                        />
                      </div>
                      <div className="rounded-top-lg pt-1 pb-0 mb-2">
                        <CardTitle title='Contrato Serviço*' click={handleEdit} field='contrato'/>
                        {!showForm['contrato'] && card.info_contrato && 
                          <CardInfo data={card.info_contrato} attr1='contratante' attr2='produto' url='finances/contracts/environmental'/>
                        }
                        <EditForm 
                          onSubmit={handleSubmit} 
                          show={showForm['contrato']}
                          fieldkey='contrato'
                          setShow={setShowForm}
                          data={card.info_contrato}
                        />
                      </div>
                      <span className='fw-bold fs-0'>Histórico</span>
                      <div className="rounded-top-lg pt-1 pb-0 mb-2">
                        {card.history_fases_list.map(h =>
                          <div className={`p-1 mb-1 text-body row mx-0 info-pipe ${theme === 'dark' ? 'info-pipe-dark' : ''}`} key={h.id}>
                              <label className='row fw-bold fs--2'>{h.phase_name}</label>
                              <label className='row fs--2'>Duração (min): 
                                {' '+Number(h.duration/60).toLocaleString("pt-BR", {maximumFractionDigits:2})}
                              </label>
                          </div>
                        )}
                      </div>
                    </Tab.Pane>
                    <Tab.Pane eventKey="anexos">
                      {activeTab === 'anexos' && 
                        <ModalMediaContent title='Anexos'><Anexos card={card} updatedactivity={(a) => setActivities([a, ...activities])}/></ModalMediaContent>
                      }
                    </Tab.Pane>
                    <Tab.Pane eventKey="comments">
                      <ModalMediaContent title='Comentários'> 
                        {activeTab === 'comments' &&
                          <ModalCommentContent card={card} updatedactivity={(a) => setActivities([a, ...activities])}/>
                        }
                      </ModalMediaContent>
                    </Tab.Pane>
                    <Tab.Pane eventKey="pvtec">
                      {activeTab === 'pvtec' && 
                        <PVTEC card={card} updatedactivity={(a) => setActivities([a, ...activities])}/>
                      }
                    </Tab.Pane>
                    <Tab.Pane eventKey="cobrancas">
                      {activeTab === 'cobrancas' && 
                        <Cobrancas card={card} updatedactivity={(a) => setActivities([a, ...activities])}/>
                      }
                    </Tab.Pane>
                  </Tab.Content>
                </div>
              </Tab.Container></>
            : kanbanModal.show &&
              <SkeletBig />
            }
            
          </Col>
          <Col lg={5} className='overflow-auto modal-column-scroll border border-bottom-0 border-top-0'>
            {card ? <>
              <div className="rounded-top-lg pt-1 pb-0 mb-2">
                <span className="mb-1 fs-0 fw-bold d-inline-block me-2">Fase Atual</span>
                <SubtleBadge>{card.str_fase}</SubtleBadge>
              </div>
              <ModalMediaContent title='Atividades'>
                <ModalActivityContent card={card} atividades={activities}/>
              </ModalMediaContent>
              </>
            : kanbanModal.show &&
              <SkeletBig />
            }
          </Col>
          <Col lg={2} className='mb-1 overflow-auto modal-column-scroll actionscard'>
          {card ?
            <ModalSidebar card={card} pipe={card.pipe_code} fases={card.fases_list} namefase={card.str_fase} move={movercard}/>
          : kanbanModal.show &&
            <SkeletBig />
          }
          </Col>
        </Row>
      </Modal.Body>
    </Modal>
  );
}

export default KanbanModal;

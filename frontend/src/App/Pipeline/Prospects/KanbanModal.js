import React, { useState, useContext, useEffect } from 'react';
import { CloseButton, Col, Modal, Row, Tab } from 'react-bootstrap';
import ModalMediaContent from '../ModalMediaContent';
import ModalCommentContent from '../ModalCommentContent';
import ModalActivityContent from '../ModalActivityContent';
import { PipeContext } from '../../../context/Context';
import api from '../../../context/data';
import ModalSidebar from '../ModalSidebar';
import { GetRecord, HandleSearch, SelectOptions } from '../../../helpers/Data';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import SubtleBadge from '../../../components/common/SubtleBadge';
import { useAppContext } from '../../../Main';
import CardInfo, {CardTitle, DropdownModal} from '../CardInfo';
import { TaskDropMenu } from './TaskCard';
import { SkeletBig } from '../../../components/Custom/Skelet';
import {Anexos} from '../Anexos';
import NavGai from './Nav';
import { RedirectToLogin } from '../../../Routes/PrivateRoute';
import { fieldsProspect } from '../Data';
import EditFormModal from '../../../components/Custom/EditForm';
import MinutaContrato from './MinutaContrato';
import IndexAT from '../AnaliseTecnica/Index';
import Encerramento from './Encerramento';

const KanbanModal = ({show, movercard}) => {
  const [showForm, setShowForm] = useState({});
  const {kanbanState: {kanbanModal}, kanbanDispatch} = useContext(PipeContext);
  const navigate = useNavigate()
  const token = localStorage.getItem("token")
  const {code} = useParams()
  const [card, setCard] = useState();
  const [activities, setActivities] = useState();
  const {config: {theme}} = useAppContext();
  const [activeTab, setActiveTab] = useState('processo');
  const [options, setOptions] = useState();

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
      const reg = await GetRecord(code, 'pipeline/fluxos/prospects')
      if (!reg){
        handleClose()
        RedirectToLogin(navigate)
      }
      else{
        if (Object.keys(reg).length === 0){
          handleClose()
          navigate("/error/404")
        }
        setCard(reg)
        const getoptions = async () =>{
          const options = await SelectOptions('register/produtos', 'description', 'acronym')
          setOptions({'produto':options})
        }
        if (!options) { getoptions() }
        if (!activities){
          HandleSearch('', 'pipeline/card-activities',(data) => {setActivities(data)}, `?prospect=${reg.id}`)
        }
      }
    }
    if(kanbanModal.show && code) { !card && getData() } else { setCard(null) }
  }, [kanbanModal])

  const handleEdit = (key) =>{
    setShowForm(prevState => ({
      ...prevState,
      [key]: !prevState[key]
    }));
  }

  const handleSubmit = (formData) =>{
    if (formData){
      api.put(`pipeline/fluxos/prospects/${code}/`, formData, {headers: {Authorization: `Bearer ${token}`}})
      .then((response) => {
        kanbanDispatch({
          type: 'UPDATE_TASK_CARD',
          payload: {
            updatedCard: {id: response.data.id, str_produto:response.data.info_produto.description, 
              nome:response.data.nome, created_at: response.data.created_at, code: response.data.code,
              list_responsaveis: response.data.list_responsaveis, data_vencimento: response.data.data_vencimento,
            },
            targetListId: card.phase,
            id: card.id
          }
        })
        toast.success("Card Atualizado com Sucesso!")
        setShowForm({})
        setCard(response.data)
        if (response.data.activity){
          setActivities([response.data.activity, ...activities])
        }
      })
      .catch((erro) => {
        if (erro.response.status === 400){
          toast.error(Object.values(erro.response.data)[0][0])
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
        <TaskDropMenu card={card}/>
        <CloseButton
          onClick={handleClose}
          className="btn btn-sm btn-circle d-flex flex-center transition-base ms-2"
        />
      </div>
      <Modal.Body className="pt-2">
        <Row className='p-2 gy-1'>
          <Col className='border-1 pe-3 ps-3 overflow-auto modal-column-scroll' id='infocard' lg={5}>
            {card ? <>
              <div className="rounded-top-lg pt-1 pb-0 mb-2">
                <h4 className="mb-1 fs-1 fw-bold">{card.nome}</h4>
              </div>
              <DropdownModal card={card} handleSubmit={handleSubmit} handleEdit={handleEdit}/>
              <Tab.Container id="left-tabs-example" defaultActiveKey="processo" onSelect={handleTabSelect}>
                <NavGai card={card} />
                  <Tab.Content>
                    <Tab.Pane eventKey="processo">
                      <h5 className="mb-0 fs-0 mt-2 fw-bold">Informações do Prospect</h5>
                      <div className='text-secondary fs--2'>Criado por {card.str_created_by} em {' '}
                        {new Date(card.created_at).toLocaleDateString('pt-BR', {year:"numeric", month: "short", day: "numeric", timeZone: 'UTC'})}
                        {' às '+new Date(card.created_at).toLocaleTimeString('pt-BR', {hour:"numeric", minute:"numeric"})}
                      </div>
                      <div className="rounded-top-lg pt-1 pb-0">
                        <span className='fw-bold fs--1'>Prospect</span>
                        <div className="fs--1 row-10">#{card.code}</div>
                      </div>

                      {fieldsProspect.slice(0,5).map(f => 
                        !showForm[f.name] ?
                          <div className="rounded-top-lg pt-1 pb-0 mb-2" key={f.name}>
                            <CardTitle title={f.label.replace('*','')} field={f.name} click={handleEdit}/>
                            {f.type === 'select2' ? 
                              <CardInfo data={card[f.data]} attr1={f.attr1} 
                                attr2={f.attr2} key={card[f.data].uuid} url={f.name !== 'produto' && f.url}
                              />
                            : f.type === 'select' ?
                              f.name === 'classificacao' ?
                                <div className="fs--1 row-10">{card[f.name] || '-'}</div>
                              :
                                <div className="fs--1 row-10">{card[f.data] && card[f.data][f.attr1]}</div>
                            : f.type === 'date' ? 
                              <div className="fs--1 row-10">{card[f.name] ? new Date(card[f.name]).toLocaleDateString('pt-BR', {timeZone:'UTC'}) : '-'}</div>
                            : f.type === 'dropdown' ?
                              <div className="fs--1 row-10">{f.icon && f.icon[card[f.name]]} {card[f.string] || '-'}</div>
                            : 
                              <div className="fs--1 row-10 text-justify">{card[f.name] || '-'}</div>}
                          </div>
                          :
                          <EditFormModal key={f.name} options={options}
                            onSubmit={(formData) => handleSubmit(formData, card.uuid)} 
                            show={showForm[f.name]} fieldkey={f.name} setShow={setShowForm} 
                            record={card} field={f}
                          />
                      )}

                      <span className='fw-bold fs-0 d-block mt-3 mb-2'>Histórico</span>
                      <div className='row gx-0'>
                        {card.history_fases_list.map(h =>
                          <CardInfo data={h} attr1={'phase_name'} small key={h.phase_name}
                            title2={`Duração (min): ${Number(h.duration/60).toLocaleString("pt-BR", {maximumFractionDigits:2})}`}
                          />
                        )}
                      </div>

                    </Tab.Pane>
                    <Tab.Pane eventKey="anexos">
                      {activeTab === 'anexos' && 
                        <ModalMediaContent title='Anexos'>
                          <Anexos card={card} isprospect updatedactivity={(a) => setActivities([a, ...activities])}/>
                        </ModalMediaContent>
                      }
                    </Tab.Pane>
                    <Tab.Pane eventKey="comments">
                      <ModalMediaContent title='Comentários'> 
                        {activeTab === 'comments' &&
                          <ModalCommentContent card={card} updatedactivity={(a) => setActivities([a, ...activities])}
                            link='pipeline/card-comments' param='prospect' paramform='fluxo_prospect'
                          />
                        }
                      </ModalMediaContent>
                    </Tab.Pane>
                    <Tab.Pane eventKey="minutacontrato">
                      <ModalMediaContent title='Minuta de Contrato'> 
                        {activeTab === 'minutacontrato' && 
                          <MinutaContrato card={card} updatedactivity={(a) => setActivities([a, ...activities])} setcard={setCard}/>
                         }
                      </ModalMediaContent>
                    </Tab.Pane>
                    <Tab.Pane eventKey="analisetec">
                      <ModalMediaContent title='Análse Técnica'> 
                        {activeTab === 'analisetec' && <IndexAT card={card} updatedactivity={(a) => setActivities([a, ...activities])}/>}
                      </ModalMediaContent>
                    </Tab.Pane>
                    <Tab.Pane eventKey="encerramento">
                      <ModalMediaContent title='Encerramento'> 
                        {activeTab === 'encerramento' && 
                          <Encerramento card={card} updatedactivity={(a) => setActivities([a, ...activities])} setcard={setCard}/>
                         }
                      </ModalMediaContent>
                    </Tab.Pane>
                  </Tab.Content>
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
              {card && card.phase === 89 &&
                <ModalMediaContent title='Proposta de Valor'>
                  {fieldsProspect.slice(5).map(f => 
                    !showForm[f.name] ?
                      <div className="rounded-top-lg pt-1 pb-0 mb-2" key={f.name}>
                        <CardTitle title={f.label.replace('*','')} field={f.name} click={handleEdit}/>
                        <div className="fs--1 row-10 text-justify">
                          {card[f.name] ? Number(card[f.name]).toLocaleString('pt-br', {minimumFractionDigits:2}) : '-'}
                        </div>
                      </div>
                    :
                    <EditFormModal key={f.name} options={options}
                      onSubmit={(formData) => handleSubmit(formData, card.uuid)} 
                      show={showForm[f.name]} fieldkey={f.name} setShow={setShowForm} 
                      record={card} field={f}
                    />)
                  }
                </ModalMediaContent>
              }  
              <ModalMediaContent title='Atividades'>
                <ModalActivityContent card={card} atividades={activities}/>
              </ModalMediaContent>
              </>
            : kanbanModal.show &&
              <SkeletBig />
            }
          </Col>
          
          <Col lg={2} className='mb-1 overflow-auto modal-column-scroll actionscard'>
          {card 
            ? <ModalSidebar card={card} pipe={card.pipe_code} fases={card.fases_list} namefase={card.str_fase} move={movercard}/>
            : kanbanModal.show && <SkeletBig />
          }
          </Col>
        </Row>
      </Modal.Body>
    </Modal>
  );
}

export default KanbanModal;

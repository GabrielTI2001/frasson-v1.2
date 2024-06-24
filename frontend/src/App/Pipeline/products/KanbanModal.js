import React, { useState, useContext, useEffect } from 'react';
import { CloseButton, Col, Modal, Placeholder, Row } from 'react-bootstrap';
// import '../../../assets/scss/custom.css';
// import Background from 'components/common/Background';
// import { Link } from 'react-router-dom';
import ModalMediaContent from '../ModalMediaContent';
// import GroupMember from './GroupMember';
// import { members } from 'data/kanban';
// import ModalLabelContent from './ModalLabelContent';
// import ModalAttachmentContent from './ModalAttachmentContent';
import ModalCommentContent from '../ModalCommentContent';
// import ModalActivityContent from './ModalActivityContent';
import { PipeContext } from '../../../context/Context';
import api from '../../../context/data';
import ModalSidebar from '../ModalSidebar';
import EditForm from './EditForm';
import { GetRecord } from '../../../helpers/Data';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import SubtleBadge from '../../../components/common/SubtleBadge';
import { useAppContext } from '../../../Main';
import CardInfo, {CardTitle} from '../CardInfo';
import { TaskDropMenu } from './TaskCard';

const KanbanModal = ({show}) => {
  const [showForm, setShowForm] = useState({'card':false,'data':false,'beneficiario':false, 
    'detalhamento': false, 'instituicao': false});
  const {kanbanState: {kanbanModal}, kanbanDispatch} = useContext(PipeContext);
  const navigate = useNavigate()
  const token = localStorage.getItem("token")
  const {pipe, code} = useParams()
  const [card, setCard] = useState();
  const {config: {theme}} = useAppContext();

  const handleClose = () => {
    navigate('/pipeline/'+pipe)
    kanbanDispatch({ type: 'TOGGLE_KANBAN_MODAL' });
  };

  useEffect(() =>{
    const getData = async () =>{
      const card = await GetRecord(code, 'pipeline/cards/produtos')
      if (!card){
        setCard({})
        navigate("/auth/login")
      }
      else{
        if (Object.keys(card).length === 0){
          handleClose()
          navigate("/error/404")
        }
        setCard(card)
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
      api.put(`pipeline/cards/produtos/${code}/`, formData, {headers: {Authorization: `bearer ${token}`}})
      .then((response) => {
        kanbanDispatch({
          type: 'UPDATE_TASK_CARD',
          payload: {
            updatedCard: {id: response.data.id, card:response.data.card, str_detalhamento:response.data.info_detalhamento.detalhamento_servico,
              str_beneficiario:response.data.list_beneficiario[0].razao_social, created_at: response.data.created_at, code: response.data.code,
              prioridade:response.data.prioridade, list_responsaveis: response.data.list_responsaveis, data_vencimento: response.data.data_vencimento
            },
            targetListId: card.phase,
            id: card.id
          }
        })
        toast.success("Card Atualizado com Sucesso!")
        setCard(response.data)
      })
      .catch((erro) => {
        console.error('erro: '+erro);
      })
    }
    setShowForm({...showForm, 'card':false,'data':false,'beneficiario':false,'detalhamento':false, 
    'instituicao':false, 'contrato':false, 'responsaveis':false, 'data_vencimento':false})
  }


  if (card){
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
          {card ? 
           <Row className='p-2'>
              <Col className='border-1 px-0 overflow-auto modal-column-scroll' id='infocard' lg={5}>
                <div className="rounded-top-lg pt-1 pb-0 ps-3">
                  {card.info_detalhamento && (
                    <h4 className="mb-1 fs-0 fw-bold">{card.info_detalhamento.detalhamento_servico}</h4>
                  )}
                </div>
                <span className='fw-bold fs--1 ms-3'>Formulário Inicial</span>
                <div className="rounded-top-lg ps-3 pt-1 pb-0">
                  <span className='fw-bold fs--1'>Processo</span>
                  <div className="fs--1 ms-3 row-10">#{card.code}</div>
                  <CardTitle title='Card*' click={handleEdit} field='card'/>
                  {card.card && !showForm['card'] &&
                    <div className="fs--1 ms-3 row-10">{card.card}</div>
                  }
                  <EditForm 
                    onSubmit={handleSubmit} 
                    show={showForm['card']}
                    fieldkey='card'
                    setShow={setShowForm}
                    data={card.card}
                  />
                </div>
                <div className="rounded-top-lg ps-3 pt-1 pb-0 mb-2">
                  <CardTitle title='Beneficiário*' click={handleEdit} field='beneficiario'/>
                  {card.beneficiario && !showForm['beneficiario'] && card.list_beneficiario.map ((b) =>
                    <CardInfo data={b} title2='CPF/CNPJ:' attr1='razao_social' attr2='cpf_cnpj' key={b.id}/>
                  )}
                  <EditForm 
                    onSubmit={handleSubmit} 
                    show={showForm['beneficiario']}
                    fieldkey='beneficiario'
                    setShow={setShowForm}
                    data={card.list_beneficiario}
                  />
                </div>
                <div className="rounded-top-lg ps-3 mb-2">
                  <CardTitle title='Detalhamento da Demanda*' click={handleEdit} field='detalhamento'/>
                  {card.info_detalhamento && !showForm['detalhamento'] &&
                    <CardInfo data={card.info_detalhamento} title2='Produto:' attr1='detalhamento_servico' attr2='produto'/>
                  }
                  <EditForm 
                    onSubmit={handleSubmit} 
                    show={showForm['detalhamento']}
                    fieldkey='detalhamento'
                    setShow={setShowForm}
                    data={card.info_detalhamento}
                  />
                </div>
                <div className="rounded-top-lg ps-3 pt-1 pb-0 mb-2">
                  <CardTitle title='Instituição Vinculada*' click={handleEdit} field='instituicao'/>
                  {card.info_instituicao && !showForm['instituicao'] &&
                    <CardInfo data={card.info_instituicao} title2='Identificação:' attr1='razao_social' attr2='identificacao'/>
                  }
                  <EditForm 
                    onSubmit={handleSubmit} 
                    show={showForm['instituicao']}
                    fieldkey='instituicao'
                    setShow={setShowForm}
                    data={card.info_instituicao}
                  />
                </div>
                <div className="rounded-top-lg ps-3 pt-1 pb-0 mb-2">
                  <CardTitle title='Contrato*' click={handleEdit} field='contrato'/>
                  {!showForm['contrato'] && card.info_contrato && 
                    <CardInfo data={card.info_contrato} title2='Produto:' attr1='contratante' attr2='produto'/>
                  }
                  <EditForm 
                    onSubmit={handleSubmit} 
                    show={showForm['contrato']}
                    fieldkey='contrato'
                    setShow={setShowForm}
                    data={card.info_contrato}
                  />
                </div>
                <div className="rounded-top-lg ps-3 pt-1 pb-0 mb-2">
                  <CardTitle title='Vencimento' click={handleEdit} field='data_vencimento'/>
                  {!showForm['data_vencimento'] && (card.data_vencimento 
                    ?<div className="fs--1 ms-3 row-10">{new Date(card.data_vencimento).toLocaleDateString('pt-BR', {timeZone:'UTC'})}</div>
                    :<div className="fs--1 ms-3">-</div>
                  )}
                  <EditForm 
                    onSubmit={handleSubmit} 
                    show={showForm['data_vencimento']}
                    fieldkey='data_vencimento'
                    setShow={setShowForm}
                    data={card.data_vencimento || ''}
                  />
                </div>
                <span className='fw-bold fs--1 ms-3'>Histórico</span>
                <div className="rounded-top-lg ps-3 pt-1 pb-0 mb-2">
                  {card.history_fases_list.map(h =>
                    <div className={`p-1 mb-1 text-body row ms-2 info-pipe ${theme === 'dark' ? 'info-pipe-dark' : ''}`} key={h.id}>
                        <label className='row fw-bold fs--1'>{h.phase_name}</label>
                        <label className='row fs--2'>Duração (min): 
                          {' '+Number(h.duration/60).toLocaleString("pt-BR", {maximumFractionDigits:2})}
                        </label>
                    </div>
                  )}
                </div>
              </Col>
              <Col lg={5}>
                <div className="rounded-top-lg pt-1 pb-0 mb-2">
                  <span className="mb-1 fs--1 fw-bold d-inline-block me-2">Fase Atual</span>
                  <SubtleBadge>{card.str_fase}</SubtleBadge>
                </div>
                <div className="rounded-top-lg pt-1 pb-0 mb-2">
                  <CardTitle title='Responsáveis*' click={handleEdit} field='responsaveis'/>
                  {card.responsaveis && card.responsaveis.length > 0 ? 
                  <div className={`p-1 mb-1 text-body row ms-1 info-pipe ${theme === 'dark' ? 'info-pipe-dark' : ''}`}>
                    {!showForm['responsaveis'] && card.list_responsaveis.map ((r) =>
                      <div className='px-1 my-1 col-6' key={r.id}>
                        <img className='rounded-circle me-2' style={{width:'30px', height:'30px'}} 
                          src={`${process.env.REACT_APP_API_URL}/${r.avatar}`}
                        />
                        <span>{r.nome}</span>
                      </div>
                    )}
                    <EditForm 
                      onSubmit={handleSubmit} 
                      show={showForm['responsaveis']}
                      fieldkey='responsaveis'
                      setShow={setShowForm}
                      data={card.list_responsaveis}
                    />
                  </div>
                  : <div>-</div>}
                </div>
                <ModalMediaContent title='Comentários'>
                  <ModalCommentContent card={card} />
                </ModalMediaContent>
              </Col>
              <Col lg={2}>
                <ModalSidebar id={card.id} code={code} pipe='produtos'/>
              </Col>
            </Row>
          :         
          <div>
            <Placeholder animation="glow">
                <Placeholder xs={7} /> <Placeholder xs={4} /> 
                <Placeholder xs={4} />
                <Placeholder xs={6} /> <Placeholder xs={8} />
            </Placeholder>    
          </div>
        }
        </Modal.Body>
      </Modal>
    );
  }
};

export default KanbanModal;

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
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowDown, faCalendar, faChevronDown, faChevronLeft, faChevronRight, faPencil } from '@fortawesome/free-solid-svg-icons';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import SubtleBadge from '../../../components/common/SubtleBadge';
import { useAppContext } from '../../../Main';

const KanbanModal = ({show}) => {
  const [showForm, setShowForm] = useState({'card':false,'data':false,'beneficiario':false, 
    'detalhamento': false, 'instituicao': false});
  const {kanbanState: {kanbanModal}, kanbanDispatch} = useContext(PipeContext);
  const navigate = useNavigate()
  const {uuid} = useParams()
  const [card, setCard] = useState();
  const {config: {theme}} = useAppContext();

  const handleClose = () => {
    navigate('/pipeline/products')
    kanbanDispatch({ type: 'TOGGLE_KANBAN_MODAL' });
  };

  useEffect(() =>{
    const getData = async () =>{
      const card = await GetRecord(uuid, 'pipeline/cards/produtos')
      if (!card){
        navigate("/auth/login")
      }
      if (Object.keys(card).length === 0){
        handleClose()
        navigate("/error/404")
      }
      setCard(card)
    }
    if(kanbanModal.show && uuid){getData()}
  }, [kanbanModal])

  const handleEdit = (key) =>{
    setShowForm(prevState => ({
      ...prevState,
      [key]: !prevState[key]
    }));
  }
  const handleSubmit = (formData) =>{
    if (formData){
      api.put(`pipeline/cards/produtos/${card.id}/`, formData)
      .then((response) => {
        kanbanDispatch({
          type: 'UPDATE_TASK_CARD',
          payload: {
            updatedCard: {id: response.data.id, card:response.data.card, str_detalhamento:response.data.info_detalhamento.detalhamento_servico,
              str_beneficiario:response.data.list_beneficiario[0].razao_social, created_at: response.data.created_at
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
    'instituicao':false, 'contrato':false})
  }


  if (card){
    return (
      <Modal
        show={show}
        onHide={handleClose}
        size='xl'
        contentClassName="border-0"
        dialogClassName="mt-2 modal-custom modal-xl"
      >
        <div className="position-absolute top-0 end-0 mt-1 me-1 z-index-1"style={{ zIndex: 1000 }}>
          <CloseButton
            onClick={handleClose}
            className="btn btn-sm btn-circle d-flex flex-center transition-base"
          />
        </div>
        <Modal.Body className="pt-2">
          {card ? 
           <Row className='p-2'>
              <Col className='border-1 px-0' id='infocard' lg={5}>
                <div className="rounded-top-lg pt-1 pb-0 ps-3">
                  {card.info_detalhamento && (
                    <h4 className="mb-1 fs-1 fw-bold">{card.info_detalhamento.detalhamento_servico}</h4>
                  )}
                </div>
                <div className="rounded-top-lg ps-3 pt-1 pb-0">
                  <div className='fs--1 fw-bold'><FontAwesomeIcon icon={faChevronDown} className='me-1'/>Card*
                    <span className='modal-editar ms-2 fw-normal' onClick={() => handleEdit('card')}>
                      <FontAwesomeIcon icon={faPencil} className='me-1'/>Editar
                    </span>
                  </div>
                  {card.card && (
                    !showForm['card'] &&(
                      <div className="fs--1 ms-3 row-10">{card.card}</div>
                    )
                  )}
                  <EditForm 
                    onSubmit={handleSubmit} 
                    show={showForm['card']}
                    fieldkey='card'
                    setShow={setShowForm}
                    data={card.card}
                  />
                </div>
                <div className="rounded-top-lg ps-3 pt-1 pb-0 mb-2">
                  <span className='fw-bold fs--1'><FontAwesomeIcon icon={faChevronRight} className='me-1'/>Beneficiário*</span>
                  <span className='modal-editar ms-2' onClick={() => handleEdit('beneficiario')}>
                    <FontAwesomeIcon icon={faPencil} className='me-1'/>Editar
                  </span>
                  {card.beneficiario && card.list_beneficiario.map ((b) => (
                    !showForm['beneficiario'] && (
                      <div className={`p-1 mb-1 row ms-2 info-pipe ${theme === 'dark' ? 'info-pipe-dark' : ''}`} key={b.id}>
                        <label className='row fw-bold fs--1'>{b.razao_social}</label>
                        <span className='row fs--2'>CPF/CNPJ:</span>
                        <label className='row fs--2'>{b.cpf_cnpj}</label>
                      </div>
                    )))}
                  <EditForm 
                    onSubmit={handleSubmit} 
                    show={showForm['beneficiario']}
                    fieldkey='beneficiario'
                    setShow={setShowForm}
                    data={card.list_beneficiario}
                  />
                </div>
                <div className="rounded-top-lg ps-3 mb-2">
                  <span className='fw-bold fs--1'><FontAwesomeIcon icon={faChevronRight} className='me-1'/>Detalhamento da Demanda*</span>
                  <span className='modal-editar ms-2 fs--1' onClick={() => handleEdit('detalhamento')}>
                    <FontAwesomeIcon icon={faPencil} className='me-1'/>Editar
                  </span>
                  {card.info_detalhamento && (
                    !showForm['detalhamento'] && (
                      <div className={`p-1 mb-1 row ms-2 info-pipe ${theme === 'dark' ? 'info-pipe-dark' : ''}`}>
                        <label className='row fw-bold fs--1'>{card.info_detalhamento.detalhamento_servico}</label>
                        <span className='row fs--2'>Produto:</span>
                        <label className='row fs--2'>{card.info_detalhamento.produto}</label>
                      </div>
                    ))}
                  <EditForm 
                    onSubmit={handleSubmit} 
                    show={showForm['detalhamento']}
                    fieldkey='detalhamento'
                    setShow={setShowForm}
                    data={card.info_detalhamento}
                  />
                </div>
                <div className="rounded-top-lg ps-3 mt-3">
                  <div className='fw-bold fs--1'><FontAwesomeIcon icon={faCalendar} className='me-1'/>Data de Abertura*</div>
                  <div className="fs--1 ms-3 row">{new Date(card.created_at).toLocaleDateString('pt-BR', {timeZone:'UTC'}) || '-'}</div>
                </div>
                <div className="rounded-top-lg ps-3 pt-1 pb-0 mb-2">
                  <span className='fw-bold fs--1'><FontAwesomeIcon icon={faChevronRight} className='me-1'/>Instituição Vinculada*</span>
                  <span className='modal-editar ms-2 fs--1' onClick={() => handleEdit('instituicao')}>
                    <FontAwesomeIcon icon={faPencil} className='me-1'/>Editar
                  </span>
                  {card.info_instituicao && (
                    !showForm['instituicao'] && (
                      <div className={`p-1 mb-1 row ms-2 info-pipe ${theme === 'dark' ? 'info-pipe-dark' : ''}`}>
                        <label className='row fw-bold fs--1'>{card.info_instituicao.razao_social}</label>
                        <span className='row fs--2'>Identificação:</span>
                        <label className='row fs--2'>{card.info_instituicao.identificacao}</label>
                      </div>
                    ))}
                  <EditForm 
                    onSubmit={handleSubmit} 
                    show={showForm['instituicao']}
                    fieldkey='instituicao'
                    setShow={setShowForm}
                    data={card.info_instituicao}
                  />
                </div>
                <div className="rounded-top-lg ps-3 pt-1 pb-0 mb-2">
                  <span className='fw-bold fs--1'><FontAwesomeIcon icon={faChevronRight} className='me-1'/>Contrato*</span>
                  <span className='modal-editar ms-2 fs--1' onClick={() => handleEdit('contrato')}>
                    <FontAwesomeIcon icon={faPencil} className='me-1'/>Editar
                  </span>
                  {!showForm['contrato'] && (
                    card.info_contrato ? 
                    <Link className={`p-1 mb-1 row ms-2 text-body info-pipe ${theme === 'dark' ? 'info-pipe-dark' : ''}`}>
                      <label className='row fw-bold fs--1 cursor-pointer'>{card.info_contrato.contratante}</label>
                      <span className='row fs--2'>Produto:</span>
                      <label className='row fs--2'>{card.info_contrato.produto}</label>
                    </Link>
                    : <div className='ms-2'>-</div>
                  )}
                  <EditForm 
                    onSubmit={handleSubmit} 
                    show={showForm['contrato']}
                    fieldkey='contrato'
                    setShow={setShowForm}
                    data={card.info_contrato}
                  />
                </div>
              </Col>
              <Col lg={5}>
                <div className="rounded-top-lg pt-1 pb-0 mb-2">
                  <span className="mb-1 fs--1 fw-bold d-inline-block me-2">Fase Atual</span>
                  <SubtleBadge>{card.str_fase}</SubtleBadge>
                </div>
                <ModalMediaContent title='Comentários'>
                  <ModalCommentContent card={card} />
                </ModalMediaContent>
              </Col>
              <Col lg={2}>
                <ModalSidebar />
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

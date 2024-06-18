import React, { useContext } from 'react';
// import PropTypes from 'prop-types';
import { Card, Dropdown} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import SoftBadge from 'components/common/SoftBadge';
import { Draggable } from 'react-beautiful-dnd';
import AppContext, { PipeContext } from '../../../context/Context';
// import api from 'data/kanban2';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faEllipsisH } from '@fortawesome/free-solid-svg-icons';
import SubtleBadge from '../../../components/common/SubtleBadge';
import { useNavigate } from 'react-router-dom';

// Adicione os ícones à biblioteca
library.add(faEllipsisH);

const options = {
  month: "short",
  day: "numeric",
  timeZone: 'UTC'
};

const calcdif = (data) => {
  const dif = (new Date(data) - new Date())/(24 * 60 * 60 * 1000)
  return dif
};

const TaskDropMenu = ({ id }) => {
  const { kanbanDispatch } = useContext(PipeContext);

  const {
    config: { isRTL }
  } = useContext(AppContext);
  
  const handleRemoveTaskCard = () => {
    // var url = "delete/card/"+id+"/";
    // api.delete(url)
    // .then(() => {
    //   kanbanDispatch({
    //     type: 'REMOVE_TASK_CARD',
    //     payload: {idcard: id}
    //   });
    // })
    // .catch((error) => {
    //   console.error('Erro ao atualizar os dados:', error);
    // });
  };
  return (
    <Dropdown
      onClick={e => e.stopPropagation()}
      align="end"
      className="font-sans-serif"
    >
      <Dropdown.Toggle
        variant="falcon-default"
        size="sm"
        className="kanban-item-dropdown-btn hover-actions dropdown-caret-none"
      >
        <FontAwesomeIcon icon={faEllipsisH} transform="shrink-2" />
      </Dropdown.Toggle>
      {/* <Dropdown.Menu className="py-0" align={isRTL ? 'start' : 'end'}>
        <Dropdown.Item href="#!">Add Card</Dropdown.Item>
        <Dropdown.Item href="#!">Edit</Dropdown.Item>
        <Dropdown.Item href="#!">Copy link</Dropdown.Item>
        <Dropdown.Divider />
      </Dropdown.Menu> */}
    </Dropdown>
  );
};

const TaskCard = ({
  task,
  index
}) => {
  const { kanbanDispatch} = useContext(PipeContext);
  const navigate = useNavigate()
  const handleModalOpen = () => {
    navigate('/pipeline/products/'+task.code)
    kanbanDispatch({ type: 'OPEN_KANBAN_MODAL', payload: {card: task} });
  };
  // styles we need to apply on draggables
  const getItemStyle = isDragging => ({
    cursor: isDragging ? 'grabbing' : 'pointer',
    transform: isDragging ? 'rotate(-2deg)' : ''
  });
  return (
    <Draggable draggableId={`task${task ? task.id : 10}`} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={provided.draggableProps.style}
          className="kanban-item"
        >
          <Card
            style={getItemStyle(snapshot.isDragging)}
            className="kanban-item-card hover-actions-trigger"
            onClick={handleModalOpen}
          >
            <Card.Body className='p-2'>
              {task.prioridade && 
                <SubtleBadge bg={`${task.prioridade === 'Alta' ? 'danger' : task.prioridade === 'Média' ? 'warning' : 'success'}`} 
                  className='me-2 fw-normal text-body fs--2'>{task.prioridade}
                </SubtleBadge>
              }
              <div className='mb-1'>
                <h4 className='fw-bold fs--1'>{task.str_detalhamento || '-'}</h4>
              </div>
              <div className='mb-1'>
                <label className='mb-0 text-uppercase fs--2'>Processo</label><br></br>
                <span className='d-block'>#{task.code}</span>
              </div>
              <div className='mb-1'>
                <label className='mb-0 text-uppercase fs--2'>Card</label><br></br>
                <SubtleBadge bg='secondary' className='me-2 fw-normal'>{task.card}</SubtleBadge> 
              </div>
              <div className='mb-1'>
                <label className='mb-0 d-block cursor-pointer text-uppercase fs--2'>Beneficiário</label>
                <span className='d-block'>{task.str_beneficiario}</span>
              </div>
              <div className='mb-1'>
                <label className='mb-0 d-block cursor-pointer text-uppercase fs--2'>Data de Abertura</label>
                <span className='d-block'>{new Date(task.created_at).toLocaleDateString('pt-BR', {timeZone:'UTC'})}</span>
              </div>
              {task.data_vencimento &&
              <div className='mb-1'>
                <SubtleBadge bg={calcdif(task.data_vencimento) > 0 ? 'secondary' : 'danger'} className='me-2 fw-normal fs--2'>
                  Venc {new Date(task.data_vencimento).toLocaleDateString('pt-BR', options)}
                </SubtleBadge> 
                {calcdif(task.data_vencimento) > 0 
                  ? <span style={{fontSize:'0.7rem'}}>em {parseInt(calcdif(task.data_vencimento))} dias</span>
                  : <span style={{fontSize:'0.7rem'}}>{parseInt(calcdif(task.data_vencimento)) * -1} dias atrás</span>
                }
              </div>
              }
              <div className='mb-1'> 
                {task.list_responsaveis.map(r => 
                  <img data-bs-toggle="tooltip" title={r.nome} className='rounded-circle me-2' style={{width:'25px', height:'25px'}} 
                    src={`${process.env.REACT_APP_API_URL}/${r.avatar}`} key={r.id}
                  />
                )}
              </div>
            </Card.Body>
          </Card>
        </div>
      )}
    </Draggable>
  );
};
export default TaskCard;

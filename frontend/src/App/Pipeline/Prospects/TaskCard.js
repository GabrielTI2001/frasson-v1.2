import React, { useContext, useState } from 'react';
// import PropTypes from 'prop-types';
import { Card, Dropdown} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import SoftBadge from 'components/common/SoftBadge';
import { Draggable } from '@hello-pangea/dnd';
import AppContext, { PipeContext } from '../../../context/Context';
// import api from 'data/kanban2';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faEllipsisH, faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import SubtleBadge from '../../../components/common/SubtleBadge';
import { useNavigate } from 'react-router-dom';
import ModalDeleteCard from '../../../components/Custom/ModalDeleteCard';
import GroupMember from '../GroupMember';

// Adicione os ícones à biblioteca
library.add(faEllipsisH);

const options = {
  month: "short",
  day: "numeric",
  timeZone: 'UTC'
};

export const calcdif = (data) => {
  const dif = (new Date(data) - new Date())/(24 * 60 * 60 * 1000)
  return dif
};

export const TaskDropMenu = ({ card, click }) => {
  const { kanbanDispatch } = useContext(PipeContext);
  const [modaldel, setModaldel] = useState({show:false})
  const navigate = useNavigate()

  const {
    config: { isRTL }
  } = useContext(AppContext);

  const handledelete = () =>{
    kanbanDispatch({
      type: 'REMOVE_TASK_CARD',
      payload: {idcard: card.id}
    });
    navigate(`/pipeline/518984924`)
    kanbanDispatch({ type: 'TOGGLE_KANBAN_MODAL' });
  }

  return (
    <Dropdown
      onClick={e => e.stopPropagation()}
      align="end"
      className="font-sans-serif"
    >
      <Dropdown.Toggle
        variant="falcon-default"
        size="sm"
        className="kanban-item-dropdown-btn btn-circle hover-actions dropdown-caret-none d-flex flex-center py-2 px-3 shadow-none"
      >
        <FontAwesomeIcon icon={faEllipsisV} transform="shrink-2" className='fs-2'/>
      </Dropdown.Toggle>
      <Dropdown.Menu className="py-0" align={isRTL ? 'start' : 'end'}>
        <Dropdown.Item onClick={() => {setModaldel({show:true, link:`${process.env.REACT_APP_API_URL}/pipeline/fluxos/prospects/${card.code}/`})}}>
          Excluir Card
        </Dropdown.Item>
        <Dropdown.Item>Copy link</Dropdown.Item>
      </Dropdown.Menu>
      <ModalDeleteCard show={modaldel.show} link={modaldel.link} update={handledelete} close={() => setModaldel({show:false})}/>
    </Dropdown>
  );
};

const TaskCardProspect = ({
  task,
  index
}) => {
  const { kanbanDispatch} = useContext(PipeContext);
  const navigate = useNavigate()
  const handleModalOpen = () => {
    navigate(`/pipeline/518984924/processo/${task.code}`)
    kanbanDispatch({ type: 'OPEN_KANBAN_MODAL', payload: {card: task} });
  };
  // styles we need to apply on draggables
  const getItemStyle = isDragging => ({
    cursor: isDragging ? 'grabbing' : 'pointer',
    transform: isDragging ? 'rotate(-2deg)' : ''
  });
  return (
    <Draggable draggableId={`task${task ? task.id : 1}`} index={index}>
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
              {task && task.prioridade && 
                <SubtleBadge bg={`${task.prioridade === 'Alta' ? 'danger' : task.prioridade === 'Média' ? 'warning' : 'success'}`} 
                  className='me-2 fw-normal text-body fs--2'>{task.prioridade}
                </SubtleBadge>
              }
              <div className='mb-1'>
                <h4 className='fw-bold fs--1'>{task && (task.str_cliente || '-')}</h4>
              </div>
              <div className='mb-1'>
                <label className='mb-0 text-uppercase fs--2'>Processo</label><br></br>
                <span className='d-block'>#{task && task.code}</span>
              </div>
              <div className='mb-1'>
                <label className='mb-0 d-block cursor-pointer text-uppercase fs--2'>Produto de Interesse</label>
                <span className='d-block'>{task && task.str_produto}</span>
              </div>
              {task && task.data_vencimento &&
              <div className='mb-1'>
                <SubtleBadge bg={calcdif(task.data_vencimento) > 0 ? 'secondary' : 'danger'} className='me-2 fw-normal fs--2'>
                  Venc {new Date(task.data_vencimento).toLocaleDateString('pt-BR', options)}
                </SubtleBadge> 
                {calcdif(task.data_vencimento) > 0 
                  ? <span style={{fontSize:'0.7rem'}}>em {parseInt(calcdif(task.data_vencimento))} dia(s)</span>
                  : <span style={{fontSize:'0.7rem'}}>{parseInt(calcdif(task.data_vencimento)) * -1} dia(s) atrás</span>
                }
              </div>
              }
              {task &&
                <div className='mb-1'> 
                  <GroupMember users={task.list_responsaveis}/>
                </div>
              }
            </Card.Body>
          </Card>
        </div>
      )}
    </Draggable>
  );
};
export default TaskCardProspect;

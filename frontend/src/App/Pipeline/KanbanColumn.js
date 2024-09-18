import React, { useContext, useEffect, useRef, useState } from 'react';
import KanbanColumnHeader from './KanbanColumnHeader';
import TaskCard from './GAI/TaskCard';
import TaskCardProspect from './Prospects/TaskCard';
import { Droppable } from '@hello-pangea/dnd';
import classNames from 'classnames';
import { PipeContext } from '../../context/Context';

const KanbanColumn = ({ kanbanColumnItem, item, handleMouseDown}) => {
  const { id, descricao, card_set } = kanbanColumnItem;
  const formViewRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      formViewRef.current.scrollIntoView({ behavior: 'smooth' });
    }, 500);
    return clearTimeout(timeout);
  }, []);

  return (
    <div className={classNames('kanban-column')} onMouseDown={handleMouseDown} ref={containerRef}>
      <KanbanColumnHeader id={id} title={descricao} itemCount={kanbanColumnItem ? card_set.length : 0} />
      <Droppable droppableId={`${id}`} type="KANBAN">
        {provided => (
          <>
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              id={`container-${id}`}
              className="kanban-items-container scrollbar"
            >
              {kanbanColumnItem && card_set && card_set.map((card, index) => (
                item === 'gestao-credito' ? <></>
                : item === 'prospect' ? card && <TaskCardProspect className='task-card' key={card.id} index={index} task={card} /> 
                : card && <TaskCard className='task-card' key={card.id} index={index} task={card}/>
              ))}
              {provided.placeholder}
              <div ref={formViewRef}></div>
            </div>
            <div className="kanban-column-footer">
            </div>
          </>
        )}
      </Droppable>
    </div>
  );
};

// KanbanColumn.propTypes = {
//   kanbanColumnItem: PropTypes.shape({
//     idfase: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
//     descricao: PropTypes.string,
//     card_set: PropTypes.arrayOf(TaskCard.propTypes.task)
//   })
// };

export default KanbanColumn;

import React, { useContext, useEffect, useRef, useState } from 'react';
import KanbanColumnHeader from './KanbanColumnHeader';
import TaskCard from './GAI/TaskCard';
import { Droppable } from '@hello-pangea/dnd';
import classNames from 'classnames';
import { PipeContext } from '../../context/Context';

const KanbanColumn = ({ kanbanColumnItem}) => {
  const { id, descricao, fluxo_gestao_ambiental_set } = kanbanColumnItem;
  const [showForm, setShowForm] = useState(false);
  const formViewRef = useRef(null);
  const {
    kanbanState: { fases}
  } = useContext(PipeContext);

  useEffect(() => {
    const timeout = setTimeout(() => {
      formViewRef.current.scrollIntoView({ behavior: 'smooth' });
    }, 500);
    return clearTimeout(timeout);
  }, [showForm]);

  return (
    <div className={classNames('kanban-column')}>
      <KanbanColumnHeader id={id} title={descricao} itemCount={kanbanColumnItem && fluxo_gestao_ambiental_set ? fluxo_gestao_ambiental_set.length : 0} />
      <Droppable droppableId={`${id}`} type="KANBAN">
        {provided => (
          <>
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              id={`container-${id}`}
              className="kanban-items-container scrollbar"
            >
              {kanbanColumnItem && fluxo_gestao_ambiental_set && fluxo_gestao_ambiental_set.map((card, index) => (
                <TaskCard key={card && card.id} index={index} task={card}/>
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

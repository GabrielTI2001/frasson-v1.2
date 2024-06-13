import React, { useContext, useEffect, useRef, useState } from 'react';
import KanbanColumn from '../KanbanColumn';
import api from '../../../context/data';
import KanbanModal from './KanbanModal';
import { DragDropContext } from 'react-beautiful-dnd';
import IconButton from '../../../components/common/IconButton';
import is from 'is_js';
import { PipeContext } from '../../../context/Context';
import AddAnotherFase from '../AddAnotherFase';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { Placeholder } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
library.add(faPlus);

const KanbanContainer = () => {
  const {
    kanbanState,
    kanbanDispatch
  } = useContext(PipeContext);
  const {uuid} = useParams()
  const [showForm, setShowForm] = useState(false);
  const containerRef = useRef(null);
  const fases = kanbanState.fases;

  const handleSubmit = listData => {
    const newList = {
      pipe: kanbanState.pipe.id,
      descricao: listData.descricao,
      done: listData.done,
    }
    const isEmpty = !Object.keys(listData).length;

    if (!isEmpty) {
      kanbanDispatch({
        type: 'ADD_KANBAN_COLUMN',
        payload: listData
      });
      setShowForm(false);
    }
  };

  useEffect(() => {
    if (uuid) {
      kanbanDispatch({ type: 'OPEN_KANBAN_MODAL', payload: {} });
    }
    if (is.ipad()) {
      containerRef.current.classList.add('ipad');
    }
    if (is.mobile()) {
      containerRef.current.classList.add('mobile');
      if (is.safari()) {
        containerRef.current.classList.add('safari');
      }
      if (is.chrome()) {
        containerRef.current.classList.add('chrome');
      }
    }
  },[]);

  const getColumn = id => {
    if (fases){
      return fases.find(fase => fase.id === Number(id))
    }
    else{
      return null;
    }
  };

  const reorderArray = (array, fromIndex, toIndex) => {
    const newArr = [...array];

    const chosenItem = newArr.splice(fromIndex, 1)[0];
    newArr.splice(toIndex, 0, chosenItem);

    return newArr;
  };

  const move = (source, destination) => {
    const sourceItemsClone = [...getColumn(source.droppableId).card_produtos_set];
    const destItemsClone = [...getColumn(destination.droppableId).card_produtos_set];

    const [removedItem] = sourceItemsClone.splice(source.index, 1);
    destItemsClone.splice(destination.index, 0, removedItem);

    return {
      updatedDestItems: destItemsClone,
      updatedSourceItems: sourceItemsClone
    };
  };

  const handleDragEnd = result => {
    const { source, destination } = result;

    if (!destination) {
      return;
    }

    if (source.droppableId === destination.droppableId) {
      const items = getColumn(source.droppableId).card_produtos_set;
      const column = getColumn(source.droppableId);
      const reorderedItems = reorderArray(
        items,
        source.index,
        destination.index
      );

      kanbanDispatch({
        type: 'UPDATE_SINGLE_COLUMN',
        payload: { column, reorderedItems }
      });
    } else {
      const sourceColumn = getColumn(source.droppableId);
      const destColumn = getColumn(destination.droppableId);

      const movedItems = move(source, destination);
      var idcard = getColumn(source.droppableId).card_produtos_set[source.index].id
      api.put(`pipeline/cards/produtos/${idcard}/`, {'phase':destColumn.id})
      .then((response) => {
        kanbanDispatch({
          type: 'UPDATE_DUAL_COLUMN',
          payload: {
            idcard,
            sourceColumn,
            updatedSourceItems: movedItems.updatedSourceItems,
            destColumn,
            updatedDestItems: movedItems.updatedDestItems
          }
        });
      })
      .catch((erro) => {
        console.error('erro: '+erro);
      })
    }
  };

    return (
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="kanban-container me-n3" ref={containerRef}>
        {/* Pega o array de itens e renderiza um div pra cada*/}
          {kanbanState.fases ? kanbanState.fases.map((fase)=>{
            return( 
              <KanbanColumn
                key={fase.id}
                kanbanColumnItem={fase}
              />
            )
          })
          :
          <div className='kanban-column'>
            <Placeholder animation="glow">
                <Placeholder xs={7} /> <Placeholder xs={4} /> 
                <Placeholder xs={4} />
                <Placeholder xs={6} /> <Placeholder xs={8} />
            </Placeholder>    
          </div>   
          }
          <div className="kanban-column">
            <AddAnotherFase
              type="list"
              onSubmit={handleSubmit}
              showForm={showForm}
              setShowForm={setShowForm}
            />
            {!showForm && (
              <IconButton
                variant="secondary"
                className="d-block w-100 border-400 bg-400"
                icon={faPlus}
                iconClassName="me-1"
                onClick={() => setShowForm(true)}
              >
                Adicionar Fase
              </IconButton>
            )}
          </div>
        </div>
        <KanbanModal show={kanbanState.kanbanModal.show}/>
      </DragDropContext>
    );
};

export default KanbanContainer;

export const kanbanReducer = (state, action) => {
  const { type, payload } = action;

  switch (type) {
    case 'SET_DATA':
      return {
        ...state,
        pipes: action.payload.pipes,
        pipe: action.payload.pipe,
        fases: action.payload.fases
        // ... outras propriedades conforme necessário
      };

    case 'OPEN_KANBAN_MODAL':
      return {
        ...state,
        kanbanModal: {
          ...state.kanbanModal,
          modalContent: payload.card,
          show: true
        }
      };

    case 'TOGGLE_KANBAN_MODAL':
      return {
        ...state,
        kanbanModal: {
          ...state.kanbanModal,
          show: !state.kanbanModal.show
        }
      };

    case 'ADD_KANBAN_COLUMN':
      return {
        ...state,
        fases: [...state.fases, payload]
      };

    case 'ADD_TASK_CARD':
      console.log(state.fases.map(fase => fase.id === payload.targetListId))
      return {
        ...state,
        fases: state.fases.map(fase =>
          fase.id === payload.targetListId
            ? { ...fase, card_produtos_set: [...fase.card_produtos_set, payload.novocard] }
            : fase
        )
      };

    case 'UPDATE_TASK_CARD':
      return {
        ...state,
        fases: state.fases.map(fase =>
          fase.id === payload.targetListId ? 
          {...fase, card_produtos_set:fase.card_produtos_set.map( card =>
              card.id === payload.id
              ? payload.updatedCard
              : card
              )}
          : fase
          )  
      };
    case 'REMOVE_TASK_CARD':
      return {
        ...state,
        fases: state.fases.map(f => {
          return {
            ...f,
            card_produtos_set: f.card_produtos_set.filter(card => card.id !== payload.idcard)
          };
        })
      };

    // case 'UPDATE_SINGLE_COLUMN':
    //   return {
    //     ...state,
    //     kanbanItems: state.kanbanItems.map(kanbanItem =>
    //       kanbanItem.id === payload.column.id
    //         ? {
    //             ...kanbanItem,
    //             items: [...payload.reorderedItems]
    //           }
    //         : kanbanItem
    //     )
    //   };

    case 'UPDATE_DUAL_COLUMN':
      return {
        ...state,
        fases: state.fases.map(fase =>
          fase.id === payload.sourceColumn.id ||
          fase.id === payload.destColumn.id
            ? {
                ...fase,
                card_produtos_set:
                  (fase.id === payload.sourceColumn.id &&
                    payload.updatedSourceItems) ||
                  (fase.id === payload.destColumn.id &&
                    payload.updatedDestItems)
              }
            : fase
        )
      };

      case 'REVERT_DRAG': {
        const { sourceColumnId, initialSourceItems, destColumnId, initialDestItems } = action.payload;
        // Atualizar as colunas com os itens iniciais
        const updatedColumns = state.fases.map(column => {
          if (column.id === Number(sourceColumnId)) {
            return { ...column, card_produtos_set: initialDestItems };
          } else if (column.id === Number(destColumnId)) {
            return { ...column, card_produtos_set: initialSourceItems };
          }
          return column;
        });
        return {
          ...state,
          fases: updatedColumns
        };
      }

    case 'REMOVE_KANBAN_COLUMN':
      return {
        ...state,
        fases: state.fases.filter(
          fase => fase.id !== payload.id
        )
    };

    default:
      return state;
  }
};

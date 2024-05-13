export const ambientalReducer = (state, action) => {
  const { type, payload } = action;

  switch (type) {
    case 'SET_DATA':
      return {
        ...state,
        outorga: payload.outorga,
        appo: payload.appo,
        asv: payload.asv,
      };

    case 'CLEAR_DATA':
      return {
        ...state,
        outorga: null,
        appo: null,
        asv: null
      };

    case 'OPEN_MODAL':
      return {
        ...state,
        modal: {
          ...state.modal,
          content: payload,
          show: true
        }
      };

    case 'TOGGLE_MODAL':
      return {
        ...state,
        modal: {
          ...state.modal,
          show: !state.modal.show
        }
      };

    case 'ADD_PONTO':
      return {
        ...state,
        outorga: { ...state.outorga, coordenadas: [...state.outorga.coordenadas, payload.novoponto] }
      };

    case 'ADD_PONTO_APPO':
      return {
        ...state,
        appo: { ...state.appo, coordenadas: [...state.appo.coordenadas, payload.novoponto] }
    };

    case 'ADD_PONTO_ASV':
      return {
        ...state,
        asv: { ...state.asv, areas: [...state.asv.areas, payload.novaarea] }
    };
  

    case 'UPDATE_PONTO':
      return {
        ...state,
        outorga:
        {...state.outorga, coordenadas:state.outorga.coordenadas.map( ponto =>
              ponto.id === payload.id
              ? payload.updatedPonto
              : ponto
          )}
      };

    case 'UPDATE_PONTO_APPO':
      return {
        ...state,
        appo:
        {...state.appo, coordenadas:state.appo.coordenadas.map( ponto =>
          ponto.id === payload.id
          ? payload.updatedPonto
          : ponto
        )}
      };

    case 'UPDATE_PONTO_ASV':
      return {
        ...state,
        asv:
        {...state.asv, areas:state.asv.areas.map( area =>
          area.id === payload.id
          ? payload.updatedArea
          : area
        )}
      };

    case 'REMOVE_PONTO':
      return {
        ...state,
        outorga: {
            ...state.outorga,
            coordenadas: state.outorga.coordenadas.filter(ponto => ponto.id !== payload.id)
        }
      };

    case 'REMOVE_PONTO_APPO':
      return {
        ...state,
        appo: {
            ...state.appo,
            coordenadas: state.appo.coordenadas.filter(ponto => ponto.id !== payload.id)
        }
      };
    
    case 'REMOVE_PONTO_ASV':
      console.log(payload)
      return {
        ...state,
        asv: {
            ...state.asv,
            areas: state.asv.areas.filter(area => area.id !== payload.id)
        }
      };
      
    default:
      return state;
  }
};

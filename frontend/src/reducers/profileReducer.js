export const profileReducer = (state, action) => {
  const { type, payload } = action;
  switch (type) {
    case 'SET_PROFILE':
      return {
        ...state,
        perfil:payload
      };
    case 'UPDATE_PROFILE':
      return {
        ...state,
        ...payload.updatedFields
      };
    default:
      return state;
  }
};

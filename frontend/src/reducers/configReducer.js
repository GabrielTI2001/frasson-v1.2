import { settings } from '../config';
import { setItemToStore } from '../helpers/utils';

export const configReducer = (state, action) => {
  const { type, payload } = action;
  switch (type) {
    case 'SET_CONFIG':
      if (payload.setInStore) {
        setItemToStore(payload.key, payload.value);
      }
      return {
        ...state,
        [payload.key]: payload.value
      };
    case 'REFRESH':
      return {
        ...state
      };
    case 'RESET':
      const dados = [localStorage.getItem('login'), localStorage.getItem('token'), localStorage.getItem('user'), localStorage.getItem('permissions')]
      localStorage.clear();
      localStorage.setItem("login", dados[0]);
      localStorage.setItem('token', dados[1]);
      localStorage.setItem('user', dados[2]);
      localStorage.setItem('permissions', dados[3]);
      document.documentElement.setAttribute('data-bs-theme', settings.theme);
      return {
        ...state,
        ...settings
      };
    default:
      return state;
  }
};

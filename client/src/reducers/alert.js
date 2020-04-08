import { SET_ALERT, REMOVE_ALERT } from '../actions/types';
const initialState = [];
export default function (state = initialState, action) {
  //since each 'action' has 'type' and 'payload', we are destructuring 'action' to two seperate variables instead of using 'action.payload' and 'action.type'
  const { type, payload } = action;

  switch (type) {
    case SET_ALERT:
      return [...state, payload];

    case REMOVE_ALERT:
      return state.filter((alert) => alert.id !== payload);

    default:
      return state;
  }
}

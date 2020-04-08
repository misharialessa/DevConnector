import { SET_ALERT, REMOVE_ALERT } from './types';
import { v4 as uuid } from 'uuid';

export const setAlert = (msg, alertType, timeout = 5000) => (dispatch) => {
  const id = uuid();
  dispatch({
    type: SET_ALERT,
    payload: { msg, alertType, id }
  });

  //Setting a timeout for the alert, so after few seconds (default is set to 5 seconds from above) we will dispatch a new action with type "remove_alert" (the action is sent to the reducer)
  setTimeout(() => dispatch({ type: REMOVE_ALERT, payload: id }), timeout);
};

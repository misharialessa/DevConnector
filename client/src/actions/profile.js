import axios from 'axios';
import { setAlert } from './alert';

import { PROFILE_ERROR, GET_PROFILE } from './types';

//Get current user's profile

export const getCurrentProfile = () => async (dispatch) => {
  // we need to hit the '/api/profile/me' route we created in the backend to get the info we need
  // A request to '/api/profile/me' will return the profile details of whatever user is logged in (using the token in the browser)

  try {
    const res = await axios.get('/api/profile/me');

    // if the above statement does not THROW an error (err). then we assume request was successful and we "dispatch" a 'GET_PROFILE' action to be executed
    dispatch({ type: GET_PROFILE, payload: res.data });
  } catch (err) {
    // Here, we want to dispatch a 'PRPFILE_ERROR" Action and set the payload to an object that contains "msg" as the text portion of the error and a "status" as the status of the response (300, 400, 500 etc.)

    dispatch({
      type: PROFILE_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    });
  }
};

//Create or update profile (we know if we are creating or updating a profile from the 'edit' argument)
//The 'history' object stores the location of the latest 'path' so that after creating a profile, we go to the same location

export const createProfile = (formData, history, edit = false) => async (
  dispatch
) => {
  try {
    const config = {
      headers: { 'Content-Type': 'application/json' }
    };

    const res = await axios.post('/api/profile', formData, config);

    //dispatching the GET_PROFILE because the 'create' request returns the same data as getProfile
    dispatch({ type: GET_PROFILE, payload: res.data });

    //We want to set an alert to let the user know that the profile has been created/updated. The 'message' is set depending on the 'edit' argument

    dispatch(setAlert(edit ? 'Profile Updated' : 'Profile Created', 'success'));

    //if editing, we dont want to redirect. BUT if we are creating, then we will redirect to the profile

    if (!edit) {
      history.push('/dashboard');
    }
  } catch (err) {
    const errors = err.response.data.errors;

    if (errors) {
      errors.forEach((error) => dispatch(setAlert(error.msg, 'danger')));
    }

    dispatch({
      type: PROFILE_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    });
  }
};

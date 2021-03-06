import axios from 'axios';
import { setAlert } from './alert';

import {
  PROFILE_ERROR,
  GET_PROFILE,
  GET_PROFILES,
  UPDATE_PROFILE,
  ACCOUNT_DELETED,
  CLEAR_PROFILE,
  GET_REPOS
} from './types';
import { set } from 'mongoose';

// Get All Profiles

export const getProfiles = () => async (dispatch) => {
  //We want to prevent the current user's profile from appearing when we try to list all profiles
  dispatch({ type: CLEAR_PROFILE });

  try {
    const res = await axios.get('/api/profile');
    dispatch({
      type: GET_PROFILES,
      payload: res.data
    });
  } catch (err) {
    dispatch({
      type: PROFILE_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    });
  }
};

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

// Get profile by id -- We are getting the profile by the USER's ID, NOT the profile id

export const getProfileById = (userId) => async (dispatch) => {
  try {
    const res = await axios.get(`/api/profile/user/${userId}`);
    dispatch({
      type: GET_PROFILE,
      payload: res.data
    });
  } catch (err) {
    dispatch({
      type: PROFILE_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    });
  }
};

// Get Github Repos. We are communicating with Github from the BACKEND through a request to 'api/profile/github'

export const getGithubRepos = (username) => async (dispatch) => {
  try {
    const res = await axios.get(`/api/profile/github/${username}`);
    dispatch({
      type: GET_REPOS,
      payload: res.data
    });
  } catch (err) {
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

// Add experience

export const addExperience = (formData, history) => async (dispatch) => {
  try {
    const config = {
      headers: { 'Content-Type': 'application/json' }
    };

    //using 'put' because in the back end we setup the route as a 'put' route
    const res = await axios.put('/api/profile/experience', formData, config);

    //dispatching the GET_PROFILE because the 'create' request returns the same data as getProfile
    dispatch({ type: UPDATE_PROFILE, payload: res.data });

    //We want to set an alert to let the user know that the experience has been added

    dispatch(setAlert('Experience Added', 'successs'));

    // redirect to dashboard after successfully adding an experience
    history.push('/dashboard');
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

// Add education

export const addEducation = (formData, history) => async (dispatch) => {
  try {
    const config = {
      headers: { 'Content-Type': 'application/json' }
    };

    const res = await axios.put('/api/profile/education', formData, config);

    //dispatching the GET_PROFILE because the 'create' request returns the same data as getProfile
    dispatch({ type: UPDATE_PROFILE, payload: res.data });

    //We want to set an alert to let the user know that the experience has been added

    dispatch(setAlert('Education Added', 'successs'));

    // redirect to dashboard after successfully adding an experience
    history.push('/dashboard');
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

//Delete an experience

export const deleteExperience = (id) => async (dispatch) => {
  try {
    const res = await axios.delete(`/api/profile/experience/${id}`);

    dispatch({
      type: UPDATE_PROFILE,
      payload: res.data
    });

    dispatch(setAlert('Experience Removed!', 'success'));
  } catch (err) {
    dispatch({
      type: PROFILE_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    });
  }
};

//Delete an Education

export const deleteEducation = (id) => async (dispatch) => {
  try {
    const res = await axios.delete(`/api/profile/education/${id}`);

    dispatch({
      type: UPDATE_PROFILE,
      payload: res.data
    });

    dispatch(setAlert('Education Removed!'));
  } catch (err) {
    dispatch({
      type: PROFILE_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    });
  }
};

//Delete account and profile

export const deleteAccount = () => async (dispatch) => {
  if (window.confirm('Are you sure? This action is PERMENANT!')) {
    try {
      await axios.delete('/api/profile');

      dispatch({ type: CLEAR_PROFILE });
      dispatch({ type: ACCOUNT_DELETED });
      dispatch(setAlert('Your Account Has Been Permanantly Deleted!'));
    } catch (err) {
      dispatch({
        type: PROFILE_ERROR,
        payload: { msg: err.response.statusText, status: err.response.status }
      });
    }
  }
};

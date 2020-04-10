import {
  GET_PROFILE,
  PROFILE_ERROR,
  CLEAR_PROFILE,
  UPDATE_PROFILE
} from '../actions/types';

const initialState = {
  profile: null,
  profiles: [],
  repos: [],
  loading: true,
  error: {}
};

export default function (state = initialState, action) {
  const { type, payload } = action;

  switch (type) {
    //When the action dispatches "GET_PROFILE", it is sending the data it received from the 'request to the server' to the reducer.
    //We setup the server to send all the profile data, including the updates. So here, UPDATE_PROFILE acts the same as GET_PROFILE
    case GET_PROFILE:
    case UPDATE_PROFILE:
      return {
        ...state,
        profile: payload,
        loading: false
      };
    case PROFILE_ERROR:
      return {
        ...state,
        error: payload,
        loading: false
      };

    case CLEAR_PROFILE:
      return {
        ...state,
        profile: null,
        repose: [],
        loading: false
      };

    default:
      return state;
  }
}

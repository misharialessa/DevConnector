import {
  GET_POSTS,
  GET_POST,
  POST_ERROR,
  UPDATE_LIKES,
  DELETE_POST,
  ADD_POST,
  ADD_COMMENT,
  DELETE_COMMENT
} from '../actions/types';

const initialState = { post: null, posts: [], loading: true, error: {} };

export default function (state = initialState, action) {
  const { type, payload } = action;

  switch (type) {
    case GET_POSTS:
      return { ...state, posts: payload, loading: false };
    case GET_POST:
      return { ...state, post: payload, loading: false };

    case ADD_POST:
      return { ...state, posts: [payload, ...state.posts], loading: false };

    case POST_ERROR:
      return { ...state, error: payload, loading: false };

    case UPDATE_LIKES:
      // Check if postId matches a post in 'posts', if it does, then update the likes for that post, else keep the post as is

      return {
        ...state,
        posts: state.posts.map((post) =>
          post._id === payload.postId ? { ...post, likes: payload.likes } : post
        ),
        loading: false
      };

    case DELETE_POST:
      // here, payload is just the id ( we are only dispatching the id as a payload)
      return {
        ...state,
        posts: state.posts.filter((post) => post._id !== payload),
        loading: false
      };

    case ADD_COMMENT:
      return {
        ...state,
        post: { ...state.post, comments: payload },
        loading: false
      };

    case DELETE_COMMENT:
      return {
        ...state,
        post: {
          ...state.post,
          comments: state.post.comments.filter(
            (comment) => comment._id !== payload
          )
        },
        loading: false
      };

    default:
      return state;
  }
}

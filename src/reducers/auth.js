export default (state = {}, action) => {
  switch (action.type) {
    case 'LOGIN':
      return {
        uid: action.uid
      };
    case 'LOGOUT':
      return {};
    case 'SET_NAME_AND_AVATAR':
      return {
        ...state,
        ...action.userInfo
      }
    default:
      return state;
  }
};

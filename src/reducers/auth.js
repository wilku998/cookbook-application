export default (state = {}, action) => {
  switch (action.type) {
    case 'LOGIN':
      return {
        uid: action.uid,
        loginProcess: true
      };
    case 'LOGOUT':
      return {};
    case 'SET_NAME_AND_AVATAR':
      return {
        ...state,
        ...action.userInfo,
        loginProcess: false,
        isNew: false
      }
    case 'IS_NEW':
      return {
        ...state,
        isNew: true
      }
    default:
      return state;
  }
};

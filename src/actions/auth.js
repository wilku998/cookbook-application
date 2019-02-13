import { firebase, googleAuthProvider, facebookAuthProvider } from '../firebase/firebase';
import database from '../firebase/firebase';

export const login = (uid) => ({
  type: 'LOGIN',
  uid
});

export const startLoginWithGoogle = () => {
  return () => {
    return firebase.auth().signInWithPopup(googleAuthProvider)
  };
};

export const startLoginWithFacebook = () => {
  return () => {
    return firebase.auth().signInWithPopup(facebookAuthProvider)
  };
};

export const logout = () => ({
  type: 'LOGOUT'
});

export const startLogout = () => {
  return () => {
    return firebase.auth().signOut();
  };
};

export const setNameAndAvatar = (userInfo) => ({
  type: 'SET_NAME_AND_AVATAR',
  userInfo
});

export const sendNameAndAvatarToFirebase = (userInfo) => {
  return (dispatch, getState) => {
    return database.ref(`users/${getState().auth.uid}/userInfo`).set(userInfo).then(() => {
      dispatch(setNameAndAvatar(userInfo));
    })
  }
}
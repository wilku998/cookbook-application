import React from 'react';
import { connect } from 'react-redux';
import { startLoginWithGoogle, startLoginWithFacebook } from '../actions/auth';

export const LoginPage = ({ startLoginWithGoogle, startLoginWithFacebook }) => (
  <div className="login">
    <h1 className="login__title login__title--huge">Cookbook application</h1>
    <p className="login__title login__title--small">Welcome in virtual cookbook</p>
    <div className="login-btn-container">
      <button className="button button--primary login-btn" onClick={startLoginWithGoogle}>Login with Google</button>
      <button className="button button--primary login-btn" onClick={startLoginWithFacebook}>Login with Facebook</button>
    </div>
  </div>
);

const mapDispatchToProps = (dispatch) => ({
  startLoginWithGoogle: () => dispatch(startLoginWithGoogle()),
  startLoginWithFacebook: () => dispatch(startLoginWithFacebook())
});

export default connect(undefined, mapDispatchToProps)(LoginPage);

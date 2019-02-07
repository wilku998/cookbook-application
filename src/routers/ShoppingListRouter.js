import React from 'react';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';


export const ShoppingListRouter = ({
  isAuth,
  component: Component,
  twoCompVisible,
  ...rest
}) => {

  return (<Route {...rest} component={(props) => (
    isAuth && !twoCompVisible ? (
      <div>
        <main className="row container">
          <Component {...props} />
        </main>
      </div>
    ) : (
        !isAuth ? <Redirect to='/' /> : <Redirect to='/dashboard' />
    )
  )}/>
)
};
const mapStateToProps = (state) => ({
  isAuth: !!state.auth.uid,
  twoCompVisible: state.styles.twoCompVisible
});

export default connect(mapStateToProps)(ShoppingListRouter);
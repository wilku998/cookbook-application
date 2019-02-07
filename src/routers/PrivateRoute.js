import React from 'react';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import ShoppingList from '../components/ShoppingList';

export const PrivateRoute = ({
  isAuth,
  component: Component,
  twoCompVisible,
  ...rest
}) => {

  return (<Route {...rest} component={(props) => (
    isAuth ? (
      <div>
        <main className="row container">
          <Component {...props} />
          {twoCompVisible && <ShoppingList twoCompVisible={twoCompVisible}/>}
        </main>
      </div>
    ) : (
      <Redirect to='/' />
    )
  )}/>
)
};
const mapStateToProps = (state) => ({
  isAuth: !!state.auth.uid,
  twoCompVisible: state.styles.twoCompVisible
});

export default connect(mapStateToProps)(PrivateRoute);
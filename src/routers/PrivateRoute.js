import React from 'react';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import ShoppingList from '../components/ShoppingList';
import LoadingPage from '../components/LoadingPage';

export const PrivateRoute = ({
  isAuth,
  component: Component,
  twoCompVisible,
  fetchingData,
  ...rest
}) => {
  console.log(fetchingData)
  return (<Route {...rest} component={(props) => (
    isAuth ? (
      <div>
        <main className="row container">
          {fetchingData ? 
            <div className="loader-container">
              <LoadingPage /> 
            </div>
          : <Component {...props} />}
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
  twoCompVisible: state.styles.twoCompVisible,
  fetchingData: state.styles.fetchingData
});

export default connect(mapStateToProps)(PrivateRoute);
import React from 'react';
import { connect } from 'react-redux';
import { Router, Route, Switch, Redirect } from 'react-router-dom';
import createHistory from 'history/createBrowserHistory';
import PrivateRoute from './PrivateRoute';
import PublicRoute from './PublicRoute';
import ShoppingListRouter from './ShoppingListRouter';
import DashboardPage from '../components/DashboardPage';
import Recipe from '../components/Recipe'
import PrivateList from '../components/PrivateList';
import LoginPage from '../components/LoginPage'
import CreateRecipe from '../components/CreateRecipe'
import ShoppingList from '../components/ShoppingList';
import Header from '../components/Header';
import GreetingPopup from '../components/GreetingPopup';
import LoadingPage from '../components/LoadingPage';

export const history = createHistory();
const AppRouter = ({auth, fetchingData}) => {
  return(
  <Router history={history}>
    {fetchingData ? <LoadingPage /> :
      <div>
        {auth.userName && (<Header />)}
        <GreetingPopup />
        <Switch>
          <PublicRoute path="/" component={LoginPage} exact={true} />
          <PrivateRoute path="/dashboard" component={DashboardPage} />
          <PrivateRoute path="/recipe/:name" component={Recipe} exact={true}/>
          <PrivateRoute path="/recipe/fromUsers/:id" component={Recipe} />
          <PrivateRoute path="/recipes/:type" component={PrivateList} />
          <PrivateRoute path="/create-recipe" component={CreateRecipe} />
          <PrivateRoute path="/edit-recipe/:id" component={CreateRecipe} />
          <ShoppingListRouter path="/shopping-list" component={ShoppingList} />
          
          <Redirect to="/dashboard" />
        </Switch>
      </div>
    }
  </Router>
)};

const mapStateToProps=(state => ({
  auth: state.auth,
  fetchingData: state.styles.fetchingData
}))
export default connect(mapStateToProps)(AppRouter);

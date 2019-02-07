import React from 'react';
import { connect } from 'react-redux';
import { Router, Route, Switch, Link, NavLink } from 'react-router-dom';
import createHistory from 'history/createBrowserHistory';
import PrivateRoute from './PrivateRoute';
import ShoppingListRouter from './ShoppingListRouter';
import DashboardPage from '../components/DashboardPage';
import Recipe from '../components/Recipe'
import PrivateList from '../components/PrivateList';
import LoginPage from '../components/LoginPage'
import CreateRecipe from '../components/CreateRecipe'
import ShoppingList from '../components/ShoppingList';
import GreetingPopup from '../components/GreetingPopup';
import Header from '../components/Header';

export const history = createHistory();
const AppRouter = ({auth}) => {
  console.log()
  return(
  <Router history={history}>
    <div>
      {auth.userName && (<Header />)}
      {!auth.userName && (<GreetingPopup />)}
      
      <Switch>
        <Route path="/" component={LoginPage} exact={true} />
        <PrivateRoute path="/dashboard" component={DashboardPage} />
        <PrivateRoute path="/recipe/:name" component={Recipe} exact={true}/>
        <PrivateRoute path="/recipe/fromUsers/:id" component={Recipe} />
        <PrivateRoute path="/recipes/:type" component={PrivateList} />
        <PrivateRoute path="/create-recipe" component={CreateRecipe} />
        <PrivateRoute path="/edit-recipe/:id" component={CreateRecipe} />
        <ShoppingListRouter path="/shopping-list" component={ShoppingList} />
      </Switch>
    </div>
  </Router>
)};

const mapStateToProps=(state => ({
  auth: state.auth
}))
export default connect(mapStateToProps)(AppRouter);

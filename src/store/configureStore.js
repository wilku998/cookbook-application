import { createStore, combineReducers, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import authReducer from '../reducers/auth';
import recipesReducer from '../reducers/recipes';
import apiReducer from '../reducers/api';
import shoppingListReducer from '../reducers/shoppingList';
import stylesReducer from '../reducers/styles';

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

export default () => {
  const store = createStore(
    combineReducers({
      auth: authReducer,
      recipes: recipesReducer,
      api: apiReducer,
      shoppingList: shoppingListReducer,
      styles: stylesReducer
    }),
    composeEnhancers(applyMiddleware(thunk))
  );

  return store;
};

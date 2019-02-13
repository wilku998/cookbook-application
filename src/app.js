import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import AppRouter, { history } from './routers/AppRouter';
import configureStore from './store/configureStore';
import { login, logout } from './actions/auth';
import 'normalize.css/normalize.css';
import './styles/styles.scss';
import 'react-dates/lib/css/_datepicker.css';
import { firebase } from './firebase/firebase';
import LoadingPage from './components/LoadingPage';
import { setLikes, setOwnRecipes, setSelectedRecipeByID, setSelectedRecipe } from './actions/recipes';
import { setShoppingList } from './actions/shoppingList';
import database from './firebase/firebase';
import { setNameAndAvatar } from './actions/auth'
const store = configureStore();

const setTwoCompVisible=(twoCompVisible, scrWidth)=>{
  store.dispatch({
    type: 'SET_TWO_COMP_VIS',
    twoCompVisible,
    scrWidth
  })
}
let scrWidth = window.innerWidth
setTwoCompVisible(scrWidth>910, scrWidth)

window.addEventListener(('resize'), (e) => {
  scrWidth = window.innerWidth;
  setTwoCompVisible(scrWidth>910, scrWidth)
})


const jsx = () => (
  <Provider store={store}>
    <AppRouter />
  </Provider>
);

let hasRendered = false;
const renderApp = () => {
  if (!hasRendered) {
    ReactDOM.render(jsx(), document.getElementById('app'));
    hasRendered = true;
  }
};

const renderLoading = () => {
  ReactDOM.render(<LoadingPage />, document.getElementById('app'));
} 
renderLoading();

firebase.auth().onAuthStateChanged((user) => {

  if (user) {
    store.dispatch(login(user.uid));

    //checking if user is login for first time
    database.ref(`users/${user.uid}/userInfo`).once("value").then(res => {
      const userInfo = res.val()
      if(userInfo){
      //setting data
      store.dispatch(setNameAndAvatar(userInfo));
      
      Promise.all([store.dispatch(setShoppingList()),
        store.dispatch(setLikes()), store.dispatch(setOwnRecipes()), store.dispatch(setOwnRecipes())]).then(() => {
        
          const pathname = history.location.pathname;
        const pathnameArr = pathname.split('/');
        const state = store.getState();
  
        if(pathnameArr[1]==='recipe' && pathnameArr[2]!=='fromUsers'){
          //from edemam only liked (they dont have id)
          const likedRecipes = state.recipes.likedRecipes
          const likedIndex = likedRecipes.findIndex(e => e.label.split(' ').join('-') === pathnameArr[2] && !e.fromUser);
  
          if(likedIndex>-1){
            store.dispatch(setSelectedRecipe(likedRecipes[likedIndex]));
          }else{
            history.push('/dashboard');
          }
          renderApp();
        }else if(pathnameArr[1]==='recipe' && pathnameArr[2]==='fromUsers'){
          //users (own, liked or unknown)
          const ownRecipes = state.recipes.ownRecipes;
          const likedRecipes = state.recipes.likedRecipes;
          const id = pathnameArr[3];
  
          let ownIndex = ownRecipes.findIndex(e=> e.id === id);
          let likedIndex = likedRecipes.findIndex(e=> e.id === id);
  
          if(ownIndex > -1){
            history.push(`/edit-recipe/${id}`);
            renderApp();        
          }else if(likedIndex>-1){
            store.dispatch(setSelectedRecipe(likedRecipes[likedIndex]))
            renderApp();        
          }else{
            store.dispatch(setSelectedRecipeByID(id)).then(() => {
              renderApp();        
            })
          }
        }else if (pathname === '/') {
          history.push('/dashboard');
          renderApp();
        }else{
          renderApp();
        }
      });
    }else{
      renderApp();
      store.dispatch({type: "IS_NEW"})
      history.push('/dashboard');
    }
  })  
  }else {
    store.dispatch(logout());
    renderApp();
    history.push('/');
  }

});

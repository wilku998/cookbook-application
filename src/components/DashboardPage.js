import React from 'react';
import { connect } from 'react-redux';
import RecipesList from './RecipesList';
import GreetingComponent from './GreetingComponent';
import LoadingPage from './LoadingPage';

const DashboardPage = (props) => (
  props.fetchingRecipes ?
    <div className="loader-container">
      <LoadingPage />
    </div>
      :
    props.searchedRecipes.length>0 ? <RecipesList /> :
    <GreetingComponent />
)


const mapStateToProps = (state) => ({
  searchedRecipes: state.recipes.searchedRecipes,
  fetchingRecipes: state.styles.fetchingRecipes
})

export default connect(mapStateToProps)(DashboardPage);


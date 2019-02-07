import React from 'react';
import { connect } from 'react-redux';
import RecipesList from './RecipesList';
import GreetingComponent from './GreetingComponent';

const DashboardPage = (props) => (
        props.searchedRecipes.length>0 ? <RecipesList /> :
        <GreetingComponent />
)


const mapStateToProps = (state) => ({
  searchedRecipes: state.recipes.searchedRecipes,
})

export default connect(mapStateToProps)(DashboardPage);


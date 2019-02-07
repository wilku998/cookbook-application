import React from 'react'
import { connect } from 'react-redux';
import RecipeHeader from './RecipeHeader';
import { setSelectedRecipe } from '../actions/recipes'
import { history } from '../routers/AppRouter';
import { setLeftSideHeight } from '../actions/styles';

class LikedRecipes extends React.Component{
    constructor(props){
        super(props)
        this.state = {

        }
    }

    onRecipeClick(recipe){
        this.props.setSelectedRecipe(recipe);
        if(recipe.fromUser){
            history.push(`/recipe/fromUsers/${recipe.id}`);
        }else{
            history.push(`/recipe/${recipe.label.split(' ').join('-')}`);
        }

    }

    componentDidMount(){
        this.props.setLeftSideHeight(this.refs.component);
    }

    render(){
        return (
            <div className="my-recipes" ref='component'>
            <div className="main-h-container">
              <h1 className="main-h">liked ecipes</h1>
            </div>
            
                {this.props.LikedRecipes.length>0 ?this.props.LikedRecipes.map((e, i) => {
                    return (
                    <div onClick={() => this.onRecipeClick(e)}className="liked-recipes__item" key={i}>
                        <div className="my-recipes__item"><RecipeHeader parent="liked-recipes" recipe={e}/></div>
                    </div>
                    )
                }):'no likes'}
            </div>
        )
    }
}

const mapStateToProps = (state) => {
    return ({
        LikedRecipes: state.recipes.likedRecipes
    })
}

const mapDispatchToProps = (dispatch) => {
    return ({
        setSelectedRecipe: (recipe) => dispatch(setSelectedRecipe(recipe)),
        setLeftSideHeight: (refsComponent) => dispatch(setLeftSideHeight(refsComponent))
    })
}

export default connect(mapStateToProps, mapDispatchToProps)(LikedRecipes)

import React from 'react';
import { connect } from 'react-redux';
import { history } from '../routers/AppRouter';
import { setSelectedRecipe, addToLikedRecipes, removeFromLiked } from '../actions/recipes';
import parseIngredients from '../parsingFunctions/parseIngredients';
import createIngObj from '../parsingFunctions/createIngObj';
import reduceTitle from '../parsingFunctions/reduceTitle';


class RecipesListItem extends React.Component{
    constructor(props){
        super(props)
        this.state={
            titleLimit: 30
        }
    }

   onClick(){
        if(!this.props.recipe.fromUser){
            const likedIndex = this.props.likedRecipes.findIndex(e => e.id === this.props.recipe.id)

            if(likedIndex===-1){
                const recipe = this.parseRecipe(this.props.recipe);
                this.pushRecipe(recipe) 
            }else{
                this.pushRecipe(this.props.likedRecipes[likedIndex]); 
            }
        }else{
            if(this.props.isOwn){
              history.push(`/edit-recipe/${this.props.recipe.id}`);
            }else{
                this.props.setSelectedRecipe(this.props.recipe);
                history.push(`/recipe/fromUsers/${this.props.recipe.id}`);  
            }    
       }
    }

    pushRecipe(recipe){
        this.props.setSelectedRecipe(recipe);
        history.push(`/recipe/${recipe.label.split(' ').join('-')}`);
    }

    addToLikedRecipes(){
        let recipe = this.props.recipe;

        if(!this.props.recipe.fromUser){
            recipe = this.parseRecipe(this.props.recipe)
        }
        this.props.addToLikedRecipes({...recipe, isLiked: true});
    }

    parseRecipe(recipe){
        const ingredients = parseIngredients(recipe.ingredients).map((e) => {
            return createIngObj(e);
        });

        const totalDaily = Object.keys(recipe.totalDaily).map(key => {
            return recipe.totalDaily[key]
        });

        const totalNutrients = Object.keys(recipe.totalNutrients).map(key => {
            return recipe.totalNutrients[key]
        });

        return{
            ...recipe,
            totalDaily,
            totalNutrients,
            ingredients,
            initialServings: recipe.servings,
            initialIngrCounts: ingredients.map(e=> e.count),
            initialTotalDailyCounts: totalDaily.map(e => e.quantity),
            initialTotalNutrientsCounts: totalNutrients.map(e=> e.quantity)
        };
    }

    removeFromLiked(){
        this.props.removeFromLiked(this.props.recipe); 
    }
    
    render(){
        return (
            <div className="recipes-list__item">
                <img src={this.props.recipe.image} className="recipes-list__item__image"/>
                {
                    !this.props.isOwn ? this.props.recipe.isLiked ? 
                        <div className="recipes-list__item__action" onClick={() => this.removeFromLiked()}>
                            <i className="icon-heart-1 recipes-list__item__action__icon" />
                        </div>
                        :
                        <div className="recipes-list__item__action" onClick={() => this.addToLikedRecipes()}>
                            <i className="icon-heart-empty recipes-list__item__action__icon" />
                        </div>
                    : <div className="recipes-list__item__action" onClick={()=>this.onClick()}>
                        <i className="icon-feather recipes-list__item__action__icon" />
                      </div>
                }


                <div className="recipes-list__item__description" onClick={()=>this.onClick()}>
                    <h3 className="recipes-list__item__description__title">
                        {reduceTitle(this.props.recipe.label, this.state.titleLimit)}
                    </h3>
                    <span className="recipes-list__item__description__info"><i className="icon-adult recipes-list__item__icon-small" />
                        Servings: {this.props.recipe.servings}
                    </span>
                    <span className="recipes-list__item__description__info"><i className="icon-food recipes-list__item__icon-small" />
                        Ingredients: {this.props.recipe.ingredients.length}
                    </span>
                </div>
            </div>
        )
    }
}

const mapStateToProps = (state, props) => {
    return{
        likedRecipes: state.recipes.likedRecipes,
        api: state.api,
        isOwn: state.auth.uid === props.recipe.fromUser
    }
}

const mapDispatchToProps = (dispatch) => {
    return{
        setSelectedRecipe: (recipe) => dispatch(setSelectedRecipe(recipe)),
        addToLikedRecipes: (recipe) => dispatch(addToLikedRecipes(recipe)),
        removeFromLiked: (recipe) => dispatch(removeFromLiked(recipe))
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(RecipesListItem)


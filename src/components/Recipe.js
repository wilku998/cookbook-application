import React from 'react'
import { connect } from 'react-redux';
import { addToLikedRecipes, incrementOrDecreaseServings, removeFromLiked } from '../actions/recipes';
import RecipeHeader from './RecipeHeader';
import { addIngredients } from '../actions/shoppingList';
import { sliceIngredientsArr } from '../parsingFunctions/sliceIngredientsArr'
import PopupModal from './PopupModal';
import PopupCreateRecipe from './PopupCreateRecipe';
import { setLeftSideHeight } from '../actions/styles';


class Recipe extends React.Component{
    constructor(props){
        super(props)
        this.state = {
            formUnit: 'procents',
            modalIsOpen: false,
            secondModaIsOpen: false
        }
        this.closeModal = this.closeModal.bind(this);
        this.closeSecondModal = this.closeSecondModal.bind(this);
        this.incrementOrDecreaseServings = this.incrementOrDecreaseServings.bind(this);
    }
    closeModal() {
        this.setState({
            modalIsOpen: false,
        });
    }

    closeSecondModal() {
        this.setState({
            secondModaIsOpen: false,
        });
    }
    
    addToShoppingList(){
        if(this.props.shoppingList.length<10){
            const indexOfRecipeInShoppingList = this.props.shoppingList.findIndex(e => e.from === this.props.recipe.label);
            if(indexOfRecipeInShoppingList===-1){
                this.props.addToShoppingList(this.props.recipe.ingredients, this.props.recipe.label);
            }else{
                this.setState({modalIsOpen: true,
                });
            }
        }else{
            this.setState(()=>({
                secondModaIsOpen: true
            }))
        }
    }

    like(){
        this.props.addToLiked({...this.props.recipeCopy, isLiked: true});
    }

    unlike(){
        this.props.removeFromLiked(this.props.recipe); 
    }

    incrementOrDecreaseServings(type){
        let newServings;

        if(this.props.recipe.servings>1 && type==='minus'){
            newServings = this.props.recipe.servings-1;
          }else if(this.props.recipe.servings<30 && type==='plus'){
            newServings = this.props.recipe.servings+1;
          }

        this.props.incrementOrDecreaseServings({...this.props.recipe, newServings});
    }

    sliceHealthLabels(labels){
        return [labels.slice(0, Math.ceil(labels.length / 2)), labels.slice(Math.ceil(labels.length / 2) ,labels.length)]
    }

    sliceNutrients(nutrients, scrWidth){
        if(scrWidth>600){
            return [
                nutrients.slice(0, Math.ceil(nutrients.length / 4)),
                nutrients.slice(Math.ceil(nutrients.length / 4) ,Math.ceil(nutrients.length / 2)),
                nutrients.slice(Math.ceil(nutrients.length / 2) ,Math.ceil(nutrients.length*0.75)),
                nutrients.slice(Math.ceil(nutrients.length*0.75) ,nutrients.length)
            ]
        }else{
            return [
                nutrients.slice(0, Math.ceil(nutrients.length / 2)),
                nutrients.slice(Math.ceil(nutrients.length / 2) ,nutrients.length),
            ] 
        }

    }
    
    sortArr(arr){

        return arr.sort((a, b) => a.label.length + a.unit.length + toString(Math.round(a.quantity*10)/10).length
        > 
        b.label.length + b.unit.length + toString(Math.round(b.quantity)).length ? 1 : -1)
    }

    unitChange(formUnit){
        this.setState(()=>({formUnit}))
    }

    componentDidMount(){
        this.props.setLeftSideHeight(this.refs.component);
    }
    
    render(){
        return (
            <div className="recipe" ref='component'>
                <PopupModal modalIsOpen={this.state.modalIsOpen} closeModal={this.closeModal}
                    ingredients={this.props.recipe.ingredients} label={this.props.recipe.label}
                />

                <PopupCreateRecipe modalIsOpen={this.state.secondModaIsOpen} closeModal={this.closeSecondModal} 
                message="You reached limit of recipes in shopping list, delete at least one." />

                <RecipeHeader parent="recipe" recipe={this.props.recipe} incrementOrDecreaseServings={this.incrementOrDecreaseServings}/>
                
                <div className="recipe__ingredients ingredients">
                    <h3 className="recipe__ingredients__title">Ingredients</h3>
                    <div className="ingredients-container">
                        {[this.props.scrWidth<=550 ? [this.props.recipe.ingredients] : sliceIngredientsArr(this.props.recipe.ingredients, 'recipe')][0]
                        .map((arr, iArr, recipes) => {
                            return (
                                <ul key={`ingredients-arr-${iArr}`} className={recipes[1] ? "ingredients__list"
                                    : 
                                "ingredients__list ingredients__list--shopping"}>
                                    {arr.map((e, iItem) => {
                                        return (
                                            <li className="ingredients__list__item" key={`ingredients-arr-${iArr}-item-${iItem}`}>
                                            {e.count} {e.unit} {e.ingredient}
                                            </li>
                                        )
                                    })}
                                </ul>
                            )
                        })}
                    </div>
                </div>
                <div className="recipe__ingredients recipe__ingredients--darken ingredients">
                    <h3 className="recipe__ingredients__title">Health labels</h3>
                        <div className="ingredients-container">
                            {
                                this.sliceHealthLabels(this.props.recipe.healthLabels)
                                .map((arr, iArr) =>{
                                    return (
                                        <ul key={`healthLabels-arr-${iArr}`} className="ingredients__list">
                                            {arr.map((e, iItem) => {
                                                return (<li className="ingredients__list__item" key={`healthLabels-arr-${iArr}-item-${iItem}`}>
                                                    <i className="icon-ok-outline recipe__icon"/>{this.props.recipe.fromUser ? e.label : e.split("-").join(' ')}
                                                </li>)
                                            })}
                                        </ul>
                                    )
                                })
                            }
                        </div>
                </div>
                {
                !this.props.recipe.fromUser
                &&
                <div className="recipe__ingredients ingredients">
                    <h3 className="recipe__ingredients__title">Nutrients
                        <select className="input-small input-small--nutrients input-small--unit" value={this.state.formUnit} 
                        onChange={(e) => this.unitChange(e.target.value)}>
                            {['procents', 'other-units'].map(unit => 
                                <option key={unit} value={unit}>{unit='other-units' ? unit.split('-').join(' ') : unit}</option>)}
                        </select>
                    </h3>
                    
                        <div className="ingredients-container">
                            {
                                this.sliceNutrients(...[this.state.formUnit === 'procents' ? this.props.recipe.totalDaily 
                                :
                                this.props.recipe.totalNutrients], this.props.scrWidth).map((arr, iArr) =>{
                                    return (
                                        <ul key={`nutrients-arr-${iArr}`}
                                            className={this.props.scrWidth>600 ? "ingredients__list ingredients__list--nutrients" : "ingredients__list"}>
                                            {this.sortArr(arr).map((e, iItem) => {
                                                return (<li className="ingredients__list__item" key={`nutrients-arr-${iArr}-item-${iItem}`}>
                                                    {e.label} {Math.round(e.quantity)}{e.unit}
                                                </li>)
                                            })}
                                        </ul>
                                    )
                                })
                            }
                        </div>
                </div>
                }
                <div className="recipe__footer recipe__footer--column">
                    <span className="recipe__footer--column__btn" onClick={() => this.addToShoppingList()}><i className="icon-basket recipe__icon"></i>Add to shopping list</span>
                    
                    {this.props.recipe.isLiked===true ? <span className="recipe__footer--column__btn" onClick={() => this.unlike()}><i className="icon-heart-broken recipe__icon"></i>Unlike recipe</span>
                    :
                    <span className="recipe__footer--column__btn" onClick={() => this.like()}><i className="icon-heart recipe__icon"></i>Like recipe</span>}
                    
                    {this.props.recipe.url!='' && <a target="_blank" rel="noopener noreferrer" href={this.props.recipe.url} className="recipe__footer__link">Check full recipe on publisher site</a>}
                </div>
            </div>
        )
    }
};

const mapStateToProps = (state) => {
    return {
        recipe: state.recipes.selectedRecipe,
        recipeCopy: state.recipes.selectedRecipeCopy,
        shoppingList: state.shoppingList.recipes,
        scrWidth: state.styles.scrWidth
    }
};

const mapDispatchToProps = (dispatch) => {
    return {
        addToLiked: (recipe) => dispatch(addToLikedRecipes(recipe)),
        removeFromLiked: (recipe) => dispatch(removeFromLiked(recipe)),
        addToShoppingList: (ingredients, label) => dispatch(addIngredients(ingredients, label)),
        incrementOrDecreaseServings: (recipe) => dispatch(incrementOrDecreaseServings(recipe)),
        setLeftSideHeight: (refsComponent) => dispatch(setLeftSideHeight(refsComponent)),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Recipe);

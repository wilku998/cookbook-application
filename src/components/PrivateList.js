import React from 'react';
import { connect } from 'react-redux';
import RecipeHeader from './RecipeHeader';
import { history } from '../routers/AppRouter';
import { removeRecipe, setSelectedRecipe } from '../actions/recipes'
import { setLeftSideHeight } from '../actions/styles';
import MoveButtons from './MoveButtons';

class PrivateList extends React.Component {
    constructor(props){
        super(props);
        this.state={
            page: 1,
            pages: Math.ceil(props.recipes.length/5),
            type: props.match.params.type
        }
        this.nextPage=this.nextPage.bind(this);
        this.prevPage=this.prevPage.bind(this);
    }

    nextPage(){
        this.setState((state) => ({
            page: state.page+1
        }))
        window.scrollTo(0,0);
    }

    prevPage(){
        this.setState((state) => ({
            page: state.page-1
        }))
        window.scrollTo(0,0);
    }

    editRecipe = (id) => {
        history.push(`/edit-recipe/${id}`)
    };

    getVisibleRecipes(page){
        return this.props.recipes.slice((page-1)*5, page*5)
    }

    onItemClick(recipe){
        this.props.setSelectedRecipe(recipe);
        if(this.state.type==='liked'){
            if(recipe.fromUser){
                history.push(`/recipe/fromUsers/${recipe.id}`);
            }else{
                history.push(`/recipe/${recipe.label.split(' ').join('-')}`);
            }
        }

    }

    componentDidMount(){
        this.props.setLeftSideHeight(this.refs.component)
    }
    componentDidUpdate(){
        this.props.setLeftSideHeight(this.refs.component)
    }

    render() {
        return (
            <div className="private-list" ref='component'>
                
                {this.props.scrWidth>450 && <div className="main-h-container">
                    <h1 className="main-h">{this.state.type==='own' ? "My recipes" : "Liked recipes"}</h1>
                </div>}

                <div className="private-list__content">
                    {this.props.recipes.length>0 ? 
                        this.getVisibleRecipes(this.state.page).map(e => <div key={e.id} onClick={()=>this.onItemClick(e)}
                        className={this.state.type==='liked' ? "private-list__item private-list__item--liked" : "private-list__item"}>
                            <RecipeHeader editRecipe={this.editRecipe} removeRecipe={this.props.removeRecipe} parent={this.state.type} recipe={e} />
                        </div>)
                        :
                    <span className="private-list__content__empty">{this.state.type==='own' ? `You didn't create any recipe yet.` : `You didn't like any recipe yet.`}</span>
                    }
                </div>

                {this.props.recipes.length>4 && <MoveButtons page={this.state.page} pages={this.state.pages}
                nextPage={this.nextPage} prevPage={this.prevPage}/>}
            </div>
        )
    }
};

const mapStateToProps=(state, props)=>({
    recipes: props.match.params.type==='own' ? state.recipes.ownRecipes : state.recipes.likedRecipes,
    scrWidth: state.styles.scrWidth
})

const mapDispatchToProps=(dispatch) => ({
    removeRecipe: (id) => dispatch(removeRecipe(id)),
    setLeftSideHeight: (refsComponent) => dispatch(setLeftSideHeight(refsComponent)),
    setSelectedRecipe: (recipe) => dispatch(setSelectedRecipe(recipe))
})

export default connect(mapStateToProps, mapDispatchToProps)(PrivateList);
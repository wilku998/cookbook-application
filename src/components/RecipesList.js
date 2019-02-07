import React from 'react';
import { connect } from 'react-redux';
import RecipesListItem from './RecipesListItem';
import MoveButtons from './MoveButtons';
import { setLeftSideHeight } from '../actions/styles'

export class RecipesList extends React.Component {
  constructor(props){
    super(props);

    this.state = {
      page: 1,
    }
    this.prevPage = this.prevPage.bind(this);
    this.nextPage = this.nextPage.bind(this);
  }

  nextPage(){
    this.setState((state) => {
      return {page: state.page + 1};
    });
  }

  prevPage(){
    this.setState((state) => {
      return {page: state.page - 1};
    });
  }


  selectRecipes(recipes, limit){
    const selectedRecipes = recipes.slice((this.state.page-1)*limit, this.state.page*limit);
    return selectedRecipes
  }

  componentDidMount(){
    this.props.setLeftSideHeight(this.refs.component);
  }

  getLimit(scrWidth){
    return scrWidth<=550 && scrWidth>350 ? 8 : 9
  }
  componentDidUpdate(){
    this.props.setLeftSideHeight(this.refs.component);
    
  }

  render(){
    return (
      <div className="recipes-list" ref="component">
        
        <div className="recipes-list__recipes">
          {this.props.recipes.length > 0 && this.selectRecipes(this.props.recipes, this.getLimit(this.props.scrWidth)).map((e, i)=>{
            return <RecipesListItem key={i} recipe={e}/>
          })}
        </div>
        {(this.props.recipes.length > this.getLimit(this.props.scrWidth)) &&    
          <div className="recipes-list__move">
            <MoveButtons nextPage={this.nextPage} prevPage={this.prevPage} page={this.state.page} 
              pages={Math.ceil(this.props.recipes.length/this.getLimit(this.props.scrWidth))} />
          </div>
        }  
      </div>
    )
  }
}

const mapDispatchToProps = (dispatch) => ({
  setLeftSideHeight: (refsComponent) => dispatch(setLeftSideHeight(refsComponent))
})

const mapStateToProps = (state) => {
  return {
    recipes: state.recipes.searchedRecipes,
    scrWidth: state.styles.scrWidth
  }
}



export default connect(mapStateToProps, mapDispatchToProps)(RecipesList);
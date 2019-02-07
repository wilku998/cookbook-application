import React from 'react';
import axios from 'axios';
import { connect } from 'react-redux';
import { setSearchedRecipes } from '../actions/recipes';
import { Link, NavLink } from 'react-router-dom';
import {history} from '../routers/AppRouter'
import { startLogout } from '../actions/auth'
import database from '../firebase/firebase';
import { healthLabels } from '../data/healthLables';
import { ingredientValidation } from '../validation/ingredientsValidation'


export class Header extends React.Component {
  constructor(props){
    super(props);

    this.state = {
      query: '',
      wasSearchedForTest: false,
      searchFrom: 'users',
      advencedOpen: false,
      animationOfHidingAdvencedSearch: false,
      filterHealthLabels: healthLabels.map(e => ({...e, isActive: false})),
      filterIngredients: [],
      filterIngredientsInput: '',
      filterHealthLabelsInput: '',
      userMenuVisible: false,
      searchVisible: false,
      mainMenuVisible: false,
      selected: '',
      arrowDown: false
    }
  }

  onQueryChange(e){
    this.setState({query: e.target.value});
  }

  searchRecipes(){
    const selector = this.state.searchFrom;
    let request;
    if(selector==='edamam'){
      request = this.getRecipesFromAPI()
    }else if(selector==='users'){
      request = this.getRecipesFromUsers()
    }

    request.then((res) => {
      if(res){
        this.props.setSearchedRecipes(res);
      }
    })
  }

  getRecipesFromUsers(){
    
    return database.ref('usersRecipes').once('value').then(res => {
      const objFromFirebase = res.val();
      if(!!objFromFirebase){
        const recipes = Object.keys(objFromFirebase).map(key => {
          return {...objFromFirebase[key], id: key}
        })
  
        return recipes.filter(recipe => {
          //seaching for excluded ingredient
          const filterIngredients = this.state.filterIngredients;
          let doesntContainExcludedIgr = true;
          if(filterIngredients.length>0){
            filterIngredients.forEach(filter => {
              recipe.ingredients.forEach(igr => {
                if(igr.ingredient.includes(filter)){
                  doesntContainExcludedIgr = false
                }
              })
            })
          }
  
          //checking if recipe has each filter helath label
          let healthLabelsValidation = true;
          const filterHealthLabels = this.state.filterHealthLabels.filter(e => e.isActive).map(e => e.parameter);

          if(filterHealthLabels.length>0){
            const dontFoundedLabelIndex = filterHealthLabels.map(filter => {
              return recipe.healthLabels.map(e => e.parameter).includes(filter)
            }).findIndex(e => e===false)
            if(dontFoundedLabelIndex>-1){
              healthLabelsValidation = false;
            }
          }

          let queryValidation = false;

          if(recipe.label.includes(this.state.query) || recipe.ingredients.findIndex(e => e.ingredient.includes(this.state.query)>-1)){
            queryValidation = true;
          }

          return doesntContainExcludedIgr && healthLabelsValidation && queryValidation
        })
      }
    })
  }

  getRecipesFromAPI(){
    const query = `https://api.edamam.com/search?q=${this.state.query}&app_id=${this.props.api.APP_ID}&app_key=
    ${this.props.api.APP_KEY}&to=30${this.state.filterHealthLabels
    .filter(e => e.isActive).map((e) => `&health=${e.parameter}`)}
    ${this.state.filterIngredients.map(e => `&excluded=${e}`)}`.replace(',','');
    console.log(query)
//excluded=vinegar&excluded=pretzel
    return axios(query)
    .then((res) => {
      const recipes = res.data.hits.map(e => {
        let recipe = e.recipe;
        recipe.ingredients = recipe.ingredientLines;
        recipe.servings = recipe.yield;
        delete recipe.ingredientLines;
        delete recipe.yield;
      return recipe
      });
      return recipes
    }).catch((error)=>{
      console.log(error);
    })
  }

  onSubmit(e){
    e && e.preventDefault();
    if(history.location.pathname !== '/dashboard'){
      history.push('/dashboard');
    }
    this.state.advencedOpen && this.toggleAdvencedSearch(false);
    this.state.searchVisible && this.toggleWhenMobile(false, false);
    this.searchRecipes();
  }
  
  onSelectorChange(selectorValue){
    this.setState(() => ({
      selectorValue
    }))
  }

  onFilterIngredientsInputChange(filterIngredientsInput){
    this.setState(()=>({
      filterIngredientsInput
    }))
  }

  addFilterIngredient(event){
    event.preventDefault();
    const valid = ingredientValidation(this.state.filterIngredientsInput);

    valid && this.setState((state) => ({
      filterIngredients: [...state.filterIngredients, state.filterIngredientsInput],
      filterIngredientsInput: ""
    }))
  }

  deleteFilterProperty(from, property){
    this.setState(state => ({
      [from]: state[from].filter(e => e!==property)
    }))
  }

  toggleAdvencedSearch(value){

    const set = () => {
      this.setState((state)=>({
        advencedOpen: value,
        animationOfHidingAdvencedSearch: false,
      }))
    }

    //closing
    if(this.state.advencedOpen){
      this.setState(() => ({
        animationOfHidingAdvencedSearch: true,
        arrowDown: false
      }), ()=> {
        setTimeout(() => set(), 200);
      });
      //opening
    }else{
      this.setState(() => ({
        arrowDown: true
      }))
      set();
    }
  }

  toggleWhenMobile(mainMenuVisible, searchVisible){
    mainMenuVisible && this.toggleAdvencedSearch(false);
    
    this.setState((state) => ({
      searchVisible,
      mainMenuVisible,
      selected: mainMenuVisible ? 'menu' : searchVisible ? 'search' : state.selected
    }))
  }

  setSelected(selected){
    this.setState(() => ({
      selected
    }))

    this.toggleAdvencedSearch(false);
  }

  selectSearchFrom(value){
    this.setState(() => ({
      searchFrom: value
    }))
  }

  showUserMenu(property){
    this.setState(() => ({
      userMenuVisible: property
    }))
  }

  switchModeOfHealthLabel(toSwitch){
    this.setState(state =>({
      filterHealthLabels: state.filterHealthLabels.map(e => e.label===toSwitch.label ? {...e, isActive: !e.isActive} : e)
    }))
  }

  renderNavUser(name){
    return (
      name ? (<div className="nav__user" 
      onMouseOut={() => this.showUserMenu(false)} onMouseOver={() => this.showUserMenu(true)}>
        <img className="nav__user__picture" src={this.props.userInfo.avatar}/>
        <span className="nav__user__name">{name}</span>
        <div className={this.state.userMenuVisible ? "nav__user__menu" : "nav__user__menu nav__user__menu--hidden"}>
          <span className="nav__user__menu__option" onClick={() => this.props.startLogout()}>logout</span>
        </div>
      </div>
      ) : ''
    )
  }
  componentDidMount(){
    //this.searchRecipes()
  }
  render (){
    return (
      <div className="header-container">
        <div className="row header">
          <div className="header-left">
            
            {this.props.twoCompVisible &&
            <Link onClick={() => this.toggleAdvencedSearch(false)} to="/dashboard" className="header__logo-container">
              <i className="icon-food-1 header__logo"/>
            </Link>
            }

              <div className="search-container">

                {(this.props.scrWidth>550 || this.state.searchVisible) &&
                  (<form className="search" onSubmit={(e) => this.onSubmit(e)}>
                    <div className="search__more" onClick={() => this.toggleAdvencedSearch(!this.state.advencedOpen)}>
                      <i className={this.state.arrowDown ? "search__icon search__icon--close icon-down-open" : "search__icon icon-down-open"}/>
                    </div>
                    <input placeholder="search recipes" className="search__input" value={this.state.query} onChange={(e) => this.onQueryChange(e)} type="text" />
                    <button className="search__btn">
                      <i className="search__icon icon-search-1" />
                    </button>
                  </form>)
                }

                {this.state.advencedOpen && (
                <div className={this.state.animationOfHidingAdvencedSearch ? "advenced-search advenced-search--hide" : "advenced-search"}>
                  <div className="advenced-search__left">
                    <div className="advenced-search__item">
                      <span className="advenced-search__title">Search from</span>
                        <label className="advenced-search__label">
                          <input className="advenced-search__radio" type="radio" name="from" value="edamam"
                          onChange={(e)=> this.selectSearchFrom(e.target.value)} checked={this.state.searchFrom==="edamam"}/>
                          <span className="advenced-search__label__option">edamam database</span>
                        </label>
                        <label className="advenced-search__label">
                          <input className="advenced-search__radio" type="radio" name="from" value="users"
                          onChange={(e)=> this.selectSearchFrom(e.target.value)} checked={this.state.searchFrom==="users"}/>
                          <span className="advenced-search__label__option">created by users</span>
                        </label>
                    </div>

                    <div className="advenced-search__item advenced-search__item--ingredients">
                      <span className="advenced-search__title">Exclude ingredients</span>
                        <form className="advenced-search__form" onSubmit={e => this.addFilterIngredient(e)}>
                        <input className="input-small input-small--text" type="text" 
                          onChange={e => this.onFilterIngredientsInputChange(e.target.value)}
                          value={this.state.filterIngredientsInput}/>
                          <button className="input-small__btn" >add</button>              
                        </form>
                        <ul className="advenced-search__list">
                        {
                          this.state.filterIngredients.map((e, i) => {
                            return  (<li key={i} className="advenced-search__list__item">{e}
                                      <i className="icon-cancel advenced-search__list__item__delete"
                                      onClick={() => this.deleteFilterProperty('filterIngredients', e)}/>
                                    </li>)
                          })
                        }
                        </ul>
                    </div>
                  </div>

                  <div className="advenced-search__item advenced-search__item--right">
                    <span className="advenced-search__title">Filter by health labels</span>
                    <div className="advenced-search__list-containerForTwo">
                    {
                        [this.props.scrWidth>550 ? [this.state.filterHealthLabels.slice(0, Math.ceil(this.state.filterHealthLabels.length/2)),
                        this.state.filterHealthLabels.slice(Math.ceil(this.state.filterHealthLabels.length/2))]
                          :
                        [this.state.filterHealthLabels]][0]
                        .map((arr, arrIndex) => {
                          return (
                            <ul key={arrIndex} className="advenced-search__list-double">
                              {arr.map((e, i) => {
                                return (<li key={i} onClick={() => this.switchModeOfHealthLabel(e)}
                                className={e.isActive ? "advenced-search__list__item advenced-search__list__item--label advenced-search__list__item--label--active" :
                                "advenced-search__list__item--label advenced-search__list__item"}>
                                {e.label}</li>)
                              })}                            
                            </ul>
                          )
                        })
                      }
                    </div>
                  </div>
                </div>
              )}
              </div>
          </div>

          {this.props.scrWidth>550 ? (
            <nav className="nav">
            <div className={this.state.selected === 'create' ? "nav__item nav__item--selected" : "nav__item"}>
              <Link onClick={() => this.setSelected('create')} to ="/create-recipe" 
                className="nav__item__link">
                Create recipe<i className="nav__icon icon-plus-circled"/>
              </Link>             
            </div>
            <div className={this.state.selected === 'own' ? "nav__item nav__item--selected" : "nav__item"}>
              <Link onClick={() => this.setSelected('own')} to ="/recipes/own" 
                className="nav__item__link">
                My recipes<i className="nav__icon icon-food"/>
              </Link>
            </div>
            <div className={this.state.selected === 'liked' ? "nav__item nav__item--selected" : "nav__item"}>
              <Link onClick={() => this.setSelected('liked')} to ="/recipes/liked" 
                className="nav__item__link">
                Likes<i className="nav__icon icon-heart"/>
              </Link>        
            </div>

            {
              !this.props.twoCompVisible && 
              (<div className={this.state.selected === 'shopping' ? "nav__item nav__item--selected" : "nav__item"}>
                <Link onClick={() => this.setSelected('shopping')} to ="/shopping-list" 
                  className="nav__item__link">
                  Shopping list<i className="nav__icon icon-heart"/>
                </Link>        
              </div>)
            }

            {this.renderNavUser(this.props.userInfo.userName)}
          </nav>      
          ) : (
            <nav className="nav">
            <Link onClick={() => this.toggleWhenMobile(false, false)} to="/dashboard" className="header__logo-container">
              <i className="icon-food-1 header__logo"/>
            </Link>
              <div className={this.state.selected=== 'menu' ? "nav__item nav__item--selected" : "nav__item"}
                onClick={()=> this.toggleWhenMobile(true, false)}>
                <span className="nav__item__link">
                  <i className="icon-menu"/>
                </span>
              </div>
              <div className={this.state.selected=== 'search' ? "nav__item nav__item--selected" : "nav__item"}
                onClick={()=> this.toggleWhenMobile(false, true)}>
                <span className="nav__item__link">
                  <i className="icon-search-1"/>
                </span>
              </div>
              <div className={this.state.selected=== 'shopping' ? "nav__item nav__item--selected" : "nav__item"}
                onClick={() => {
                  this.setSelected('shopping');
                  this.toggleWhenMobile(false, false)
                  }}>
                <Link to ="/shopping-list" className="nav__item__link">
            	    <i className="icon-basket" />
                </Link>
              </div>

              {this.renderNavUser(this.props.userInfo.userName)}

              {this.state.mainMenuVisible &&
              (<div className='nav__mobile-menu'>
                <Link onClick={() => this.toggleMenuWhenMobile()} to ="/create-recipe" className='nav__mobile-menu__item'>
                  Create recipe
                </Link>
                <Link onClick={() => this.toggleMenuWhenMobile()} to ="/recipes/liked" className='nav__mobile-menu__item'>
                  Liked recipes
                </Link> 
                <Link onClick={() => this.toggleMenuWhenMobile()} to ="/recipes/own" className='nav__mobile-menu__item'>
                  My recipes
                </Link>  
              </div>)}
            </nav>
          )}
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  return{
    api: state.api,
    userInfo: state.auth,
    twoCompVisible: state.styles.twoCompVisible,
    scrWidth: state.styles.scrWidth
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    setSearchedRecipes: (recipes) => dispatch(setSearchedRecipes(recipes)),
    startLogout: () => dispatch(startLogout())
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(Header);


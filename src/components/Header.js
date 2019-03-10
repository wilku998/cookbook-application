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

const defaultHealthLabels = healthLabels.map(e => ({...e, isActive: false}));

export class Header extends React.Component {
  constructor(props){
    super(props);

    this.state = {
      query: '',
      wasSearchedForTest: false,
      searchFrom: 'edamam',
      advencedOpen: false,
      animationOfHidingAdvencedSearch: false,
      filterHealthLabels: defaultHealthLabels,
      filterIngredients: [],
      filterIngredientsInput: '',
      filterHealthLabelsInput: '',
      userMenuVisible: false,
      searchVisible: false,
      mainMenuVisible: false,
      selected: '',
      filterIngredientsInputValid: false,
      arrowDown: false,
      addingFiltersDisabled: true,
      limitHealthLabels: 2,
      EDEMAN_ID: process.env.EDEMAN_ID,
      EDEMAN_KEY: process.env.EDEMAN_KEY
    }
  }

  onQueryChange(e){
    this.setState({query: e.target.value});
  }

  searchRecipes(query, selector){
    if(selector==='edamam'){
      this.getRecipesFromAPI(query).then((res) => {
        this.set(this.parseEdemamRecipes(res))
      })
    }else if(selector==='users'){
      this.getRecipesFromUsers().then((res) => {
        this.set(this.filterRecipesFromUsers(this.parseUsersRecipes(res), query));
      })
    }
  }

  searchAllFromUsers(){
    this.prepareBeforeSearch()

    this.getRecipesFromUsers().then((res) => {
      this.set(this.parseUsersRecipes(res));
    })
  }

  set(respond){
    respond !== [] && this.props.setSearchedRecipes(respond);
    this.props.setFetchingRecipes(false);
  }
  getRecipesFromUsers(){
    return database.ref('usersRecipes').once('value')
  }

  getRecipesFromAPI(query){
    const request = `https://api.edamam.com/search?q=${query}&app_id=${this.state.EDEMAN_ID}&app_key=
    ${this.state.EDEMAN_KEY}&to=30${this.state.filterHealthLabels
    .filter(e => e.isActive).map((e) => `&health=${e.parameter}`)}
    ${this.state.filterIngredients.map(e => `&excluded=${e}`)}`.replace(',','');

    return axios(request)
  }

  parseUsersRecipes(res){
    const objFromFirebase = res.val();
    if(!!objFromFirebase){
      return Object.keys(objFromFirebase).map(key => {
        return {...objFromFirebase[key], id: key}
      })
    }
  }

  filterRecipesFromUsers(recipes, query){
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

      query.split(' ').forEach((el) => {
        if(recipe.label.includes(el) || (recipe.ingredients.findIndex(e => e.ingredient.includes(el))>-1)){
          queryValidation = true;
        }
      })

      return doesntContainExcludedIgr && healthLabelsValidation && queryValidation
    })
  }
  parseEdemamRecipes(res){
    return res.data.hits.map(e => {
      let recipe = e.recipe;
      recipe.ingredients = recipe.ingredientLines;
      recipe.servings = recipe.yield;
      delete recipe.ingredientLines;
      delete recipe.yield;
      return recipe
    });
  }

  onSubmit(e, query, selector){
    e && e.preventDefault();
    this.prepareBeforeSearch()
    this.searchRecipes(query, selector);
  }

  prepareBeforeSearch(){
    if(history.location.pathname !== '/dashboard'){
      history.push('/dashboard');
    }
    this.props.setFetchingRecipes(true);
    this.state.advencedOpen && this.toggleAdvencedSearch(false);
    this.state.searchVisible && this.toggleWhenMobile(false, false);
  }

  onSelectorChange(selectorValue){
    this.setState(() => ({
      selectorValue
    }))
  }

  onFilterIngredientsInputChange(filterIngredientsInput){
    const index = this.state.filterIngredients.findIndex(e => e===filterIngredientsInput);
    const filterIngredientsInputValid = ingredientValidation(filterIngredientsInput) && index===-1;

    this.setState(()=>({
      filterIngredientsInput,
      filterIngredientsInputValid
    }))
  }

  addFilterIngredient(event){
    event.preventDefault();

    if(this.state.filterIngredients.length<5){
      const filterIngredients = [...this.state.filterIngredients, this.state.filterIngredientsInput];

      this.state.filterIngredientsInputValid && this.setState((state) => ({
        filterIngredients,
        filterIngredientsInput: "",
        filterIngredientsInputValid: false,
        addingFiltersDisabled: filterIngredients.length>=5
      }))
    }
  }

  deleteFilterIngredients(igr){
    const filterIngredients = this.state.filterIngredients.filter(e => e!==igr);

    this.setState(state => ({
      filterIngredients,
      addingFiltersDisabled: filterIngredients.length>=5
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
    if(!value){
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

  toggleWhenMobile(menu, search){
    !searchVisible && this.toggleAdvencedSearch(false);
    const searchVisible = search && this.state.searchVisible ? false : search;
    const mainMenuVisible = menu && this.state.mainMenuVisible ? false : menu;

    this.setState((state) => ({
      mainMenuVisible,
      searchVisible,
      userMenuVisible: false,
      selected: mainMenuVisible ? 'menu' : searchVisible ? 'search' : ''
    }))
  }


  selectSearchFrom(value){
    const filteredHealthLabels = this.state.filterHealthLabels.filter(e => e.isActive)

    this.setState((state) => ({
      searchFrom: value,
      addingFiltersDisabled: value==='edamam',
      filterIngredients: value==='edamam' ? [] : state.filterIngredients,
      limitHealthLabels: value === "edamam" ? 2 : 6,
      filterHealthLabels: value==='edamam' && filteredHealthLabels.length>2 ? defaultHealthLabels : state.filterHealthLabels
    }))
  }

  showUserMenu(property){
    this.setState(() => ({
      userMenuVisible: property,
      mainMenuVisible: false,
      searchVisible: false,
      selected: ''
    }))
  }

  switchModeOfHealthLabel(toSwitch){
    const filterHealthLabels = this.state.filterHealthLabels.map(e => e.label===toSwitch.label ? {...e, isActive: !e.isActive} : e)

    if(filterHealthLabels.filter(e => e.isActive).length<=this.state.limitHealthLabels){
      this.setState(() =>({
        filterHealthLabels
      }))
    }
  }

  renderNavUser(name){
    return (
      name ? (
      <div className="nav__user" 
        onMouseOut={() => this.showUserMenu(false)} onMouseOver={() => this.showUserMenu(true)}>
        <div className="nav__user__content">
          <img className="nav__user__picture" src={this.props.userInfo.avatar}/>
          <span className="nav__user__name">{name}</span>
        </div>
        <div className={this.state.userMenuVisible ? "nav__user__menu" : "nav__user__menu nav__user__menu--hidden"}>
          <span className="nav__user__menu__option" onClick={() => this.props.startLogout()}>logout</span>
        </div>
      </div>
      ) : ''
    )
  }
  componentDidMount(){

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
                  (<form className="search" onSubmit={(e) => this.onSubmit(e, this.state.query, this.state.searchFrom)}>
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
                        <div className="advenced-search__see-all button-inline" onClick={() => {this.searchAllFromUsers()}}>
                          <span><i className="icon-eye"/>see all from users</span>
                        </div>
                    </div>

                    <div className="advenced-search__item advenced-search__item--ingredients">
                      <span className="advenced-search__title">Exclude ingredients</span>
                        <form className="advenced-search__form" onSubmit={e => this.addFilterIngredient(e)}>
                          <input  type="text"
                            disabled={this.state.addingFiltersDisabled} 
                            className=
                            {this.state.addingFiltersDisabled || (!this.state.filterIngredientsInputValid) ? 
                            "input-small input-small--count input-small--disabled input-small--withBtn" 
                              :
                            "input-small input-small--count input-small--withBtn"} 
                            onChange={e => this.onFilterIngredientsInputChange(e.target.value)}
                            value={this.state.filterIngredientsInput}
                          />
                          <button className=
                            {this.state.addingFiltersDisabled || (!this.state.filterIngredientsInputValid) ? 
                            "input-small__btn input-small__btn--disabled"
                              :
                            "input-small__btn"}
                          >add</button>              
                        </form>
                        <ul className="advenced-search__list">
                        {
                          this.state.filterIngredients.map((e, i) => {
                            return  (<li key={i} className="advenced-search__list__item">{e}
                                      <i className="icon-cancel advenced-search__list__item__delete"
                                      onClick={() => this.deleteFilterIngredients(e)}/>
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
              {this.props.scrWidth<=910 && (
                <Link onClick={() => this.toggleWhenMobile(false, false)} to="/dashboard" className="header__logo-container header__logo-container--inNav">
                  <i className="icon-food-1 header__logo header__logo--inNav"/>
                </Link>
              )}

            <div className={history.location.pathname === '/create-recipe' || history.location.pathname.split('/')[1]==='edit-recipe' 
              ? "nav__item nav__item--selected" : "nav__item"}>
              <Link onClick={() => this.toggleAdvencedSearch(false)} to ="/create-recipe" 
                className="nav__item__link">
                Create recipe<i className="nav__icon icon-plus-circled"/>
              </Link>             
            </div>
            <div className={history.location.pathname === '/recipes/own' ? "nav__item nav__item--selected" : "nav__item"}>
              <Link onClick={() => this.toggleAdvencedSearch(false)} to ="/recipes/own" 
                className="nav__item__link">
                My recipes<i className="nav__icon icon-food"/>
              </Link>
            </div>
            <div className={history.location.pathname === '/recipes/liked' ? "nav__item nav__item--selected" : "nav__item"}>
              <Link onClick={() => this.toggleAdvencedSearch(false)} to ="/recipes/liked" 
                className="nav__item__link">
                Likes<i className="nav__icon icon-heart"/>
              </Link>        
            </div>

            {
              !this.props.twoCompVisible && 
              (<div className={history.location.pathname === '/shopping-list' ? "nav__item nav__item--selected" : "nav__item"}>
                <Link onClick={() => this.toggleAdvencedSearch(false)} to ="/shopping-list" 
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
              <div className={history.location.pathname === '/shopping-list' && this.state.selected==='' ? "nav__item nav__item--selected" : "nav__item"}
                onClick={() => {
                  this.toggleWhenMobile(false, false)
                  }}>
                <Link to ="/shopping-list" className="nav__item__link">
            	    <i className="icon-basket" />
                </Link>
              </div>

              {this.renderNavUser(this.props.userInfo.userName)}

              {this.state.mainMenuVisible &&
              (<div className='nav__mobile-menu'>
                <Link onClick={(e) => this.toggleWhenMobile(false, false)} to ="/create-recipe" 
                className={history.location.pathname === '/create-recipe' || history.location.pathname.split('/')[1]==='edit-recipe' ? 
                  'nav__mobile-menu__item nav__mobile-menu__item--selected' : 'nav__mobile-menu__item'}>
                  Create recipe
                </Link>
                <Link onClick={(e) => this.toggleWhenMobile(false, false)} to ="/recipes/liked" 
                className={history.location.pathname === '/recipes/liked' ?
                  'nav__mobile-menu__item nav__mobile-menu__item--selected' : 'nav__mobile-menu__item'}>
                  Liked recipes
                </Link> 
                <Link onClick={(e) => this.toggleWhenMobile(false, false)} to ="/recipes/own" 
                className={history.location.pathname === '/recipes/own' ?
                  'nav__mobile-menu__item nav__mobile-menu__item--selected' : 'nav__mobile-menu__item'}>
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
    userInfo: state.auth,
    twoCompVisible: state.styles.twoCompVisible,
    scrWidth: state.styles.scrWidth
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    setSearchedRecipes: (recipes) => dispatch(setSearchedRecipes(recipes)),
    startLogout: () => dispatch(startLogout()),
    setFetchingRecipes: (val) => dispatch({type:"SET_FETCHING_RECIPES", val})
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(Header);


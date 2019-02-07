const defaultState = {
  allIngredients: [],
  recipes: []
}

export default (state=defaultState, action) => {
    switch(action.type){
        case 'ADD_INGREDIENTS':  
        return {
          allIngredients: action.allIngredients, 
          recipes: action.recipes ? action.recipes : state.recipes
        }

        case 'CHANGE_COUNT':
          return{
            allIngredients: action.allIngredients,
            recipes: action.recipes ? action.recipes : state.recipes
          }
        
        case 'REMOVE_ALL_INGREDIENTS':
        return{
          ...action.state
        }

        case "REMOVE_INGREDIENT":
          return {
            allIngredients: action.allIngredients, 
            recipes: action.recipes ? action.recipes : state.recipes
          }

        case 'OVERWRITE_INGREDIENTS':
          return action.state
        
        case 'SET_SHOPPINGLIST':
          return {
            allIngredients: action.state.allIngredients ? action.state.allIngredients : [],
            recipes: action.state.recipes ? action.state.recipes : []
          }
        case 'LOGOUT':
          return defaultState
        default:
          return state;
    }
}

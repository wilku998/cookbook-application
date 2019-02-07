const defaultRecipesState = {
  selectedRecipe: {

    
  },
  searchedRecipes: [],
  likedRecipes: [],
  ownRecipes: []
}

export default (state = defaultRecipesState, action) => {
    switch (action.type) {
      case 'SEARCH':
        return {
          ...state,
          searchedRecipes: action.searchedRecipes.map(recipe => {
            const indexOfLiked = recipe.fromUser ? state.likedRecipes.findIndex(e => e.id===recipe.id) : 
            state.likedRecipes.findIndex(e => e.label===recipe.label);
            
            if(indexOfLiked>-1){
              return {
                ...recipe,
                isLiked: true
              }
            }else{
              return {
                ...recipe,
                isLiked: false}
            }
          })
        }
      case 'SELECT':
        return {
          ...state,
          selectedRecipe: action.selectedRecipe,
          selectedRecipeCopy: action.selectedRecipe
        }
      case 'ADD_TO_LIKED':
        return {
          ...state,
          selectedRecipe: action.likedRecipe.fromUser ? 
          //if recipe is created by other used we are looking by id else by label
          state.selectedRecipe.id === action.likedRecipe.id ? {...action.likedRecipe, servings: state.selectedRecipe.servings,
            ingredients: state.selectedRecipe.ingredients} : state.selectedRecipe
            :
          state.selectedRecipe.label === action.likedRecipe.label ? {...action.likedRecipe, servings: state.selectedRecipe.servings,
            ingredients: state.selectedRecipe.ingredients, totalDaily: state.selectedRecipe.totalDaily,
            totalNutrients: state.selectedRecipe.totalNutrients} : state.selectedRecipe,
          
          searchedRecipes: state.searchedRecipes.map(recipe => {
            if(action.likedRecipe.fromUser ? recipe.id === action.likedRecipe.id : recipe.label === action.likedRecipe.label){
              return action.likedRecipe
            }else{
              return recipe
            }              
          }),
          likedRecipes: [...state.likedRecipes, action.likedRecipe]
        }
      case 'REMOVE_FROM_LIKED':
      //each liked recipe have id
        return {
          ...state,
          selectedRecipe: state.selectedRecipe.id === action.id ? {...state.selectedRecipe, isLiked: false} : state.selectedRecipe,
          searchedRecipes: state.searchedRecipes.map(recipe => {
            if(recipe.id === action.id){
              return {
                ...recipe,
                isLiked: false
              }
            }else{
              return recipe
            }
          }),
          likedRecipes: state.likedRecipes.filter((e)=>{
            return e.id!==action.id
          })
        }
      case 'INC_OR_DEC_SER':
      if(action.totalDaily && action.totalNutrients){
        return{
          ...state,
          selectedRecipe: {...state.selectedRecipe, servings: action.servings, ingredients: action.ingredients, totalDaily: action.totalDaily, totalNutrients: action.totalNutrients},
        }
      }else{
        return{
          ...state,
          selectedRecipe: {...state.selectedRecipe, servings: action.servings, ingredients: action.ingredients},
        }      
      }
      case "REMOVE_OWN_RECIPE":
        return{
          ...state,
          ownRecipes: state.ownRecipes.filter(e=> e.id !==action.id)
        }
      case 'SET_LIKES':
        return {
          ...state,
          likedRecipes: action.likes ? action.likes : defaultRecipesState.likedRecipes
        }
      case 'ADD_RECIPE':
        const index = state.ownRecipes.findIndex(e => e.id === action.recipe.id)
        return {
          ...state,
          ownRecipes: index === -1 ? [...state.ownRecipes, action.recipe] : state.ownRecipes.map((e, i) => i===index ? action.recipe : e)
        }
      case 'SET_OWN_RECIPES':
        return {
          ...state,
          ownRecipes: action.ownRecipes ? action.ownRecipes : defaultRecipesState.ownRecipes
        }
      case 'LOGOUT':
        return defaultRecipesState
      default:
        return state;
    }
  };
 
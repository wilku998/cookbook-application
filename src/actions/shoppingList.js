import database from '../firebase/firebase';

export const addIngredientsInRedux = (allIngredients, recipes) => ({
    type: 'ADD_INGREDIENTS',
    allIngredients,
    recipes
})

export const addIngredients = (ingredients, from) => {
    return (dispatch, getState) => {
        const state = getState().shoppingList;
        const uid = getState().auth.uid;
        
        // TO SHOPPINGLIST.ALLINGREDIENTS
        let allIngredients = state.allIngredients.map(e => e);

        ingredients.forEach(igr => {
            igr.unit === 'none' ? igr.unit="": igr.unit=igr.unit;
            const indexOfSameIngredient = allIngredients.findIndex(e => e.ingredient === igr.ingredient && e.unit === igr.unit);
            if(indexOfSameIngredient>-1){
              let count = Math.round((allIngredients[indexOfSameIngredient].count + igr.count)*100)/100;
              
              if(from==='all'){
                if(igr.unit==='g' && count>1000){
                  count = 1000
                } else if(igr.unit!=='g' && count>100){
                  count = 100
                }
              }

              allIngredients[indexOfSameIngredient] = {
                  ...igr,
                  count 
              }
            }else{
                allIngredients.push(igr);
            }
        })

        // TO SHOPPINGLIST.RECIPES
        const recipes = from !=='all' ? 
          state.recipes.findIndex(e => e.from === from) === -1 ? [...state.recipes, {from: from, ingredients:ingredients}] : 
          state.recipes.map(recipe => {
            if(from===recipe.from){
              return {
                ...recipe,
                ingredients: recipe.ingredients.map((igr, i) => {
                  return {
                    ...igr,
                    count: igr.count + ingredients[i].count
                  }
                })
              }
            }else{
              return recipe
            }
          })
          : undefined 

        return database.ref(`users/${uid}/shoppingList/allIngredients`).set(allIngredients).then(() => {
            dispatch(addIngredientsInRedux(allIngredients, recipes))
            return recipes && database.ref(`users/${uid}/shoppingList/recipes`).set(recipes);
          })
          
    }
}

const changeCountInAll = (allIngredientsFromState, action) => {
    const ingredientToChangeIndex = allIngredientsFromState.findIndex(e => e.ingredient===action.ingredient && e.unit===action.unit);
  
    
    if(ingredientToChangeIndex>-1){
      const count = action.from === 'all' ? parseFloat(action.count) :
      Math.round((allIngredientsFromState[ingredientToChangeIndex].count+(action.diffrence*action.sign))*100)/100
      
      allIngredientsFromState[ingredientToChangeIndex] = {
        ...allIngredientsFromState[ingredientToChangeIndex],
        count
      }  
    }
    return allIngredientsFromState
}

export const changeCountInRedux = (allIngredients, recipes) => ({
    type: 'CHANGE_COUNT',
    allIngredients,
    recipes
})

export const changeCount = (from, ingredient, count, unit, sign, diffrence) => {
    return (dispatch, getState) => {
        const uid = getState().auth.uid;
        const state = getState().shoppingList;

        const allIngredientsFromState = state.allIngredients.map(e => e);
        const allIngredients = changeCountInAll(allIngredientsFromState, {from, ingredient, count, unit, sign, diffrence});

        if(from!=='all'){
            const recipeToChangeIndex = state.recipes.findIndex(e => e.from===from);
    
            const recipes = state.recipes.map((recipe, recipeIndex) => {
                if(recipeToChangeIndex === recipeIndex){
                    return {
                        ...recipe,
                        ingredients: recipe.ingredients.map(e => {
                            if(e.ingredient===ingredient){
                                return {
                                    ...e,
                                    count: parseFloat(count)
                                }
                            }else{
                                return e
                            }
                        })
                    }
                }else{
                    return recipe
                }
            })

            database.ref(`users/${uid}/shoppingList`).set({allIngredients, recipes}).then(() => {
                dispatch(changeCountInRedux(allIngredients, recipes))
            })

        } else {
            database.ref(`users/${uid}/shoppingList/allIngredients`).set(allIngredients).then(() => {
                dispatch(changeCountInRedux(allIngredients, undefined))
            })
        }

    }
}

export const removeAllIngredientsInRedux = (state) => ({
    type: 'REMOVE_ALL_INGREDIENTS',
    state
})

export const removeAllIngredients = (from) => {
    return (dispatch, getState) => {
        const state = getState().shoppingList;
        const uid = getState().auth.uid;
        let allIngredients;
        let recipes;

        if(from=='all'){
            allIngredients = [];
            recipes = [];

          }else{
            allIngredients = state.allIngredients.map(igrInAll => {
              let count = igrInAll.count;

              // looking for recipe from action
              state.recipes.forEach(recipe => {
                if(recipe.from === from){
                  //looping over ingredients in found recipe
                  recipe.ingredients.forEach(igrInFoundRecipe => {
                    //looking for same ingredient in all in founded recipe
                    if(igrInAll.ingredient === igrInFoundRecipe.ingredient){
                      count = igrInAll.count - igrInFoundRecipe.count
                    }
                  })
                }
              })
              return {
                ...igrInAll,
                count
              }
            }).filter(igr => igr.count > 0)
            recipes = state.recipes.filter(recipe => {
                return recipe.from !== from
            })
        }
        return database.ref(`users/${uid}/shoppingList`).set({allIngredients, recipes}).then(() => {
            dispatch(removeAllIngredientsInRedux({allIngredients, recipes}));
        })
    }
}

export const setShoppingListInRedux = (state) => ({
    type: 'SET_SHOPPINGLIST',
    state
})

export const setShoppingList = () => {
    return (dispatch, getState) => {
        const uid = getState().auth.uid;
        
        return database.ref(`users/${uid}/shoppingList`).once("value").then(res => {
            const objFromFirebase = res.val();
            if(objFromFirebase){
                dispatch(setShoppingListInRedux(objFromFirebase));
            }
        })
    }
}

export const removeIngredientInRedux = (allIngredients, recipes) => ({
    type: 'REMOVE_INGREDIENT',
    allIngredients,
    recipes
})

export const removeIngredient = (from, ingredient, count, unit) => {
    return (dispatch, getState) => {
        const uid = getState().auth.uid;
        const state = getState().shoppingList;

        let allIngredients;
        let recipes;

        if(from==='all'){
            allIngredients = state.allIngredients.filter(e => !(e.ingredient===ingredient && e.unit===unit))
            recipes = state.recipes.map(recipe => {
                return {...recipe, ingredients: recipe.ingredients.filter(e => !(e.ingredient===ingredient && e.unit===unit))}
            })

             
        }else{
            allIngredients = state.allIngredients.map(e => {
                if(e.ingredient===ingredient && e.unit===unit){
                return {
                    ...e,
                    count: Math.round((e.count - count)*10)/10
                }
                } else{
                return e
                }
            }).filter(e => e.count>0)

            recipes = state.recipes.map(recipe => {
                if(from==='all' || recipe.from===from){
                    let ingredients = recipe.ingredients.filter(e => {
                        return e.ingredient!=ingredient
                    })
                    return {...recipe, ingredients}
                }else{
                    return recipe
                }
            })
        }
        database.ref(`users/${uid}/shoppingList`).set({allIngredients, recipes}).then(() => {
            dispatch(removeIngredientInRedux(allIngredients, recipes))
        })
    }
}

export const overwriteShoppingListInRedux = (state) => ({
    type: 'OVERWRITE_INGREDIENTS',
    state
});

export const overwriteShoppingList = (ingredients, from) => {
    return(dispatch, getState) => {
        const uid = getState().auth.uid;
        const state = getState().shoppingList;

        const allIngredients = state.allIngredients.map(igr => {
            let countFromRecipeInShoppingList = 0;
            let actionCount;

            ingredients.forEach(igrFromAction => {
              if(igrFromAction.ingredient === igr.ingredient){
                actionCount = igrFromAction.count

                countFromRecipeInShoppingList = state.recipes.find(e => e.from === from).ingredients
                .find(el => el.ingredient===igrFromAction.ingredient).count;
              }
            })

            if(countFromRecipeInShoppingList!==0){
              return {
                ...igr,
                count: igr.count - countFromRecipeInShoppingList + actionCount
              }
            }else{
              return igr
            }
          })

          const recipes = state.recipes.map(recipe => {
            if(recipe.from === from){
              return {
                ...recipe,
                ingredients: ingredients
              }
            }else{
              return recipe
            }
          })

          database.ref(`users/${uid}/shoppingList`).set({allIngredients, recipes}).then(() => {
              dispatch(overwriteShoppingListInRedux({allIngredients, recipes}))
          })
    }
}
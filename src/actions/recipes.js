import database from '../firebase/firebase';
import { history } from '../routers/AppRouter';

export const setSearchedRecipes = (searchedRecipes) => {

  const recipes = searchedRecipes.map(recipe => {
    if(recipe.fromUser){
      return {
        ...recipe,
        likedBy: recipe.likedBy ? createLikedByArrForRedux(recipe.likedBy) : []
      }
    }else{
      return recipe
    }
  })

  return{
    type: 'SEARCH',
    searchedRecipes: recipes
  }
};

export const setSelectedRecipe = (selectedRecipe) => ({
  type: 'SELECT',
  selectedRecipe
});

const getArrOfLikedRecipesIDsFromUsers = (likedRecipes) => {
  return likedRecipes.filter(e => e.fromUser).map(e => e.id)
}

export const addToLikedRecipesInRedux = (likedRecipe) => ({
  type: 'ADD_TO_LIKED',
  likedRecipe
});


export const addToLikedRecipes = (likedRecipe) => {
  return(dispatch, getState) => {
    const state = getState()
    const uid = state.auth.uid;

    if(likedRecipe.fromUser){
      const publicRef = database.ref(`usersRecipes/${likedRecipe.id}/likedBy/${uid}`);
      const likedByMyObj = {
        avatar: state.auth.avatar,
        userName: state.auth.userName
      }

      publicRef.set(likedByMyObj).then(()=>{
        database.ref(`users/${uid}/likedUsersRecipes`).set([...getArrOfLikedRecipesIDsFromUsers(state.recipes.likedRecipes), likedRecipe.id]).then(() => {
          dispatch(addToLikedRecipesInRedux({...likedRecipe, likedBy: [...likedRecipe.likedBy, {uid, ...likedByMyObj}], isLiked: true}))
        })
      });

    }else{
      database.ref(`users/${uid}/likedRecipes`).push(likedRecipe).then((ref) => {
        dispatch(addToLikedRecipesInRedux({...likedRecipe, id: ref.key, isLiked: true}))
      })      
    }
  }
};


export const removeFromLikedInRedux = (id, fromUser) => ({
  type: 'REMOVE_FROM_LIKED',
  id,
  fromUser
});

export const removeFromLiked = ({id, fromUser} = recipe) => {
  return(dispatch, getState) => {

    const state = getState();
    const uid = state.auth.uid;
    if(fromUser){
      database.ref(`usersRecipes/${id}/likedBy/${uid}`).remove().then(() => {
        
        database.ref(`users/${uid}/likedUsersRecipes/`).set(getArrOfLikedRecipesIDsFromUsers(state.recipes.likedRecipes).filter(e => e!==id))
        .then(() => {
          dispatch(removeFromLikedInRedux(id, fromUser))
        })
      })


    }else{
      database.ref(`users/${uid}/likedRecipes/${id}`).remove().then(() => {
        dispatch(removeFromLikedInRedux(id, fromUser))
      })
    }
    
  }
}

export const setLikesInRedux = (likes) => ({
  type: "SET_LIKES",
  likes
});

const createLikedByArrForRedux = (likedBy) => {
  return likedBy ? Object.keys(likedBy).map(key => {
    return {
      ...likedBy[key],
      uid: key
    }
  }) : []
}

export const setLikes = () => {
  return (dispatch, getState) => {
    const uid = getState().auth.uid;
    let likes = [];

    return database.ref(`users/${uid}/likedRecipes`).once("value").then(res => {
      const objFromFirebase = res.val();
      
      if(objFromFirebase){
        Object.keys(objFromFirebase).forEach(key => {
          likes.push({...objFromFirebase[key], id: key})
        })
      }

      return database.ref(`users/${uid}/likedUsersRecipes`).once("value").then(res2 => {
        const likedUsersRecipiesIDsArr = res2.val();
        if(likedUsersRecipiesIDsArr){
          const promises = likedUsersRecipiesIDsArr.map(id => {
            return database.ref(`usersRecipes/${id}`).once("value").then(res3 => {
              const recipe = res3.val();
              if(recipe){
                const likedBy = recipe.likedBy ? createLikedByArrForRedux(recipe.likedBy) : []

                likes.push({...recipe, id: res3.key, likedBy, isLiked: true})
              }else{
                console.log('this recipe was deleted')
              }

            })
          })

          return Promise.all(promises).then(() => {
            dispatch(setLikesInRedux(likes));
          })
        }else{
          dispatch(setLikesInRedux(likes));
        }
      })
    })
  }
}

export const incrementOrDecreaseServings = ({ingredients, newServings, initialServings, initialIngrCounts, label, initialTotalDailyCounts, totalDaily,
  initialTotalNutrientsCounts, totalNutrients, fromUser} = recipe) => {
  const newIngredients = ingredients.map((e, i) => {
    const intialCount = initialIngrCounts[i];

    return {
      ...e,
      count: Math.round((intialCount/initialServings*newServings)*100)/100
    }
  });


  if(!fromUser){
    const newTotals =[[], []];
    const initialTotalCounts = [initialTotalDailyCounts, initialTotalNutrientsCounts];
    // daily , nutreints
    [totalDaily, totalNutrients].forEach((total, totalIndex) => {
      
      newTotals[totalIndex] = total.map((e, i) => {
          const intialCount=initialTotalCounts[totalIndex][i];
          return {
            ...e,
            quantity: Math.round((intialCount/initialServings*newServings)*100)/100
          }
      });
    })

    return {
      type: 'INC_OR_DEC_SER',
      servings: newServings,
      ingredients: newIngredients,
      label,
      totalDaily: newTotals[0],
      totalNutrients: newTotals[1]
    }
  }else{
    return {
      type: 'INC_OR_DEC_SER',
      servings: newServings,
      ingredients: newIngredients,
      label
    }
  }
  

  
}

export const addOwnRecipeInRedux = (recipe) => ({
  type: 'ADD_RECIPE',
  recipe
})

export const addOwnRecipe = (recipe, recipeID, edit) => {
  return (dispatch, getState) => {
    const state = getState();
    const uid = state.auth.uid;

    const publicRef = database.ref('usersRecipes');
    const userRef = database.ref(`users/${uid}/ownRecipes`);

    if(edit){
      const {label, source, healthLabels, ingredients, url, servings, image} = recipe
      return publicRef.child(recipeID).update({label, source, healthLabels, ingredients, url, servings, image}).then(()=> {
      dispatch(addOwnRecipeInRedux(recipe))      
      })
    }else{
      return userRef.set([...state.recipes.ownRecipes.map(e => e.id), recipeID]).then(() => {
        return publicRef.child(recipeID).set({...recipe, fromUser: uid}).then(()=> {
        
          dispatch(addOwnRecipeInRedux({...recipe, fromUser: uid}))
        })
      })
    }
  }
}



export const setOwnRecipes=()=>{
  return (dispatch, getState) => {
    const uid= getState().auth.uid;
    const ownRecipes = [];

    return database.ref(`users/${uid}/ownRecipes`).once("value").then(res => {
      const ownRecipesIDs = res.val();

      if(ownRecipesIDs){
        const promises = ownRecipesIDs.map(recipeID => {

          return database.ref(`usersRecipes/${recipeID}`).once("value").then(res2 => {
            let recipe = res2.val();
            const likedBy = recipe.likedBy ? createLikedByArrForRedux(recipe.likedBy) : []

            ownRecipes.push({...recipe, likedBy});
          })
        })

        return Promise.all(promises).then(() => {
          dispatch({ownRecipes, type: "SET_OWN_RECIPES"});
        })
      }
    })
  }
}

export const setSelectedRecipeByID = (id) => {
  return (dispatch, getState) => {

    return database.ref(`usersRecipes/${id}`).once("value").then((ref) => {
      const recipe = ref.val();
      if(recipe){
        const likedBy = recipe.likedBy ? createLikedByArrForRedux(recipe.likedBy) : []
        dispatch(setSelectedRecipe({...recipe, likedBy}))

      }else{
        console.log('this recipe dont exist')
        history.push('/dashboard');
      }
    })
  }
}

export const removeRecipe=(id)=>{
  return (dispatch, getState) => {
    const state = getState();
    const uid= state.auth.uid;
      database.ref(`usersRecipes/${id}`).remove().then(()=>{

        const myRecipesNew = state.recipes.ownRecipes.filter(e => e.id !== id).map(e => e.id);

        database.ref(`users/${uid}/ownRecipes`).set(myRecipesNew).then(() => {
          dispatch({type:"REMOVE_OWN_RECIPE", id})
        })
      })  
  }
}
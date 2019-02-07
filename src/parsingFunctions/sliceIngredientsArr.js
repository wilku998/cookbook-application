export const sliceIngredientsArr = (ingredients, parent) =>{
    const half = Math.ceil(ingredients.length/2);


    let sortIngredients=(arr) => {
        if(parent==='create' || parent=='shopping'){
            return arr.sort((a,b) => {
                a.unit.length + a.ingredient.length + a.count.toString().length > b.unit.length + b.ingredient.length + b.count.toString().length ? -1 : 1
            })
        }else{
            return arr.sort((a,b) => {
                a.ingredient.length > b.ingredient.length ? -1 : 1
            })
        }
        
    }

    return [sortIngredients(ingredients.slice(0, half)), sortIngredients(ingredients.slice(half))];
};


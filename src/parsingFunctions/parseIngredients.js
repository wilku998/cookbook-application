export const unitsShort = ['tbsp', 'tbsp', 'oz', 'oz', 'tsp', 'tsp', 'cup', 'pound', 'jars', 'packages', 'g', 'g', 'kg', 'kg'];

export default (ingredients) => {
    const unitsLong = ['tablespoons', 'tablespoon', 'ounces', 'ounce', 'teaspoons', 'teaspoon', 'cups', 'pounds', 'jar', 'package', 'grams', 'gram', 'kilograms', 'kilogram'];
    
    const newIngredients = ingredients.map(el => {
        let ingredient = el.toLowerCase();


        //replacing units long to shorts
        unitsLong.forEach((unitToReplace, i) => {
            ingredient = ingredient.replace(unitToReplace, unitsShort[i]);
        })

        return ingredient;
    })
    return newIngredients; 
}
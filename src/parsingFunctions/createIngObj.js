import { unitsShort } from './parseIngredients'

export default (ing) => {
    const units = unitsShort;
    let ingredient;

    ['¼', '½','¾'].forEach((e,i) => {
        const count = i === 0 ? 0.25 : i === 1 ? 0.5 : 0.75;
        ingredient = ing.replace(e, count)
    })

    let objIng = {};
    // checking if there is a unit
    let ingredientArr = ingredient.trim().split(' ');
    const unitIndex = ingredientArr.findIndex((e) => {
        return units.includes(e)
    })

    //there is a unit
    if(unitIndex>-1){
        const countArr = ingredientArr.slice(0, unitIndex);

        if( countArr.length===2){
            objIng.count= isNaN(countArr[0]) || isNaN(countArr[1]) ? 1 : Math.round(eval(`${countArr[0]}+${countArr[1]}`)*10)/10;
        }else{
            objIng.count= isNaN(countArr[0]) ? 1 : Math.round(eval(countArr[0].replace('-', '+'))*10)/10;
        }
        objIng.unit = ingredientArr[unitIndex]
        objIng.ingredient = ingredientArr.slice(unitIndex+1).join(" ");

    } else if(parseFloat(ingredientArr[0], 10)){
        // no unit but count at first position
        objIng.count= parseFloat(ingredientArr[0], 100);
        objIng.unit = '';
        objIng.ingredient = ingredientArr.slice(1).join(" ");

    } else {
        //no unit and no count at firs postion
        objIng.count = 1;
        objIng.unit = '';
        objIng.ingredient = ingredientArr.join(" ");
    }
    
    return objIng
};
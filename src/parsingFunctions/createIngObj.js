import { unitsShort } from './parseIngredients'

export default (ingredient) => {
    const units = unitsShort;
    let objIng = {};
    // checking if there is a unit
    let ingredientArr = ingredient.split(' ');
    const unitIndex = ingredientArr.findIndex((e) => {
        return units.includes(e)
    })
    
    //there is a unit
    if(unitIndex>-1){
        const countArr = ingredientArr.slice(0, unitIndex);
        if( countArr.length===2){
            countArr.forEach((count, i) => {
                countArr[i] = count === '½' ? 1/2 : count
            })
            objIng.count=Math.round(eval(`${countArr[0]}+${countArr[1]}`)*10)/10;
        }else{
            objIng.count=Math.round(eval(countArr[0].replace('-', '+'))*10)/10;
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
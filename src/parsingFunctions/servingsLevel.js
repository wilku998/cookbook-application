export const recipeLevel = (ingredients) => {
    let count = calculateCount(ingredients);

    if(count<=5){
        return 'easy'
    } else if (count<=15){
        return 'medium'
    } else if(count>15){
        return 'hard'
    }
}

export const calculateServings = (ingredients) => {
    let count = calculateCount(ingredients);

    return Math.ceil(count/3)>=30 ? 30 : Math.ceil(count/3);
}

const calculateCount = (ingredients) => {
    //return Math.ceil(ingredients.map((e)=> e.count).reduce((prev, cur) => {return prev+cur}, 0));
    return Math.ceil(ingredients.map((e)=>{
        if(e.unit === 'g'){
            return e.count/100
        }else if(e.unit==='kg'){
            return (e.count*1000)/100
        }else if(e.count>=50 && e.count<100 && e.unit !== 'g' && e.unit !== 'kg'){
            return e.count/10
        }else if(e.count>=100 && e.unit !== 'g' && e.unit !== 'kg'){
            return e.count/20
        }else{
            return e.count
        }
    }).reduce((prev, cur) => {return prev+cur}, 0));

}
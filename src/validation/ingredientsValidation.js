export const countValidation = (count, unit, countBefore) => {
    const validation = (count.split('').includes('.') ? (count.split('.')[1].length<2) : true);
    const countNumber = parseFloat(count);
    if(validation && countNumber>=0 && ((countNumber<=100 || (unit==='g' && countNumber<=1000) || count<countBefore))){
        return true
    }else{
        false
    }
    

}

export const ingredientValidation = (value) => {
    let validation = true;
    value.split(' ').forEach(e => {
        if(e.length>=20){
            validation=false;
        }
    })
    if(value.length>2 && value.length<80 && validation){
        return true
    } else {
        return false
    }
}

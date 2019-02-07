export const countValidation = (count, unit) => {
    const validation = (count.split('').includes('.') ? (count.split('.')[1].length<2) : true);
    const countNumber = parseFloat(count);
    if(validation && countNumber>=0 && (countNumber<=100 || (unit==='g' && countNumber<1000))){
        return countNumber
    }
    

}

export const ingredientValidation = (value) => {
    let validation = true;
    value.split(' ').forEach(e => {
        if(e.length>=20){
            validation=false;
        }
    })
    if(value.length>2 && value.length<200 && validation){
        return true
    } else {
        return false
    }
}

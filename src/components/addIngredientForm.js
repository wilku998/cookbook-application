import React from 'react';


const formUnits = ["kg", "g", "pound", "oz", "tsp", "tbsp", "cup", "package", "jar", "none"];
const AddIngredientForm = (props) => {
    console.log(props.parent)
    const classs = props.addingDisabled ? "input-small input-small--disabled" : "input-small";
    return (
        <form className={props.parent === 'shopping' ? "add-ingredient-form add-ingredient-form--grey"
            :
        "add-ingredient-form add-ingredient-form--primary"} onSubmit={e => props.addIngredient(e)}
        >
        
            <div className="add-ingredient-form__top">
                <label className="label"><span className="label__text">Count</span>
                    <input className={`${classs} input-small--count`} type="number" value={props.formCount}
                    min={.1} step={.1}
                    onChange={(e) => props.onAddCountChange(e.target.value)} />
                </label>
                <label className="label"><span className="label__text">Unit</span>
                    <select className={`${classs} input-small--unit`} value={props.formUnit} 
                    onChange={(e) => props.onAddUnitChange(e.target.value)}>
                        {formUnits.map(unit => <option key={unit} value={unit}>{unit}</option>)}
                    </select>
                </label>
                {props.lines===1 &&
                (<label className="label">
                    <span className="label__text">Ingredient</span>
                    <div className="label__containerForInputBtn">
                        <input className={`${classs} input-small--text`} type="text" 
                        value={props.formIngredient} 
                        onChange={(e) => props.onAddIngredientChange(e.target.value)} />
                        <button className={props.addingDisabled ? "input-small__btn input-small__btn--disabled" : "input-small__btn"}>add</button>
                    </div>
                </label>)
                }   
            </div>

            {props.lines===2 &&
                (<label className="add-ingredient-form__down">
                    <span className="label__text">Ingredient</span>
                    <input className={`${classs} input-small--text`} type="text" 
                    value={props.formIngredient} 
                    onChange={(e) => props.onAddIngredientChange(e.target.value)} />
                    <button className={props.addingDisabled ? "input-small__btn input-small__btn--disabled" : "input-small__btn"}>add</button>
                </label>)
            }
        </form>
    )
}

export default AddIngredientForm;


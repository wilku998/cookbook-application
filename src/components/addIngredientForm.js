import React from 'react';
import {ingredientValidation, countValidation} from '../validation/ingredientsValidation';

const formUnits = ["kg", "g", "pound", "oz", "tsp", "tbsp", "cup", "package", "jar", "none"];

class AddIngredientForm extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            formCount: '1',
            formUnit: 'kg',
            formIngredient: '',
            addingDisabled: true
        }
    };



    addIngredient(event){
        event.preventDefault();

        const set = () =>{
            this.props.addIngredient(
                parseFloat(this.state.formCount), this.state.formUnit, this.state.formIngredient.trim()
            )
            this.setState(() => ({
                formCount: '1',
                formUnit: 'kg',
                formIngredient: '',
                addingDisabled: true
            }))
        }

        !this.state.addingDisabled  && !this.props.disabled && set();
    }

    setDisabledVar(){
        this.setState(() => ({
            addingDisabled:
                !ingredientValidation(this.state.formIngredient.trim())
                    ||
                (!isNaN(this.state.formCount) ? !countValidation(this.state.formCount, this.state.formUnit) : true)
        }))
    }

    onAddIngredientChange(formIngredient){
        this.setState(()=> ({
            formIngredient,
        }), () => {
            this.setDisabledVar();
        })
    }

    onAddCountChange(newCount){
        const newCountFixed = newCount.replace(',', '.');

        !isNaN(newCountFixed) && this.setState((state) => ({
            formCount: newCountFixed,
        }), () => {
            this.setDisabledVar();
        })
    }

    onAddUnitChange(formUnit){
        const unitBefore = this.state.formUnit;
        this.setState(() => ({
            formUnit
        }), () => {
            (unitBefore==='g' || formUnit === 'g') && this.setDisabledVar();
        })
    }


    render(){
        const classs = this.state.addingDisabled || this.props.disabled ? "input-small input-small--disabled" : "input-small";
        return (
            <form className={this.props.parent === 'shopping' ? "add-ingredient-form add-ingredient-form--grey"
                :
            "add-ingredient-form add-ingredient-form--primary"} onSubmit={e => this.addIngredient(e)}
            >
            
                <div className="add-ingredient-form__top">
                    <label className="label"><span className="label__text">Count</span>
                        <input className={`${classs} input-small--count`} type="text" value={this.state.formCount}
                        min={.1} step={.1}
                        onChange={(e) => this.onAddCountChange(e.target.value)}
                        />
                    </label>
                    <label className="label"><span className="label__text">Unit</span>
                        <select className={`${classs} input-small--unit`} value={this.state.formUnit} 
                        onChange={(e) => this.onAddUnitChange(e.target.value)}>
                            {formUnits.map(unit => <option key={unit} value={unit}>{unit}</option>)}
                        </select>
                    </label>
                    {this.props.lines===1 &&
                    (<label className="label">
                        <span className="label__text">Ingredient</span>
                        <div className="label__containerForInputBtn">
                            <input className={`${classs} input-small--withBtn`} type="text" 
                            value={this.state.formIngredient} 
                            onChange={(e) => this.onAddIngredientChange(e.target.value)}
                            />
                            <button className={this.state.addingDisabled || this.props.disabled ? 
                                "input-small__btn input-small__btn--disabled" : "input-small__btn"}
                                >
                                add
                            </button>
                        </div>
                    </label>)
                    }   
                </div>

                {this.props.lines===2 &&
                    (<label className="add-ingredient-form__down">
                        <span className="label__text">Ingredient</span>
                        <input className={`${classs} input-small--withBtn`} type="text" 
                        value={this.state.formIngredient} 
                        onChange={(e) => this.onAddIngredientChange(e.target.value)} />
                        <button className={this.state.addingDisabled || this.props.disabled ? "input-small__btn input-small__btn--disabled" : "input-small__btn"}>add</button>
                    </label>)
                }
            </form>
        )
    }
}

export default AddIngredientForm;


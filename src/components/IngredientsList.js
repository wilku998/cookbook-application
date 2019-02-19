import React from 'react'
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import {countValidation} from '../validation/ingredientsValidation';

import { sliceIngredientsArr } from '../parsingFunctions/sliceIngredientsArr'

class IngredientsList extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            ingredients: this.props.ingredients ? props.ingredients.map(e => ({...e, valid: true, defaultCount: e.count})) : []
        }
    }

    sendHeights(){
        if(this.props.twoCompVisible && this.props.parent==='shopping-list'){
            this.props.getItemsHeight(this.refs)
        }
    }

    onCountChange(newCount, ingredient, unit){
        const newCountFixed = newCount.replace(',', '.');
        const index = this.state.ingredients.findIndex(e => e.ingredient ===ingredient && e.unit===unit)

        const countBiggerThanSum = this.props.parent==='shopping-list' ?
        this.props.countBiggerThanSum(parseFloat(newCountFixed), ingredient, unit) : true

        !isNaN(newCountFixed) && this.setState((state) => ({
            ingredients: state.ingredients.map((e, i) => i===index ? {
                ...e,
                count: newCountFixed,
                valid: 
                    countBiggerThanSum
                        && 
                    countValidation(newCountFixed, this.props.ingredients[index].unit)}
            : e)
        }))
    }

    componentDidMount(){
        this.sendHeights();
    }

    componentDidUpdate(prevProps){
        if(this.props.twoCompVisible && this.props.parent==='shopping-list'){
            let isRefresh = false;

            for (let i = 0; i < this.props.ingredients.length; i++) {      
                if(JSON.stringify(prevProps.ingredients[i]) !== JSON.stringify(this.props.ingredients[i])) {
                    isRefresh = true
                    break;
                }
            }

            if(isRefresh || prevProps.ingredients.length!==this.props.ingredients.length){
                this.sendHeights();
            }   
        }
    }


    componentWillReceiveProps(props){
        this.setState(() => ({
            ingredients: props.ingredients.map(e => ({...e, valid: true, defaultCount: e.count}))
        }))
    }

    render(){
        return (
            <div className="ingredients-container">
                {[this.props.countOfArr===2 ? sliceIngredientsArr(this.state.ingredients, this.props.parent) : [this.state.ingredients]][0]
                .map((arr, iArr) => {
                    return (
                        <ul key={`ingredients-arr-${iArr}`} 
                            className={this.props.countOfArr===1 ? 
                            "ingredients__list ingredients__list--shopping" : 
                            "ingredients__list"}
                        >
                            {arr.map((e, iItem) => {
                                return (
                                    <li ref={`ingredients-list-item${iItem}`} className="ingredients__list__item" key={`ingredients-arr-${iArr}-item-${iItem}`}>
                                        <label className="ingredients__list__item__label">
                                        <div className="label__containerForInputBtn">
                                            <input className={`input-small input-small--count input-small--withBtn
                                                ${!e.valid ? 'input-small--disabled' : ''}`} type="text"
                                                value={e.count} 
                                                onChange={(event) => this.onCountChange(event.target.value, e.ingredient, e.unit)}
                                            />

                                            <button onClick={() => e.valid && 
                                                this.props.changeCount(parseFloat(e.count), e.ingredient, e.defaultCount, e.unit)}
                                                className={`input-small__btn ${!e.valid ? 'input-small__btn--disabled' : ''}`}>
                                                <i className="icon-ok-outline"/>
                                            </button>
                                        </div>
                                            <span className="ingredients__list__item__unit">{e.unit}</span>
                                        </label>
                                        <p className="ingredients__list__item__p">{e.ingredient}</p>
                                        <i className="ingredients__list__item__remove icon-cancel-circled" onClick={() => this.props.removeIngredient(e.ingredient, e.defaultCount, e.unit)} />
                                    </li>
                                )
                            })}
                        </ul>
                    )
                })}
            </div>
        )
    }
}

/*
                (<label className="label">
                    <span className="label__text">Ingredient</span>
                    <div className="label__containerForInputBtn">
                        <input className={`${classs} input-small--text`} type="text" 
                        value={props.formIngredient} 
                        onChange={(e) => props.onAddIngredientChange(e.target.value)} />
                        <button className={props.addingDisabled ? "input-small__btn input-small__btn--disabled" : "input-small__btn"}>add</button>
                    </div>
                </label>)

                                            <input type="number"
                                            className="input-small input-small--count input-small--count--shopping"
                                            value={Math.round(e.count*10)/10}
                                            min={.1}
                                            step={.1}
                                            onChange={(event) => this.props.onCountChange(event.target.value, e.ingredient, e.count, e.unit)}
                                            />
*/
const mapStateToProps = (state) => ({
    twoCompVisible: state.styles.twoCompVisible
})
export default connect(mapStateToProps)(IngredientsList);

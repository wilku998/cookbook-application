import React from 'react'
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';

import { sliceIngredientsArr } from '../parsingFunctions/sliceIngredientsArr'

class IngredientsList extends React.Component{
    constructor(props){
        super(props);

    }

    sendHeights(){
        if(this.props.twoCompVisible && this.props.parent==='shopping-list'){
            this.props.getItemsHeight(this.refs)
        }
    }
    
    componentDidMount(){
        this.sendHeights();
    }

    componentDidUpdate(prevProps){
        if(prevProps.ingredients.length!==this.props.ingredients.length){
            this.sendHeights();
        }
    }

    render(){
        return (
            <div className="ingredients-container">
                {[this.props.countOfArr===2 ? sliceIngredientsArr(this.props.ingredients, this.props.parent) : [this.props.ingredients]][0]
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
                                            <input type="number"
                                            className="input-small input-small--count input-small--count--shopping"
                                            value={Math.round(e.count*10)/10}
                                            min={.1}
                                            step={.1}
                                            onChange={(event) => this.props.onCountChange(event.target.value, e.ingredient, e.count, e.unit)}
                                            />
                                            <span className="ingredients__list__item__unit">{e.unit}</span>
                                        </label>
                                        <p className="ingredients__list__item__p">{e.ingredient}</p>
                                        <i className="ingredients__list__item__remove icon-cancel-circled" onClick={() => this.props.removeIngredient(e.ingredient, e.count, e.unit)} />
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

const mapStateToProps = (state) => ({
    twoCompVisible: state.styles.twoCompVisible
})
export default connect(mapStateToProps)(IngredientsList);

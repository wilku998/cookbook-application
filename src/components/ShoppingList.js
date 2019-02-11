import React from 'react';
import { connect } from 'react-redux';
import { changeCount, removeAllIngredients, removeIngredient, addIngredients } from '../actions/shoppingList';
import MoveButtons from './MoveButtons';
import {ingredientValidation, countValidation} from '../validation/ingredientsValidation';
import IngredientsList from './IngredientsList';
import ReactDOM from 'react-dom';
import reduceTitle from '../parsingFunctions/reduceTitle';
import AddIngredientForm from './addIngredientForm';

class ShoppingList extends React.Component{
    constructor(props){
        super(props)
        this.state = {
            selectorValue: 'all',
            formCount: 1,
            formUnit: 'kg',
            formIngredient: '',
            page: 1,
            prevPage: 1,
            allItemsHeights: [],
            avaibaleHeight: 0,
            currentLimit: 9999,
            pages: 1,
            addingDisabled: true
        }

        this.onAddCountChange = this.onAddCountChange.bind(this);
        this.onAddUnitChange = this.onAddUnitChange.bind(this);
        this.onAddIngredientChange = this.onAddIngredientChange.bind(this);
        this.addIngredient = this.addIngredient.bind(this);
        this.removeIngredient = this.removeIngredient.bind(this);

        this.nextPage=this.nextPage.bind(this);
        this.prevPage=this.prevPage.bind(this);
        this.removeIngredient=this.removeIngredient.bind(this);
        this.onCountChange=this.onCountChange.bind(this);
        this.getItemsHeight=this.getItemsHeight.bind(this);
    }

    onCountChange(count, ingredient, countBefore, unit){
        let sumOfSameCounts = 0;
        
        if(this.state.selectorValue==='all'){
            this.props.recipes.forEach(recipe => {
                recipe.ingredients.forEach(igr => {
                    if(igr.ingredient === ingredient){
                        sumOfSameCounts+=igr.count
                    }
                })
            })
        }

        if(countValidation(count, unit, countBefore) && (count>=sumOfSameCounts || this.state.selectorValue!='all')){
            const sign = Math.sign(count - countBefore);
            const diffrence = Math.abs(count - countBefore)
    
            this.props.changeCount(this.state.selectorValue, ingredient, count, unit, sign, diffrence);
        }
    }

    removeIngredient(ingredient, count, unit){
        let quanityOfIngredients;
        if(this.state.selectorValue==='all'){
            quanityOfIngredients = this.props.allIngredients.length;
        }else{
            quanityOfIngredients = this.props.recipes.find(e=> e.from===this.state.selectorValue).ingredients.length
        }

        if(quanityOfIngredients>1){
            this.props.removeIngredient(this.state.selectorValue, ingredient, count, unit)
        }else{
            this.removeAll()
        }
    }

    removeAll(){
        this.props.removeAllIngredients(this.state.selectorValue);

        this.setState(() => ({
            selectorValue: 'all',
        }))        
    }

    onAddCountChange(value){

        countValidation(value, this.state.formUnit) && 
        this.setState((state) => ({
            formCount: value
        }))
    }

    onAddUnitChange(value){
        this.setState(() => ({
            formUnit: value
        }))
    }

    onAddIngredientChange(formIngredient){
        let valid = ingredientValidation(formIngredient)

        this.setState((state)=> ({
            formIngredient,
            addingDisabled: !valid || state.selectorValue!=='all'
        }))
    }

    addIngredient(e){
        e.preventDefault();
        !this.state.addingDisabled && this.props.addIngredient(parseFloat(this.state.formCount), this.state.formUnit, this.state.formIngredient).then(() => {
            this.setState(() => ({
                formCount: 1,
                formUnit: 'kg',
                formIngredient: '',
                addingDisabled: true
            }))
        })
    }

    nextPage(){
        this.setState((state)=>{
            return {
                page: state.page+1,
                currentLimit: state.limites[state.page]
            }
        })
    }

    prevPage(){
        this.setState((state)=>{
            return {
                page: state.page-1,
                currentLimit: state.limites[state.page-2]
            }
        })       
    }

    onSelectorChange(value){
        this.setState(()=>({
            selectorValue: value,
            addingDisabled: value!=='all',
            page: 1,
            currentLimit: 9999,
            selectorChanged: true
        }));
    }

    getSelectedIngredients(allIngredients, recipes, selectorValue){
        const selected = selectorValue === 'all' ? allIngredients : recipes
        .find(e => e.from===selectorValue).ingredients;

        return selected
    }

    getVisibleIngredients(selectedIngredients, page, currentLimit){

        if(selectedIngredients.length>currentLimit){
            const start = page === 1 ? 0 : this.state.limites.slice(0, [page-1]).reduce((prev, cur) => {return prev + cur}, 0)
            return selectedIngredients.slice(start, start+currentLimit)
        
        }else{
            return selectedIngredients
        }
    }

    calculatePages(){
        let assistantArr = [];
        let limites = [];

        this.state.allItemsHeights.forEach(e => {
            if(assistantArr[assistantArr.length-1]+e<this.state.avaibaleHeight){
                assistantArr[assistantArr.length-1]+=e; 
                limites[limites.length-1]+=1; 
            }else{
                assistantArr.push(e);
                limites.push(1)
            }
        })
        //returning to previous page when new items have been added but when last item from page was deleted prevpage - 1
        const page = this.state.selectorChanged ? this.state.page : limites[this.state.prevPage-1] ? this.state.prevPage : this.state.prevPage-1;
        this.setState((state) => ({
            pages: assistantArr.length,
            limites,
            page,
            currentLimit: limites[page-1],
            selectorChanged: false
        }))
    }


    getItemsHeight(refs){
        const keys = Object.keys(refs);
        const itemsHeights = keys.map(key => {
            return parseFloat(window.getComputedStyle(ReactDOM.findDOMNode(refs[key])).getPropertyValue("height"));
        })

        // this condiction is because ingredients list component will also send height when page is changed and then we dont wont to calculate page
        if(this.getSelectedIngredients(this.props.allIngredients, this.props.recipes, this.state.selectorValue).length===itemsHeights.length){
            this.setState((state) => {
                return {
                    allItemsHeights: itemsHeights
                }
            }, () => {
                this.calculatePages();
            })
        }
    }

    componentDidMount(){
        if(this.props.twoCompVisible){
            const topHeight = parseFloat(window.getComputedStyle(ReactDOM.findDOMNode(this.refs.top)).getPropertyValue("height"));
            this.setState(() => ({
                topHeight,
            }))
        }
    }

    componentWillReceiveProps(props){
        if(props.leftSideHeight>0 && this.state.leftSideHeight!==props.leftSideHeight && this.props.twoCompVisible){
            this.setState((state) => {
                return {
                    leftSideHeight: props.leftSideHeight,
                    avaibaleHeight: props.leftSideHeight - state.topHeight - 70,
                    currentLimit: 9999,
                    page: 1,
                    selectorValue: 'all'
                }
            })
        }
    }

    componentDidUpdate(prevProps){
        if(prevProps.allIngredients.length !== this.props.allIngredients.length && this.props.twoCompVisible){
            this.setState((state) => ({
                currentLimit: 9999,
                page: 1,
                prevPage: state.page,
            }))

        }
    }

    /*
isupdate
ShoppingList.js:155 new calc
ShoppingList.js:166 6
IngredientsList.js:15 send heights
    */
    render(){
        return (
            <div className={this.props.twoCompVisible ? "shopping-list" : "shopping-list shopping-list--fullscr"} ref='component'>
                <div ref='top'>
                    <div className="shopping-list__title-container">
                        <h2 className="shopping-list__title">Shooping List</h2>
                    </div>

                    <AddIngredientForm addIngredient={this.addIngredient} onAddCountChange={this.onAddCountChange} onAddUnitChange={this.onAddUnitChange}
                        onAddIngredientChange={this.onAddIngredientChange}
                        formCount={this.state.formCount} formUnit={this.state.formUnit} formIngredient={this.state.formIngredient}
                        lines={this.props.twoCompVisible ? 2 : this.props.scrWidth<=350 ? 2 : 1}
                        addingDisabled={this.state.formIngredient==="" ? false || this.state.selectorValue!=='all' : this.state.addingDisabled}
                        parent={this.props.scrWidth>910 ? "shopping" : ""}
                    />

                    <div className="shopping-list__menu">
                        <select onChange={(e) => this.onSelectorChange(e.target.value)}
                        value={this.state.selectorValue}
                        className="input-small input-small--unit input-small--unit--recipe-selector"
                        >
                        <option value="all">All</option>
                        {this.props.options.map((e) =>{
                            return <option key={e} value={e}>{reduceTitle(e, 15)}</option>
                        })}   
                        </select>
                        <button className={this.props.scrWidth >910 ? "button button--grey" : "button button--primary"} onClick={() => this.removeAll()}>Remove all</button>
                    </div>
                </div>
                
                    
                <div className="shopping-list__ingredients">    
                        {this.getSelectedIngredients(this.props.allIngredients, this.props.recipes, this.state.selectorValue).length > 0 ?
                                
                            <IngredientsList ref='list' countOfArr={this.props.twoCompVisible ? 1 : this.props.scrWidth<=550 ? 1 : 2}
                                getItemsHeight={this.getItemsHeight} parent='shopping-list'
                                ingredients={this.getVisibleIngredients(
                                    this.getSelectedIngredients(this.props.allIngredients, this.props.recipes, this.state.selectorValue),
                                    this.state.page, this.state.currentLimit
                                    )}
                                removeIngredient={this.removeIngredient} onCountChange={this.onCountChange}
                            />
                    : <span className="shopping-list__ingredients__empty">Your shopping list is empty.</span>}
                </div>

                {
                this.getSelectedIngredients(this.props.allIngredients, this.props.recipes, this.state.selectorValue).length >
                this.state.currentLimit
                    &&
                <MoveButtons from="shopping" page={this.state.page}
                pages={this.state.pages} nextPage={this.nextPage} prevPage={this.prevPage}/>
                }

            </div>
        )
    }
}

const mapStateToProps = (state) => {
    return ({
        recipes: state.shoppingList.recipes,
        allIngredients: state.shoppingList.allIngredients,
        options: state.shoppingList.recipes.map(e => e.from),
        leftSideHeight: state.styles.leftSideHeight,
        scrWidth: state.styles.scrWidth,
        twoCompVisible: state.styles.twoCompVisible,
    })
}

const mapDispatchToProps = (dispatch) => {
    return ({
        changeCount: (from, ingredient, count, unit, sign, diffrence) => dispatch(changeCount(from, ingredient, count, unit, sign, diffrence)),
        removeAllIngredients: (from) => dispatch(removeAllIngredients(from)),
        removeIngredient: (from, ingredient, count, unit) => dispatch(removeIngredient(from, ingredient, count, unit)),
        addIngredient: (count, unit, ingredient) => dispatch(addIngredients([{count, unit, ingredient}], 'all'))
    })
}

export default connect(mapStateToProps, mapDispatchToProps)(ShoppingList)
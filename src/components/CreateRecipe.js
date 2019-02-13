import React from 'react'
import { storage } from '../firebase/firebase';
import { connect } from 'react-redux';
import ReactDOM from 'react-dom';
import UUID from'uuid';
import {ingredientValidation, countValidation} from '../validation/ingredientsValidation';
import AddIngredientForm from './addIngredientForm';
import PopupCreateRecipe from './PopupCreateRecipe';
import { addOwnRecipe } from '../actions/recipes';
import IngredientsList from './IngredientsList';
import { history } from '../routers/AppRouter';
import { setLeftSideHeight } from '../actions/styles';
import { healthLabels, diets } from '../data/healthLables';

class CreateRecipe extends React.Component {
    constructor(props){
        super(props)
        this.state = {
            modalIsOpen: false,
            formCount: 1,
            formUnit: 'kg',
            formIngredient: '',
            percentage: 0,
            message: '',
            addingDisabled: false,
            avatarChanged: false,
            validForm: false,
            validUrl: false,
            validLabel: false,
            recipe: {label: '',
                    healthLabels: [],
                    ingredients: [],
                    image: "https://firebasestorage.googleapis.com/v0/b/recipes-app-4f6e6.appspot.com/o/create-recipe-image.png?alt=media&token=3b8606ae-1651-4b13-bbda-71e4b81fe047",
                    servings: 1,
                    url: '',
                    id: UUID(),
                    likedBy: []
            }
        }
        this.onAddCountChange = this.onAddCountChange.bind(this);
        this.onAddUnitChange = this.onAddUnitChange.bind(this);
        this.onAddIngredientChange = this.onAddIngredientChange.bind(this);
        this.addIngredient = this.addIngredient.bind(this);
        this.closeModal = this.closeModal.bind(this);
        this.removeIngredient = this.removeIngredient.bind(this);
        this.onCountChange = this.onCountChange.bind(this);
    }

    fileSelection(e){
        
        let file = e.target.files[0];

        const ref = storage.ref(`users/${this.props.userInfo.uid}/ownRecipesImages/${this.state.recipe.id}`);
        const task = ref.put(file);

        task.on('state_changed',
        (snapshot)=>{
            const percentage = Math.round((snapshot.bytesTransferred / snapshot.totalBytes)*100)
            console.log(percentage);
            this.setState(()=>({
                addingDisabled: true,
                percentage
            }))
            
        },
        (error)=>{

        },
        (complete)=>{
            ref.getDownloadURL().then((url) => {
                this.setState(({recipe} = state) => ({
                    recipe: {...recipe,
                    image: url
                    },
                    addingDisabled: false,
                    avatarChanged: true
                }), () => {
                    this.calculateImageHeight();
                })
              }).catch(error => {
                // Handle any errors
              });
        })
        
    }



    calculateImageHeight(){
        let value;
        let property;
        if(this.props.scrWidth>450){
            property= 'imageHeight';
            value = window.getComputedStyle(ReactDOM.findDOMNode(this.refs.image)).getPropertyValue("height");
        }else{
            property= 'imageHeightInput';
            value = window.getComputedStyle(ReactDOM.findDOMNode(this.refs.imageInput)).getPropertyValue("height");
        }
        console.log(property)
        console.log(value)
        this.setState(() => ({
            [property]: value
        }))
    }

    sliceHealthLabels(labels){
        return [labels.slice(0, Math.ceil(labels.length / 2)), labels.slice(Math.ceil(labels.length / 2) ,labels.length)]
    }

 
    setLabel(label){        
        this.setState(({recipe} = state) => ({
            recipe: {...recipe, label},
            validLabel: label.length >= 5 && label.length<=40
        }))
    }

    onAddCountChange(value){
        countValidation(value, this.state.formUnit) && 
        this.setState(() => ({
            formCount: value,
        }))
    }

    onAddUnitChange(value){
        this.setState((state) => ({
            formUnit: value,
            formCount: state.formCount>100 ? 100 : state.formCount
        }))
    }

    onAddIngredientChange(value){
        this.setState(()=> ({
            formIngredient: value,
            validForm: ingredientValidation(value)
        }))
    }

    addIngredient(event){
        event.preventDefault();
        if(this.state.validForm && this.state.recipe.ingredients.length<20){
            const index = this.state.recipe.ingredients.findIndex(e => e.ingredient === this.state.formIngredient && e.unit === this.state.formUnit)
            let ingredients;
            if(index===-1){
                ingredients = [...this.state.recipe.ingredients, {count: parseFloat(this.state.formCount), unit: this.state.formUnit==='none' ? "" : this.state.formUnit,
                    ingredient: this.state.formIngredient
                }];
            }else{
                ingredients = this.state.recipe.ingredients.map((e, i) => {
                    if(i === index){
                        const formCount = parseFloat(this.state.formCount);
                        console.log(this.state.formCount)
                        console.log(e.count)
                        let count;
                        if(this.state.formUnit!=="g" && e.count+formCount>100){
                            count=100
                        }else if (this.state.formUnit==="g" && e.count+formCount>1000){
                            count=1000
                        }else{
                            count = formCount + e.count
                        }
                        return{
                            ...e,
                            count
                        }
                    }else{
                        return e
                    }
                })
            }

            this.setState(({recipe} = state) =>({
                recipe: {...recipe, ingredients},
                formCount: 1,
                formUnit: 'kg',
                formIngredient: '',
            }))
        }
    }

    removeIngredient(ingredient, count, unit){
        console.log(ingredient, count, unit)
        this.setState(({recipe} = state) => ({
            recipe: {
                ...recipe,
                ingredients: recipe.ingredients.filter(e => !(e.ingredient===ingredient && e.unit===unit))
            }
        }))
    }

    onCountChange(count, ingredient, countBefore, unit){
        countValidation(count, unit) && this.setState(({recipe} = state) => ({
            recipe: {
                ...recipe,
                ingredients: recipe.ingredients.map(e => {
                if(e.ingredient===ingredient && e.unit===unit){
                    return {
                        ...e,
                        count
                    }
                }else{
                    return e
                }
            })}
        }))
    }

    addHealthLabel(value){
        const index = this.state.recipe.healthLabels.findIndex(e => e.parameter === value);

        if(index===-1 && this.state.recipe.healthLabels.length<=6){
            this.setState(({recipe} = state) => ({
                recipe: {...recipe,
                    healthLabels: [...recipe.healthLabels, healthLabels.find(e => e.parameter === value)]
                },
                formHealthLabel: ''
            }))
        }
    }

    removeHealthLabel(value){
        this.setState(({recipe} = state) => ({
            recipe: {
                ...recipe,
                healthLabels: recipe.healthLabels.filter(e => e.parameter!==value)
            }
        }))
    }


    incrementOrDecreaseServings(value){
        const newValue = this.state.recipe.servings+(value);
        if(newValue>=1){
            this.setState(({recipe} = state)=>({
                recipe: {
                    ...recipe,
                    servings: newValue
                }
            }))
        }
    }

    validateRecipe(){
        const recipe = this.state.recipe;
        if(!this.state.validLabel){
            return 'Title should have at least 5 chars and less than 30.';
        }else if(recipe.ingredients.length < 2 || recipe.ingredients.length > 20){
            return 'Add at least 2 ingredient but less than 20.';                            
        }else if(recipe.healthLabels.length < 1){
            return 'Add at least 1 health label.';                            
        }else if(this.state.addingDisabled){                        
            return 'Wait until food picture upload.';                            
        }else if(!this.state.validUrl && recipe.url!==''){
            return 'Write correct url to recipe or leave empty.';                            
        }else{
            return ''
        }
    }
    addRecipe(isEdited){
        const message = this.validateRecipe();

        if(message===''){
            const id = this.state.recipe.id;
            
            const recipe = {
                ...this.state.recipe,
                initialServings: this.state.recipe.servings,
                initialIngrCounts: this.state.recipe.ingredients.map(e => e.count),
                source: this.props.userInfo
            }

            this.props.addOwnRecipe(recipe, id, isEdited).then(() => {
                history.push('/recipes/own')
                window.scroll({
                    top: 0,
                    left: 0,
                    behavior: 'smooth'
                  });
            })

        }else{
            this.setState(()=>({
                message,
                modalIsOpen: true
            }))
        }
    }

    closeModal() {
        this.setState(() => ({
            modalIsOpen: false,
            message: ''
        }));
    }

    setUrl(url){
        const regexp =  /^(?:(?:https?|ftp):\/\/)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/\S*)?$/;

        this.setState(({recipe} = state)=>({
            recipe: {...recipe, url},
            validUrl: regexp.test(url)
        }))
    }

    componentDidMount(){
        this.calculateImageHeight();
        if(this.props.match.params.id){
            this.props.recipe ? 
                this.setState(() => ({
                    recipe: this.props.recipe,
                }), () => {
                    this.setLabel(this.props.recipe.label);
                    this.setUrl(this.props.recipe.url);
                })
            :
                history.push('/dashboard')
        }
        this.props.setLeftSideHeight(this.refs.component)
    }

    componentDidUpdate(prevProps, prevState){
        if((prevState.recipe.ingredients.length !== this.state.recipe.ingredients.length
            ||
        prevState.recipe.healthLabels.length !== this.state.recipe.healthLabels.length) && this.props.scrWidth>910){
            this.props.setLeftSideHeight(this.refs.component)
        }
    }

    render(){
        return (
                <div className="recipe" ref='component'>
                <PopupCreateRecipe modalIsOpen={this.state.modalIsOpen} closeModal={this.closeModal} message={this.state.message}/>

                    <div className="recipe__header">
                        {this.props.scrWidth>450 && (
                        <div className="recipe__header__image">
                            <div ref={"image"} style={{backgroundImage: `url(${this.state.recipe.image})`, width: this.state.imageHeight}}
                            className="recipe__header__image__content">
                                <input type="file" className="fileButton" onChange={e => this.fileSelection(e)} />
                                {this.state.addingDisabled ? <img className="loader__image fileButton__loader fileButton__loader--mid"
                                src="/images/loader.gif" />
                                    :
                                !this.state.avatarChanged && <i className="icon-camera fileButton__icon"/>}                                
                            </div>
                        </div>
                        )}

                        <div className="recipe__header__container recipe__header__container--create">

                            <div className="recipe__header__container__title recipe__header__container__title--create">
                                <input className={this.state.recipe.label !== '' ? 
                                    this.state.validLabel ? "input-valid create-recipe__input" : "input-invalid create-recipe__input" : 
                                    "input-default create-recipe__input"}
                                    placeholder="Recipe title" type="text" 
                                    value={this.state.recipe.label} onChange={e => this.setLabel(e.target.value)}
                                />
                            
                                {this.props.scrWidth<=450 && (
                                    <div className="recipe__header__image">

                                        <div ref={"imageInput"} style={{backgroundImage: `url(${this.state.recipe.image})`, width: this.state.imageHeightInput}}
                                        className="recipe__header__image__content">
                                            <input type="file" className="fileButton" onChange={e => this.fileSelection(e)} />
                                            {this.state.addingDisabled ? <img className="loader__image fileButton__loader fileButton__loader--small"
                                            src="/images/loader.gif" />
                                                :
                                            !this.state.avatarChanged && <i className="icon-camera fileButton__icon fileButton__icon--small"/>}    
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="recipe__header__container__publisher">
                                <img className="recipe__header__container__publisher__avatar" src={this.props.userInfo.avatar}/>
                                <span className="recipe__header__container__publisher__userName">
                                    {this.props.userInfo.userName}
                                </span>
                            </div>
                            <div className="recipe__header__info-container">                            
                                <span className="recipe__header__info">
                                    <i className="icon-adult recipe__icon"></i>Servings: {this.state.recipe.servings} {this.state.recipe.servings===1 ? 'person' : 'persons'} 
                                    <div className="recipe__header__info__change-servings-icon-container">                        
                                        <i className="icon-plus recipe__header__info__change-servings-icon" onClick={() => this.incrementOrDecreaseServings(1)}></i> 
                                        <i className="icon-minus-1 recipe__header__info__change-servings-icon" onClick={() => this.incrementOrDecreaseServings(-1)}></i>
                                    </div>
                                </span>
                            </div>
                        </div>
                    </div>

                    <AddIngredientForm addIngredient={this.addIngredient} onAddCountChange={this.onAddCountChange} onAddUnitChange={this.onAddUnitChange}
                        onAddIngredientChange={this.onAddIngredientChange}
                        formCount={this.state.formCount} formUnit={this.state.formUnit} formIngredient={this.state.formIngredient}
                        lines={this.props.scrWidth<=350 ? 2 : 1}
                        addingDisabled={(this.state.formIngredient==="" ? false : !this.state.validForm) ||
                        this.state.recipe.ingredients.length>=20}
                    />


                    <div className="recipe__ingredients ingredients">
                        <h3 className="recipe__ingredients__title">Ingredients</h3>
                        
                        <IngredientsList parent="create" countOfArr={2} ingredients={this.state.recipe.ingredients}
                            removeIngredient={this.removeIngredient} onCountChange={this.onCountChange}
                            countOfArr={this.props.twoCompVisible ? 1 : this.props.scrWidth<=550 ? 1 : 2}
                        />

                    </div>

                    
                    <form className="add-ingredient-form add-ingredient-form--primary add-ingredient-form--health">
                        <span className="add-ingredient-form__span">Select</span>
                            <select className="input-small input-small--unit input-small--unit--recipe-selector" value="" onChange={(e)=> this.addHealthLabel(e.target.value)}>
                                <option value="" disabled selected>health lables</option>
                                {healthLabels.map(e => <option key={e.parameter} value={e.parameter}>{e.label}</option>)}
                            </select>
                    </form>

                    <div className="recipe__ingredients ingredients recipe__health-label">
                        <h3 className="recipe__ingredients__title">Health labels</h3>
                            <div className="ingredients-container">
                                {
                                    [this.props.scrWidth > 450 ? this.sliceHealthLabels(this.state.recipe.healthLabels) : [this.state.recipe.healthLabels]][0]
                                    .map((arr, iArr) =>{
                                        return (
                                            <ul key={`healthLabels-arr-${iArr}`} className={this.props.scrWidth > 450 ? 
                                            "ingredients__list" : " ingredients__list ingredients__list--shopping"}>
                                                {arr.map((e, iItem) => {
                                                    return (<li className="ingredients__list__item recipe__health-label__item" key={`healthLabels-arr-${iArr}-item-${iItem}`}>
                                                        <i className="icon-ok-outline recipe__icon"/>{e.label}
                                                        <i className="icon-cancel-circled ingredients__list__item__remove" onClick={() => this.removeHealthLabel(e.parameter)} />
                                                    </li>)
                                                })}
                                            </ul>
                                        )
                                    })
                                }
                            </div>
                    </div>

                    <div className="recipe__footer">
                        <label className="label label--url">
                            <span className="label__text label__text--url">Full recipe url (optional)</span>
                            <input className={this.state.recipe.url === "" ? "input-small input-default input-small--text" :
                                this.state.validUrl ? "input-small input-valid input-small--text" :
                                "input-small input-invalid input-small--text"
                                }
                                value={this.state.recipe.url} onChange={e => this.setUrl(e.target.value)} type="text"
                            />

                        </label>
                        {this.props.match.params.id ? <span className="recipe__footer__button button button--primary"
                        onClick={() => this.addRecipe(true)}>Update recipe</span>
                         : 
                        <span className="recipe__footer__button button button--primary" onClick={() => this.addRecipe(false)}>Publish recipe</span>}
                    </div>

                </div>
        )
    }
}


const mapStateToProps = (state, props) => ({
    recipe: state.recipes.ownRecipes.find(e => e.id === props.match.params.id),
    userInfo: state.auth,
    scrWidth: state.styles.scrWidth,
});

const mapDispatchToProps = (dispatch) => ({
    addOwnRecipe: (recipe, recipeID, edit) => dispatch(addOwnRecipe(recipe, recipeID, edit)),
    setLeftSideHeight: (refsComponent) => dispatch(setLeftSideHeight(refsComponent))
})

export default connect(mapStateToProps, mapDispatchToProps)(CreateRecipe);



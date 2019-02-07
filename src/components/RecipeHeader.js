import React from 'react'
import { connect } from 'react-redux';
import ReactDOM from 'react-dom';

const fakeliked = [
    {avatar: "https://firebasestorage.googleapis.com/v0/b/recipes-app-4f6e6.appspot.com/o/user-default.png?alt=media&token=3b0e5895-56cb-4f27-b944-739ba04cd475",
    userName: "bartass elo elo"},
    {avatar: "https://firebasestorage.googleapis.com/v0/b/recipes-app-4f6e6.appspot.com/o/user-default.png?alt=media&token=3b0e5895-56cb-4f27-b944-739ba04cd475",
    userName: "google"},
    {avatar: "https://firebasestorage.googleapis.com/v0/b/recipes-app-4f6e6.appspot.com/o/user-default.png?alt=media&token=3b0e5895-56cb-4f27-b944-739ba04cd475",
    userName: "google"},
    {avatar: "https://firebasestorage.googleapis.com/v0/b/recipes-app-4f6e6.appspot.com/o/user-default.png?alt=media&token=3b0e5895-56cb-4f27-b944-739ba04cd475",
    userName: "google"},
    {avatar: "https://firebasestorage.googleapis.com/v0/b/recipes-app-4f6e6.appspot.com/o/user-default.png?alt=media&token=3b0e5895-56cb-4f27-b944-739ba04cd475",
    userName: "google"},
]
class RecipeHeader extends React.Component{
    constructor(props){
        super(props)
        this.state = {
            imageHeight: 0,
            displayImage: true
        }
    }


    setImageHeight(imageHeight){
        this.setState(() => ({
            imageHeight,
        }), () => {
            const componentWidth = parseInt(window.getComputedStyle(ReactDOM.findDOMNode(this.refs.component)).getPropertyValue("width"));
            const leftWidth = parseInt(window.getComputedStyle(ReactDOM.findDOMNode(this.refs.left)).getPropertyValue("width"));
            //16 is left padding of image container
            this.setState(() => ({
                displayImage: componentWidth>leftWidth+imageHeight+16 && imageHeight+16<0.3*componentWidth
            }))
        })
    }

    componentDidMount(){
        const imageHeight = parseInt(window.getComputedStyle(ReactDOM.findDOMNode(this.refs.image)).getPropertyValue("height"));
        this.setImageHeight(imageHeight)
    }

    componentDidUpdate(prevProps, prevState){
        if(this.state.displayImage===true){
            const imageHeight = parseInt(window.getComputedStyle(ReactDOM.findDOMNode(this.refs.image)).getPropertyValue("height"));
            if(prevState.imageHeight!==imageHeight){
                this.setImageHeight(imageHeight)
            }
        }
    }

    render(){
        return (
            <div ref='component' className={this.props.parent === 'own' || this.props.parent === 'liked' ? 
                "recipe__header recipe__header--list" : "recipe__header"}>

                {this.state.displayImage &&
                (<div className="recipe__header__image">
                    <div ref={"image"} style={{backgroundImage: `url(${this.props.recipe.image})`, width: this.state.imageHeight}}
                    className="recipe__header__image__content"></div>
                </div>)
                }
                
                <div ref='left' className="recipe__header__container">
                    <h2 className="recipe__header__container__title">{this.props.recipe.label}</h2>
                    {this.props.recipe.fromUser ?
                        <div className="recipe__header__container__publisher">
                            <img className="recipe__header__container__publisher__avatar" src={this.props.recipe.source.avatar}/>
                            <span className="recipe__header__container__publisher__userName">{this.props.recipe.source.userName}</span>
                        </div>
                         :
                        <span className="recipe__header__container__publisher">{this.props.recipe.source}</span>
                    }

                    {this.props.parent==='recipe' &&
                        <div className="recipe__header__info-container">
                            <span className="recipe__header__info">
                                <i className="icon-adult recipe__icon"></i>Servings: {this.props.recipe.servings} {this.props.recipe.servings===1 ? 'person' : 'persons'} 
                                <div className="recipe__header__info__change-servings-icon-container">
                                    <i className="icon-plus recipe__header__info__change-servings-icon"
                                    onClick={() => this.props.incrementOrDecreaseServings('plus')}></i> 

                                    <i className="icon-minus-1 recipe__header__info__change-servings-icon"
                                    onClick={() => this.props.incrementOrDecreaseServings('minus')}></i>                                
                                </div>
                            </span>
                        </div>
                    }

                    {((this.props.recipe.likedBy && this.props.recipe.likedBy.length>0) || this.props.parent==='own') &&
                        <div className={this.props.parent==='recipe' ? "recipe__header__info-container recipe__header__info-container--no-margin"
                                :
                            "recipe__header__info-container"}
                        >
                            {this.props.recipe.likedBy && this.props.recipe.likedBy.length>0 &&
                            (<span className="recipe__header__info recipe__header__info--liked-by">
                                <i className="icon-heart recipe__icon"></i>
                                Liked by:
                                <div className="recipe__header__likedBy">
                                    {this.props.recipe.likedBy.length===1 ? this.props.recipe.likedBy[0].userName :`${this.props.recipe.likedBy.length} users`}
                                    {this.props.recipe.likedBy.slice(0, 3).map((e, i) => <img key={i} className="recipe__header__likedBy__img" src={e.avatar} />)}
                                    {this.props.recipe.likedBy.length>3 && <span className="recipe__header__likedBy__dots">...</span>}
                                </div>
                            </span>)
                            }

                            {this.props.parent==='own' && (
                                <div className="recipe__header__button-container">
                                    <button className="recipe__header__button button button--small button--primary" onClick={() => this.props.removeRecipe(this.props.recipe.id)}>remove</button>
                                    <button className="recipe__header__button button button--small button--primary" onClick={() => this.props.editRecipe(this.props.recipe.id)}>edit</button>
                                </div>        
                            )}
                        </div>
                    }
                </div>
            </div>
        )
    }
}

const mapStateToProps = (state) => ({
    scrWidth: state.styles.scrWidth
})
export default connect(mapStateToProps)(RecipeHeader);

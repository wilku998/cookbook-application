import Modal from 'react-modal';
import React from 'react'
import { connect } from 'react-redux';
import { addIngredients, overwriteShoppingList } from '../actions/shoppingList'

class PopupModal extends React.Component {
    constructor(props){
        super(props)
        
    }

    addToExisting(){
        this.props.addToExisting();
        this.props.closeModal();
    }
    
    overwrite(){
        this.props.overwrite();
        this.props.closeModal();
    }

    render(){
        return (
            <div className="popup-container">
                <Modal
                    isOpen={this.props.modalIsOpen}
                    contentLabel="Example Modal"
                    onRequestClose={this.props.closeModal}
                    className="popup popup--gradient"
                    style= {{overlay: {zIndex: 100, background: 'linear-gradient(to right bottom, rgba(255,255,255,0.5), rgba(180, 180, 180, 0.5))'}}}
                >       
                    <i className="popup__close icon-cancel-circled" onClick={this.props.closeModal} />
                    <span className="popup__span">You already have this recipe in shopping list.</span>
                    <div className="popup__btn-container">
                        <button className="popup__btn popup__btn--2 button button--grey" onClick={() => this.addToExisting()}>Add</button>
                        <button className="popup__btn popup__btn--2 button button--grey" onClick={() => this.overwrite()}>Overwrite</button>                     
                    </div>                    
                </Modal>
                
            </div>
        )
    }
}

const mapDispatchToProps = (dispatch, props) => ({
    addToExisting: () => dispatch(addIngredients(props.ingredients, props.label)),
    overwrite: () => dispatch(overwriteShoppingList(props.ingredients, props.label))
})

export default connect(undefined, mapDispatchToProps)(PopupModal);
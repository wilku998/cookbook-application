import Modal from 'react-modal';
import React from 'react'


const PopupCreateRecipe = props => (
    <div className="popup-container">
        <Modal
            isOpen={props.modalIsOpen}
            contentLabel="Example Modal"
            onRequestClose={props.closeModal}
            className="popup popup--gradient"
            style= {{overlay: {zIndex: 100}}}            
        >       
            <span className="popup__span">{props.message}</span>
            <div className="popup__btn-container">
                <button className="button button--grey popup__btn" onClick={() => props.closeModal()}>Close</button>                
            </div>
        </Modal>
    </div>
);

export default PopupCreateRecipe
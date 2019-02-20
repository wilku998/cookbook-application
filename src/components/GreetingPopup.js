import Modal from 'react-modal';
import React from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import { storage } from '../firebase/firebase'
import { sendNameAndAvatarToFirebase } from '../actions/auth';

class GreetingPopup extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            modalIsOpen: props.isNew,
            img: 'https://firebasestorage.googleapis.com/v0/b/recipes-app-4f6e6.appspot.com/o/user-default.png?alt=media&token=3b0e5895-56cb-4f27-b944-739ba04cd475',
            userName: '',
            submittingDisabled: false,
            avatarChanged: false,
            valid: false
          }
          this.closeModal = this.closeModal.bind(this);
        }
    
    closeModal(){
        this.setState(() => ({
          modalIsOpen: false
        }))
      }
    
    fileSelection(e){
      let file = e.target.files[0];
      const ref = storage.ref(`users/${this.props.uid}/avatar`);
      const task = ref.put(file);

      task.on('state_changed',
      (snapshot)=>{
          this.setState(()=>({
            submittingDisabled: true,
            avatarChanged: true
          }))
      },
      (error)=>{

      },
      (complete)=>{
          ref.getDownloadURL().then((url) => {
              this.setState(() => ({
                  img: url,
                  submittingDisabled: false
              }))
            }).catch(error => {

            });
      })
    }

    onNameChange(userName){
        this.setState(() => ({
            userName,
            valid: userName.length>= 5 && userName.length<=15
        }))
    }

    getStarted(){
        const userName = this.state.userName;

        if(!this.state.submittingDisabled && this.state.valid){
            this.props.sendNameAndAvatarToFirebase({userName, avatar: this.state.img}).then(() => {
                this.closeModal();
            })
        }
    }

    componentWillReceiveProps(props){
            this.setState(()=> ({
                modalIsOpen: props.isNew
            }))
    }

    render(){
    return (
        <Modal
        isOpen={this.state.modalIsOpen}
        contentLabel="Example Modal"
        onRequestClose={this.closeModal}
        className="popup popup--first-login"
        style= {{overlay: {zIndex: 100, background: 'linear-gradient(to right bottom, rgba(255,255,255,0.5), rgba(180, 180, 180, 0.5))',
        overflowY:'scroll', overflowX: 'hidden'}}}
        ref="comp"
        onRequestClose={() => false}
        >
            <div className="popup__greeting">
                <h2 className="popup__greeting__h">Welcome for the first time in cookbook app</h2>
                <span className="popup__greeting__span">Set your name. Avatar you can leave default.</span>
            </div>

            <div className="popup__avatar-container">
                <div className="popup__avatar" ref={"image"} style={{backgroundImage: `url(${this.state.img})`}}>
                    <input className="fileButton fileButton--greeting" type="file" onChange={e => this.fileSelection(e)} />
                    {this.state.submittingDisabled ? <img className="loader__image fileButton__loader fileButton__loader--greeting" src="/images/loader.gif" />
                        :
                    !this.state.avatarChanged && <i className="icon-camera fileButton__icon fileButton__icon--avatar"/>}                           
                </div>
            </div>

            <input value={this.state.userName}
            className={this.state.userName==='' ? "popup__input" 
            : this.state.valid ? "popup__input popup__input--valid" : "popup__input popup__input--invalid"}
                type="text" placeholder="your name"
                onChange={(e) => this.onNameChange(e.target.value)}
            />

            <div className="popup__btn-container popup__btn-container--first-login">
                <button className="popup__btn button button--primary" onClick={() => this.getStarted()}>Get started!</button>
            </div>
        </Modal>
        )
    }
}

const mapDispatchToProps = (dispatch) => {
    return ({
        sendNameAndAvatarToFirebase: (userInfo) => dispatch(sendNameAndAvatarToFirebase(userInfo))
    })
}

const mapStateToProps = (state) => {
    return ({
        isNew: state.auth.isNew,
        uid: state.auth.uid
    })
}

export default connect(mapStateToProps, mapDispatchToProps)(GreetingPopup);

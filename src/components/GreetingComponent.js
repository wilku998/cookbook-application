import React from 'react';
import { setLeftSideHeight } from '../actions/styles';
import { connect } from 'react-redux';

class GreetingComponent extends React.Component{
    componentDidMount(){
        if(this.props.scrWidth>910){
            this.props.setLeftSideHeight(this.refs.component)
        }
    }
    render(){
        return (
            <section className="dashboard" ref="component">
                <div className="dashboard__header" style={{background: `url(./images/dashboard-header-background.jpg) center/cover`}}>
                <div className="dashboard__header-container">
                    <h1 className="dashboard__header__title dashboard__header__title--huge">Welcome in cookbook application</h1>
                    <span className="dashboard__header__title dashboard__header__title--small">Search over 2 milions of recipies</span>
                </div>
                </div>

                <div className="dashboard__content">
                <div className="dashboard__right">
                    <div className="dashboard__right-container">
                    <h2 className="dashboard__h">About</h2>
                    <div className="dashboard__section">
                        <i className="dashboard__icon icon-help-circled-alt"/>
                        <p className="dashboard__p dashboard__p--right">Application uses emedam recipies database and allows users to create their own recipes. The Cookbook App was created only for educational purposes and is in one hundred percent free. I'm inviting you to test my work. Find delicius recipes and share the website to your friends.</p>            
                    </div>
                    </div>
                </div>


                <div className="dashboard__left">
                    <h2 className="dashboard__h">Guides</h2>
                    <div className="dashboard__section">
                    <p className="dashboard__p dashboard__p--left">Expand the search bar on top of the website to select from which database you want to search recipes. You can also choose the health label that you are interested in and also exclude ingredients you don't want. If you want add own ingredients to shopping list choose "all" option in shopping-list selector.</p>            
                    <i className="dashboard__icon dashboard__icon--dark icon-book"/>
                    </div>
                </div>

                <div className="dashboard__right dashboard__right--warnings">
                    <div className="dashboard__right-container dashboard__right-container--warnings">
                    <h2 className="dashboard__h">Warnings</h2>
                    <div className="dashboard__section">
                        <i className="dashboard__icon icon-attention-alt"/>
                        <p className="dashboard__p dashboard__p--right">Because of free acces to the emedam recipes datebase the application allows user to search for a recipe up to 5 times per minute, excluding ingredients isn't available and user can't choose more than 2 health lables. Searching for another users recipes is always available with all features.</p>
                    </div>
                    </div>
                </div>

                <div className="dashboard__footer">
                    <div className="dashboard__footer-container">

                    <div className="dashboard__footer__section">
                        <h3 className="dashboard__footer__title">Contact</h3>
                        <span className="dashboard__footer__info">wilkbartosz98@wp.pl</span>
                    </div>

                    <div className="dashboard__footer__section">
                        <h3 className="dashboard__footer__title">Privacy policy</h3>
                        <span className="dashboard__footer__info">All rights reserved <span className="dashboard__footer__privacy-icon">&reg;</span></span>
                    </div>

                    </div>
                </div>

                </div>

            </section>
        )
    }
}
const mapStateToProps = (state) => ({
    scrWidth: state.styles.scrWidth
})

const mapDispatchToProps = (dispatch) => ({
    setLeftSideHeight: (refs) => dispatch(setLeftSideHeight(refs))
})
export default connect(mapStateToProps, mapDispatchToProps)(GreetingComponent);
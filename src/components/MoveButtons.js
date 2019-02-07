import React from 'react';

const MoveButtons = (props) => {
  if(props.pages>1 && props.page===1){
      return (
      <div className={props.from !== 'shopping' ? "move-buttons" : "move-buttons move-buttons--shopping-list"}>
        <div className={props.from !== 'shopping' ? "move-buttons__btn" : "move-buttons__btn move-buttons__btn--shopping-list"}
          onClick={() => {props.nextPage()}}>
          <span>Next page</span><i className="icon-right-open-outline"/>
        </div>
      </div>
      )
  } else if(props.page!=1 && props.page<props.pages){
      return (
        <div className={props.from !== 'shopping' ? "move-buttons" : "move-buttons move-buttons--shopping-list"}>
          <div className={props.from !== 'shopping' ? "move-buttons__btn" : "move-buttons__btn move-buttons__btn--shopping-list"}
            onClick={() => {props.nextPage()}}>
            <span>Next page</span><i className="icon-right-open-outline"/>
          </div>
          <div className={props.from !== 'shopping' ? "move-buttons__btn" : "move-buttons__btn move-buttons__btn--shopping-list"}
            onClick={() => {props.prevPage()}}>
            <i className="icon-left-open-outline"/><span>Prev page</span>
            </div>
        </div>
      ) 
  } else if(props.page!=1 && props.page===props.pages){
      return (
        <div className={props.from !== 'shopping' ? "move-buttons" : "move-buttons move-buttons--shopping-list"}>
          <div className={props.from !== 'shopping' ? "move-buttons__btn" : "move-buttons__btn move-buttons__btn--shopping-list"}
            onClick={() => {props.prevPage()}}>
            <i className="icon-left-open-outline"/><span>Prev page</span>
            </div>
        </div>
      ) 
  } else{
    return <p>No move buttons</p>
  }
}


export default MoveButtons
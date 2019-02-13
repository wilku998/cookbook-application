export default (state = {leftSideHeight: 0, twoCompVisible: true, scrWidth: 0}, action) => {
    switch (action.type) {
      case 'CALCULATE_LEFT-SIDE_HEIGHT':
        return {
            ...state,
            leftSideHeight: action.height
        };
    case 'SET_SHOPPING-LIST_ITEMS_HEIGHT':
        return {
            ...state,
            shoppingListItemsHeight: action.shoppingListItemsHeight
        };
    case 'SET_TWO_COMP_VIS':
        return {
            ...state,
            twoCompVisible: action.twoCompVisible,
            scrWidth: action.scrWidth
        };
    case 'SET_FETCHING_DATA_VAR':
        return {
            ...state,
            fetchingData: action.val
        }
      default:
        return state;
    }
  };
import ReactDOM from 'react-dom';

export const setLeftSideHeight = (refsComponent) => {
    const height = parseFloat(window.getComputedStyle(ReactDOM.findDOMNode(refsComponent)).getPropertyValue("height"));
    return {
    type: 'CALCULATE_LEFT-SIDE_HEIGHT',
    height
    }
}




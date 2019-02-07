export default (title, limit) => {
    let titleArr = title.split(' ');
    let newTitle = [];

    titleArr.reduce((prev, cur) => {
        if(prev + cur.length<limit){
            newTitle.push(cur);
            return prev + cur.length
        }
    }, 0);
    const returnedTitle = title === newTitle.join(' ') ? title : `${newTitle.join(' ')}...`;
    return returnedTitle;
};

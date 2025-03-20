const getSelectData = (select = []) => {
    return Object.fromEntries(select.map((el) => [el, 1]))
}


console.log(getSelectData([1, 2, 3, 4]));

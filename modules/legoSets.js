const setData = require("../data/setData");
const themeData = require("../data/themeData");

let sets = [];

const initialize = () => {
    setData.forEach(set => {
        const searchedTheme = themeData.find(theme => theme.id === set.theme_id);
        if (searchedTheme) {
            set.theme = searchedTheme.name;
            sets.push(set);
        }
    });
    return new Promise((resolve, reject) => {
        if (sets.length > 0) resolve();
        else reject("Fail to initialize!");
    });
};

const getAllSets = () => {
    return new Promise((resolve, reject) => {
        if (sets && sets.length > 0) resolve(sets);
        else reject("Invalid sets data!");
    });
};

const getSetByNum = (setNum) => {
    return new Promise((resolve, reject) => {
        const res = sets.find(set => set.set_num === setNum);
        if (res && res != {}) resolve(res);
        else reject("No set matches the set number!");
    });
};

const getSetsByTheme = (theme) => {
    return new Promise((resolve, reject) => {
        const res = sets.filter(set => set.theme.toLowerCase().includes(theme.toLowerCase()));
        if (res && res.length > 0) resolve(res);
        else reject("No set matches the theme!");
    });
};

module.exports = {
    initialize,
    getAllSets,
    getSetByNum,
    getSetsByTheme
};
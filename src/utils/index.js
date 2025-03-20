const lodash = require('lodash')
const { default: mongoose } = require('mongoose')

const convertToObjectIdMongodb = (id) => new mongoose.Types.ObjectId(id)


const removeUndefinedObject = obj => {
    Object.keys(obj).forEach((key) => {
        if (obj[key] === null || obj[key] === undefined) {
            delete obj[key];
        }
    })

    return obj
}

const getInfoData = (fileds, object) => {
    return lodash.pick(object, fileds)
}

const getSelectData = (select = []) => {
    return Object.fromEntries(select.map((el) => [el, 1]))
}

const getUnSelectData = (select = []) => {
    return Object.fromEntries(select.map((el) => [el, 0]))
}

module.exports = {
    convertToObjectIdMongodb,
    getInfoData,
    removeUndefinedObject,
    getSelectData,
    getUnSelectData,
}
const getCountDocumentsByFilter = (model, filter = {}) => {
    return model.countDocuments(filter).lean()
}

module.exports = { getCountDocumentsByFilter }
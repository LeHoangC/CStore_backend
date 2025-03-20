const { Schema, model } = require('mongoose')

const DOMCUMENT_NAME = 'Resource'
const COLLECTION_NAME = 'resources'

const resourceSchema = new Schema(
    {
        src_name: { type: String, required: true },
        src_slug: { type: String, required: true },
        src_description: { type: String, default: '' },
    },
    {
        timestamps: true,
        collection: COLLECTION_NAME,
    }
)

module.exports = model(DOMCUMENT_NAME, resourceSchema)

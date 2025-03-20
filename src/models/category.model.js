const mongoose = require('mongoose');
const { default: slugify } = require('slugify');


const DOCUMENT_NAME = 'Category'
const COLLECTION_NAME = 'categories'

const categorySchema = new mongoose.Schema({
    name: { type: String, required: true },
    slug: { type: String },
    description: { type: String },
    isActive: { type: Boolean, default: true }
}, {
    timestamps: true,
    collection: COLLECTION_NAME
})

categorySchema.pre('save', function (next) {
    this.slug = slugify(this.name, { lower: true, locale: 'vi' })
    next()
})

module.exports = mongoose.model(DOCUMENT_NAME, categorySchema)
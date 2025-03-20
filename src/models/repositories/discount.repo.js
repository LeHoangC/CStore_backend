const DISCOUNT_MODEL = require('../../models/discount.model')
const { getProductById, getVariantById } = require('./product.repo')

const checkDiscountExist = async (filter) => {
    return await DISCOUNT_MODEL.findOne(filter).lean()
}

const getApplicableProducts = async (products, discount) => {
    switch (discount.discount_applies_to) {
        case 'all':
            return [...products]
        case 'category': {
            const productPromises = products.map(async (product) => {
                let productInfo

                if (product.productId && product.variantId) {
                    productInfo = await getVariantById({ productId: product.productId, variantId: product.variantId, select: ['category'] })
                    product.price = productInfo.variants[0].price
                } else {
                    productInfo = await getProductById(product.productId)
                }

                return {
                    product,
                    isApplicable: discount.discount_category_ids.includes(productInfo.category.toString())
                }
            })

            const results = await Promise.all(productPromises)
            return results.filter(item => item.isApplicable).map(item => item.product)
        }
        case 'products': {
            const productPromises = products.map(async (product) => {
                const productInfo = await getProductById(product.productId)
                return {
                    product,
                    isApplicable: discount.discount_product_ids.includes(productInfo._id.toString())
                }
            })

            const results = await Promise.all(productPromises)
            return results.filter(item => item.isApplicable).map(item => item.product)
        }
        default:
            return []
    }
}

module.exports = {
    checkDiscountExist,
    getApplicableProducts
}
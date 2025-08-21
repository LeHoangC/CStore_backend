const ErrorResponse = require('../../core/error.response')
const PRODUCT_MODEL = require('../../models/product.model')
const { removeUndefinedObject, getSelectData, convertToObjectIdMongodb } = require('../../utils')
const { getCountDocumentsByFilter } = require('./index.repo')

const findAllProducts = async (query) => {
    const {
        limit = 10,
        page = 1,
        select = ['name', 'slug', 'brand', 'stock', "mainImage", 'images', 'isPublished', 'hasVariants', 'isDraft', 'price', 'variants', 'ratings', 'sold_quantity'],
        minPrice = 0,
        maxPrice = 9999999999,
        filterObject,
        search = null,
        category = null,
        isAdmin
    } = query

    const skip = (page - 1) * limit
    const sortBy = search ? { score: { $meta: "textScore" }, createdAt: -1 } : { createdAt: -1 }

    let filter = removeUndefinedObject({
        ...filterObject,
        category,
        $or: [
            // Trường hợp 1: Sản phẩm KHÔNG có biến thể
            {
                hasVariants: false,
                basePrice: { $gte: minPrice, $lte: maxPrice },
            },
            // Trường hợp 2: Sản phẩm CÓ biến thể
            {
                hasVariants: true,
                variants: {
                    $elemMatch: {
                        price: { $gte: minPrice, $lte: maxPrice },
                    },
                },
            },
        ],
    })

    if (isAdmin) {
        filter = {}
    }

    if (search) {
        const regexSearch = new RegExp(search)
        filter['$text'] = { $search: regexSearch }
    }

    const [products, totalItems] = await Promise.all([
        PRODUCT_MODEL.find(filter).sort(sortBy).skip(skip).limit(limit).select(getSelectData(select)).populate('category', 'name').lean(),
        getCountDocumentsByFilter(PRODUCT_MODEL, filter),
    ])

    const totalPages = Math.ceil(totalItems / limit)

    return {
        data: products,
        pagination: {
            page,
            limit,
            totalItems,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
        },
    }
}

const getProducts = async (products) => {
    return await Promise.all(
        products.map(async (product) => {
            let foundProduct

            if (product.productId && product.variantId) {
                let classify = ''
                foundProduct = await getVariantById({
                    productId: product.productId,
                    variantId: product.variantId,
                    select: ['name', 'description', 'mainImage', 'ratings', 'hasVariants'],
                })

                classify += foundProduct.variants[0].combination.map((option) => option.value).join(', ')

                foundProduct.name = foundProduct.name + ` (${classify})`
                foundProduct.variants[0].classify = classify

            } else {
                foundProduct = await getProductById(product.productId)
            }
            return { product: foundProduct, quantity: product.quantity }
        })
    )
}

const getProductById = async (productId) => {
    const productInDb = await PRODUCT_MODEL.findOne({ _id: convertToObjectIdMongodb(productId) }).lean()
    if (!productInDb) {
        throw new ErrorResponse('Sản phẩm không tồn tại', 404)
    }

    return productInDb
}

const getVariantById = async ({ productId, variantId, select = [] }) => {
    const productInDb = await PRODUCT_MODEL.findOne(
        {
            _id: productId,
            'variants._id': variantId,
        },
        {
            ...getSelectData(select),
            'variants.$': 1,
        }
    ).lean()

    if (!productInDb) {
        throw new ErrorResponse('Sản phẩm không tồn tại', 404)
    }

    return productInDb
}

const checkProductByServer = async (products) => {
    return await Promise.all(
        products.map(async (product) => {
            let foundProduct

            if (product.productId && product.variantId) {
                foundProduct = await getVariantById({ productId: product.productId, variantId: product.variantId, select: ['name', 'hasVariants'] })
                foundProduct.name = foundProduct.name + ` (${foundProduct.variants[0].combination.map((option) => option.value).join(', ')})`
            } else {
                foundProduct = await getProductById(product.productId)
            }

            if (foundProduct.isDraft) {
                throw new ErrorResponse(`Sản phẩm ${foundProduct.name} không khả dụng.`, 400)
            }

            return { product: foundProduct, quantity: product.quantity }
        })
    )
}

module.exports = {
    findAllProducts,
    checkProductByServer,
    getProducts,
    getVariantById,
    getProductById,
}

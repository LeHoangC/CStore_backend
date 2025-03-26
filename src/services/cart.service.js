const ErrorResponse = require('../core/error.response')
const CART_MODEL = require('../models/cart.model')
const PRODUCT_MODEL = require('../models/product.model')
const { getProducts, getProductById, getVariantById } = require('../models/repositories/product.repo')

class CartService {
    static createUserCart = async ({ userId, product }) => {
        return await CART_MODEL.create({
            cart_userId: userId,
            cart_products: product ? [product] : []
        })
    }

    static async updateUserCartQuantity({ userId, product }) {
        const { productId, quantity, variantId = null } = product

        let query = {
            cart_userId: userId,
            cart_state: 'active',
        }

        let updateSet = {};

        if (variantId) {
            query = {
                ...query,
                'cart_products.productId': productId,
                'cart_products.variantId': variantId
            };

            updateSet = {
                $inc: {
                    'cart_products.$.quantity': quantity,
                },
            };
        } else {
            query = {
                ...query,
                'cart_products.productId': productId,
                'cart_products.variantId': null // Đảm bảo không có variantId
            };

            updateSet = {
                $inc: {
                    'cart_products.$.quantity': quantity,
                },
            };
        }

        const options = { upsert: true, new: true }

        return await CART_MODEL.findOneAndUpdate(query, updateSet, options)
    }

    // static async updateUserCartQuantity({ userId, product }) {
    //     const { productId, quantity } = product
    //     const query = {
    //         cart_userId: userId,
    //         'cart_products.productId': productId,
    //         cart_state: 'active',
    //     },
    //         updateSet = {
    //             $inc: {
    //                 'cart_products.$.quantity': quantity,
    //             },
    //         },
    //         options = { upsert: true, new: true }

    //     return await CART_MODEL.findOneAndUpdate(query, updateSet, options)
    // }

    static addToCart = async ({ userId, product }) => {
        const productInfo = await getProductById(product.productId)

        if (!productInfo) {
            throw new Error('Sản phẩm không tồn tại');
        }

        // Kiểm tra tính hợp lệ của request
        if (productInfo.hasVariants) {
            if (!product.variantId) {
                throw new Error('Vui lòng chọn biến thể của sản phẩm');
            }

            await getVariantById({ productId: product.productId, variantId: product.variantId })
        }

        const userCart = await CART_MODEL.findOne({ cart_userId: userId })

        if (!userCart) {
            return await this.createUserCart({ userId, product })
        }

        if (!userCart.cart_products.length) {
            userCart.cart_products.push(product)
            userCart.cart_count_product = 1
            return userCart.save()
        } else {
            let existingProduct;

            if (product.variantId) {
                // Kiểm tra sản phẩm có biến thể dựa trên cả productId và variantId
                existingProduct = userCart.cart_products.find(
                    (prd) => prd.productId === product.productId && prd.variantId === product.variantId
                )
            } else {
                // Kiểm tra sản phẩm thường chỉ dựa trên productId và không có variantId
                existingProduct = userCart.cart_products.find(
                    (prd) => prd.productId === product.productId && !prd.variantId
                )
            }

            if (existingProduct) {
                return await this.updateUserCartQuantity({ userId, product })
            }

            userCart.cart_products = [...userCart.cart_products, product]
            userCart.cart_count_product++
            return await userCart.save()
        }
    }

    static getUserCart = async (userId) => {
        const foundCart = await CART_MODEL.findOne({ cart_userId: userId })

        if (!foundCart) {
            return this.createUserCart({ userId })
        }

        const productsCart = await getProducts(foundCart.cart_products)

        foundCart.cart_products = productsCart
        return foundCart
    }

    static removeItemCart = async ({ userId, productId, variantId }) => {
        const query = { cart_userId: userId };
        let updateSet;
        let matchCondition;

        // Xác định điều kiện khớp với sản phẩm trong cart_products
        if (variantId) {
            // Trường hợp sản phẩm có biến thể
            matchCondition = {
                cart_products: {
                    $elemMatch: {
                        productId,
                        variantId
                    }
                }
            };
            updateSet = {
                $pull: {
                    cart_products: {
                        productId,
                        variantId
                    }
                }
            };
        } else {
            // Trường hợp sản phẩm thường (không có variantId)
            matchCondition = {
                cart_products: {
                    $elemMatch: {
                        productId,
                        variantId: { $exists: false }
                    }
                }
            };
            updateSet = {
                $pull: {
                    cart_products: {
                        productId,
                        variantId: { $exists: false }
                    }
                }
            };
        }

        // Thêm $inc để giảm cart_count_product
        updateSet['$inc'] = {
            cart_count_product: -1
        };

        // Kết hợp điều kiện kiểm tra với thao tác cập nhật
        const deleteCart = await CART_MODEL.findOneAndUpdate(
            {
                ...query, // cart_userId: userId
                ...matchCondition // Kiểm tra sản phẩm có tồn tại trong cart_products
            },
            updateSet,
            { new: true } // Trả về tài liệu sau khi cập nhật
        );

        if (!deleteCart) {
            throw new Error("Sản phẩm không tồn tại trong giỏ hàng hoặc đã bị xóa.");
        }

        return deleteCart;
    };

    static resetCart = async ({ userId, cartId }) => {
        const foundCart = await CART_MODEL.findOne({ cart_userId: userId, _id: cartId })
        if (!foundCart) {
            throw new ErrorResponse('Giỏ hàng không tồn tại!')
        }

        foundCart.cart_products = []
        foundCart.cart_count_product = 0
        foundCart.save()

        return foundCart
    }
}

module.exports = CartService
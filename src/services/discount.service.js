'use strict'

const ErrorResponse = require('../core/error.response')
const DISCOUNT_MODEL = require('../models/discount.model')
const { getCart, validateProductsExistInCart } = require('../models/repositories/cart.repo')
const { checkDiscountExist, getApplicableProducts } = require('../models/repositories/discount.repo')
const { findAllProducts } = require('../models/repositories/product.repo')
const { sendDiscountToQueue } = require('../queues/producers/discountProducer')
const { getInfoData } = require('../utils')

class DiscountService {
    static createDiscount = async (payload) => {
        const {
            name,
            code,
            description,
            type,
            value,
            max_value,
            applies_to,
            category_ids,
            product_ids,
            start_date,
            end_date,
            is_active,
            min_order_value,
            max_uses,
            max_uses_per_user,
        } = payload

        if (new Date() > new Date(start_date) || new Date() > new Date(end_date)) {
            throw new ErrorResponse('Thời gian bắt đầu và kết thúc phải lớn hơn hiện tại!', 400)
        }

        if (new Date(start_date) >= new Date(end_date)) {
            throw new ErrorResponse('Ngày bắt đầu phải trước ngày kết thúc', 400)
        }

        const foundDiscount = await DISCOUNT_MODEL.findOne({ discount_code: code })

        if (foundDiscount) {
            throw new ErrorResponse('Mã giảm giá đã tồn tại', 400)
        }

        const newDiscount = await DISCOUNT_MODEL.create({
            discount_name: name,
            discount_code: code,
            discount_description: description,
            discount_type: type,
            discount_value: value,
            discount_max_value: max_value,
            discount_applies_to: applies_to,
            discount_category_ids: category_ids,
            discount_product_ids: product_ids,
            discount_start_date: start_date,
            discount_end_date: end_date,
            discount_is_active: is_active,
            discount_min_order_value: min_order_value,
            discount_max_uses: max_uses,
            discount_max_user_per_used: max_uses_per_user,
        })

        await sendDiscountToQueue(newDiscount);

        return newDiscount
    }

    static updateDiscount = async ({ discountId, bodyUpdate }) => {
        return await DISCOUNT_MODEL.findByIdAndUpdate(discountId, bodyUpdate, { new: true, runValidators: true })
    }

    static getDiscount = async ({ discountId, query }) => {
        const foundDiscount = await checkDiscountExist({ _id: discountId })

        if (!foundDiscount || !foundDiscount.discount_is_active) {
            throw new ErrorResponse('Mã giảm giá không tồn tại hoặc đã hết hạn', 400)
        }

        const { discount_applies_to, discount_category_ids, discount_product_ids } = foundDiscount

        let products

        if (discount_applies_to === 'all') {
            products = await findAllProducts(query)
        }

        if (discount_applies_to === 'categories') {
            products = await findAllProducts({ ...query, queryObject: { category: { $in: discount_category_ids } } })
        }

        if (discount_applies_to === 'products') {
            products = await findAllProducts({ ...query, queryObject: { _id: { $in: discount_product_ids } } })
        }

        return {
            discount: getInfoData(
                [
                    '_id',
                    'discount_name',
                    'discount_description',
                    'discount_type',
                    'discount_max_value',
                    'discount_value',
                    'discount_code',
                    'discount_start_date',
                    'discount_end_date',
                    'discount_max_uses',
                    'discount_uses_count',
                    'discount_max_user_per_used',
                    'discount_min_order_value',
                    'discount_applies_to',
                ],
                foundDiscount
            ),
            products,
        }
    }

    static getAllDiscount = async () => {
        return await DISCOUNT_MODEL.find({
            discount_is_active: true,
        }).select(
            'discount_name discount_description discount_type discount_max_value discount_value discount_code discount_start_date discount_end_date discount_min_order_value discount_applies_to'
        ).lean()
    }

    /**
     *
     * @param {string} discountCode - Mã code của discount
     * @param {string} userId - userId
     *
     * @param {Array<Object>} products - mảng sản phẩm được verify
     * @param {string} products[].productId - id sản phẩm
     * @param {string} products[].quantity - số lượng
     * @param {string} products[].name - tên sản phẩm
     * @returns
     */

    static verifyDiscount = async ({ discountCode, userId, products, cartId }) => {
        const foundCart = await getCart({ _id: cartId, cart_userId: userId, cart_state: 'active' })

        if (!foundCart) {
            throw new ErrorResponse('Giỏ hàng không tồn tại.')
        }

        if (!products.length) {
            throw new ErrorResponse('Vui lòng chọn sản phẩm trước khi áp dụng discount', 400)
        }

        validateProductsExistInCart(products, foundCart.cart_products)

        const foundDiscount = await checkDiscountExist({ discount_code: discountCode })

        if (!foundDiscount) {
            throw new ErrorResponse(`Discount doesn't exitst`)
        }

        const {
            discount_is_active,
            discount_max_uses,
            discount_end_date,
            discount_min_order_value,
            discount_max_user_per_used,
            discount_users_used,
            discount_type,
            discount_value,
        } = foundDiscount

        if (!discount_is_active) throw new ErrorResponse(`Discount expired`, 400)
        if (!discount_max_uses) throw new ErrorResponse(`Discount are out!`, 400)

        if (new Date() > new Date(discount_end_date)) {
            throw new ErrorResponse(`Discount code has expired`, 400)
        }

        products = await getApplicableProducts(products, foundDiscount)

        if (products.length === 1 && products[0] === false) {
            throw new ErrorResponse('Không có sản phẩm nào đủ điều kiện áp dụng mã giảm giá', 400)
        }

        let totalOrder = 0

        if (discount_min_order_value > 0) {
            totalOrder = products.reduce((acc, product) => {
                return acc + product.quantity * product.price
            }, 0)

            if (totalOrder < discount_min_order_value) {
                throw new ErrorResponse(`Phiếu giảm giá yêu cầu giá trị các mặt hàng được áp dụng tối thiểu là ${discount_min_order_value} `, 400)
            }
        }

        if (discount_max_user_per_used > 0) {
            const userUsedDiscount = discount_users_used.filter((user) => user.userId === userId).length

            if (userUsedDiscount && userUsedDiscount >= discount_max_user_per_used) {
                throw new ErrorResponse('Limit discount user', 400)
            }
        }

        const amount = discount_type === 'fixed' ? discount_value : totalOrder * (discount_value / 100)
        const totalPrice = totalOrder - amount

        return {
            totalOrder,
            discount: {
                amount,
                discountId: foundDiscount._id,
            },
            totalPrice: totalPrice < 0 ? 0 : totalPrice,
        }
    }

    static async deleteDiscount(discountId) {
        const deleted = await DISCOUNT_MODEL.findByIdAndDelete(discountId)
        return deleted
    }
}

module.exports = DiscountService

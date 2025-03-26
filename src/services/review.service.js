const ErrorResponse = require('../core/error.response')
const ORDER_MODEL = require('../models/order.model')
const PRODUCT_MODEL = require('../models/product.model')
const { getProductById } = require('../models/repositories/product.repo')
const REVIEW_MODEL = require('../models/review.model')
const { convertToObjectIdMongodb } = require('../utils')


class ReviewService {
    static createReview = async ({ userId, orderId, productId, variantId, variant_name, images, text, rating }) => {
        const foundOrder = ORDER_MODEL.findOne({ _id: orderId, order_user: convertToObjectIdMongodb(userId) })

        if (!foundOrder) {
            throw new ErrorResponse('Đơn hàng không tồn tại', 400)
        }

        const product = await getProductById(productId)
        if (!product) throw new ErrorResponse('Sản phẩm không tồn tại', 400);

        const oldAverage = product.ratings.average;
        const oldCount = product.ratings.count;
        const newCount = oldCount + 1;
        const newAverage = (oldAverage * oldCount + rating) / newCount;

        const foundReview = await REVIEW_MODEL.findOne({
            review_order: orderId,
            review_user: userId,
            review_productId: productId,
            ...(variantId && { review_variantId: variantId }) // Thêm điều kiện cho variantId nếu có
        })

        if (foundReview) {
            throw new ErrorResponse('Bạn đã đánh giá cho sản phẩm này', 400)
        }

        await PRODUCT_MODEL.updateOne(
            { _id: productId },
            {
                $set: {
                    'ratings.average': newAverage,
                    'ratings.count': newCount
                }
            }
        );


        const newReview = REVIEW_MODEL.create({
            review_user: userId,
            review_order: orderId,
            review_images: images,
            review_text: text,
            review_productId: productId,
            rating,
            ...(variantId && { review_variantId: variantId, review_variant_name: variant_name })
        })
        return newReview
    }
}

module.exports = ReviewService
const ErrorResponse = require('../core/error.response');
const { getRedis } = require('../dbs/init.redis');
const CATEGORY_MODEL = require('../models/category.model');

const { instanceConnect: redisClient } = getRedis()

class CategoriesService {
    static createCategory = async ({ name, description }) => {
        const foundCategory = await CATEGORY_MODEL.findOne({ name });

        if (foundCategory) {
            throw new ErrorResponse('Category đã tồn tại', 400);
        }

        const newCategory = await CATEGORY_MODEL.create({
            name,
            description,
        });

        return newCategory
    }

    static updateCategory = async ({ categoryId, name, description, isActive }) => {
        const foundCategory = await CATEGORY_MODEL.findById(categoryId);

        if (!foundCategory) {
            throw new ErrorResponse('Category not exists', 400);
        }

        return await CATEGORY_MODEL.findByIdAndUpdate(categoryId, {
            name,
            description,
            isActive,
        }, { new: true, runValidators: true });
    }

    static getCategories = async () => {
        // return await CATEGORY_MODEL.find();
        const cacheKey = 'categories'

        const cacheData = await redisClient.get(cacheKey)
        if (cacheData) {
            return JSON.parse(cacheData)
        }

        const categories = await CATEGORY_MODEL.aggregate([
            {
                $lookup: {
                    from: "products",
                    foreignField: 'category',
                    localField: '_id',
                    as: "products"
                }
            },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    description: 1,
                    isActive: 1,
                    slug: 1,
                    productCount: { $size: "$products" }
                }
            }
        ])

        await redisClient.set(cacheKey, JSON.stringify(categories))

        return categories
    }

    static getCategoryById = async (id) => {
        return CATEGORY_MODEL.findById(id)
    }

    static deleteCategory = async (id) => {
        return CATEGORY_MODEL.findByIdAndDelete(id)
    }
}

module.exports = CategoriesService

const CategoriesService = require("../services/category.service")
const { removeUndefinedObject } = require("../utils")

class CategoriesController {
    createCategory = async (req, res, next) => {
        return res.status(201).json(await CategoriesService.createCategory(req.body))
    }

    updateCategory = async (req, res, next) => {
        const bodyUpdate = removeUndefinedObject(req.body)
        return res.status(200).json(await CategoriesService.updateCategory({ ...bodyUpdate, categoryId: req.params.categoryId }))
    }

    getCategories = async (req, res, next) => {
        return res.status(200).json(await CategoriesService.getCategories())
    }

    getCategoryById = async (req, res, next) => {
        return res.status(200).json(await CategoriesService.getCategoryById(req.params.id))
    }

    deleteCategory = async (req, res, next) => {
        return res.status(200).json(await CategoriesService.deleteCategory(req.params.categoryId))
    }
}

module.exports = new CategoriesController()
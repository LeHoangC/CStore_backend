'use strict'

const ProductService = require("../services/product.service")
const { removeUndefinedObject } = require("../utils")

class ProductController {
    createProduct = async (req, res, next) => {
        return res.status(201).json(await ProductService.createProduct(req.body))
    }

    updateProduct = async (req, res, next) => {
        const bodyUpdate = removeUndefinedObject(req.body)
        return res.status(200).json(await ProductService.updateProduct(req.params.productId, bodyUpdate))
    }

    publicProduct = async (req, res, next) => {
        return res.status(200).json(await ProductService.publicProduct(req.params.productId))
    }

    unPublicProduct = async (req, res, next) => {
        return res.status(200).json(await ProductService.unPublicProduct(req.params.productId))
    }

    getProduct = async (req, res, next) => {
        return res.status(200).json(await ProductService.getProduct(req.params.slug))
    }

    getAllProducts = async (req, res, next) => {
        return res.status(200).json(await ProductService.getAllProducts(req.query))
    }

    analyticProducts = async (req, res, next) => {
        return res.status(200).json(await ProductService.analyticProducts())
    }
}

module.exports = new ProductController()
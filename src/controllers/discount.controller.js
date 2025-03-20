const { removeUndefinedObject } = require("../utils");
const DiscountService = require("../services/discount.service");

class DiscountController {
    createDiscount = async (req, res, next) => {
        return res.status(201).json(await DiscountService.createDiscount(req.body));
    }

    updateDiscount = async (req, res, next) => {
        const bodyUpdate = removeUndefinedObject(req.body);
        return res.status(200).json(await DiscountService.updateDiscount({ discountId: req.params.discountId, bodyUpdate }));
    }

    getDiscount = async (req, res, next) => {
        return res.status(200).json(await DiscountService.getDiscount({ discountId: req.params.discountId, query: req.query }));
    }

    getAllDiscount = async (req, res, next) => {
        return res.status(200).json(await DiscountService.getAllDiscount())
    }

    verifyDiscount = async (req, res, next) => {
        return res.status(200).json(await DiscountService.verifyDiscount({ userId: req.user.userId, ...req.body }));
    }

    deleteDiscount = async (req, res, next) => {
        return res.status(200).json(await DiscountService.deleteDiscount(req.params.discountId));
    }
}

module.exports = new DiscountController();
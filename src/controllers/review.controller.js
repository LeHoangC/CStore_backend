const ReviewService = require("../services/review.service")

class ReviewController {
    createReview = async (req, res) => {
        return res.status(201).json(await ReviewService.createReview({ userId: req.user.userId, ...req.body }))
    }
}

module.exports = new ReviewController()
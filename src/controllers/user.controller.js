const UserService = require("../services/user.service")

class UserController {
    getAllUser = async (req, res, next) => {
        return res.status(200).json(await UserService.getAllUser(req.query))
    }
}

module.exports = new UserController()
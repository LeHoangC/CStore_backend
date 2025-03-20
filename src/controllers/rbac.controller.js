const { createResource, createRole } = require("../services/rbac.service")

class RbacController {
    newResource = async (req, res) => {
        const response = {
            message: "Create new resource",
            data: await createResource(req.body)
        }

        return res.status(201).json(response)
    }

    newRole = async (req, res) => {
        const response = {
            message: "Create new role",
            data: await createRole(req.body)
        }

        return res.status(201).json(response)
    }
}


module.exports = new RbacController()
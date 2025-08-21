const { getCountDocumentsByFilter } = require('../models/repositories/index.repo');
const USER_MODEL = require('../models/user.model');
const { getUnSelectData } = require('../utils');


class UserService {
    static getAllUser = async (query) => {

        const { search, page, limit = 5 } = query

        const skip = (page - 1) * limit
        const filter = {}
        const regexSearch = new RegExp(search)
        if (search) {
            filter['$text'] = { $search: regexSearch }
        }

        const [users, totalUser] = await Promise.all([
            USER_MODEL.find(filter).skip(skip).limit(limit).select(getUnSelectData(['user_password'])),
            getCountDocumentsByFilter(USER_MODEL, filter),
        ])

        const totalPages = Math.ceil(totalUser / limit)

        return {
            data: users,
            pagination: {
                page,
                limit,
                totalUser,
                totalPages,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1,
            },
        }

    }
}

module.exports = UserService
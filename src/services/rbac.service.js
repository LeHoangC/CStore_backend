const RESOURCE_MODEL = require('../models/resource.model');
const ROLE_MODEL = require('../models/role.model');

const createResource = async ({ name, slug, description }) => {
    const resource = await RESOURCE_MODEL.create({
        src_name: name,
        src_slug: slug,
        src_description: description
    })

    return resource
}

const createRole = async ({ name, slug, description, grants }) => {
    const role = await ROLE_MODEL.create({
        role_name: name,
        role_slug: slug,
        role_description: description,
        role_grants: grants
    })

    return role
}

module.exports = { createResource, createRole }
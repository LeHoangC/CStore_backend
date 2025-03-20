const fs = require('fs')
const path = require('path');
const multer = require('multer');

const uploadDisk = multer({
    storage: multer.diskStorage({
        destination: function (req, res, cb) {
            const uploadDir = 'public/uploads/temp'

            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true })
            }
            cb(null, 'public/uploads/temp')
        },
        filename: function (req, file, cb) {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            cb(null, uniqueSuffix + path.extname(file.originalname))
        }
    }),
    limits: {
        fileSize: 5 * 1024 * 1024
    }
})

module.exports = {
    uploadDisk
}
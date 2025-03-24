const express = require('express')
const path = require('path');
const { uploadDisk } = require('../configs/multer.config')
const router = express.Router()

router.post('/attachments', uploadDisk.single('attachment'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Không có file nào được upload' });
        }

        // Tạo ID duy nhất cho ảnh (có thể dùng _id từ MongoDB nếu lưu vào DB)
        const imageId = path.basename(req.file.filename, path.extname(req.file.filename));

        // Đường dẫn tương đối tới file
        const relativePath = `/uploads/temp/${req.file.filename}`;

        // Trả về thông tin ảnh
        res.status(200).json({
            success: true,
            image: {
                id: imageId,
                filename: req.file.filename,
                path: relativePath,
                url: `${req.protocol}://${req.get('host')}${relativePath}`
            }
        });
    } catch (error) {
        console.error('Lỗi upload ảnh:', error);
        res.status(500).json({ success: false, message: error.message });
    }
})


router.use('/review', require('./review'))
router.use('/setting', require('./setting'))
router.use('/orders', require('./order'))
router.use('/analytic', require('./analytic'))
router.use('/checkout', require('./checkout'))
router.use('/cart', require('./cart'))
router.use('/discount', require('./discount'))
router.use('/products', require('./product'))
router.use('/categories', require('./category'))
router.use('/rbac', require('./rbac'))
router.use('/users', require('./users'))
router.use('/auth', require('./access'))

module.exports = router
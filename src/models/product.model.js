const mongoose = require("mongoose");
const { default: slugify } = require("slugify");

const DOCUMENT_NAME = "Product";
const COLLECTION_NAME = "products";

const variantSchema = new mongoose.Schema({
    combination: [
        {
            option: String, // e.g., "color", "size"
            value: String  // e.g., "red", "42"
        },
    ],
    stock: {                    // Số lượng tồn kho
        type: Number,
        default: 0,
        min: [0, "Số lượng tồn kho của biến thể phải lớn hơn hoặc bằng 0"]
    },
    price: {                    // Giá của biến thể
        type: Number,
        required: true
    },
    images: [{ type: Object }], // Ảnh riêng của biến thể
    sold_quantity: {            // Số lượng đã bán
        type: Number,
        default: 0
    },
});

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    slug: { type: String, unique: true },
    brand: { type: String, default: "No Brand" },
    category: { type: mongoose.Types.ObjectId, ref: "Category", required: true },
    description: { type: String, default: "" },
    mainImage: { type: Object }, // Ảnh chính của sản phẩm
    images: [{ type: Object }],
    sold_quantity: { type: Number, default: 0 }, // Số lượng đã bán

    hasVariants: Boolean, // Đánh dấu sản phẩm có biến thể hay không

    // Thông tin cho sản phẩm không có biến thể

    price: {                // Giá cơ bản (chỉ dùng khi hasVariants = false)
        type: Number,
        min: [0, 'Giá không thể nhỏ hơn 0'],
        validate: {
            validator: function (value) {
                if (!this.hasVariants && (value === undefined || value === null)) {
                    return false
                }
                return true
            },
            message: 'Giá bán là bắt buộc khi sản phẩm không có biến thể'
        }
    },
    stock: { type: Number, default: 0, min: [0, "Số lượng tồn kho phải lớn hơn hoặc bằng 0"] },       // Tồn kho (chỉ dùng khi hasVariants = false)
    variantOptions: [
        {
            option: { type: String, required: true },
            values: [String]
        }
    ],
    variants: [variantSchema], // Danh sách biến thể
    ratings: {
        average: { type: Number, default: 0 },
        count: { type: Number, default: 0 }
    },
    isDraft: { type: Boolean, default: true, index: true },
    isPublished: { type: Boolean, default: false, index: true },
}, {
    timestamps: true,
    collection: COLLECTION_NAME
});

productSchema.index({ name: "text", description: "text" });

productSchema.pre("save", function (next) {
    this.slug = slugify(this.name, { lower: true, locale: "vi" });
    next();
})

// Trong schema Product
productSchema.virtual('reviews', {
    ref: 'Review',
    localField: '_id',
    foreignField: 'review_productId'
});

// Đảm bảo virtual được included khi query
productSchema.set('toObject', { virtuals: true });
productSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model(DOCUMENT_NAME, productSchema);;
const Product = require('../models/product')
const Order = require('../models/order');
const cloudinary = require('cloudinary')
const APIFeatures = require('../utils/apiFeatures');
const { filterBadWords } = require('../utils/badWordsFilter');

exports.newProduct = async (req, res, next) => {
    console.log(req.files)
    let images = []

    if (typeof req.body.images === 'string') {
        images.push(req.body.images)
    } else {
        images = req.body.images
    }

    let imagesLinks = [];

    for (let i = 0; i < images.length; i++) {
        try {
            const result = await cloudinary.v2.uploader.upload(images[i], {
                folder: 'flowers',
                width: 150,
                crop: "scale",
            });

            imagesLinks.push({
                public_id: result.public_id,
                url: result.secure_url
            })

        } catch (error) {
            console.log(error)
        }

    }

    req.body.images = imagesLinks
    req.body.user = req.user.id;

    const product = await Product.create(req.body);

    if (!product)
        return res.status(400).json({
            success: false,
            message: 'Product not created'
        })


    return res.status(201).json({
        success: true,
        product
    })
}

exports.getSingleProduct = async (req, res, next) => {
    const product = await Product.findById(req.params.id);
    if (!product) {
        return res.status(404).json({
            success: false,
            message: 'Product not found'
        })
    }
    return res.status(200).json({
        success: true,
        product
    })
}

exports.getAdminProducts = async (req, res, next) => {

    const products = await Product.find();
    if (!products) {
        return res.status(404).json({
            success: false,
            message: 'Products not found'
        })
    }
    return res.status(200).json({
        success: true,
        products
    })

}

exports.updateProduct = async (req, res, next) => {
    let product = await Product.findById(req.params.id);
    
    if (!product) {
        return res.status(404).json({
            success: false,
            message: 'Product not found'
        })
    }
    
    let images = []
    if (typeof req.body.images === 'string') {
        images.push(req.body.images)
    } else {
        images = req.body.images
    }
 
    let imagesLinks = [];
    
    // Check if images are already uploaded (objects with public_id) or new uploads (base64 strings)
    for (let i = 0; i < images.length; i++) {
        // If it's an object with public_id, it's already uploaded - keep it
        if (typeof images[i] === 'object' && images[i].public_id) {
            imagesLinks.push({
                public_id: images[i].public_id,
                url: images[i].url,
                isMain: images[i].isMain || false
            });
        } 
        // If it's a string (base64), upload it to Cloudinary
        else if (typeof images[i] === 'string') {
            const result = await cloudinary.v2.uploader.upload(images[i], {
                folder: 'flowers',
                width: 150,
                crop: "scale",
            });
            imagesLinks.push({
                public_id: result.public_id,
                url: result.secure_url,
                isMain: false
            });
        }
    }
    
    // Set the main image based on mainImage index
    if (req.body.mainImage !== undefined && imagesLinks[req.body.mainImage]) {
        imagesLinks.forEach((img, idx) => {
            img.isMain = (idx === req.body.mainImage);
        });
    }
    
    req.body.images = imagesLinks;
    
    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
        useFindandModify: false
    })
    
    return res.status(200).json({
        success: true,
        product
    })
}

exports.deleteProduct = async (req, res, next) => {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
        return res.status(404).json({
            success: false,
            message: 'Product not found'
        })
    }

    return res.status(200).json({
        success: true,
        message: 'Product deleted'
    })
}

exports.getProducts = async (req, res) => {

    const resPerPage = 4;
    const productsCount = await Product.countDocuments();

    const apiFeatures = new APIFeatures(Product.find(), req.query).search().filter()
    
    // Add category filter
    if (req.query.category) {
        apiFeatures.query = apiFeatures.query.find({ category: req.query.category });
    }
    
    // Add exact rating filter (not "gte", exact match)
    if (req.query.ratings) {
        const rating = Number(req.query.ratings);
        // Filter products with rating >= specified rating and < rating + 1
        apiFeatures.query = apiFeatures.query.find({ 
            ratings: { 
                $gte: rating,
                $lt: rating + 1
            }
        });
    }
    
    apiFeatures.pagination(resPerPage);
    const products = await apiFeatures.query;
    let filteredProductsCount = products.length;

    if (!products)
        return res.status(400).json({ message: 'error loading products' })
    return res.status(200).json({
        success: true,
        products,
        filteredProductsCount,
        resPerPage,
        productsCount,

    })
}

exports.productSales = async (req, res, next) => {
    const totalSales = await Order.aggregate([
        {
            $group: {
                _id: null,
                total: { $sum: "$itemsPrice" }

            },
            
        },
    ])
    console.log( totalSales)
    const sales = await Order.aggregate([
        { $project: { _id: 0, "orderItems": 1, totalPrice: true } },
        { $unwind: "$orderItems" },
        {
            $group: {
                _id: { product: "$orderItems.name" },
                total: { $sum: { $multiply: ["$orderItems.price", "$orderItems.quantity"] } }
            },
        },
    ])
    console.log(sales)
    
    if (!totalSales) {
        return res.status(404).json({
            message: 'error sales'
        })
       
    }
    if (!sales) {
        return res.status(404).json({
            message: 'error sales'
        })
      
    }
    
    let totalPercentage = {}
    totalPercentage = sales.map(item => {
         
        percent = Number (((item.total/totalSales[0].total) * 100).toFixed(2))
        total =  {
            name: item._id.product,
            percent
        }
        return total
    }) 
     console.log(totalPercentage)
    res.status(200).json({
        success: true,
        totalPercentage,
        sales,
        totalSales
    })

}

exports.createProductReview = async (req, res, next) => {
    const { rating, comment, productId } = req.body;

    // Check if user has purchased this product
    const orders = await Order.find({
        user: req.user._id,
        'orderItems.product': productId
    });

    if (orders.length === 0) {
        return res.status(403).json({
            success: false,
            message: 'You can only review products you have purchased'
        });
    }

    // Filter bad words from comment
    const filteredComment = filterBadWords(comment);

    const review = {
        user: req.user._id,
        name: req.user.name,
        rating: Number(rating),
        comment: filteredComment,
        createdAt: Date.now()
    }
    
    const product = await Product.findById(productId);
    
    if (!product) {
        return res.status(404).json({
            success: false,
            message: 'Product not found'
        });
    }

    // Users can now add multiple reviews - just push the new review
    product.reviews.push(review);
    product.numOfReviews = product.reviews.length;
    
    // Recalculate average rating
    product.ratings = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length;
    
    await product.save({ validateBeforeSave: false });
    
    return res.status(200).json({
        success: true,
        message: 'Review posted successfully'
    })
}

exports.getProductReviews = async (req, res, next) => {
    const product = await Product.findById(req.query.id);
    res.status(200).json({
        success: true,
        reviews: product.reviews
    })
}

exports.updateReview = async (req, res, next) => {
    const { rating, comment, productId, reviewId } = req.body;

    const product = await Product.findById(productId);

    if (!product) {
        return res.status(404).json({
            success: false,
            message: 'Product not found'
        });
    }

    // Find the review
    const review = product.reviews.find(r => r._id.toString() === reviewId);

    if (!review) {
        return res.status(404).json({
            success: false,
            message: 'Review not found'
        });
    }

    // Check if the user owns this review
    if (review.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({
            success: false,
            message: 'You can only edit your own reviews'
        });
    }

    // Filter bad words from comment
    const filteredComment = filterBadWords(comment);

    // Update the review
    review.rating = Number(rating);
    review.comment = filteredComment;

    // Recalculate average rating
    product.ratings = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length;

    await product.save({ validateBeforeSave: false });

    return res.status(200).json({
        success: true,
        message: 'Review updated successfully'
    });
}

exports.deleteReview = async (req, res, next) => {
    const product = await Product.findById(req.query.productId);

    if (!product) {
        return res.status(404).json({
            success: false,
            message: 'Product not found'
        });
    }

    // Find the review to check ownership
    const reviewToDelete = product.reviews.find(review => review._id.toString() === req.query.id.toString());

    if (!reviewToDelete) {
        return res.status(404).json({
            success: false,
            message: 'Review not found'
        });
    }

    // Check if user owns the review (unless they're admin)
    if (req.user.role !== 'admin' && reviewToDelete.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({
            success: false,
            message: 'You can only delete your own reviews'
        });
    }

    const reviews = product.reviews.filter(review => review._id.toString() !== req.query.id.toString());
    const numOfReviews = reviews.length;

    const ratings = numOfReviews > 0 
        ? reviews.reduce((acc, item) => item.rating + acc, 0) / numOfReviews
        : 0;

    await Product.findByIdAndUpdate(req.query.productId, {
        reviews,
        ratings,
        numOfReviews
    }, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    })

    return res.status(200).json({
        success: true,
        message: 'Review deleted successfully'
    })
}

// Bulk delete products => /api/admin/products/bulk-delete
exports.bulkDeleteProducts = async (req, res, next) => {
    try {
        const { ids } = req.body;

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Please provide product IDs to delete'
            });
        }

        // Get all products to delete their images
        const products = await Product.find({ _id: { $in: ids } });

        // Delete images from cloudinary
        for (const product of products) {
            for (const image of product.images) {
                await cloudinary.v2.uploader.destroy(image.public_id);
            }
        }

        // Delete products from database
        const result = await Product.deleteMany({ _id: { $in: ids } });

        res.status(200).json({
            success: true,
            message: `${result.deletedCount} products deleted successfully`,
            deletedCount: result.deletedCount
        });
    } catch (error) {
        console.error('Bulk delete error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error deleting products'
        });
    }
};

// Toggle product status => /api/admin/product/:id/toggle
exports.toggleProductStatus = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        product.isActive = !product.isActive;
        await product.save();

        res.status(200).json({
            success: true,
            message: `Product ${product.isActive ? 'activated' : 'deactivated'} successfully`,
            product
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Error toggling product status'
        });
    }
};

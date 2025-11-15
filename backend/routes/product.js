const express = require('express');
const router = express.Router();
const upload = require("../utils/multer");

const { 
    newProduct,
    getSingleProduct,
    getAdminProducts,
    updateProduct,
    deleteProduct,
    getProducts,
    productSales,
    createProductReview,
    getProductReviews,
    updateReview,
    deleteReview,
    bulkDeleteProducts,
    toggleProductStatus
    } = require('../controllers/product');

    const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth')

router.post('/admin/product/new', isAuthenticatedUser, upload.array('images', 10), newProduct);
router.get('/product/:id', getSingleProduct)
router.get('/admin/products', isAuthenticatedUser, authorizeRoles('admin'), getAdminProducts);

router.put('/admin/product/:id', isAuthenticatedUser, authorizeRoles('admin'), updateProduct);
router.delete('/admin/product/:id', deleteProduct);
router.post('/admin/products/bulk-delete', isAuthenticatedUser, authorizeRoles('admin'), bulkDeleteProducts);
router.put('/admin/product/:id/toggle', isAuthenticatedUser, authorizeRoles('admin'), toggleProductStatus);

router.get('/products', getProducts)
router.get('/admin/product-sales', productSales);

// Review routes
router.put('/review', isAuthenticatedUser, createProductReview);
router.patch('/review', isAuthenticatedUser, updateReview);
router.get('/reviews', isAuthenticatedUser, getProductReviews);
router.delete('/review/user', isAuthenticatedUser, deleteReview); // User delete own review
router.delete('/reviews', isAuthenticatedUser, authorizeRoles('admin'), deleteReview); // Admin delete any review

module.exports = router

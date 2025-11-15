const express = require('express');
const router = express.Router();

const {
    createCategory,
    getCategories,
    getActiveCategories,
    getSingleCategory,
    updateCategory,
    deleteCategory,
    bulkDeleteCategories,
    toggleCategoryStatus
} = require('../controllers/category');

const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth');

// Public routes
router.get('/categories', getCategories);
router.get('/categories/active', getActiveCategories);

// Admin routes
router.post('/admin/category/new', isAuthenticatedUser, authorizeRoles('admin'), createCategory);
router.get('/admin/category/:id', isAuthenticatedUser, authorizeRoles('admin'), getSingleCategory);
router.put('/admin/category/:id', isAuthenticatedUser, authorizeRoles('admin'), updateCategory);
router.delete('/admin/category/:id', isAuthenticatedUser, authorizeRoles('admin'), deleteCategory);
router.post('/admin/categories/bulk-delete', isAuthenticatedUser, authorizeRoles('admin'), bulkDeleteCategories);
router.put('/admin/category/:id/toggle', isAuthenticatedUser, authorizeRoles('admin'), toggleCategoryStatus);

module.exports = router;

const Category = require('../models/category');
const cloudinary = require('cloudinary');

// Create new category => /api/admin/category/new
exports.createCategory = async (req, res, next) => {
    try {
        const { name, description, image } = req.body;

        // Check if category already exists
        const existingCategory = await Category.findOne({ name });
        if (existingCategory) {
            return res.status(400).json({
                success: false,
                message: 'Category with this name already exists'
            });
        }

        // Upload image to cloudinary
        const result = await cloudinary.v2.uploader.upload(image, {
            folder: 'categories',
            width: 500,
            crop: "scale"
        });

        const category = await Category.create({
            name,
            description,
            image: {
                public_id: result.public_id,
                url: result.secure_url
            }
        });

        res.status(201).json({
            success: true,
            category
        });
    } catch (error) {
        console.error('Create category error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error creating category'
        });
    }
};

// Get all categories => /api/categories
exports.getCategories = async (req, res, next) => {
    try {
        const categories = await Category.find().sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: categories.length,
            categories
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Error fetching categories'
        });
    }
};

// Get active categories only => /api/categories/active
exports.getActiveCategories = async (req, res, next) => {
    try {
        const categories = await Category.find({ isActive: true }).sort({ name: 1 });

        res.status(200).json({
            success: true,
            count: categories.length,
            categories
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Error fetching active categories'
        });
    }
};

// Get single category => /api/admin/category/:id
exports.getSingleCategory = async (req, res, next) => {
    try {
        const category = await Category.findById(req.params.id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        res.status(200).json({
            success: true,
            category
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Error fetching category'
        });
    }
};

// Update category => /api/admin/category/:id
exports.updateCategory = async (req, res, next) => {
    try {
        let category = await Category.findById(req.params.id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        const { name, description, image, isActive } = req.body;

        // Check if new name conflicts with existing category
        if (name && name !== category.name) {
            const existingCategory = await Category.findOne({ name });
            if (existingCategory) {
                return res.status(400).json({
                    success: false,
                    message: 'Category with this name already exists'
                });
            }
        }

        // Update image if provided and it's a new base64 image
        if (image && image.startsWith('data:image')) {
            // Delete old image from cloudinary
            await cloudinary.v2.uploader.destroy(category.image.public_id);

            // Upload new image
            const result = await cloudinary.v2.uploader.upload(image, {
                folder: 'categories',
                width: 500,
                crop: "scale"
            });

            req.body.image = {
                public_id: result.public_id,
                url: result.secure_url
            };
        } else {
            // Keep the old image
            delete req.body.image;
        }

        category = await Category.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            category
        });
    } catch (error) {
        console.error('Update category error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error updating category'
        });
    }
};

// Delete category => /api/admin/category/:id
exports.deleteCategory = async (req, res, next) => {
    try {
        const category = await Category.findById(req.params.id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        // Delete image from cloudinary
        await cloudinary.v2.uploader.destroy(category.image.public_id);

        await category.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Category deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Error deleting category'
        });
    }
};

// Bulk delete categories => /api/admin/categories/bulk-delete
exports.bulkDeleteCategories = async (req, res, next) => {
    try {
        const { ids } = req.body;

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Please provide category IDs to delete'
            });
        }

        // Get all categories to delete their images
        const categories = await Category.find({ _id: { $in: ids } });

        // Delete images from cloudinary
        for (const category of categories) {
            await cloudinary.v2.uploader.destroy(category.image.public_id);
        }

        // Delete categories from database
        const result = await Category.deleteMany({ _id: { $in: ids } });

        res.status(200).json({
            success: true,
            message: `${result.deletedCount} categories deleted successfully`,
            deletedCount: result.deletedCount
        });
    } catch (error) {
        console.error('Bulk delete error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error deleting categories'
        });
    }
};

// Toggle category status => /api/admin/category/:id/toggle
exports.toggleCategoryStatus = async (req, res, next) => {
    try {
        const category = await Category.findById(req.params.id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        category.isActive = !category.isActive;
        await category.save();

        res.status(200).json({
            success: true,
            message: `Category ${category.isActive ? 'activated' : 'deactivated'} successfully`,
            category
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Error toggling category status'
        });
    }
};

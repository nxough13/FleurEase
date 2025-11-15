const express = require('express');
const router = express.Router();
const upload = require("../utils/multer");

const { 
    registerUser,
    loginUser,
    googleLogin,
    facebookLogin,
    forgotPassword,
    resetPassword,
    verifyEmail,
    getUserProfile,
    updateProfile,
    updatePassword,
    allUsers,
    deleteUser,
    getUserDetails,
    updateUser,
    suspendUser,
    unsuspendUser,
    addToWishlist,
    removeFromWishlist,
    getWishlist
} = require('../controllers/auth');

const {isAuthenticatedUser, authorizeRoles} = require('../middlewares/auth')

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/google-login', googleLogin);
router.post('/facebook-login', facebookLogin);
router.get('/verify-email/:token', verifyEmail);
router.post('/password/forgot', forgotPassword);
router.put('/password/reset/:token', resetPassword);
router.get('/me',  isAuthenticatedUser, getUserProfile)
router.put('/me/update', isAuthenticatedUser,  upload.single("avatar"), updateProfile)
router.put('/password/update', isAuthenticatedUser, updatePassword)
router.get('/admin/users', isAuthenticatedUser, authorizeRoles('admin'), allUsers)

router.route('/admin/user/:id').get(isAuthenticatedUser, getUserDetails ).delete(isAuthenticatedUser, deleteUser).put(isAuthenticatedUser, authorizeRoles('admin'), updateUser)
router.put('/admin/user/:id/suspend', isAuthenticatedUser, authorizeRoles('admin'), suspendUser)
router.put('/admin/user/:id/unsuspend', isAuthenticatedUser, authorizeRoles('admin'), unsuspendUser)

// Wishlist routes
router.post('/wishlist', isAuthenticatedUser, addToWishlist)
router.delete('/wishlist/:productId', isAuthenticatedUser, removeFromWishlist)
router.get('/wishlist', isAuthenticatedUser, getWishlist)

module.exports = router;

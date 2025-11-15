const User = require('../models/user');
const crypto = require('crypto')
const cloudinary = require('cloudinary')
const sendEmail = require('../utils/sendEmail')

exports.registerUser = async (req, res, next) => {
    try {
        console.log('Register request received:', { name: req.body.name, email: req.body.email });
        
        const { name, email, password, avatar } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User already exists with this email'
            });
        }

        // Upload avatar to Cloudinary
        const result = await cloudinary.v2.uploader.upload(avatar, {
            folder: 'avatars',
            width: 150,
            crop: "scale"
        });

        console.log('Cloudinary upload successful:', result.public_id);

        // Create user (unverified)
        const user = await User.create({
            name,
            email,
            password,
            avatar: {
                public_id: result.public_id,
                url: result.secure_url
            },
            isVerified: false
        });

        // Generate verification token
        const verificationToken = user.getVerificationToken();
        await user.save({ validateBeforeSave: false });

        // Create verification URL
        const verificationUrl = `${req.protocol}://${req.get('host')}/api/v1/verify-email/${verificationToken}`;

        const message = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                    <h1 style="color: white; margin: 0;">🌸 Welcome to Our Flower Shop!</h1>
                </div>
                <div style="background-color: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                    <h2 style="color: #333;">Hello ${name}! 👋</h2>
                    <p style="color: #666; font-size: 16px; line-height: 1.6;">
                        Thank you for registering with us! We're excited to have you join our community.
                    </p>
                    <p style="color: #666; font-size: 16px; line-height: 1.6;">
                        To complete your registration and start shopping for beautiful flowers, please verify your email address by clicking the button below:
                    </p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${verificationUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 25px; font-weight: bold; font-size: 16px; display: inline-block;">
                            ✓ Verify Email Address
                        </a>
                    </div>
                    <p style="color: #999; font-size: 14px; line-height: 1.6;">
                        Or copy and paste this link in your browser:<br>
                        <a href="${verificationUrl}" style="color: #667eea; word-break: break-all;">${verificationUrl}</a>
                    </p>
                    <p style="color: #999; font-size: 14px; line-height: 1.6; margin-top: 20px;">
                        ⏰ This verification link will expire in 24 hours.
                    </p>
                    <p style="color: #999; font-size: 14px; line-height: 1.6;">
                        If you didn't create an account with us, please ignore this email.
                    </p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                    <p style="color: #999; font-size: 12px; text-align: center;">
                        © 2025 Flower Shop. All rights reserved.
                    </p>
                </div>
            </div>
        `;

        try {
            await sendEmail({
                email: user.email,
                subject: '🌸 Verify Your Email - Flower Shop',
                message
            });

            console.log('Verification email sent successfully to:', user.email);

            return res.status(201).json({
                success: true,
                message: `Verification email sent to ${user.email}. Please check your inbox to verify your account.`
            });
        } catch (error) {
            // If email fails, delete the user
            await User.findByIdAndDelete(user._id);
            await cloudinary.v2.uploader.destroy(result.public_id);
            
            console.error('Email sending failed:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to send verification email. Please try again.'
            });
        }
    } catch (error) {
        console.error('Registration error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Registration failed'
        });
    }
}

exports.googleLogin = async (req, res, next) => {
    try {
        const { email, name, googleId, avatar } = req.body;

        console.log('Google login request:', { email, name });

        // Check if user already exists
        let user = await User.findOne({ email });

        if (user) {
            // User exists, just login
            console.log('Existing user found, logging in:', user._id);
        } else {
            // Create new user with Google data
            console.log('Creating new user from Google data');
            
            user = await User.create({
                name,
                email,
                password: Math.random().toString(36).slice(-8) + googleId, // Random password (won't be used)
                avatar: {
                    public_id: `google_${googleId}`,
                    url: avatar || 'https://via.placeholder.com/150'
                },
                googleId: googleId,
                isVerified: true // Google users are auto-verified
            });

            console.log('New user created:', user._id);
        }

        const token = user.getJwtToken();

        return res.status(200).json({
            success: true,
            user,
            token
        });
    } catch (error) {
        console.error('Google login error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Google login failed'
        });
    }
};

exports.facebookLogin = async (req, res, next) => {
    try {
        const { email, name, facebookId, avatar } = req.body;

        console.log('Facebook login request:', { email, name });

        // Check if user already exists
        let user = await User.findOne({ email });

        if (user) {
            // User exists, just login
            console.log('Existing user found, logging in:', user._id);
        } else {
            // Create new user with Facebook data
            console.log('Creating new user from Facebook data');
            
            user = await User.create({
                name,
                email,
                password: Math.random().toString(36).slice(-8) + facebookId, // Random password (won't be used)
                avatar: {
                    public_id: `facebook_${facebookId}`,
                    url: avatar || 'https://via.placeholder.com/150'
                },
                facebookId: facebookId,
                isVerified: true // Facebook users are auto-verified
            });

            console.log('New user created:', user._id);
        }

        const token = user.getJwtToken();

        return res.status(200).json({
            success: true,
            user,
            token
        });
    } catch (error) {
        console.error('Facebook login error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Facebook login failed'
        });
    }
};

exports.loginUser = async (req, res, next) => {
    const { email, password } = req.body;

    // Checks if email and password is entered by user
    if (!email || !password) {
        return res.status(400).json({ error: 'Please enter email & password' })
    }

    // Finding user in database
    let user = await User.findOne({ email }).select('+password')
    if (!user) {
        return res.status(401).json({ message: 'Invalid Email or Password' })
    }

    // Check if user is verified (skip for Google users)
    if (!user.isVerified && !user.googleId) {
        return res.status(403).json({ 
            success: false,
            message: 'Please verify your email before logging in. Check your inbox for the verification link.' 
        })
    }

    // Checks if password is correct or not
    const isPasswordMatched = await user.comparePassword(password);

    if (!isPasswordMatched) {
        return res.status(401).json({ message: 'Invalid Email or Password' })
    }
    const token = user.getJwtToken();

    res.status(201).json({
        success: true,
        token,
        user
    });
}

exports.forgotPassword = async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        return res.status(404).json({ error: 'User not found with this email' })

    }
    // Get reset token
    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });
    // Create reset password url
    const resetUrl = `${req.protocol}://localhost:5173/password/reset/${resetToken}`;
    const message = `Your password reset token is as follow:\n\n${resetUrl}\n\nIf you have not requested this email, then ignore it.`
    try {
        await sendEmail({
            email: user.email,
            subject: 'FleurEase Password Recovery',
            message
        })

        res.status(200).json({
            success: true,
            message: `Email sent to: ${user.email}`
        })

    } catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save({ validateBeforeSave: false });
        return res.status(500).json({ error: error.message })
      
    }
}

exports.resetPassword = async (req, res, next) => {
    console.log(req.params.token)
    // Hash URL token
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex')
    const user = await User.findOne({
        resetPasswordExpire: { $gt: Date.now() }
    })
    console.log(user)

    if (!user) {
        return res.status(400).json({ message: 'Password reset token is invalid or has been expired' })
        
    }

    if (req.body.password !== req.body.confirmPassword) {
        return res.status(400).json({ message: 'Password does not match' })

    }

    // Setup new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    const token = user.getJwtToken();
    return res.status(201).json({
        success: true,
        token,
        user
    });
   
}

exports.getUserProfile = async (req, res, next) => {
    const user = await User.findById(req.user.id);
    console.log(user)

    return res.status(200).json({
        success: true,
        user
    })
}

exports.updateProfile = async (req, res, next) => {

    const newUserData = {
        name: req.body.name,
        email: req.body.email,
        address: req.body.address || '',
        city: req.body.city || '',
        postalCode: req.body.postalCode || '',
        phoneNo: req.body.phoneNo || ''
    }

    // Update avatar
    if (req.body.avatar !== '') {
        let user = await User.findById(req.user.id)
        
        const image_id = user.avatar.public_id;
        const res = await cloudinary.v2.uploader.destroy(image_id);
        
        const result = await cloudinary.v2.uploader.upload(req.body.avatar, {
            folder: 'avatars',
            width: 150,
            crop: "scale"
        })

        newUserData.avatar = {
            public_id: result.public_id,
            url: result.secure_url
        }
    }
    const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
        new: true,
        runValidators: true,
    })
    if (!user) {
        return res.status(401).json({ message: 'User Not Updated' })
    }

    return res.status(200).json({
        success: true,
        user
    })
}

exports.updatePassword = async (req, res, next) => {
    console.log(req.body.password)
    const user = await User.findById(req.user.id).select('+password');
    // Check previous user password
    const isMatched = await user.comparePassword(req.body.oldPassword)
    if (!isMatched) {
        return res.status(400).json({ message: 'Old password is incorrect' })
    }
    user.password = req.body.password;
    await user.save();
    const token = user.getJwtToken();

    return res.status(201).json({
        success: true,
        user,
        token
    });

}

exports.allUsers = async (req, res, next) => {
    const users = await User.find();
    res.status(200).json({
        success: true,
        users
    })
}

exports.deleteUser = async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return res.status(401).json({ message: `User does not found with id: ${req.params.id}` })
    }

    // Remove avatar from cloudinary
    const image_id = user.avatar.public_id;
    await cloudinary.v2.uploader.destroy(image_id);
    await User.findByIdAndDelete(req.params.id);
    return res.status(200).json({
        success: true,
    })
}

exports.getUserDetails = async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return res.status(400).json({ message: `User does not found with id: ${req.params.id}` })
    }

    res.status(200).json({
        success: true,
        user
    })
}

exports.updateUser = async (req, res, next) => {
    const newUserData = {
        role: req.body.role
    }

    const user = await User.findByIdAndUpdate(req.params.id, newUserData, {
        new: true,
        runValidators: true,
    })

    return res.status(200).json({
        success: true,
        user
    })
}

exports.suspendUser = async (req, res, next) => {
    try {
        const { reason, subject } = req.body;
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Update user suspension status
        user.isSuspended = true;
        user.suspensionReason = reason || 'No reason provided';
        await user.save();

        // Send email notification
        const message = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #6b46c1 0%, #8b5cf6 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                    <h1 style="color: white; margin: 0;">🌸 FleurEase</h1>
                </div>
                <div style="background-color: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
                    <h2 style="color: #6b46c1; margin-top: 0;">${subject || 'Account Suspended'}</h2>
                    <p style="color: #333; font-size: 16px; line-height: 1.6;">
                        Dear ${user.name},
                    </p>
                    <p style="color: #333; font-size: 16px; line-height: 1.6;">
                        Your account has been suspended by an administrator.
                    </p>
                    <div style="background-color: white; padding: 20px; border-left: 4px solid #dc3545; margin: 20px 0; border-radius: 5px;">
                        <strong style="color: #dc3545;">Reason:</strong>
                        <p style="color: #666; margin: 10px 0 0 0;">${reason || 'No reason provided'}</p>
                    </div>
                    <p style="color: #333; font-size: 16px; line-height: 1.6;">
                        If you believe this is a mistake, please contact our support team.
                    </p>
                    <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
                    <p style="color: #999; font-size: 14px; text-align: center;">
                        © ${new Date().getFullYear()} FleurEase. All rights reserved.
                    </p>
                </div>
            </div>
        `;

        await sendEmail({
            email: user.email,
            subject: subject || 'Your FleurEase Account Has Been Suspended',
            message
        });

        return res.status(200).json({
            success: true,
            message: 'User suspended and notification email sent'
        });
    } catch (error) {
        console.error('Suspend user error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Error suspending user'
        });
    }
}

exports.unsuspendUser = async (req, res, next) => {
    try {
        const { reason, subject } = req.body;
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Update user suspension status
        user.isSuspended = false;
        user.suspensionReason = '';
        await user.save();

        // Send email notification
        const message = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #6b46c1 0%, #8b5cf6 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                    <h1 style="color: white; margin: 0;">🌸 FleurEase</h1>
                </div>
                <div style="background-color: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
                    <h2 style="color: #28a745; margin-top: 0;">${subject || 'Account Reactivated'}</h2>
                    <p style="color: #333; font-size: 16px; line-height: 1.6;">
                        Dear ${user.name},
                    </p>
                    <p style="color: #333; font-size: 16px; line-height: 1.6;">
                        Good news! Your account has been reactivated by an administrator.
                    </p>
                    <div style="background-color: white; padding: 20px; border-left: 4px solid #28a745; margin: 20px 0; border-radius: 5px;">
                        <strong style="color: #28a745;">Message:</strong>
                        <p style="color: #666; margin: 10px 0 0 0;">${reason || 'Your account is now active and you can continue using our services.'}</p>
                    </div>
                    <p style="color: #333; font-size: 16px; line-height: 1.6;">
                        You can now log in and access all features of FleurEase.
                    </p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/login" 
                           style="background: linear-gradient(135deg, #6b46c1 0%, #8b5cf6 100%); 
                                  color: white; 
                                  padding: 15px 40px; 
                                  text-decoration: none; 
                                  border-radius: 25px; 
                                  font-weight: bold;
                                  display: inline-block;">
                            Login to Your Account
                        </a>
                    </div>
                    <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
                    <p style="color: #999; font-size: 14px; text-align: center;">
                        © ${new Date().getFullYear()} FleurEase. All rights reserved.
                    </p>
                </div>
            </div>
        `;

        await sendEmail({
            email: user.email,
            subject: subject || 'Your FleurEase Account Has Been Reactivated',
            message
        });

        return res.status(200).json({
            success: true,
            message: 'User unsuspended and notification email sent'
        });
    } catch (error) {
        console.error('Unsuspend user error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Error unsuspending user'
        });
    }
}

exports.addToWishlist = async (req, res, next) => {
    try {
        const { productId } = req.body;
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if product already in wishlist
        const isInWishlist = user.wishlist.includes(productId);

        if (isInWishlist) {
            return res.status(400).json({
                success: false,
                message: 'Product already in wishlist'
            });
        }

        user.wishlist.push(productId);
        await user.save();

        return res.status(200).json({
            success: true,
            message: 'Product added to wishlist',
            wishlist: user.wishlist
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || 'Error adding to wishlist'
        });
    }
}

exports.removeFromWishlist = async (req, res, next) => {
    try {
        const { productId } = req.params;
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        user.wishlist = user.wishlist.filter(id => id.toString() !== productId);
        await user.save();

        return res.status(200).json({
            success: true,
            message: 'Product removed from wishlist',
            wishlist: user.wishlist
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || 'Error removing from wishlist'
        });
    }
}

exports.getWishlist = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).populate('wishlist');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        return res.status(200).json({
            success: true,
            wishlist: user.wishlist
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || 'Error fetching wishlist'
        });
    }
}

exports.verifyEmail = async (req, res, next) => {
    try {
        // Hash the token from URL
        const verificationToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

        const user = await User.findOne({
            verificationToken,
            verificationTokenExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).send(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Verification Failed</title>
                    <style>
                        body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
                        .container { background: white; padding: 40px; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.2); text-align: center; max-width: 500px; }
                        h1 { color: #e74c3c; margin-bottom: 20px; }
                        p { color: #666; font-size: 16px; line-height: 1.6; }
                        .icon { font-size: 60px; margin-bottom: 20px; }
                        a { display: inline-block; margin-top: 20px; padding: 12px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 25px; font-weight: bold; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="icon">❌</div>
                        <h1>Verification Failed</h1>
                        <p>Your verification link is invalid or has expired.</p>
                        <p>Please register again or contact support.</p>
                        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/register">Go to Register</a>
                    </div>
                </body>
                </html>
            `);
        }

        // Verify the user
        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpire = undefined;
        await user.save();

        console.log('User verified successfully:', user.email);

        return res.status(200).send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Email Verified!</title>
                <style>
                    body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
                    .container { background: white; padding: 40px; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.2); text-align: center; max-width: 500px; }
                    h1 { color: #27ae60; margin-bottom: 20px; }
                    p { color: #666; font-size: 16px; line-height: 1.6; }
                    .icon { font-size: 60px; margin-bottom: 20px; }
                    a { display: inline-block; margin-top: 20px; padding: 12px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 25px; font-weight: bold; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="icon">✅</div>
                    <h1>Email Verified Successfully!</h1>
                    <p>Your email has been verified. You can now log in to your account.</p>
                    <p>Welcome to our Flower Shop! 🌸</p>
                    <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/login">Go to Login</a>
                </div>
            </body>
            </html>
        `);
    } catch (error) {
        console.error('Email verification error:', error);
        return res.status(500).send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Error</title>
                <style>
                    body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
                    .container { background: white; padding: 40px; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.2); text-align: center; max-width: 500px; }
                    h1 { color: #e74c3c; margin-bottom: 20px; }
                    p { color: #666; font-size: 16px; line-height: 1.6; }
                    .icon { font-size: 60px; margin-bottom: 20px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="icon">⚠️</div>
                    <h1>Something Went Wrong</h1>
                    <p>An error occurred during verification. Please try again later.</p>
                </div>
            </body>
            </html>
        `);
    }
}

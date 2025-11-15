const Order = require('../models/order');
const Product = require('../models/product');
const User = require('../models/user');
const sendEmail = require('../utils/sendEmail');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Create a new order   =>  /api/v1/order/new
exports.newOrder = async (req, res, next) => {
    const {
        orderItems,
        shippingInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        paymentInfo

    } = req.body;

    const order = await Order.create({
        orderItems,
        shippingInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        paymentInfo,
        paidAt: Date.now(),
        user: req.user._id
    })

    res.status(200).json({
        success: true,
        order
    })
}

exports.myOrders = async (req, res, next) => {
    const orders = await Order.find({ user: req.user.id })
    
    res.status(200).json({
        success: true,
        orders
    })
}

exports.getSingleOrder = async (req, res, next) => {
    const order = await Order.findById(req.params.id).populate('user', 'name email')
    if (!order) {
        res.status(404).json({
            message: 'No Order found with this ID',

        })
    }
    res.status(200).json({
        success: true,
        order
    })
}

exports.allOrders = async (req, res, next) => {
    const orders = await Order.find().populate('user', 'name email')
    
    let totalAmount = 0;

    orders.forEach(order => {
        totalAmount += order.totalPrice
    })

    res.status(200).json({
        success: true,
        totalAmount,
        orders
    })
}

exports.deleteOrder = async (req, res, next) => {
    const order = await Order.findByIdAndDelete(req.params.id)

    if (!order) {
        return res.status(400).json({
            message: 'No Order found with this ID',

        })
      
    }
    return res.status(200).json({
        success: true
    })
}

exports.updateOrder = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id).populate('user', 'name email')
        
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            })
        }

        if (order.orderStatus === 'Delivered') {
            return res.status(400).json({
                success: false,
                message: 'You have already delivered this order'
            })
        }

        // Update stock for each product
        for (const item of order.orderItems) {
            await updateStock(item.product, item.quantity)
        }

        order.orderStatus = req.body.status
        order.deliveredAt = Date.now()
        await order.save()

        // Generate PDF Receipt
        const pdfPath = await generatePDFReceipt(order);

        // Send email with PDF attachment
        await sendOrderEmail(order, pdfPath);

        // Clean up PDF file after sending
        fs.unlinkSync(pdfPath);

        res.status(200).json({
            success: true,
            message: 'Order updated and email sent successfully'
        })
    } catch (error) {
        console.error('Update order error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error updating order'
        })
    }
}

async function updateStock(id, quantity) {
    const product = await Product.findById(id);

    product.stock = product.stock - quantity;

    await product.save({ validateBeforeSave: false })
}

exports.totalOrders = async (req, res, next) => {
    const totalOrders = await Order.aggregate([
        {
            $group: {
                _id: null,
                count: { $sum: 1 }
            }
        }
    ])
    if (!totalOrders) {
        return res.status(404).json({
            message: 'error total orders',
        })
    }
    res.status(200).json({
        success: true,
        totalOrders
    })

}

exports.totalSales = async (req, res, next) => {
    const totalSales = await Order.aggregate([
        {
            $group: {
                _id: null,
                totalSales: { $sum: "$totalPrice" }
            }
        }
    ])
    if (!totalSales) {
        return res.status(404).json({
            message: 'error total sales',
        })
    }
    res.status(200).json({
        success: true,
        totalSales
    })
}

exports.customerSales = async (req, res, next) => {
    const customerSales = await Order.aggregate([
        {
            $lookup: {
                from: 'users',
                localField: 'user',
                foreignField: '_id',
                as: 'userDetails'
            },
        },

        { $unwind: "$userDetails" },
        {
            $group: {
                _id: "$user",
                total: { $sum: "$totalPrice" },
                doc: { "$first": "$$ROOT" },

            }
        },

        {
            $replaceRoot: {
                newRoot: { $mergeObjects: [{ total: '$total' }, '$doc'] },
            },
        },
        
        {
            $project: {
                _id: 0,
                "userDetails.name": 1,
                total: 1,
            }
        },
        { $sort: { total: -1 } },

    ])
    console.log(customerSales)
    if (!customerSales) {
        return res.status(404).json({
            message: 'error customer sales',
        })


    }
    
    res.status(200).json({
        success: true,
        customerSales
    })

}

exports.salesPerMonth = async (req, res, next) => {
    const salesPerMonth = await Order.aggregate([

        {
            $group: {
                _id: {
                    year: { $year: "$paidAt" },
                    month: { $month: "$paidAt" }
                },
                total: { $sum: "$totalPrice" },
            },
        },

        {
            $addFields: {
                month: {
                    $let: {
                        vars: {
                            monthsInString: [, 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', ' Sept', 'Oct', 'Nov', 'Dec']
                        },
                        in: {
                            $arrayElemAt: ['$$monthsInString', "$_id.month"]
                        }
                    }
                }
            }
        },
        { $sort: { "_id.month": 1 } },
        {
            $project: {
                _id: 0,
                month: 1,
                total: 1,
            }
        }

    ])
    if (!salesPerMonth) {
        return res.status(404).json({
            message: 'error sales per month',
        })
    }
    
    res.status(200).json({
        success: true,
        salesPerMonth
    })

}

// Generate PDF Receipt
async function generatePDFReceipt(order) {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 50 });
            const fileName = `receipt-${order._id}.pdf`;
            const filePath = path.join(__dirname, '..', 'uploads', fileName);

            // Ensure uploads directory exists
            const uploadsDir = path.join(__dirname, '..', 'uploads');
            if (!fs.existsSync(uploadsDir)) {
                fs.mkdirSync(uploadsDir, { recursive: true });
            }

            const stream = fs.createWriteStream(filePath);
            doc.pipe(stream);

            // Header with gradient effect
            doc.rect(0, 0, doc.page.width, 150).fill('#6b46c1');
            
            // Company Logo/Name
            doc.fontSize(32)
               .fillColor('#ffffff')
               .text('🌸 FleurEase', 50, 40, { align: 'left' });
            
            doc.fontSize(12)
               .fillColor('#e9d5ff')
               .text('Fresh Flowers Delivered with Love', 50, 80);

            // Receipt Title
            doc.fontSize(24)
               .fillColor('#ffffff')
               .text('ORDER RECEIPT', 50, 110, { align: 'left' });

            // Reset to black for body
            doc.fillColor('#000000');

            // Order Information
            let yPosition = 180;
            
            doc.fontSize(10)
               .fillColor('#666666')
               .text('ORDER DETAILS', 50, yPosition);
            
            yPosition += 20;
            
            doc.fontSize(11)
               .fillColor('#000000')
               .text(`Order ID: ${order._id}`, 50, yPosition)
               .text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, 350, yPosition);
            
            yPosition += 15;
            doc.text(`Status: ${order.orderStatus}`, 50, yPosition)
               .text(`Payment: ${order.paymentInfo.status || 'Paid'}`, 350, yPosition);

            yPosition += 30;

            // Customer Information
            doc.fontSize(10)
               .fillColor('#666666')
               .text('CUSTOMER INFORMATION', 50, yPosition);
            
            yPosition += 20;
            
            doc.fontSize(11)
               .fillColor('#000000')
               .text(`Name: ${order.user.name}`, 50, yPosition);
            
            yPosition += 15;
            doc.text(`Email: ${order.user.email}`, 50, yPosition);

            yPosition += 30;

            // Shipping Information
            doc.fontSize(10)
               .fillColor('#666666')
               .text('SHIPPING ADDRESS', 50, yPosition);
            
            yPosition += 20;
            
            doc.fontSize(11)
               .fillColor('#000000')
               .text(`${order.shippingInfo.address}`, 50, yPosition);
            
            yPosition += 15;
            doc.text(`${order.shippingInfo.city}, ${order.shippingInfo.postalCode}`, 50, yPosition);
            
            yPosition += 15;
            doc.text(`${order.shippingInfo.country}`, 50, yPosition);
            
            yPosition += 15;
            doc.text(`Phone: ${order.shippingInfo.phoneNo}`, 50, yPosition);

            yPosition += 40;

            // Order Items Table
            doc.fontSize(10)
               .fillColor('#666666')
               .text('ORDER ITEMS', 50, yPosition);
            
            yPosition += 25;

            // Table Header
            doc.rect(50, yPosition, 500, 25).fill('#f8f9fa');
            doc.fillColor('#6b46c1')
               .fontSize(10)
               .text('Product', 60, yPosition + 8)
               .text('Quantity', 300, yPosition + 8)
               .text('Price', 400, yPosition + 8)
               .text('Subtotal', 480, yPosition + 8);

            yPosition += 25;

            // Table Rows
            doc.fillColor('#000000').fontSize(10);
            order.orderItems.forEach((item, index) => {
                if (yPosition > 700) {
                    doc.addPage();
                    yPosition = 50;
                }

                const bgColor = index % 2 === 0 ? '#ffffff' : '#f8f9fa';
                doc.rect(50, yPosition, 500, 30).fill(bgColor);
                
                doc.fillColor('#000000')
                   .text(item.name, 60, yPosition + 10, { width: 220 })
                   .text(item.quantity.toString(), 310, yPosition + 10)
                   .text(`₱${item.price.toLocaleString()}`, 400, yPosition + 10)
                   .text(`₱${(item.price * item.quantity).toLocaleString()}`, 480, yPosition + 10);
                
                yPosition += 30;
            });

            yPosition += 20;

            // Totals Section
            const totalsX = 350;
            doc.fontSize(11);
            
            doc.fillColor('#666666')
               .text('Subtotal:', totalsX, yPosition)
               .fillColor('#000000')
               .text(`₱${order.itemsPrice.toLocaleString()}`, 480, yPosition, { align: 'right' });
            
            yPosition += 20;
            doc.fillColor('#666666')
               .text('Tax (12%):', totalsX, yPosition)
               .fillColor('#000000')
               .text(`₱${order.taxPrice.toLocaleString()}`, 480, yPosition, { align: 'right' });
            
            yPosition += 20;
            doc.fillColor('#666666')
               .text('Shipping:', totalsX, yPosition)
               .fillColor('#000000')
               .text(`₱${order.shippingPrice.toLocaleString()}`, 480, yPosition, { align: 'right' });
            
            yPosition += 25;
            
            // Grand Total with highlight
            doc.rect(350, yPosition - 5, 200, 30).fill('#6b46c1');
            doc.fontSize(14)
               .fillColor('#ffffff')
               .text('GRAND TOTAL:', totalsX + 10, yPosition + 5)
               .text(`₱${order.totalPrice.toLocaleString()}`, 480, yPosition + 5, { align: 'right' });

            yPosition += 50;

            // Footer
            doc.fontSize(9)
               .fillColor('#999999')
               .text('Thank you for your purchase!', 50, yPosition, { align: 'center', width: 500 });
            
            yPosition += 15;
            doc.text('For any questions, please contact us at homehaven984@gmail.com', 50, yPosition, { align: 'center', width: 500 });

            doc.end();

            stream.on('finish', () => {
                resolve(filePath);
            });

            stream.on('error', (err) => {
                reject(err);
            });

        } catch (error) {
            reject(error);
        }
    });
}

// Send Order Email with PDF
async function sendOrderEmail(order, pdfPath) {
    const message = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #6b46c1 0%, #8b5cf6 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="color: white; margin: 0;">🌸 FleurEase</h1>
                <p style="color: #e9d5ff; margin: 10px 0 0 0;">Order Status Updated</p>
            </div>
            
            <div style="background-color: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
                <h2 style="color: #6b46c1; margin-top: 0;">Hello ${order.user.name}!</h2>
                
                <p style="color: #333; font-size: 16px; line-height: 1.6;">
                    Your order status has been updated to: <strong style="color: #6b46c1;">${order.orderStatus}</strong>
                </p>

                <div style="background-color: white; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #6b46c1;">
                    <h3 style="color: #6b46c1; margin-top: 0;">Order Summary</h3>
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr style="background-color: #f8f9fa;">
                                <th style="padding: 10px; text-align: left; border-bottom: 2px solid #6b46c1;">Product</th>
                                <th style="padding: 10px; text-align: center; border-bottom: 2px solid #6b46c1;">Qty</th>
                                <th style="padding: 10px; text-align: right; border-bottom: 2px solid #6b46c1;">Price</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${order.orderItems.map(item => `
                                <tr>
                                    <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
                                    <td style="padding: 10px; text-align: center; border-bottom: 1px solid #eee;">${item.quantity}</td>
                                    <td style="padding: 10px; text-align: right; border-bottom: 1px solid #eee;">₱${(item.price * item.quantity).toLocaleString()}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    
                    <div style="margin-top: 20px; padding-top: 15px; border-top: 2px solid #6b46c1;">
                        <table style="width: 100%;">
                            <tr>
                                <td style="padding: 5px; color: #666;">Subtotal:</td>
                                <td style="padding: 5px; text-align: right; font-weight: bold;">₱${order.itemsPrice.toLocaleString()}</td>
                            </tr>
                            <tr>
                                <td style="padding: 5px; color: #666;">Tax (12%):</td>
                                <td style="padding: 5px; text-align: right; font-weight: bold;">₱${order.taxPrice.toLocaleString()}</td>
                            </tr>
                            <tr>
                                <td style="padding: 5px; color: #666;">Shipping:</td>
                                <td style="padding: 5px; text-align: right; font-weight: bold;">₱${order.shippingPrice.toLocaleString()}</td>
                            </tr>
                            <tr style="background-color: #6b46c1; color: white;">
                                <td style="padding: 10px; font-size: 18px; font-weight: bold;">Grand Total:</td>
                                <td style="padding: 10px; text-align: right; font-size: 18px; font-weight: bold;">₱${order.totalPrice.toLocaleString()}</td>
                            </tr>
                        </table>
                    </div>
                </div>

                <p style="color: #333; font-size: 14px;">
                    Please find your detailed receipt attached to this email.
                </p>

                <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
                
                <p style="color: #999; font-size: 14px; text-align: center;">
                    Thank you for choosing FleurEase! 🌸<br>
                    © ${new Date().getFullYear()} FleurEase. All rights reserved.
                </p>
            </div>
        </div>
    `;

    await sendEmail({
        email: order.user.email,
        subject: `FleurEase - Order ${order._id} Status Updated to ${order.orderStatus}`,
        message,
        attachments: [
            {
                filename: `receipt-${order._id}.pdf`,
                path: pdfPath
            }
        ]
    });
}

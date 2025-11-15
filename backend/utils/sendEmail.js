const nodemailer = require('nodemailer');

const sendEmail = async options => {
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        auth: {
            user: process.env.SMTP_EMAIL,
            pass: process.env.SMTP_PASSWORD
        }
    });

    const message = {
        from: `${process.env.SMTP_FROM_NAME} <${process.env.SMTP_FROM_EMAIL}>`,
        to: options.email,
        subject: options.subject,
        html: options.message.includes('<') ? options.message : `<p>${options.message}</p>`
    }

    // Add attachments if provided
    if (options.attachments) {
        message.attachments = options.attachments;
    }

    await transporter.sendMail(message)
}

module.exports = sendEmail;

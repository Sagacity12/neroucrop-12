import nodemailer from 'nodemailer';
import createHttpError from 'http-errors';
import logger from '../config/logger.js';

/**
 * Configure email transporter for sending emails
 * @returns {nodemailer.Transporter} Configured email transporter
 */
const createTransporter = () => {
    // For production, use actual SMTP settings
    // For development/testing, use a service like Ethereal or Mailtrap
    
    // Check for email configuration in environment variables
    if (!process.env.EMAIL_HOST || !process.env.EMAIL_PORT || 
        !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        logger.warn('Email configuration missing - notifications will be logged but not sent');
        
        // Return a mock transporter that just logs emails
        return {
            sendMail: async (mailOptions) => {
                logger.info(`[EMAIL MOCK] Would send email: ${JSON.stringify(mailOptions)}`);
                return { messageId: `mock-${Date.now()}` };
            }
        };
    }
    
    return nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: process.env.EMAIL_PORT === '465', // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
};

/**
 * Send an email notification
 * @param {Object} emailData - Email data including to, subject, text, html
 * @returns {Promise<Object>} Email send result
 */
export const sendEmail = async (emailData) => {
    try {
        const { to, subject, text, html } = emailData;
        
        // Validate email data
        if (!to || !subject || (!text && !html)) {
            throw createHttpError(400, 'Invalid email data: to, subject, and text/html are required');
        }
        
        const transporter = createTransporter();
        
        const mailOptions = {
            from: process.env.EMAIL_FROM || '"AgricSmart" <no-reply@agricsmart.com>',
            to,
            subject,
            text,
            html: html || text // Fall back to text if no HTML
        };
        
        const info = await transporter.sendMail(mailOptions);
        logger.info(`Email sent: ${info.messageId}`);
        
        return info;
    } catch (error) {
        logger.error(`Error sending email: ${error.message}`);
        throw createHttpError(500, `Failed to send email: ${error.message}`);
    }
};

/**
 * Generate order notification email content
 * @param {string} type - Notification type: new-order, order-update, etc.
 * @param {Object} data - Order and user data
 * @returns {Object} Email subject and content
 */
export const generateOrderEmailContent = (type, data) => {
    const { order, buyer, seller, productDetails } = data;
    
    switch (type) {
        case 'new-order': {
            // Email to seller about new order
            const subject = `New Order #${order._id} Received`;
            
            const text = `
Dear ${seller.fullname},

You have received a new order #${order._id}.

Order Details:
- Date: ${new Date(order.createdAt).toLocaleString()}
- Total Amount: ${order.totalAmount} ${order.currency || 'GHS'}
- Payment Method: ${order.paymentMethod}
- Payment Status: ${order.paymentStatus}
- Delivery Method: ${order.deliveryMethod}

Products:
${productDetails.map(product => 
    `- ${product.name} (${product.quantity} × ${product.price} = ${product.quantity * product.price} GHS)`
).join('\n')}

Buyer Information:
- Name: ${buyer.fullname}
- Email: ${buyer.email}
- Phone: ${buyer.phone}

Delivery Address:
${order.deliveryAddress.street}
${order.deliveryAddress.city}, ${order.deliveryAddress.state}
${order.deliveryAddress.country} ${order.deliveryAddress.postalCode || ''}

Please log in to your account to process this order.

Thank you,
AgricSmart Team
            `;
            
            return { subject, text };
        }
        
        case 'order-status-update': {
            // Email to buyer about order status update
            const statusText = {
                'processing': 'being processed',
                'shipped': 'shipped',
                'delivered': 'delivered',
                'cancelled': 'cancelled'
            };
            
            const subject = `Order #${order._id} ${statusText[order.orderStatus] || 'Updated'}`;
            
            const text = `
Dear ${buyer.firstname},

Your order #${order._id} has been ${statusText[order.orderStatus] || 'updated'}.

Order Details:
- Date: ${new Date(order.createdAt).toLocaleString()}
- Status: ${order.orderStatus.toUpperCase()}
- Total Amount: ${order.totalAmount} ${order.currency || 'GHS'}

${order.orderStatus === 'shipped' ? `
Tracking Information:
- Shipping Method: ${order.deliveryMethod}
- Estimated Delivery: ${new Date(Date.now() + 7*24*60*60*1000).toLocaleDateString()}
` : ''}

Products:
${productDetails.map(product => 
    `- ${product.name} (${product.quantity})`
).join('\n')}

${order.orderStatus === 'cancelled' ? `
Reason for Cancellation:
${order.cancellationReason || 'No reason provided'}

If you have already paid for this order, a refund will be issued.
` : ''}

${order.notes ? `Additional Notes: ${order.notes}` : ''}

Thank you for shopping with us!

AgricSmart Team
            `;
            
            return { subject, text };
        }
        
        case 'payment-received': {
            // Email to seller about payment received
            const subject = `Payment Received for Order #${order._id}`;
            
            const text = `
Dear ${seller.firstname},

You have received payment for order #${order._id}.

Payment Details:
- Amount: ${order.totalAmount} ${order.currency || 'GHS'}
- Payment Method: ${order.paymentMethod}
- Transaction ID: ${order.transactionId || 'N/A'}

Please process this order at your earliest convenience.

Thank you,
AgricSmart Team
            `;
            
            return { subject, text };
        }
        
        default:
            return {
                subject: `AgricSmart Order Update`,
                text: `There has been an update to your order #${order._id}. Please log in to your account for details.`
            };
    }
};

/**
 * Generate education notification email content
 * @param {string} type - Notification type: enrollment, completion, certificate
 * @param {Object} data - Course and user data
 * @returns {Object} Email subject and content
 */
export const generateEducationEmailContent = (type, data) => {
  const { course, user, certificate } = data;
  
  switch (type) {
    case 'enrollment': {
      // Email for course enrollment confirmation
      const subject = `Welcome to ${course.title}`;
      
      const text = `
Dear ${user.firstname},

Congratulations on enrolling in "${course.title}"!

Course Details:
- Duration: ${course.duration / (60 * 24 * 7)} weeks
- Level: ${course.level}
- Instructor: ${course.instructor.firstname} ${course.instructor.lastname}

You can start learning right away by visiting your course dashboard:
https://agricsmart.com/education/courses/${course.slug}

What you'll learn:
${course.modules.map(module => `- ${module.title}`).join('\n')}

We're excited to have you on this learning journey!

Best regards,
The AgricSmart Education Team
      `;
      
      return { subject, text };
    }
    
    case 'completion': {
      // Email for course completion
      const subject = `Congratulations on Completing ${course.title}`;
      
      const text = `
Dear ${user.firstname},

Congratulations on successfully completing "${course.title}"!

This is a significant achievement and demonstrates your commitment to advancing your agricultural knowledge and skills.

Your certificate of completion is now available. You can view and download it from your dashboard:
https://agricsmart.com/education/certificates

Key skills you've gained:
${course.tags.map(tag => `- ${tag.charAt(0).toUpperCase() + tag.slice(1)}`).join('\n')}

We hope you found the course valuable and encourage you to explore our other offerings to continue your learning journey.

Best regards,
The AgricSmart Education Team
      `;
      
      return { subject, text };
    }
    
    case 'certificate': {
      // Email for certificate generation
      const subject = `Your Certificate for ${course.title}`;
      
      const text = `
Dear ${user.firstname},

Your certificate for completing "${course.title}" has been generated!

Certificate Details:
- Certificate ID: ${certificate.certificateId}
- Issue Date: ${new Date(certificate.issueDate).toLocaleDateString()}
- Course: ${course.title}

You can view and download your certificate using this link:
${certificate.verificationLink}

This certificate verifies that you have successfully completed all course requirements and demonstrates your proficiency in this subject area.

You can share this certificate on your professional profiles or with potential employers to showcase your agricultural expertise.

Congratulations again on your achievement!

Best regards,
The AgricSmart Education Team
      `;
      
      return { subject, text };
    }
    
    default:
      return {
        subject: `AgricSmart Education Update`,
        text: `There has been an update to your course "${course.title}". Please log in to your account for details.`
      };
  }
};

/**
 * Send education notification email
 * @param {string} type - Notification type: enrollment, completion, certificate
 * @param {Object} data - Course and user data
 * @returns {Promise<Object>} Email send result
 */
export const sendEducationEmail = async (type, data) => {
  try {
    const { user } = data;
    
    // Generate email content
    const { subject, text } = generateEducationEmailContent(type, data);
    
    // Send email
    return await sendEmail({
      to: user.email,
      subject,
      text
    });
  } catch (error) {
    logger.error(`Error sending education email: ${error.message}`);
    // Don't throw error to prevent disrupting the main flow
    return { error: error.message };
  }
}; 
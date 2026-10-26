export const orderReceiptTemplate = ({ name, orderId, items, totalAmt, deliveryDate, address }) => {
    const frontendUrl = (process.env.FRONTEND_URL || 'https://tracly.store').trim().replace(/\/$/, '');

    const formattedDate = new Date(deliveryDate).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });

    const itemsHtml = items.map(item => `
        <tr style="border-bottom: 1px solid #edf2f7;">
            <td style="padding: 12px 0; font-size: 14px; color: #2d3748; font-weight: 600; vertical-align: middle;">
                <table cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
                    <tr>
                        <td style="padding-right: 12px; vertical-align: middle;">
                            <img src="${item.image || 'https://placehold.co/80x80?text=Product'}" style="width: 40px; height: 40px; object-fit: contain; border-radius: 8px; border: 1px solid #edf2f7; display: block;" alt="${item.name}" />
                        </td>
                        <td style="vertical-align: middle; font-size: 14px; color: #2d3748; font-weight: 600;">
                            ${item.name}
                        </td>
                    </tr>
                </table>
            </td>
            <td style="padding: 12px 0; font-size: 14px; color: #718096; text-align: center; vertical-align: middle;">${item.quantity}</td>
            <td style="padding: 12px 0; font-size: 14px; color: #2d3748; text-align: right; font-weight: 600; vertical-align: middle;">₹${item.price}</td>
        </tr>
    `).join('');

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Order Confirmation</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f7fafc; margin: 0; padding: 40px 0;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0;">
            
            <tr>
                <td style="background: linear-gradient(135deg, #1a202c 0%, #2d3748 100%); padding: 40px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 900; letter-spacing: -1px; text-transform: uppercase;">TRACE</h1>
                    <p style="color: #cbd5e0; margin: 10px 0 0 0; font-size: 14px; font-weight: bold; letter-spacing: 2px; text-transform: uppercase;">Order Confirmed</p>
                </td>
            </tr>
            
            
            <tr>
                <td style="padding: 40px;">
                    <p style="font-size: 16px; color: #4a5568; margin-top: 0; font-weight: 500;">Hello <strong>${name || 'Customer'}</strong>,</p>
                    <p style="font-size: 15px; color: #718096; line-height: 1.6; margin-bottom: 30px;">Thank you for your order! We are excited to let you know that your order has been received and is being prepared for shipment.</p>
                    
                    
                    <table width="100%" cellpadding="16" cellspacing="0" style="background-color: #f8fafc; border-radius: 16px; border: 1px solid #edf2f7; margin-bottom: 30px;">
                        <tr>
                            <td>
                                <table width="100%" cellpadding="0" cellspacing="0">
                                    <tr>
                                        <td style="font-size: 12px; color: #a0aec0; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; padding-bottom: 4px;">Order ID</td>
                                        <td style="font-size: 12px; color: #a0aec0; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; padding-bottom: 4px; text-align: right;">Estimated Delivery</td>
                                    </tr>
                                    <tr>
                                        <td style="font-size: 16px; color: #1a202c; font-weight: 900;">#${orderId}</td>
                                        <td style="font-size: 16px; color: #1a202c; font-weight: 900; text-align: right; color: #38a169;">${formattedDate}</td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>

                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${frontendUrl}/dashboard/order-details/${orderId}" 
                           style="display: inline-block; background-color: #1a202c; color: #ffffff; text-decoration: none; font-weight: 700; font-size: 14px; padding: 14px 32px; border-radius: 12px; text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 4px 12px rgba(26, 32, 44, 0.15);">
                            Track Order
                        </a>
                    </div>

                    
                    <h3 style="font-size: 12px; color: #a0aec0; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; border-bottom: 2px solid #edf2f7; padding-bottom: 8px; margin-bottom: 12px;">Order Summary</h3>
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
                        <thead>
                            <tr>
                                <th align="left" style="padding-bottom: 8px; font-size: 12px; color: #a0aec0; text-transform: uppercase;">Item</th>
                                <th align="center" style="padding-bottom: 8px; font-size: 12px; color: #a0aec0; text-transform: uppercase; width: 60px;">Qty</th>
                                <th align="right" style="padding-bottom: 8px; font-size: 12px; color: #a0aec0; text-transform: uppercase; width: 100px;">Price</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${itemsHtml}
                            
                            <tr>
                                <td colspan="2" style="padding: 20px 0 0 0; font-size: 16px; font-weight: 800; color: #1a202c;">Grand Total</td>
                                <td align="right" style="padding: 20px 0 0 0; font-size: 20px; font-weight: 900; color: #1a202c; border-top: 2px dashed #edf2f7;">₹${totalAmt}</td>
                            </tr>
                        </tbody>
                    </table>

                    
                    <h3 style="font-size: 12px; color: #a0aec0; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; border-bottom: 2px solid #edf2f7; padding-bottom: 8px; margin-bottom: 12px;">Delivery Address</h3>
                    <p style="font-size: 14px; color: #4a5568; line-height: 1.6; background-color: #f8fafc; padding: 16px; border-radius: 16px; border: 1px solid #edf2f7; margin-top: 0;">
                        ${address}
                    </p>
                </td>
            </tr>
            
            
            <tr>
                <td style="background-color: #f7fafc; padding: 30px; text-align: center; border-top: 1px solid #edf2f7;">
                    <p style="font-size: 12px; color: #a0aec0; margin: 0; line-height: 1.5;">If you have any questions, please contact our support team at sivareddy03457@gmail.com.</p>
                    <p style="font-size: 12px; color: #a0aec0; margin: 10px 0 0 0; font-weight: bold;">© ${new Date().getFullYear()} TRACE. All rights reserved.</p>
                </td>
            </tr>
        </table>
    </body>
    </html>
    `;
};

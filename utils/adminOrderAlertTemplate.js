export const adminOrderAlertTemplate = ({
    orderId,
    customerName,
    customerEmail,
    customerMobile,
    address,
    items,
    totalAmt,
    subTotalAmt,
    deliveryDate,
    customerQuery
}) => {
    const frontendUrl = (process.env.FRONTEND_URL || 'https://tracly.store').trim().replace(/\/$/, '');

    const formattedDate = deliveryDate ? new Date(deliveryDate).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    }) : 'To be confirmed';

    const orderTime = new Date().toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });

    const itemsHtml = (items || []).map(item => `
        <tr style="border-bottom: 1px solid #edf2f7;">
            <td style="padding: 12px 0; font-size: 14px; color: #2d3748; font-weight: 600; vertical-align: middle;">
                <table cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
                    <tr>
                        <td style="padding-right: 12px; vertical-align: middle;">
                            <img src="${item.image || 'https://placehold.co/80x80?text=Product'}" style="width: 44px; height: 44px; object-fit: contain; border-radius: 8px; border: 1px solid #edf2f7; display: block;" alt="${item.name}" />
                        </td>
                        <td style="vertical-align: middle; font-size: 14px; color: #1a202c; font-weight: 700;">
                            ${item.name}
                        </td>
                    </tr>
                </table>
            </td>
            <td style="padding: 12px 0; font-size: 14px; color: #4a5568; text-align: center; vertical-align: middle; font-weight: 600;">${item.quantity}</td>
            <td style="padding: 12px 0; font-size: 14px; color: #dd6b20; text-align: right; font-weight: 800; vertical-align: middle;">₹${Number(item.price || 0).toLocaleString('en-IN')}</td>
        </tr>
    `).join('');

    const cleanPhone = (customerMobile || '').replace(/[^0-9]/g, '');
    const whatsappUrl = cleanPhone ? `https://wa.me/91${cleanPhone.slice(-10)}?text=Hello%20${encodeURIComponent(customerName || 'Customer')},%20we%20received%20your%20order%20%23${orderId}%20on%20Trace%20Crackers.` : '';

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>New Order & Query Alert - Trace Crackers</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 30px 10px;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="620" style="background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08); border: 1px solid #e2e8f0;">
            
            <!-- Header Banner -->
            <tr>
                <td style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #ea580c 100%); padding: 32px 30px; text-align: center;">
                    <span style="background-color: rgba(255, 255, 255, 0.15); color: #fed7aa; font-size: 11px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase; padding: 4px 12px; border-radius: 20px; display: inline-block; margin-bottom: 8px;">
                        🚨 New Order & Query Alert
                    </span>
                    <h1 style="color: #ffffff; margin: 6px 0 0 0; font-size: 26px; font-weight: 900; letter-spacing: -0.5px; text-transform: uppercase;">TRACE CRACKERS</h1>
                    <p style="color: #cbd5e1; margin: 6px 0 0 0; font-size: 13px; font-weight: 500;">
                        Customer placed an order via Confirm Order. Please contact and update them.
                    </p>
                </td>
            </tr>

            <!-- Urgent Action Notice -->
            <tr>
                <td style="padding: 24px 30px 10px 30px;">
                    <div style="background-color: #fff7ed; border: 1px solid #fed7aa; border-left: 5px solid #ea580c; border-radius: 12px; padding: 16px;">
                        <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                                <td style="vertical-align: top;">
                                    <h3 style="margin: 0 0 4px 0; color: #9a3412; font-size: 14px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">
                                        📞 Action Required: Contact Customer
                                    </h3>
                                    <p style="margin: 0; color: #7c2d12; font-size: 13px; line-height: 1.5;">
                                        The customer has submitted their order/query. Please reach out to them on phone or WhatsApp to verify order items, delivery charges, and provide updates.
                                    </p>
                                </td>
                            </tr>
                        </table>
                    </div>
                </td>
            </tr>

            <!-- Content Area -->
            <tr>
                <td style="padding: 15px 30px 30px 30px;">
                    
                    <!-- Order Meta Card -->
                    <table width="100%" cellpadding="14" cellspacing="0" style="background-color: #f8fafc; border-radius: 14px; border: 1px solid #e2e8f0; margin-bottom: 24px;">
                        <tr>
                            <td width="50%" style="border-right: 1px solid #e2e8f0;">
                                <div style="font-size: 11px; color: #64748b; font-weight: 800; text-transform: uppercase; letter-spacing: 0.8px;">Order ID</div>
                                <div style="font-size: 18px; color: #0f172a; font-weight: 900; margin-top: 2px;">#${orderId}</div>
                                <div style="font-size: 11px; color: #94a3b8; margin-top: 2px;">${orderTime}</div>
                            </td>
                            <td width="50%" style="padding-left: 20px;">
                                <div style="font-size: 11px; color: #64748b; font-weight: 800; text-transform: uppercase; letter-spacing: 0.8px;">Order Total</div>
                                <div style="font-size: 20px; color: #ea580c; font-weight: 900; margin-top: 2px;">₹${Number(totalAmt || 0).toLocaleString('en-IN')}</div>
                                <div style="font-size: 11px; color: #16a34a; font-weight: 700; margin-top: 2px;">Est. Delivery: ${formattedDate}</div>
                            </td>
                        </tr>
                    </table>

                    <!-- Customer Details Card -->
                    <h3 style="font-size: 12px; color: #475569; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin: 0 0 12px 0;">
                        👤 Customer Details
                    </h3>
                    <table width="100%" cellpadding="12" cellspacing="0" style="background-color: #f8fafc; border-radius: 14px; border: 1px solid #e2e8f0; margin-bottom: 24px;">
                        <tr>
                            <td style="font-size: 13px; color: #334155; line-height: 1.8;">
                                <div><strong>Name:</strong> <span style="font-size: 14px; font-weight: 700; color: #0f172a;">${customerName || 'Customer'}</span></div>
                                <div><strong>Phone:</strong> <a href="tel:${cleanPhone}" style="color: #ea580c; font-weight: 800; text-decoration: none;">${customerMobile || 'N/A'}</a> ${cleanPhone ? `&nbsp;|&nbsp; <a href="${whatsappUrl}" target="_blank" style="color: #16a34a; font-weight: 700; text-decoration: none;">💬 WhatsApp</a>` : ''}</div>
                                <div><strong>Email:</strong> <a href="mailto:${customerEmail}" style="color: #0284c7; text-decoration: none;">${customerEmail || 'N/A'}</a></div>
                                <div style="margin-top: 6px; padding-top: 6px; border-top: 1px dashed #cbd5e1;">
                                    <strong>Delivery Address:</strong><br/>
                                    <span style="color: #475569;">${address || 'Address not provided'}</span>
                                </div>
                            </td>
                        </tr>
                    </table>

                    <!-- Customer Query / Note Box -->
                    ${customerQuery ? `
                    <div style="background-color: #fefce8; border: 1px solid #fef08a; border-left: 5px solid #eab308; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
                        <h4 style="margin: 0 0 6px 0; color: #854d0e; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">
                            💬 Customer's Submitted Query / Instructions:
                        </h4>
                        <p style="margin: 0; color: #713f12; font-size: 14px; font-weight: 600; line-height: 1.6; white-space: pre-wrap;">
                            "${customerQuery}"
                        </p>
                    </div>
                    ` : `
                    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 12px 16px; margin-bottom: 24px; color: #64748b; font-size: 12px;">
                        <em>No specific customer notes submitted.</em>
                    </div>
                    `}

                    <!-- Order Items Summary -->
                    <h3 style="font-size: 12px; color: #475569; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin: 0 0 12px 0;">
                        📦 Ordered Items (${(items || []).length})
                    </h3>
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
                        <thead>
                            <tr>
                                <th align="left" style="padding-bottom: 8px; font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Product</th>
                                <th align="center" style="padding-bottom: 8px; font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; width: 60px;">Qty</th>
                                <th align="right" style="padding-bottom: 8px; font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; width: 100px;">Price</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${itemsHtml}
                            <tr>
                                <td colspan="2" style="padding: 14px 0 0 0; font-size: 15px; font-weight: 800; color: #0f172a;">
                                    Total Order Value:
                                </td>
                                <td align="right" style="padding: 14px 0 0 0; font-size: 18px; font-weight: 900; color: #ea580c; border-top: 2px solid #e2e8f0;">
                                    ₹${Number(totalAmt || 0).toLocaleString('en-IN')}
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    <!-- Action Buttons -->
                    <div style="text-align: center; margin: 30px 0 10px 0;">
                        <a href="${frontendUrl}/admin-portal/orders" 
                           style="display: inline-block; background: linear-gradient(135deg, #ea580c 0%, #c2410c 100%); color: #ffffff; text-decoration: none; font-weight: 800; font-size: 13px; padding: 14px 28px; border-radius: 12px; text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 4px 15px rgba(234, 88, 12, 0.35); margin-right: 8px;">
                            View in Admin Portal
                        </a>
                        ${cleanPhone ? `
                        <a href="tel:${cleanPhone}" 
                           style="display: inline-block; background-color: #0f172a; color: #ffffff; text-decoration: none; font-weight: 700; font-size: 13px; padding: 14px 24px; border-radius: 12px; text-transform: uppercase; letter-spacing: 1px;">
                            📞 Call Customer
                        </a>
                        ` : ''}
                    </div>

                </td>
            </tr>

            <!-- Footer -->
            <tr>
                <td style="background-color: #f8fafc; padding: 24px 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                    <p style="font-size: 12px; color: #64748b; margin: 0; line-height: 1.5;">
                        This is an automated notification from your <strong>Trace Crackers</strong> Store Admin System.
                    </p>
                    <p style="font-size: 11px; color: #94a3b8; margin: 6px 0 0 0;">
                        Admin Portal: <a href="${frontendUrl}/admin-portal/dashboard" style="color: #ea580c; text-decoration: none;">${frontendUrl}/admin-portal</a>
                    </p>
                </td>
            </tr>
        </table>
    </body>
    </html>
    `;
};

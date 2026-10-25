const offerEmailTemplate = ({ 
  name, 
  code, 
  discountPercent, 
  minAmount, 
  maxDiscount, 
  expiryDate, 
  headline, 
  description,
  shopUrl 
}) => {
  const formattedDate = expiryDate ? new Date(expiryDate).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }) : 'Limited Time';

  const safeHeadline = headline || `Exclusive ${discountPercent}% OFF Coupon Just For You!`;
  const safeDesc = description || `We are thrilled to share this special offer. Use the code below during checkout to enjoy fantastic savings on your next grocery haul!`;

  return `
  <!DOCTYPE html>
  <html lang="en" style="margin:0;padding:0;">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Special Offer from Trace</title>
  </head>

  <body style="margin:0;padding:0;background-color:#f3f4f6;font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; -webkit-font-smoothing: antialiased;">

    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="padding: 40px 0; background-color: #f3f4f6;">
      <tr>
        <td align="center">

          <table width="600" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.08);">
            
            <!-- Premium Header Banner -->
            <tr>
              <td style="background-color: #ff8c00; background: linear-gradient(135deg, #ff8c00 0%, #e056fd 100%); padding: 50px 30px; text-align: center; color: #ffffff;">
                <h2 style="margin: 0; font-size: 28px; font-weight: 900; letter-spacing: 2px; text-transform: uppercase; opacity: 0.95;">TRACE</h2>
                <h1 style="margin: 20px 0 10px 0; font-size: 32px; font-weight: 800; line-height: 1.2;">${safeHeadline}</h1>
                <p style="margin: 0; font-size: 18px; font-weight: 500; opacity: 0.9;">Get ready for something special!</p>
              </td>
            </tr>

            <!-- Email Body Content -->
            <tr>
              <td style="padding: 40px 40px 30px 40px;">
                
                <!-- Greeting -->
                <p style="margin: 0 0 15px 0; font-size: 18px; color: #1f2937; font-weight: 600;">
                  Hi ${name},
                </p>

                <!-- Description Message -->
                <p style="margin: 0 0 30px 0; font-size: 16px; color: #4b5563; line-height: 1.7;">
                  ${safeDesc}
                </p>

                <!-- Offer Spotlight Card -->
                <table width="100%" cellspacing="0" cellpadding="0" style="background: #fffcf5; border: 2px dashed #ff8c00; border-radius: 16px; padding: 30px; text-align: center; margin-bottom: 35px;">
                  <tr>
                    <td>
                      <span style="font-size: 14px; color: #ff8c00; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px;">YOUR EXCLUSIVE CODE</span>
                      <div style="display: inline-block; margin: 15px 0; background: #ffffff; border: 1.5px solid #e5e7eb; padding: 12px 30px; border-radius: 12px; font-size: 26px; font-weight: 800; color: #111827; letter-spacing: 3px; text-transform: uppercase; box-shadow: 0 4px 6px rgba(0,0,0,0.02);">
                        ${code}
                      </div>
                      <h3 style="margin: 10px 0; font-size: 24px; color: #1f2937; font-weight: 800;">
                        ${discountPercent}% Instant Discount
                      </h3>
                      <p style="margin: 5px 0 0 0; font-size: 14px; color: #6b7280; font-weight: 500;">
                        ${minAmount > 0 ? `Valid on orders above ₹${minAmount}` : 'Valid on all order values'} 
                        ${maxDiscount > 0 ? `• Max Discount up to ₹${maxDiscount}` : ''}
                      </p>
                    </td>
                  </tr>
                </table>

                <!-- CTA & Validity -->
                <table width="100%" cellspacing="0" cellpadding="0" style="text-align: center;">
                  <tr>
                    <td>
                      <a href="${shopUrl}/shop-now" target="_blank" style="display: inline-block; background-color: #ff8c00; color: #ffffff; text-decoration: none; font-weight: 700; font-size: 16px; padding: 16px 40px; border-radius: 50px; box-shadow: 0 6px 20px rgba(255, 140, 0, 0.35); transition: transform 0.2s;">
                        Shop & Save Now
                      </a>
                      <p style="margin: 20px 0 0 0; font-size: 13px; color: #ef4444; font-weight: 600;">
                        Offer ends on ${formattedDate}
                      </p>
                    </td>
                  </tr>
                </table>

              </td>
            </tr>

            <!-- Separator Divider -->
            <tr>
              <td style="padding: 0 40px;">
                <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 0;" />
              </td>
            </tr>

            <!-- Footer Social/Info -->
            <tr>
              <td style="padding: 30px 40px 40px 40px; text-align: center;">
                <p style="margin: 0 0 10px 0; font-size: 14px; color: #9ca3af;">
                  Need any assistance? We are here to help you!
                </p>
                <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                  &copy; ${new Date().getFullYear()} Trace Grocery. All rights reserved.<br />
                  Tracly Store, Inc.
                </p>
              </td>
            </tr>

          </table>

        </td>
      </tr>
    </table>

  </body>
  </html>
  `;
};

export default offerEmailTemplate;

const productOfferEmailTemplate = ({
  name,
  productName,
  productImage,
  discountPercent,
  price,
  mrp,
  unit,
  productUrl
}) => {
  const calculatedDiscount = discountPercent > 0 
    ? discountPercent 
    : (mrp > 0 ? Math.round(((mrp - price) / mrp) * 100) : 0);

  return `
  <!DOCTYPE html>
  <html lang="en" style="margin:0;padding:0;">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Hot Product Deal!</title>
  </head>

  <body style="margin:0;padding:0;background-color:#f8fafc;font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">

    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="padding: 40px 0; background-color: #f8fafc;">
      <tr>
        <td align="center">

          
          <table width="600" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.03); border: 1px solid #f1f5f9;">
            
            
            <tr>
              <td style="background: linear-gradient(135deg, #22c55e, #16a34a); padding: 15px 30px; text-align: center; color: #ffffff;">
                <div style="font-size: 12px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; display: flex; align-items: center; justify-content: center; gap: 8px;">
                  🔥 Fresh Arrival & Hot Discount!
                </div>
              </td>
            </tr>

            
            <tr>
              <td style="padding: 40px 40px 20px 40px;">
                <p style="margin: 0 0 12px 0; font-size: 18px; color: #0f172a; font-weight: 700; letter-spacing: -0.2px;">
                  Hi ${name},
                </p>
                <p style="margin: 0; font-size: 15px; color: #475569; line-height: 1.6;">
                  We've just added a brand-new product to our catalog, and we are kicking things off with an unbeatable introductory discount! Check it out below:
                </p>
              </td>
            </tr>

            
            <tr>
              <td style="padding: 0 40px 40px 40px;">
                <table width="100%" cellspacing="0" cellpadding="0" style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden;">
                  
                  
                  <tr>
                    <td align="center" style="padding: 40px 20px; position: relative; background-color: #ffffff; border-bottom: 1px solid #f1f5f9;">
                      ${calculatedDiscount > 0 ? `
                      <div style="display: inline-block; background-color: #dc2626; color: #ffffff; font-size: 12px; font-weight: 900; padding: 6px 14px; border-radius: 50px; text-transform: uppercase; letter-spacing: 0.5px; box-shadow: 0 4px 12px rgba(220, 38, 38, 0.25); margin-bottom: 20px;">
                        💥 SAVE ${calculatedDiscount}% OFF
                      </div>
                      ` : ''}
                      
                      <div>
                        <img src="${productImage}" alt="${productName}" width="200" style="max-width: 100%; height: auto; display: block; margin: 0 auto; mix-blend-mode: multiply;" />
                      </div>
                    </td>
                  </tr>

                  
                  <tr>
                    <td style="padding: 30px; text-align: center;">
                      <h3 style="margin: 0 0 6px 0; font-size: 20px; color: #0f172a; font-weight: 800; letter-spacing: -0.3px; text-transform: uppercase;">
                        ${productName}
                      </h3>
                      <span style="font-size: 13px; font-weight: 600; color: #64748b; display: block; margin-bottom: 20px;">
                        Unit Size: ${unit || '1 Piece'}
                      </span>

                      
                      <table cellspacing="0" cellpadding="0" style="margin: 0 auto 25px auto;">
                        <tr>
                          <td style="font-size: 32px; font-weight: 900; color: #0f172a; padding-right: 10px;">
                            ₹${price}
                          </td>
                          ${mrp > price ? `
                          <td style="font-size: 18px; font-weight: 600; color: #94a3b8; text-decoration: line-through; vertical-align: middle; padding-top: 4px;">
                            ₹${mrp}
                          </td>
                          ` : ''}
                        </tr>
                      </table>

                      
                      <table width="100%" cellspacing="0" cellpadding="0">
                        <tr>
                          <td align="center">
                            <a href="${productUrl}" target="_blank" style="display: inline-block; background: #16a34a; color: #ffffff; text-decoration: none; font-weight: 700; font-size: 15px; padding: 16px 40px; border-radius: 12px; box-shadow: 0 8px 20px rgba(22, 163, 74, 0.2); transition: background 0.2s;">
                              Shop This Deal
                            </a>
                          </td>
                        </tr>
                      </table>

                    </td>
                  </tr>

                </table>
              </td>
            </tr>

            
            <tr>
              <td style="padding: 0 40px;">
                <div style="border-top: 1px solid #f1f5f9; height: 1px;"></div>
              </td>
            </tr>

            
            <tr>
              <td style="padding: 30px 40px 40px 40px; text-align: center;">
                <p style="margin: 0 0 12px 0; font-size: 13px; color: #64748b; line-height: 1.5;">
                  Hurry, stock is limited and these introductory offers can end at any time! Reply to this email if you need assistance.
                </p>
                <p style="margin: 0; font-size: 12px; color: #94a3b8;">
                  &copy; ${new Date().getFullYear()} Trace Grocery. All rights reserved.<br/>
                  Fresh groceries, delivered instantly.
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

export default productOfferEmailTemplate;

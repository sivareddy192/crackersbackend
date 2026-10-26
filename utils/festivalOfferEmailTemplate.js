const festivalOfferEmailTemplate = ({
  name,
  title,
  subTitle,
  image,
  discountPercent,
  couponCode,
  targetUrl
}) => {
  return `
  <!DOCTYPE html>
  <html lang="en" style="margin:0;padding:0;">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title || "Festive Special Deal!"}</title>
  </head>

  <body style="margin:0;padding:0;background-color:#fffbeb;font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">

    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="padding: 40px 0; background-color: #fffbeb;">
      <tr>
        <td align="center">

          
          <table width="600" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 15px 35px rgba(180, 83, 9, 0.08); border: 2px solid #fde68a;">
            
            
            <tr>
              <td style="background: linear-gradient(135deg, #ea580c, #d97706); padding: 18px 30px; text-align: center; color: #ffffff;">
                <div style="font-size: 13px; font-weight: 900; letter-spacing: 3px; text-transform: uppercase; display: inline-flex; align-items: center; justify-content: center; gap: 8px;">
                  🎉 CELEBRATION DEALS ACTIVE 🎉
                </div>
              </td>
            </tr>

            
            <tr>
              <td style="padding: 40px 40px 20px 40px; text-align: center;">
                <h1 style="margin: 0 0 10px 0; font-size: 24px; color: #92400e; font-weight: 900; letter-spacing: -0.5px; text-transform: uppercase;">
                   Light Up Your Celebrations!
                </h1>
                <p style="margin: 0 0 8px 0; font-size: 16px; color: #1f2937; font-weight: 700;">
                  Hi ${name || 'Valued Shopper'},
                </p>
                <p style="margin: 0 auto; max-width: 460px; font-size: 14px; color: #6b7280; line-height: 1.6;">
                  We've just launched a super exclusive **Festive Special Deal** just for you! Double your savings this festive season with unbelievable storewide offers.
                </p>
              </td>
            </tr>

            
            <tr>
              <td style="padding: 0 40px 40px 40px;">
                <table width="100%" cellspacing="0" cellpadding="0" style="background: #fffaf0; border: 2px dashed #fcd34d; border-radius: 20px; overflow: hidden;">
                  
                  
                  ${image ? `
                  <tr>
                    <td align="center" style="padding: 0; background-color: #f3f4f6; position: relative;">
                       <img src="${image}" alt="${title}" width="600" style="width: 100%; height: auto; display: block; margin: 0 auto;" />
                    </td>
                  </tr>
                  ` : ''}

                  
                  <tr>
                    <td style="padding: 30px; text-align: center; background-color: #ffffff;">
                      
                      ${discountPercent > 0 ? `
                      <div style="display: inline-block; background: linear-gradient(to right, #dc2626, #f97316); color: #ffffff; font-size: 13px; font-weight: 900; padding: 8px 16px; border-radius: 8px; text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 4px 15px rgba(234, 88, 12, 0.25); margin-bottom: 16px;">
                         🔥 ${discountPercent}% OFF SAVINGS ACTIVE
                      </div>
                      ` : ''}

                      <h2 style="margin: 0 0 8px 0; font-size: 26px; color: #d97706; font-weight: 900; letter-spacing: -0.3px; text-transform: uppercase;">
                        ${title}
                      </h2>
                      
                      ${subTitle ? `
                      <p style="font-size: 14px; font-weight: 600; color: #4b5563; margin: 0 0 20px 0; line-height: 1.4;">
                        ${subTitle}
                      </p>
                      ` : ''}

                      
                      ${couponCode ? `
                      <div style="display: inline-block; background-color: #fef3c7; border: 2px dashed #f59e0b; border-radius: 12px; padding: 14px 24px; margin-bottom: 25px; text-align: center;">
                         <span style="display: block; font-size: 10px; font-weight: 800; color: #b45309; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px;">
                           Use Coupon Code At Checkout:
                         </span>
                         <span style="font-size: 20px; font-weight: 900; color: #78350f; letter-spacing: 2px; font-family: monospace;">
                           ${couponCode}
                         </span>
                      </div>
                      ` : ''}

                      
                      <table width="100%" cellspacing="0" cellpadding="0">
                        <tr>
                          <td align="center">
                            <a href="${targetUrl}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #ea580c, #e11d48); color: #ffffff; text-decoration: none; font-weight: 900; font-size: 16px; text-transform: uppercase; letter-spacing: 1px; padding: 18px 44px; border-radius: 14px; box-shadow: 0 10px 25px rgba(234, 88, 12, 0.3); transition: all 0.3s;">
                              Claim Your Offer Now 🚀
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
                <div style="border-top: 1px solid #fef3c7; height: 1px;"></div>
              </td>
            </tr>

            
            <tr>
              <td style="padding: 35px 40px 40px 40px; text-align: center;">
                <p style="margin: 0 0 12px 0; font-size: 12px; color: #92400e; font-weight: 600; line-height: 1.6;">
                  *This exclusive festive deal is valid for a limited time only. Discounts can be updated or terminated without notice. Shop while supplies last!
                </p>
                <p style="margin: 0; font-size: 12px; color: #b45309; opacity: 0.7;">
                  &copy; ${new Date().getFullYear()} Trace E-Commerce. Light up your festive season with style.<br/>
                  Fresh groceries, fast deliveries.
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

export default festivalOfferEmailTemplate;

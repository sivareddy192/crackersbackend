const welcomeOfferTemplate = ({
  name,
  code,
  discountPercent,
  minAmount,
  maxDiscount,
  shopUrl,
  deals = []
}) => {
  const firstName = name ? name.split(' ')[0] : 'Friend';

  let dealsHtml = '';
  if (deals && deals.length > 0) {
    dealsHtml = `
    
    <table width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 15px;">
      <tr>
        <td align="left">
          <span style="font-size: 11px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 1.5px;">Hot Deals For You</span>
        </td>
        <td align="right">
          <span style="background: #fee2e2; color: #dc2626; font-size: 10px; font-weight: 900; padding: 3px 8px; border-radius: 50px; text-transform: uppercase; letter-spacing: 1px;">Trending</span>
        </td>
      </tr>
    </table>

    
    <table width="100%" cellspacing="0" cellpadding="0" border="0" style="table-layout: fixed; margin-bottom: 20px;">
      <tr>
        ${deals.slice(0, 3).map((deal, idx) => {
          const imgUrl = (deal.image && deal.image.length > 0) ? deal.image[0] : 'https://placehold.co/200x200?text=Product';
          const discVal = deal.mrp > 0 ? Math.round(((deal.mrp - deal.price) / deal.mrp) * 100) : deal.discount;
          
          return `
          <td width="33.33%" valign="top" style="padding: 0 ${idx === 1 ? '8px' : '0px'};">
            <div style="background: #ffffff; border: 1px solid #edf2f7; border-radius: 16px; padding: 12px; text-align: center;">
              
              
              ${discVal > 0 ? `
                <div style="text-align: left; margin-bottom: 6px; height: 18px;">
                  <span style="background-color: #16a34a; color: #ffffff; font-size: 9px; font-weight: 900; padding: 2px 6px; border-radius: 50px; text-transform: uppercase; display: inline-block;">
                    ${discVal}% OFF
                  </span>
                </div>
              ` : '<div style="height: 18px; margin-bottom: 6px;"></div>'}
              
              
              <div style="width: 100%; background-color: #f8fafc; background: #f8fafc; border-radius: 12px; text-align: center; padding: 10px 0;">
                <img src="${imgUrl}" style="max-width: 80px; height: 80px; object-fit: contain; display: block; margin: 0 auto;" />
              </div>

              
              <div style="margin-top: 12px; text-align: left;">
                <h4 style="margin: 0; font-size: 11px; font-weight: 850; color: #1e293b; height: 26px; overflow: hidden; line-height: 1.2; text-transform: uppercase; letter-spacing: -0.2px;">
                  ${deal.name}
                </h4>
                <span style="font-size: 9px; font-weight: 700; color: #94a3b8; display: block; margin-top: 2px;">
                  ${deal.unit || '1 unit'}
                </span>
                
                <div style="margin-top: 8px;">
                  <span style="font-size: 14px; font-weight: 900; color: #0f172a;">₹${deal.price}</span>
                  ${deal.mrp > deal.price ? `
                    <span style="font-size: 10px; color: #94a3b8; text-decoration: line-through; font-weight: 600; margin-left: 4px;">₹${deal.mrp}</span>
                  ` : ''}
                </div>
              </div>

            </div>
          </td>
          `;
        }).join('')}
      </tr>
    </table>
    `;
  }

  return `
  <!DOCTYPE html>
  <html lang="en" style="margin:0;padding:0;">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Welcome to Trace!</title>
  </head>

  <body style="margin:0;padding:0;background-color:#f1f5f9;font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; -webkit-font-smoothing: antialiased;">

    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="padding: 40px 0; background-color: #f1f5f9;">
      <tr>
        <td align="center">

          
          <table width="600" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0;">
            
            
            <tr>
              <td style="background-color: #ef4444; background: linear-gradient(135deg, #f97316 0%, #ef4444 55%, #a855f7 100%); padding: 60px 40px; text-align: center; color: #ffffff; border-top-left-radius: 24px; border-top-right-radius: 24px;">
                
                
                <div style="display: inline-block; background-color: rgba(255, 255, 255, 0.25); border: 1.5px solid rgba(255, 255, 255, 0.4); padding: 5px 16px; border-radius: 50px; margin-bottom: 16px; font-size: 10px; font-weight: 900; letter-spacing: 2px; text-transform: uppercase;">
                  Welcome Gift 🎁
                </div>
                
                <h1 style="margin: 0 0 10px 0; font-size: 34px; font-weight: 900; letter-spacing: -1px; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                  Welcome to Trace, ${firstName}!
                </h1>
                
                <p style="margin: 0 auto; font-size: 15px; font-weight: 500; opacity: 0.95; max-width: 400px; line-height: 1.45;">
                  We're thrilled to have you! To start your journey, we've prepared these exclusive introductory offers just for you.
                </p>
              </td>
            </tr>

            
            <tr>
              <td style="background: #f8fafc; padding: 30px 30px 15px 30px;">
                
                
                <table width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 25px;">
                  
                  
                  <tr>
                    <td align="left" style="padding-bottom: 10px;">
                      <span style="font-size: 11px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 1.5px;">Exclusive Starter Promo</span>
                    </td>
                    <td align="right" style="padding-bottom: 10px;">
                      <span style="color: #ef4444; font-size: 11px; font-weight: 800;">One-time Only!</span>
                    </td>
                  </tr>

                  
                  <tr>
                    <td colspan="2">
                      <table width="100%" cellspacing="0" cellpadding="0" border="0" style="background: #ffffff; border: 2px dashed #f97316; border-radius: 20px; padding: 24px; box-shadow: 0 10px 15px -3px rgba(249, 115, 22, 0.05);">
                        <tr>
                          
                          <td valign="middle">
                            <h2 style="margin: 0; font-size: 22px; font-weight: 900; color: #1e293b; letter-spacing: -0.5px;">
                              Get ${discountPercent}% OFF Your Order
                            </h2>
                            <p style="margin: 4px 0 0 0; font-size: 12px; font-weight: 500; color: #64748b;">
                              ${minAmount > 0 ? `Applies on orders over ₹${minAmount}` : 'Applies to any cart value'}
                              ${maxDiscount > 0 ? ` • Max savings ₹${maxDiscount}` : ''}
                            </p>
                          </td>
                          
                          <td width="140" valign="middle" align="right">
                            <div style="background-color: #f97316; background: linear-gradient(to right, #f97316, #db2777); color: #ffffff; font-weight: 900; font-size: 13px; letter-spacing: 1.5px; text-transform: uppercase; padding: 12px 20px; border-radius: 12px; text-align: center;">
                              ${code}
                            </div>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                </table>

                
                ${dealsHtml}

                
                <table width="100%" cellspacing="0" cellpadding="0" border="0" style="margin: 25px 0 10px 0;">
                  <tr>
                    <td align="center">
                      <a href="${shopUrl}/shop-now" target="_blank" style="display: inline-block; background: #0f172a; color: #ffffff; text-decoration: none; font-size: 13px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; padding: 16px 40px; border-radius: 16px; box-shadow: 0 10px 15px -3px rgba(15, 23, 42, 0.2);">
                        Start Shopping Now
                      </a>
                      <p style="margin: 12px 0 0 0; font-size: 10px; color: #94a3b8; font-weight: 600;">
                        *Welcome discount applies automatically on your very first order.
                      </p>
                    </td>
                  </tr>
                </table>

              </td>
            </tr>

            
            <tr>
              <td style="background: #ffffff; padding: 30px 40px; text-align: center; border-top: 1px solid #f1f5f9;">
                <p style="margin: 0 0 10px 0; font-size: 13px; color: #64748b; line-height: 1.5;">
                  If you have any questions, our support team is always here for you. Feel free to reply to this email!
                </p>
                <p style="margin: 0; font-size: 11px; color: #94a3b8; font-weight: 500;">
                  &copy; ${new Date().getFullYear()} Trace Grocery. All rights reserved.<br/>
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

export default welcomeOfferTemplate;

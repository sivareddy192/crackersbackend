const orderPendingTemplate = ({ orderId, totalAmt }) => {
  return `
  <!DOCTYPE html>
  <html lang="en" style="margin:0;padding:0;">
  <head>
    <meta charset="UTF-8" />
    <title>Order Pending</title>
  </head>
  <body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial, sans-serif;">
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="padding:40px 0;background:#f5f5f5;">
      <tr>
        <td align="center">
          <table width="600" cellspacing="0" cellpadding="0" style="background:#ffffff;border-radius:12px;padding:30px;">
            <tr>
              <td align="center" style="padding-bottom:20px;">
                <h2 style="margin:0;font-size:26px;color:#ff8c00;font-weight:800;">TRACLY CRACKERS</h2>
              </td>
            </tr>
            <tr>
              <td style="font-size:16px;color:#333;padding-bottom:10px;">
                Hello,
              </td>
            </tr>
            <tr>
              <td style="font-size:15px;color:#555;line-height:1.6;padding-bottom:20px;">
                Your order <strong>#${orderId}</strong> is currently pending.
                We have received your request and are processing it. The total amount is ₹${totalAmt}.
                Thank you for shopping as a guest with Tracly Crackers!
              </td>
            </tr>
            <tr>
              <td style="padding-top:30px;font-size:12px;color:#888;text-align:center;">
                © ${new Date().getFullYear()} Tracly Crackers. All Rights Reserved.
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
export default orderPendingTemplate;

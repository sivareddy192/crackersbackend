const deliveryOtpTemplate = ({ name, otp, orderId }) => {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Delivery OTP Verification</title>
    </head>
    <body style="margin:0;padding:0;background-color:#f9fafb;font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#f9fafb;padding:40px 20px;">
            <tr>
                <td align="center">
                    <table width="100%" maxWidth="600" border="0" cellspacing="0" cellpadding="0" style="background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06);max-width:600px;">
                        
                        <tr>
                            <td style="background-color:#16a34a;padding:30px;text-align:center;">
                                <h1 style="color:#ffffff;margin:0;font-size:24px;font-weight:800;letter-spacing:-0.025em;text-transform:uppercase;">Tracly Delivery</h1>
                            </td>
                        </tr>
                        
                        
                        <tr>
                            <td style="padding:40px 30px;">
                                <h2 style="color:#111827;margin:0 0 16px 0;font-size:20px;font-weight:700;">Hello ${name || 'Customer'},</h2>
                                <p style="color:#4b5563;margin:0 0 24px 0;font-size:16px;line-height:1.6;">Your delivery boy is at your location for order <strong style="color:#111827;">#${orderId}</strong>. Please provide the OTP below to complete your delivery.</p>
                                
                                <div style="background-color:#f3f4f6;border-radius:12px;padding:30px;text-align:center;margin-bottom:24px;">
                                    <p style="color:#6b7280;margin:0 0 10px 0;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;">Your Verification OTP</p>
                                    <h3 style="color:#16a34a;margin:0;font-size:48px;font-weight:800;letter-spacing:10px;line-height:1;">${otp}</h3>
                                </div>
                                
                                <p style="color:#9ca3af;margin:0;font-size:13px;text-align:center;">This OTP is valid for this delivery only. Please do not share it with anyone else until the delivery boy arrives.</p>
                            </td>
                        </tr>
                        
                        
                        <tr>
                            <td style="background-color:#f9fafb;padding:20px 30px;text-align:center;border-top:1px solid #f3f4f6;">
                                <p style="color:#9ca3af;margin:0;font-size:12px;">© ${new Date().getFullYear()} Tracly Crackers. All rights Reserved.</p>
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

export default deliveryOtpTemplate;

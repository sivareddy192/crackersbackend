const forgotPasswordTemplate = ({ name, otp }) => {
  return `
  <!DOCTYPE html>
  <html lang="en">

  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Reset Your Password</title>
  </head>

  <body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial, Helvetica, sans-serif;">

    <table width="100%" border="0" cellspacing="0" cellpadding="0" 
      style="padding:40px 0;background:#f4f4f4;">
      <tr>
        <td align="center">
          
          
          <table width="600" cellspacing="0" cellpadding="0" 
            style="background:#ffffff;border-radius:12px;padding:30px;box-shadow:0 5px 18px rgba(0,0,0,0.06);">

            
            <tr>
              <td align="center" style="padding-bottom:20px;">
                <h2 style="margin:0;font-size:26px;color:#ff8c00;font-weight:800;">TRACE</h2>
              </td>
            </tr>

            
            <tr>
              <td style="font-size:16px;color:#333;padding-bottom:10px;">
                Hello <strong>${name}</strong>,
              </td>
            </tr>

            
            <tr>
              <td style="font-size:15px;color:#555;line-height:1.6;padding-bottom:20px;">
                We received a request to reset your password for your <strong>Trace Grocery</strong> account.
                Please use the OTP code below to continue with resetting your password.
              </td>
            </tr>

            
            <tr>
              <td align="center" style="padding: 20px 0;">
                <div
                  style="background:green;color:#ffffff; font-size:20px;padding:20px;text-align:center;font-weight : 800;"
                >
                  ${otp}
                </div>
              </td>
            </tr>

            
            <tr>
              <td style="font-size:14px;color:#666;padding-top:10px;text-align:center;">
                This OTP is valid for <strong>5 minutes</strong>.
              </td>
            </tr>

            
            <tr>
              <td style="font-size:14px;color:#555;padding-top:15px;line-height:1.6;">
                Enter this OTP on the Trace website to proceed with the password reset.
                If you did not request this, please ignore this email. Your account remains secure.
              </td>
            </tr>

            
            <tr>
              <td style="padding-top:30px;font-size:12px;color:#888;text-align:center;">
                © ${new Date().getFullYear()} Trace Grocery. All Rights Reserved.
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

export default forgotPasswordTemplate;

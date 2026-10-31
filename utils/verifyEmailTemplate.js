
const verifyEmailTemplate = ({ name, url }) => {
  return `
  <!DOCTYPE html>
  <html lang="en" style="margin:0;padding:0;">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Verify Your Email</title>
  </head>

  <body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial, Helvetica, sans-serif;">

    
    <table width="100%" border="0" cellspacing="0" cellpadding="0" 
      style="padding:40px 0;background:#f5f5f5;">
      <tr>
        <td align="center">

          
          <table width="600" cellspacing="0" cellpadding="0" 
            style="background:#ffffff;border-radius:12px;padding:30px;box-shadow:0 5px 18px rgba(0,0,0,0.06);">

            
            <tr>
              <td align="center" style="padding-bottom:20px;">
                <h2 style="margin:0;font-size:26px;color:#ff8c00;font-weight:800;">TRACLY CRACKERS</h2>
              </td>
            </tr>

            
            <tr>
              <td style="font-size:16px;color:#333;padding-bottom:10px;">
                Hi <strong>${name}</strong>,
              </td>
            </tr>

            
            <tr>
              <td style="font-size:15px;color:#555;line-height:1.6;padding-bottom:20px;">
                Thank you for creating an account on <strong>Tracly Crackers</strong>.
                To complete your registration and secure your account, please verify your email address by clicking the button below.
              </td>
            </tr>

            
            <tr>
              <td align="center" style="padding: 20px 0;">
                <a href="${url}" target="_blank"
                  style="
                    display:inline-block;
                    background:#ff8c00;
                    color:#fff;
                    text-decoration:none;
                    padding:14px 28px;
                    border-radius:6px;
                    font-size:16px;
                    font-weight:600;
                  ">
                  Verify Email
                </a>
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

export default verifyEmailTemplate;

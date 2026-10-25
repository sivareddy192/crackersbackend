/*const verifyEmailTemplate = ({name,url})=>{
    return`
<p>Dear ${name}</p>    
<p>Thank you for registering Trace.</p>   
<a href=${url} style="color:black;background :orange;margin-top : 10px,padding:20px,display:block">
    Verify Email
</a>
`
}

export default verifyEmailTemplate*/

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

    <!-- Container -->
    <table width="100%" border="0" cellspacing="0" cellpadding="0" 
      style="padding:40px 0;background:#f5f5f5;">
      <tr>
        <td align="center">

          <!-- Card -->
          <table width="600" cellspacing="0" cellpadding="0" 
            style="background:#ffffff;border-radius:12px;padding:30px;box-shadow:0 5px 18px rgba(0,0,0,0.06);">

            <!-- Logo -->
            <tr>
              <td align="center" style="padding-bottom:20px;">
                <h2 style="margin:0;font-size:26px;color:#ff8c00;font-weight:800;">TRACE</h2>
              </td>
            </tr>

            <!-- Greeting -->
            <tr>
              <td style="font-size:16px;color:#333;padding-bottom:10px;">
                Hi <strong>${name}</strong>,
              </td>
            </tr>

            <!-- Message -->
            <tr>
              <td style="font-size:15px;color:#555;line-height:1.6;padding-bottom:20px;">
                Thank you for creating an account on <strong>Trace Grocery</strong>.
                To complete your registration and secure your account, please verify your email address by clicking the button below.
              </td>
            </tr>

            <!-- Verify Button -->
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

            

            <!-- Footer -->
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

export default verifyEmailTemplate;

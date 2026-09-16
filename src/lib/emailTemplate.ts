export interface EmailTemplateProps {
  code: string;
  recipientEmail?: string;
  recipientName?: string;
  headerBannerUrl?: string;
  footerWaveUrl?: string;
}

export function generateVerificationEmailHtml({
  code,
  recipientEmail = 'user@example.com',
  recipientName = 'there',
  headerBannerUrl = 'https://files.catbox.moe/fhnjly.png',
  footerWaveUrl = 'https://files.catbox.moe/35cdtc.png',
}: EmailTemplateProps): string {
  // Format code with spaces for text fallback
  const spacedCode = code.split('').join(' ');

  return `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Verify Your Email Address</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F8F5FE; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <!-- Full Width Background Wrapper -->
  <table border="0" cellpadding="0" cellspacing="0" width="100%" bgcolor="#F8F5FE" style="background-color: #F8F5FE; padding: 36px 12px; margin: 0;">
    <tr>
      <td align="center" valign="top">
        <!-- Main Email Container (580px max) -->
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 580px; width: 100%; background-color: #FFFFFF; border-radius: 32px; overflow: hidden; border: 1px solid #E9D5FF; box-shadow: 0 16px 36px rgba(139, 92, 246, 0.12); margin: 0 auto;">
          
          <!-- 1. Header Banner Art (Plushie logo + Mascot Bunny with Quilted Envelope) -->
          <tr>
            <td align="center" style="padding: 0; line-height: 0; background-color: #F5EEFE;">
              <img 
                src="${headerBannerUrl}" 
                alt="Plushie • Cuddles in Every Click" 
                width="580" 
                style="display: block; width: 100%; max-width: 580px; height: auto; border-top-left-radius: 32px; border-top-right-radius: 32px; border: 0; outline: none; text-decoration: none;" 
              />
            </td>
          </tr>

          <!-- 2. Main Content -->
          <tr>
            <td align="center" style="padding: 32px 36px 16px; background-color: #FFFFFF; text-align: center;">
              
              <!-- Headings -->
              <h1 style="margin: 0 0 6px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 32px; font-weight: 800; color: #372365; letter-spacing: -0.5px; line-height: 1.2;">
                Almost There!
              </h1>
              <h2 style="margin: 0 0 24px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 25px; font-weight: 800; color: #4A2E80; letter-spacing: -0.3px; line-height: 1.2;">
                Verify Your Email Address
              </h2>

              <!-- Body Text -->
              <p style="margin: 0 0 10px; font-size: 15px; line-height: 1.6; color: #4A3A69; text-align: left; font-weight: 700;">
                Hi ${recipientName || 'there'},
              </p>
              <p style="margin: 0 0 28px; font-size: 14.5px; line-height: 1.6; color: #584475; text-align: left; font-weight: 400;">
                To complete your account setup and start your plushie adventure, please use the verification code below.
              </p>

              <!-- Verification Code Box -->
              <table border="0" cellpadding="0" cellspacing="0" align="center" style="margin: 0 auto 12px; width: 100%; max-width: 320px;">
                <tr>
                  <td align="center" bgcolor="#F6F3FF" style="background-color: #F6F3FF; border: 2px dashed #C8B8F8; border-radius: 20px; padding: 14px 24px;">
                    <span style="font-family: 'Courier New', Courier, monospace, -apple-system, sans-serif; font-size: 38px; font-weight: 900; letter-spacing: 12px; color: #372365; padding-left: 12px; display: inline-block; line-height: 1;">
                      ${code}
                    </span>
                  </td>
                </tr>
              </table>

              <!-- Expiration Notice -->
              <p style="margin: 0 0 26px; font-size: 13.5px; font-weight: 600; color: #6B568B; text-align: center;">
                This code will expire in 10 minutes.
              </p>

              <!-- Security Notice Box -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #FAF8FE; border: 1px solid #E9D5FF; border-radius: 18px; margin: 0 0 12px; text-align: left;">
                <tr>
                  <td width="48" valign="middle" align="center" style="padding: 14px 0 14px 16px;">
                    <table border="0" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" valign="middle" width="38" height="38" bgcolor="#7C3AED" style="background-color: #7C3AED; border-radius: 12px; color: #FFFFFF; font-size: 18px; line-height: 38px; text-align: center;">
                          🔒
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td valign="middle" align="left" style="padding: 14px 18px 14px 12px;">
                    <div style="font-size: 14px; font-weight: 800; color: #372365; margin-bottom: 3px;">
                      Didn't request this?
                    </div>
                    <div style="font-size: 13px; line-height: 1.45; color: #5D4E75;">
                      If you didn't create an account with Plushie, you can safely ignore this email.
                    </div>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- 3. Footer Section (Love note + Bottom cloud wave art) -->
          <tr>
            <td align="center" style="padding: 0; line-height: 0; background-color: #FFFFFF;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center" style="padding: 16px 0 10px; background-color: #FFFFFF;">
                    <p style="margin: 0; font-size: 13px; font-weight: 700; color: #7C3AED; letter-spacing: 0.3px;">
                      ♥ Made with love by Plushie ♥
                    </p>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="line-height: 0; padding: 0;">
                    <img 
                      src="${footerWaveUrl}" 
                      alt="Cloud wave footer" 
                      width="580" 
                      style="display: block; width: 100%; max-width: 580px; height: auto; border-bottom-left-radius: 32px; border-bottom-right-radius: 32px; border: 0; outline: none;" 
                    />
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

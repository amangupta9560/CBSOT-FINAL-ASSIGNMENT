const transporter = require('../config/nodemailer');

const sendEmail = async (to, subject, htmlContent) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || '"ResearchMind AI" <noreply@researchmind.ai>',
      to,
      subject,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`Email delivery failed: ${error.message}`);
    throw error;
  }
};

const getOTPEmailTemplate = (fullName, otpCode) => {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email</title>
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f9fafb; margin: 0; padding: 20px; }
      .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; border: 1px solid #e5e7eb; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); overflow: hidden; }
      .header { background-color: #2563eb; padding: 24px; text-align: center; }
      .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.025em; }
      .content { padding: 32px 24px; color: #1f2937; line-height: 1.5; }
      .content h2 { font-size: 20px; font-weight: 600; margin-top: 0; color: #111827; }
      .otp-box { background-color: #f3f4f6; border-radius: 6px; border: 1px dashed #d1d5db; padding: 20px; text-align: center; margin: 24px 0; }
      .otp-code { font-size: 32px; font-weight: 700; color: #2563eb; letter-spacing: 0.1em; margin: 0; }
      .warning { font-size: 13px; color: #6b7280; text-align: center; margin-top: 12px; }
      .footer { background-color: #f9fafb; padding: 16px; text-align: center; font-size: 12px; color: #9ca3af; border-top: 1px solid #e5e7eb; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>ResearchMind AI</h1>
      </div>
      <div class="content">
        <h2>Verify Your Email Address</h2>
        <p>Hello ${fullName},</p>
        <p>Thank you for registering with ResearchMind AI. To complete your sign-up and verify your email, please enter the 6-digit One-Time Password (OTP) shown below:</p>
        <div class="otp-box">
          <div class="otp-code">${otpCode}</div>
          <div class="warning">This verification code is valid for <strong>10 minutes</strong>.</div>
        </div>
        <p>If you did not request this registration, you can safely ignore this email.</p>
      </div>
      <div class="footer">
        &copy; ${new Date().getFullYear()} ResearchMind AI. All rights reserved.
      </div>
    </div>
  </body>
  </html>
  `;
};

const getPasswordResetTemplate = (fullName, resetLink) => {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your Password</title>
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f9fafb; margin: 0; padding: 20px; }
      .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; border: 1px solid #e5e7eb; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); overflow: hidden; }
      .header { background-color: #2563eb; padding: 24px; text-align: center; }
      .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.025em; }
      .content { padding: 32px 24px; color: #1f2937; line-height: 1.5; }
      .content h2 { font-size: 20px; font-weight: 600; margin-top: 0; color: #111827; }
      .btn-container { text-align: center; margin: 24px 0; }
      .btn { display: inline-block; background-color: #2563eb; color: #ffffff !important; font-weight: 600; text-decoration: none; padding: 12px 24px; border-radius: 6px; box-shadow: 0 2px 4px rgba(37, 99, 235, 0.2); }
      .warning { font-size: 13px; color: #6b7280; text-align: center; margin-top: 12px; }
      .security-note { font-size: 13px; color: #6b7280; border-left: 3px solid #2563eb; padding-left: 12px; margin-top: 24px; }
      .footer { background-color: #f9fafb; padding: 16px; text-align: center; font-size: 12px; color: #9ca3af; border-top: 1px solid #e5e7eb; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>ResearchMind AI</h1>
      </div>
      <div class="content">
        <h2>Reset Your Password</h2>
        <p>Hello ${fullName},</p>
        <p>You are receiving this email because you (or someone else) requested a password reset for your ResearchMind AI account.</p>
        <p>Please click the button below to choose a new password:</p>
        <div class="btn-container">
          <a href="${resetLink}" class="btn" target="_blank">Reset Password</a>
          <div class="warning">This link will expire in <strong>15 minutes</strong>.</div>
        </div>
        <div class="security-note">
          <strong>Security note:</strong> If you did not make this request, please disregard this email. Your password will remain secure and unchanged.
        </div>
      </div>
      <div class="footer">
        &copy; ${new Date().getFullYear()} ResearchMind AI. All rights reserved.
      </div>
    </div>
  </body>
  </html>
  `;
};

module.exports = {
  sendEmail,
  getOTPEmailTemplate,
  getPasswordResetTemplate,
};

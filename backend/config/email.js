// config/email.js - UPDATED TO ACCEPT PASSWORD FROM FRONTEND
import nodemailer from 'nodemailer';

// Create transporter
const createTransporter = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('Email credentials not configured. Email sending will be disabled.');
    return null;
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Send email function
export const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const transporter = createTransporter();
    
    if (!transporter) {
      console.log('Email not configured. Skipping email send to:', to);
      return { messageId: 'mock-email-id', message: 'Email disabled - no configuration' };
    }

    await transporter.verify();
    
    const info = await transporter.sendMail({
      from: `"Vehicle Terminal System" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
      text: text || html?.replace(/<[^>]*>/g, '')
    });

    console.log('Email sent successfully:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

// Add this to your email.js file
export const sendNewPassword = async (email, newPassword, name) => {
  try {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    
    const subject = 'Your Password Has Been Reset';
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
          }
          .content {
            background: #ffffff;
            padding: 30px;
            border-radius: 0 0 10px 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          .credentials {
            background: #f3f4f6;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #f59e0b;
          }
          .password {
            font-family: monospace;
            font-size: 18px;
            font-weight: bold;
            background: #e5e7eb;
            padding: 8px 12px;
            border-radius: 5px;
            display: inline-block;
            letter-spacing: 1px;
          }
          .button {
            display: inline-block;
            background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
            color: white;
            text-decoration: none;
            padding: 12px 30px;
            border-radius: 5px;
            margin: 20px 0;
            font-weight: bold;
          }
          .footer {
            text-align: center;
            padding: 20px;
            font-size: 12px;
            color: #6b7280;
            border-top: 1px solid #e5e7eb;
            margin-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset</h1>
            <p>Vehicle Terminal Management System</p>
          </div>
          <div class="content">
            <h2>Hello ${name}!</h2>
            <p>An administrator has reset your password.</p>
            
            <div class="credentials">
              <p><strong>📧 Email:</strong> ${email}</p>
              <p><strong>🔑 Your New Password:</strong> <span class="password">${newPassword}</span></p>
            </div>
            
            <center>
              <a href="${frontendUrl}/login" class="button">Login to Your Account</a>
            </center>
            
            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p><small>${frontendUrl}/login</small></p>
            
            <hr>
            <p><small>This is an automated message. For security reasons, please do not reply to this email.</small></p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Vehicle Terminal Management System. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `Your Password Has Been Reset

Hello ${name},

An administrator has reset your password.

Email: ${email}
New Password: ${newPassword}

Login here: ${frontendUrl}/login

This is an automated message, please do not reply.`;

    const info = await sendEmail({ to: email, subject: subject, html: html, text: text });
    return info;
  } catch (error) {
    console.error('Failed to send new password email:', error);
    return null;
  }
};

// Send user credentials with password from frontend
export const sendUserCredentials = async (email, password, name, role) => {
  try {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    
    const subject = 'Your Vehicle Terminal System Account Credentials';
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Account Credentials</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
          }
          .content {
            background: #ffffff;
            padding: 30px;
            border-radius: 0 0 10px 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          .credentials {
            background: #f3f4f6;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #f59e0b;
          }
          .password {
            font-family: monospace;
            font-size: 18px;
            font-weight: bold;
            background: #e5e7eb;
            padding: 8px 12px;
            border-radius: 5px;
            display: inline-block;
            letter-spacing: 1px;
          }
          .button {
            display: inline-block;
            background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
            color: white;
            text-decoration: none;
            padding: 12px 30px;
            border-radius: 5px;
            margin: 20px 0;
            font-weight: bold;
          }
          .info-box {
            background: #e8f4f8;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #2196f3;
          }
          .warning-box {
            background: #fff3e0;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #ff9800;
          }
          .footer {
            text-align: center;
            padding: 20px;
            font-size: 12px;
            color: #6b7280;
            border-top: 1px solid #e5e7eb;
            margin-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to VMS</h1>
            <p>Vehicle Terminal Management System</p>
          </div>
          <div class="content">
            <h2>Hello ${name}!</h2>
            <p>Your account has been created in the Vehicle Terminal Management System with the role of <strong>${role === 'superadmin' ? 'Super Administrator' : 'Administrator'}</strong>.</p>
            
            <div class="credentials">
              <p><strong>📧 Email:</strong> ${email}</p>
              <p><strong>🔑 Your Password:</strong> <span class="password">${password}</span></p>
            </div>
            
            <div class="warning-box">
              <strong>⚠️ Important Security Information:</strong>
              <ul style="margin-top: 10px; margin-bottom: 0;">
                <li>This is the password you created during account setup</li>
                <li>Store it in a secure password manager</li>
                <li>Do not share this password with anyone</li>
                <li>For security reasons, avoid sending this email to others</li>
              </ul>
            </div>
            
            <div class="info-box">
              <strong>ℹ️ Account Information:</strong>
              <ul style="margin-top: 10px; margin-bottom: 0;">
                <li>Use these credentials to log into the system</li>
                <li>You can reset your password from the login page if needed</li>
                <li>Contact your system administrator if you experience any issues</li>
              </ul>
            </div>
            
            <center>
              <a href="${frontendUrl}/login" class="button">Login to Your Account</a>
            </center>
            
            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p><small>${frontendUrl}/login</small></p>
            
            <hr>
            <p><small>This is an automated message. For security reasons, please do not reply to this email.</small></p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Vehicle Terminal Management System. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `Welcome to Vehicle Terminal Management System

Hello ${name},

Your account has been created with the role of ${role === 'superadmin' ? 'Super Administrator' : 'Administrator'}.

Email: ${email}
Password: ${password}

This is the password you created during account setup.

Login here: ${frontendUrl}/login

Important Security Information:
- Store this password in a secure location
- Do not share this password with anyone
- You can reset your password from the login page if needed

This is an automated message, please do not reply.`;

    const info = await sendEmail({ to: email, subject, html, text });
    return info;
  } catch (error) {
    console.error('Failed to send credentials email:', error);
    return null;
  }
};

export const sendPasswordChangedNotification = async (email, name) => {
  try {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    
    const subject = 'Your Password Has Been Changed';
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Changed Notification</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
          }
          .content {
            background: #ffffff;
            padding: 30px;
            border-radius: 0 0 10px 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          .info-box {
            background: #fff3e0;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #ff9800;
          }
          .button {
            display: inline-block;
            background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
            color: white;
            text-decoration: none;
            padding: 12px 30px;
            border-radius: 5px;
            margin: 20px 0;
            font-weight: bold;
          }
          .warning-box {
            background: #ffebee;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #f44336;
          }
          .footer {
            text-align: center;
            padding: 20px;
            font-size: 12px;
            color: #6b7280;
            border-top: 1px solid #e5e7eb;
            margin-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Changed</h1>
            <p>Vehicle Terminal Management System</p>
          </div>
          <div class="content">
            <h2>Hello ${name}!</h2>
            
            <div class="info-box">
              <p><strong>🔐 Your password has been successfully changed.</strong></p>
              <p>If you made this change, you can ignore this email.</p>
            </div>
            
            <div class="warning-box">
              <strong>⚠️ Didn't make this change?</strong>
              <ul style="margin-top: 10px; margin-bottom: 0;">
                <li>Contact your system administrator immediately</li>
                <li>Reset your password again from the login page</li>
                <li>Check your account activity for any suspicious actions</li>
              </ul>
            </div>
            
            <center>
              <a href="${frontendUrl}/login" class="button">Login to Your Account</a>
            </center>
            
            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p><small>${frontendUrl}/login</small></p>
            
            <hr>
            <p><small>This is an automated message. If you didn't change your password, please contact support immediately.</small></p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Vehicle Terminal Management System. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `Password Changed Notification

Hello ${name},

Your password has been successfully changed.

If you made this change, no further action is needed.

If you did NOT make this change, please:
1. Contact your system administrator immediately
2. Reset your password again
3. Review your account activity

Login here: ${frontendUrl}/login

This is an automated message.`;

    const info = await sendEmail({ to: email, subject, html, text });
    return info;
  } catch (error) {
    console.error('Failed to send password change notification:', error);
    return null;
  }
};
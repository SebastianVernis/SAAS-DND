import nodemailer from 'nodemailer';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Verify transporter
export async function verifyEmailService() {
  try {
    await transporter.verify();
    console.log('✅ Email service ready');
    return true;
  } catch (error) {
    console.error('❌ Email service error:', error.message);
    return false;
  }
}

// Load email template
async function loadTemplate(templateName) {
  try {
    const templatePath = path.join(__dirname, '../templates/emails', `${templateName}.html`);
    return await fs.readFile(templatePath, 'utf-8');
  } catch (error) {
    console.error(`Error loading template ${templateName}:`, error);
    return null;
  }
}

// Replace variables in template
function replaceVariables(template, variables) {
  let result = template;
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{{${key}}}`, 'g');
    result = result.replace(regex, value);
  }
  return result;
}

// Send generic email
export async function sendEmail({ to, subject, html, text }) {
  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''), // Strip HTML for text version
    });
    
    console.log(`📧 Email sent to ${to}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
}

// Send OTP verification email
export async function sendOtpEmail({ to, name, code }) {
  const template = await loadTemplate('otp-verification');
  if (!template) {
    throw new Error('OTP email template not found');
  }

  const html = replaceVariables(template, {
    name: name || 'User',
    otpCode: code,
  });

  return sendEmail({
    to,
    subject: '🔐 Verify your email - DragNDrop',
    html,
  });
}

// Send team invitation email
export async function sendTeamInvitationEmail({
  to,
  inviterName,
  organizationName,
  inviteLink,
  message,
  role,
}) {
  const template = await loadTemplate('team-invitation');
  if (!template) {
    throw new Error('Team invitation template not found');
  }

  const html = replaceVariables(template, {
    inviterName,
    organizationName,
    inviteLink,
    message: message || '',
    role: role.charAt(0).toUpperCase() + role.slice(1),
  });

  return sendEmail({
    to,
    subject: `🎨 ${inviterName} invited you to join ${organizationName} on DragNDrop`,
    html,
  });
}

// Send welcome email
export async function sendWelcomeEmail({ to, name, dashboardLink }) {
  const template = await loadTemplate('welcome');
  if (!template) {
    throw new Error('Welcome email template not found');
  }

  const html = replaceVariables(template, {
    name,
    dashboardLink,
  });

  return sendEmail({
    to,
    subject: '🎉 Welcome to DragNDrop!',
    html,
  });
}

// Send subscription confirmation email
export async function sendSubscriptionConfirmationEmail({
  to,
  name,
  planName,
  billingCycle,
  amount,
  nextBillingDate,
  invoiceLink,
}) {
  const template = await loadTemplate('subscription-confirmed');
  if (!template) {
    throw new Error('Subscription confirmation template not found');
  }

  const html = replaceVariables(template, {
    name,
    planName,
    billingCycle: billingCycle === 'yearly' ? 'Annual' : 'Monthly',
    amount,
    nextBillingDate,
    invoiceLink,
  });

  return sendEmail({
    to,
    subject: '✅ Subscription Confirmed - DragNDrop',
    html,
  });
}

export default {
  verifyEmailService,
  sendEmail,
  sendOtpEmail,
  sendTeamInvitationEmail,
  sendWelcomeEmail,
  sendSubscriptionConfirmationEmail,
};

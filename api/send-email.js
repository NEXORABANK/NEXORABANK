// api/send-email.js
import { Resend } from 'resend';

// Vercel will automatically read this from your Environment Variables
const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { toEmail, clientName, amount, newBalance, type } = req.body;

  try {
    const data = await resend.emails.send({
      from: 'Northfunds <onboarding@resend.dev>', // Resend's default testing address
      to: [toEmail],
      subject: `Northfunds: Account ${type} Alert`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #1e293b;">
          <h2 style="color: #0ea5e9;">NORTHFUNDS INC.</h2>
          <p>Dear <strong>${clientName}</strong>,</p>
          <p>A transaction has been posted to your account.</p>
          <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${type === 'Credit' ? '#059669' : '#ef4444'};">
            <p style="margin: 0; font-size: 18px;">Transaction Type: <strong>${type}</strong></p>
            <p style="margin: 10px 0 0 0; font-size: 24px; font-weight: bold;">Amount: £${Number(amount).toLocaleString('en-GB', {minimumFractionDigits: 2})}</p>
          </div>
          <p><strong>Available Ledger Balance:</strong> £${Number(newBalance).toLocaleString('en-GB', {minimumFractionDigits: 2})}</p>
          <p style="margin-top: 30px; font-size: 12px; color: #64748b;">This is an automated message from Northfunds Inc. Please do not reply.</p>
        </div>
      `,
    });

    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
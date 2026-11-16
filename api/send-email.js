// api/send-email.js
export default async function handler(req, res) {
  // Allow cross-origin requests
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS,POST');
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { toEmail, clientName, amount, newBalance, type } = req.body;

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Northfunds <onboarding@resend.dev>',
        to: toEmail, // Must be your verified Resend email during testing
        subject: `Northfunds: Account ${type} Alert`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; color: #1e293b;">
            <h2 style="color: #0ea5e9;">NORTHFUNDS INC.</h2>
            <p>Dear <strong>${clientName}</strong>,</p>
            <p>A transaction has been posted to your account.</p>
            <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${type.includes('Credit') ? '#059669' : '#ef4444'};">
              <p style="margin: 0; font-size: 18px;">Transaction Type: <strong>${type}</strong></p>
              <p style="margin: 10px 0 0 0; font-size: 24px; font-weight: bold;">Amount: £${Number(amount).toLocaleString('en-GB', {minimumFractionDigits: 2})}</p>
            </div>
            <p><strong>Available Ledger Balance:</strong> £${Number(newBalance).toLocaleString('en-GB', {minimumFractionDigits: 2})}</p>
          </div>
        `
      })
    });

    const data = await response.json();
    
    // Catch Resend-specific API errors (like unauthorized email addresses)
    if (data.statusCode >= 400) {
      return res.status(400).json({ error: data.message || 'Resend rejected the email.' });
    }

    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
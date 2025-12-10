/**
 * Vercel Serverless Function - NYOTA Fund Payment Processing
 * Endpoint: /api/payment
 * Uses PayHero M-Pesa STK Push API
 */

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Handle OPTIONS request for CORS
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }

  try {
    // PayHero API Credentials (from environment variables or hardcoded for testing)
    const API_USERNAME = process.env.PAYHERO_USERNAME || 'In4zPhQySfqJUybAylQg';
    const API_PASSWORD = process.env.PAYHERO_PASSWORD || 'U0BIv2Z5RUoqh5opWgQLH9ozKMPayb8nnHpENtB3';
    const ACCOUNT_ID = process.env.PAYHERO_ACCOUNT_ID || '3844';
    const CALLBACK_URL = process.env.PAYHERO_CALLBACK_URL || '';

    // Get and validate request data
    const { name, phone, amount } = req.body;

    // Validate inputs
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please enter your name'
      });
    }

    if (!phone || !/^254[0-9]{9}$/.test(phone)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid phone number (254XXXXXXXXX)'
      });
    }

    if (!amount || amount < 1) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be at least KES 1'
      });
    }

    // Generate unique transaction reference
    const reference = `NYOTA${Date.now()}${Math.floor(Math.random() * 10000)}`;

    // Prepare payment data for PayHero API
    // Following PayHero documentation structure
    const paymentData = {
      amount: parseFloat(amount),
      phone_number: phone,
      channel_id: ACCOUNT_ID,
      provider: 'm-pesa',
      external_reference: reference,
      callback_url: CALLBACK_URL || undefined,
      metadata: {
        customer_name: name,
        loan_reference: reference,
        payment_type: 'nyota_loan'
      }
    };

    console.log('Initiating PayHero M-Pesa STK Push:', {
      amount: paymentData.amount,
      phone: maskPhone(phone),
      reference: reference
    });

    // Create Basic Auth token
    const credentials = Buffer.from(`${API_USERNAME}:${API_PASSWORD}`).toString('base64');
    const authToken = `Basic ${credentials}`;

    // Make request to PayHero API
    const response = await fetch('https://backend.payhero.co.ke/api/v2/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authToken
      },
      body: JSON.stringify(paymentData)
    });

    const responseData = await response.json();

    // Log response for debugging
    console.log('PayHero API Response:', {
      status: response.status,
      success: response.ok,
      data: responseData
    });

    // Check if request was successful
    if (response.ok || response.status === 200 || response.status === 201) {
      return res.status(200).json({
        success: true,
        message: 'Payment request sent successfully! Check your phone for M-Pesa prompt.',
        data: {
          reference: responseData.reference || reference,
          amount: amount,
          phone: maskPhone(phone),
          status: 'pending'
        }
      });
    } else {
      // Handle API errors
      console.error('PayHero API Error:', responseData);
      
      const errorMessage = responseData.message || responseData.error || 'Payment request failed. Please try again.';
      
      return res.status(response.status || 400).json({
        success: false,
        message: errorMessage
      });
    }

  } catch (error) {
    console.error('Payment processing error:', error);
    
    return res.status(500).json({
      success: false,
      message: 'An error occurred while processing your payment. Please try again.'
    });
  }
}

/**
 * Mask phone number for display (254712345678 -> 254712***678)
 */
function maskPhone(phone) {
  if (!phone || phone.length < 10) return phone;
  return phone.substring(0, 6) + '***' + phone.substring(phone.length - 3);
}

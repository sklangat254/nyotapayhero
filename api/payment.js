/**
 * Vercel Serverless Function - NYOTA Fund Payment Processing (DEBUGGED VERSION)
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

  console.log('========================================');
  console.log('NEW PAYMENT REQUEST RECEIVED');
  console.log('========================================');

  try {
    // PayHero API Credentials
    const API_USERNAME = process.env.PAYHERO_USERNAME || 'In4zPhQySfqJUybAylQg';
    const API_PASSWORD = process.env.PAYHERO_PASSWORD || 'U0BIv2Z5RUoqh5opWgQLH9ozKMPayb8nnHpENtB3';
    const ACCOUNT_ID = process.env.PAYHERO_ACCOUNT_ID || '4519';  // Changed to 4519

    console.log('Credentials loaded:');
    console.log('- Username:', API_USERNAME);
    console.log('- Account ID:', ACCOUNT_ID);

    // Get and validate request data
    const { name, phone, amount } = req.body;

    console.log('Request data:');
    console.log('- Name:', name);
    console.log('- Phone:', phone);
    console.log('- Amount:', amount);

    // Validate inputs
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      console.log('❌ Validation failed: Invalid name');
      return res.status(400).json({
        success: false,
        message: 'Please enter your name'
      });
    }

    if (!phone || !/^254[0-9]{9}$/.test(phone)) {
      console.log('❌ Validation failed: Invalid phone format');
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid phone number (254XXXXXXXXX)'
      });
    }

    if (!amount || amount < 1) {
      console.log('❌ Validation failed: Invalid amount');
      return res.status(400).json({
        success: false,
        message: 'Amount must be at least KES 1'
      });
    }

    console.log('✅ All validations passed');

    // Generate unique transaction reference
    const reference = `NYOTA${Date.now()}${Math.floor(Math.random() * 10000)}`;
    console.log('Generated reference:', reference);

    // Prepare payment data - Following PayHero docs exactly
    const paymentData = {
      amount: parseFloat(amount),
      phone_number: phone,
      channel_id: parseInt(ACCOUNT_ID),
      provider: 'mpesa',  // Changed from 'm-pesa' to 'mpesa'
      external_reference: reference
    };

    console.log('Payment data prepared:', JSON.stringify(paymentData, null, 2));

    // Create Basic Auth token
    const credentials = Buffer.from(`${API_USERNAME}:${API_PASSWORD}`).toString('base64');
    const authToken = `Basic ${credentials}`;

    console.log('Auth token created (first 20 chars):', authToken.substring(0, 20) + '...');

    // PayHero API endpoint
    const apiUrl = 'https://backend.payhero.co.ke/api/v2/payments';
    console.log('API URL:', apiUrl);

    console.log('========================================');
    console.log('CALLING PAYHERO API...');
    console.log('========================================');

    // Make request to PayHero API with timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authToken,
          'Accept': 'application/json'
        },
        body: JSON.stringify(paymentData),
        signal: controller.signal
      });

      clearTimeout(timeout);

      console.log('Response received:');
      console.log('- Status:', response.status);
      console.log('- Status Text:', response.statusText);
      console.log('- OK:', response.ok);

      // Get response text first
      const responseText = await response.text();
      console.log('- Response body (raw):', responseText);

      let responseData;
      try {
        responseData = JSON.parse(responseText);
        console.log('- Response body (parsed):', JSON.stringify(responseData, null, 2));
      } catch (e) {
        console.log('❌ Failed to parse JSON response:', e.message);
        responseData = { raw: responseText };
      }

      // Check if request was successful
      if (response.ok || response.status === 200 || response.status === 201) {
        console.log('✅ PayHero API call SUCCESSFUL');
        console.log('========================================');
        
        return res.status(200).json({
          success: true,
          message: 'Payment request sent successfully! Check your phone (0705809731) for M-Pesa prompt.',
          data: {
            reference: responseData.reference || reference,
            amount: amount,
            phone: maskPhone(phone),
            status: 'pending'
          }
        });
      } else {
        // Handle API errors
        console.log('❌ PayHero API call FAILED');
        console.log('Error response:', responseData);
        console.log('========================================');
        
        const errorMessage = responseData.message 
          || responseData.error 
          || responseData.detail
          || `PayHero API error (Status ${response.status})`;
        
        return res.status(200).json({  // Return 200 to frontend but with error message
          success: false,
          message: errorMessage,
          debug: {
            status: response.status,
            response: responseData
          }
        });
      }

    } catch (fetchError) {
      clearTimeout(timeout);
      
      if (fetchError.name === 'AbortError') {
        console.log('❌ Request timeout (30 seconds)');
        console.log('========================================');
        return res.status(200).json({
          success: false,
          message: 'Request timeout. PayHero API is taking too long to respond. Please try again.'
        });
      }

      throw fetchError;
    }

  } catch (error) {
    console.log('========================================');
    console.log('❌ FATAL ERROR');
    console.log('========================================');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    return res.status(200).json({  // Return 200 to frontend but with error
      success: false,
      message: 'An error occurred while processing your payment. Error: ' + error.message,
      debug: {
        error: error.message,
        type: error.name
      }
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

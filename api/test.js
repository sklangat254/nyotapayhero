/**
 * Test Endpoint - Verify PayHero API Connection
 * Endpoint: /api/test
 * Use this to test if PayHero API is reachable
 */

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD-5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const testResults = {
      timestamp: new Date().toISOString(),
      environment: {
        nodeVersion: process.version,
        region: process.env.VERCEL_REGION || 'unknown'
      },
      credentials: {
        username: process.env.PAYHERO_USERNAME || 'In4zPhQySfqJUybAylQg',
        accountId: process.env.PAYHERO_ACCOUNT_ID || '3844',
        passwordSet: !!(process.env.PAYHERO_PASSWORD || 'U0BIv2Z5RUoqh5opWgQLH9ozKMPayb8nnHpENtB3')
      },
      tests: []
    };

    // Test 1: Can we reach PayHero API?
    console.log('Testing PayHero API connectivity...');
    
    try {
      const startTime = Date.now();
      const response = await fetch('https://backend.payhero.co.ke/api/v2/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${Buffer.from(`${testResults.credentials.username}:${process.env.PAYHERO_PASSWORD || 'U0BIv2Z5RUoqh5opWgQLH9ozKMPayb8nnHpENtB3'}`).toString('base64')}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          amount: 1,
          phone_number: '254705809731',
          channel_id: parseInt(testResults.credentials.accountId),
          provider: 'mpesa',
          external_reference: 'TEST' + Date.now()
        })
      });

      const endTime = Date.now();
      const responseText = await response.text();

      testResults.tests.push({
        name: 'PayHero API Connectivity',
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        responseTime: endTime - startTime + 'ms',
        response: responseText.substring(0, 200) + (responseText.length > 200 ? '...' : ''),
        passed: response.status < 500
      });

    } catch (error) {
      testResults.tests.push({
        name: 'PayHero API Connectivity',
        passed: false,
        error: error.message,
        errorType: error.name
      });
    }

    // Test 2: Can we reach external internet?
    try {
      const startTime = Date.now();
      const response = await fetch('https://www.google.com', {
        method: 'HEAD'
      });
      const endTime = Date.now();

      testResults.tests.push({
        name: 'Internet Connectivity',
        passed: response.ok,
        status: response.status,
        responseTime: endTime - startTime + 'ms'
      });

    } catch (error) {
      testResults.tests.push({
        name: 'Internet Connectivity',
        passed: false,
        error: error.message
      });
    }

    // Return results
    return res.status(200).json({
      success: true,
      message: 'Test completed',
      results: testResults
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
}

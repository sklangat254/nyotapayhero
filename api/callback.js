/**
 * Vercel Serverless Function - PayHero Webhook Handler
 * Endpoint: /api/callback
 * Receives payment notifications from PayHero
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
      status: 'error',
      message: 'Method not allowed'
    });
  }

  try {
    // Get callback data
    const callbackData = req.body;

    // Log the incoming callback
    console.log('========================================');
    console.log('NYOTA FUND - PayHero Callback Received');
    console.log('========================================');
    console.log('Timestamp:', new Date().toISOString());
    console.log('Callback Data:', JSON.stringify(callbackData, null, 2));

    // Validate that we received data
    if (!callbackData || Object.keys(callbackData).length === 0) {
      console.error('ERROR: No callback data received');
      return res.status(400).json({
        status: 'error',
        message: 'No data received'
      });
    }

    // Extract payment information
    const {
      reference,
      status,
      amount,
      phone_number,
      receipt_number,
      metadata = {},
      failure_reason,
      external_reference
    } = callbackData;

    console.log('========================================');
    console.log('Payment Details:');
    console.log('Reference:', reference || external_reference);
    console.log('Status:', status);
    console.log('Amount:', amount);
    console.log('Phone:', phone_number);
    console.log('Receipt:', receipt_number);
    console.log('Customer:', metadata.customer_name);
    console.log('========================================');

    // Process based on payment status
    switch (status?.toLowerCase()) {
      case 'success':
      case 'completed':
        console.log('✅ SUCCESS: Payment completed successfully');
        await handleSuccessfulPayment({
          reference: reference || external_reference,
          amount,
          phone: phone_number,
          receiptNumber: receipt_number,
          customerName: metadata.customer_name,
          metadata
        });
        break;

      case 'failed':
      case 'cancelled':
        console.log('❌ FAILED: Payment failed or cancelled');
        await handleFailedPayment({
          reference: reference || external_reference,
          amount,
          phone: phone_number,
          reason: failure_reason || 'Unknown',
          customerName: metadata.customer_name
        });
        break;

      case 'pending':
        console.log('⏳ PENDING: Payment is pending');
        await handlePendingPayment({
          reference: reference || external_reference,
          amount,
          phone: phone_number,
          customerName: metadata.customer_name
        });
        break;

      default:
        console.log('⚠️ UNKNOWN STATUS:', status);
    }

    console.log('========================================');

    // Always respond with 200 to acknowledge receipt
    return res.status(200).json({
      status: 'received',
      message: 'Callback processed successfully'
    });

  } catch (error) {
    console.error('========================================');
    console.error('ERROR: Callback processing failed');
    console.error('Error:', error);
    console.error('========================================');
    
    // Still return 200 to PayHero to prevent retries
    return res.status(200).json({
      status: 'error',
      message: 'Callback received but processing failed'
    });
  }
}

/**
 * Handle successful payment
 */
async function handleSuccessfulPayment(data) {
  console.log('Processing successful payment...');
  
  // TODO: Add your business logic here:
  // - Disburse loan to customer
  // - Update database with loan details
  // - Send confirmation SMS/Email
  // - Update customer account
  // - Generate loan agreement
  
  const loanRecord = {
    timestamp: new Date().toISOString(),
    reference: data.reference,
    amount: data.amount,
    phone: data.phone,
    receiptNumber: data.receiptNumber,
    customerName: data.customerName,
    status: 'approved',
    loanStatus: 'disbursed',
    metadata: data.metadata
  };
  
  console.log('Loan Record:', JSON.stringify(loanRecord, null, 2));
  
  // TODO: Save to database
  // await database.loans.create(loanRecord);
  
  // TODO: Send SMS notification
  // await sendSMS(data.phone, `Loan approved! KES ${data.amount} will be disbursed shortly. Receipt: ${data.receiptNumber}`);
}

/**
 * Handle failed payment
 */
async function handleFailedPayment(data) {
  console.log('Processing failed payment...');
  
  // TODO: Add your business logic here:
  // - Log the failure
  // - Notify customer
  // - Update loan application status
  
  const failureRecord = {
    timestamp: new Date().toISOString(),
    reference: data.reference,
    amount: data.amount,
    phone: data.phone,
    customerName: data.customerName,
    status: 'failed',
    reason: data.reason
  };
  
  console.log('Failure Record:', JSON.stringify(failureRecord, null, 2));
  
  // TODO: Send SMS notification
  // await sendSMS(data.phone, `Loan application failed: ${data.reason}. Please try again or contact support.`);
}

/**
 * Handle pending payment
 */
async function handlePendingPayment(data) {
  console.log('Processing pending payment...');
  
  // TODO: Add your business logic here:
  // - Update status to pending
  // - Set up timeout check
  
  const pendingRecord = {
    timestamp: new Date().toISOString(),
    reference: data.reference,
    amount: data.amount,
    phone: data.phone,
    customerName: data.customerName,
    status: 'pending'
  };
  
  console.log('Pending Record:', JSON.stringify(pendingRecord, null, 2));
}

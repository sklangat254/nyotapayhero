# NYOTA Fund - DEBUG VERSION

## 🔍 What's Different in This Version

This is a **debugging version** with enhanced logging and error handling to help identify and fix the connection error.

### **New Features:**

1. **🔍 Test API Connection Button**
   - Click to test if PayHero API is reachable
   - Shows detailed connectivity results
   - Tests both PayHero and internet connection

2. **📊 Enhanced Logging**
   - Detailed console logs in Vercel Functions
   - Step-by-step request tracking
   - Full API response capture

3. **💡 Better Error Messages**
   - Shows actual error from API
   - Displays debug information
   - Helps identify the exact problem

4. **⏱️ Timeout Protection**
   - 30-second timeout on API calls
   - Prevents indefinite hanging
   - Clear timeout error messages

---

## 🚀 How to Use This Debug Version

### **Step 1: Deploy to Vercel**

Same as before:
1. Upload to GitHub
2. Deploy on Vercel
3. No environment variables needed (credentials hardcoded)

### **Step 2: Test API Connection**

1. Open your deployed site
2. **Click "🔍 Test API Connection" button**
3. Wait for results
4. Check what it says:

**✅ If Test Passes:**
```json
{
  "PayHero API Connectivity": {
    "passed": true,
    "status": 200 or 400,
    "responseTime": "1234ms"
  },
  "Internet Connectivity": {
    "passed": true
  }
}
```

**❌ If Test Fails:**
```json
{
  "PayHero API Connectivity": {
    "passed": false,
    "error": "fetch failed" or "ECONNREFUSED"
  }
}
```

### **Step 3: Try Payment**

1. Fill form with:
   - Name: Test User
   - Phone: 0705809731
   - Amount: 10 (auto-filled)
2. Click "Request Loan"
3. **Check the error message** - it will show the exact issue

### **Step 4: Check Vercel Logs**

This is the most important step!

1. **Go to Vercel Dashboard**
2. **Click your project**
3. **Click "Functions" tab**
4. **Click on "payment" function**
5. **View real-time logs**

You'll see detailed output like:
```
========================================
NEW PAYMENT REQUEST RECEIVED
========================================
Credentials loaded:
- Username: In4zPhQySfqJUybAylQg
- Account ID: 3844
Request data:
- Name: Test User
- Phone: 254705809731
- Amount: 10
✅ All validations passed
Generated reference: NYOTA1702234567891234
Payment data prepared: {
  "amount": 10,
  "phone_number": "254705809731",
  "channel_id": 3844,
  "provider": "mpesa",
  "external_reference": "NYOTA1702234567891234"
}
========================================
CALLING PAYHERO API...
========================================
Response received:
- Status: 400 (or 200, 500, etc.)
- Response body: {...}
```

---

## 🐛 Common Errors & Solutions

### **Error 1: "fetch failed" or "ECONNREFUSED"**

**Cause:** Vercel can't reach PayHero API

**Solutions:**
1. Check if PayHero API is down: https://backend.payhero.co.ke/
2. Check Vercel network restrictions
3. Try deploying to different Vercel region

**Fix in vercel.json:**
```json
{
  "regions": ["nairobi1"]  // Try Kenya region
}
```

### **Error 2: "401 Unauthorized"**

**Cause:** Invalid credentials

**Check:**
- Username: In4zPhQySfqJUybAylQg
- Password: U0BIv2Z5RUoqh5opWgQLH9ozKMPayb8nnHpENtB3
- Account ID: 3844

**Verify** in PayHero dashboard

### **Error 3: "400 Bad Request"**

**Cause:** Invalid request format

**Check Logs For:**
- Phone format: Must be 254XXXXXXXXX
- Amount: Must be number > 0
- Channel ID: Must be 3844

**Common Fixes:**
- Change `provider` from "m-pesa" to "mpesa"
- Channel ID as integer: `parseInt("3844")`
- Remove callback_url if not registered

### **Error 4: "Connection error" in frontend**

**Cause:** API request failed entirely

**Steps:**
1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for errors
4. Check Network tab
5. Find request to `/api/payment`
6. See the actual error

---

## 📊 Understanding the Logs

### **Successful Request:**

```
✅ All validations passed
✅ PayHero API call SUCCESSFUL
Response:
- Status: 200
- Response: { "success": true, "reference": "PH_XXX" }
```

### **Failed Request:**

```
❌ PayHero API call FAILED
Error response: {
  "message": "Invalid channel_id",
  "status": 400
}
```

### **Network Failure:**

```
❌ FATAL ERROR
Error name: TypeError
Error message: fetch failed
```

---

## 🔧 Quick Fixes to Try

### **Fix 1: Change Provider Format**

In `api/payment.js` line 67, already changed to:
```javascript
provider: 'mpesa',  // Changed from 'm-pesa'
```

### **Fix 2: Ensure Integer Channel ID**

In `api/payment.js` line 68:
```javascript
channel_id: parseInt(ACCOUNT_ID),  // Ensure it's an integer
```

### **Fix 3: Remove Callback URL**

If not registered with PayHero:
```javascript
// callback_url: CALLBACK_URL  // Commented out
```

### **Fix 4: Test with Minimal Data**

Try absolute minimum:
```javascript
{
  amount: 10,
  phone_number: "254705809731",
  channel_id: 3844,
  provider: "mpesa"
}
```

---

## 🧪 Step-by-Step Debugging

### **Test 1: Can Vercel Reach Internet?**

1. Click "Test API Connection"
2. Check "Internet Connectivity" result
3. If fails → Vercel network issue

### **Test 2: Can Vercel Reach PayHero?**

1. Check "PayHero API Connectivity" result
2. Look at status code:
   - 401 → Wrong credentials
   - 400 → Wrong request format
   - 500 → PayHero server error
   - ECONNREFUSED → Can't reach PayHero

### **Test 3: Are Credentials Correct?**

1. Check Vercel logs
2. Look for "Credentials loaded"
3. Verify username matches: In4zPhQySfqJUybAylQg
4. Check Basic Auth token is generated

### **Test 4: Is Request Format Correct?**

1. Check logs for "Payment data prepared"
2. Verify:
   ```json
   {
     "amount": 10,
     "phone_number": "254705809731",
     "channel_id": 3844,
     "provider": "mpesa"
   }
   ```

### **Test 5: What's PayHero's Response?**

1. Look for "Response received"
2. Check status code
3. Read response body
4. This tells you exactly what's wrong

---

## 📞 What to Report

If still not working, provide these details:

### **From Test Button:**
- PayHero API Connectivity: passed/failed
- Status code: ?
- Response time: ?
- Error message: ?

### **From Vercel Logs:**
- Full log output
- Especially the API response section

### **From Browser:**
- Error message shown
- Browser console errors
- Network tab details

---

## 🎯 Expected Behavior

### **Working System:**

1. **Test Button:**
   ```
   PayHero API Connectivity: ✅
   Status: 200 or 400
   Response time: < 2000ms
   ```

2. **Vercel Logs:**
   ```
   ✅ All validations passed
   CALLING PAYHERO API...
   Response received: Status 200
   ✅ PayHero API call SUCCESSFUL
   ```

3. **Frontend:**
   ```
   ✅ Payment request sent successfully!
   Check your phone (0705809731) for M-Pesa prompt.
   ```

4. **Phone:**
   ```
   🔔 M-Pesa STK Push
   KES 10
   ```

---

## 💡 Most Likely Issues

Based on "Connection error" with data bundles:

### **Issue 1: Vercel Network Restrictions**

Vercel may block external APIs in some regions.

**Solution:** Check Vercel's network allowlist

### **Issue 2: CORS Issues**

API might be rejecting cross-origin requests.

**Solution:** Already added proper CORS headers

### **Issue 3: PayHero API Format Changed**

Documentation might be outdated.

**Solution:** Check actual API response in logs

### **Issue 4: Timeout Too Short**

API call timing out before completing.

**Solution:** Increased to 30 seconds (already done)

---

## 📥 Deploy and Debug

1. **Download this debug version**
2. **Deploy to Vercel**
3. **Click "Test API Connection"**
4. **Try making payment**
5. **Check Vercel logs**
6. **Report findings**

The logs will tell us exactly what's wrong! 🎯

---

## 🆘 Emergency Fallback

If PayHero API is completely unreachable from Vercel:

### **Option 1: Use Different Host**
- Try deploying on Railway, Render, or Heroku

### **Option 2: Use Webhook-Only**
- Skip STK Push
- Use manual M-Pesa payment
- Process via webhook

### **Option 3: Contact PayHero**
- Ask about Vercel compatibility
- Request IP whitelist if needed
- Verify API endpoint status

---

**Deploy this debug version and let's see what the logs say!** 🔍

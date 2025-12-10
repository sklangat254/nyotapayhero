# NYOTA Fund - Quick Loans via M-Pesa

A modern loan application system with M-Pesa payment integration via PayHero. Features localStorage for phone number persistence and automatic amount generation.

## 🌟 Key Features

- **📱 LocalStorage Phone Number** - Automatically saves and loads phone number
- **💰 Random Amount Generation** - Currently set to KES 10 for testing
- **🔒 Secure M-Pesa Integration** - PayHero STK Push API
- **⚡ Instant Processing** - Real-time payment requests
- **📊 Webhook Support** - Automatic payment notifications
- **🎨 Modern UI** - Clean, professional gradient design
- **📲 Mobile Responsive** - Works on all devices

## 📱 LocalStorage Feature

### How It Works:

1. **First Time User:**
   - User enters phone number (e.g., 0705809731)
   - Phone is auto-formatted to 254705809731
   - After submission, phone is saved to localStorage
   - Badge shows: "✓ SAVED - Phone number loaded from storage"

2. **Returning User:**
   - Phone number automatically loads from localStorage
   - Pre-filled in the form
   - User can start immediately

3. **Clear Storage:**
   - Click "Clear stored phone number" to remove saved data
   - Useful for testing or switching users

## 🚀 Quick Start

### Prerequisites:
- Node.js 18+
- Vercel account (for deployment)
- PayHero account with API credentials

### Local Development:

```bash
# Install Vercel CLI
npm install -g vercel

# Navigate to project
cd nyota-fund

# Start development server
vercel dev

# Open browser
http://localhost:3000
```

### Environment Variables:

The API has credentials **hardcoded for testing**:
```javascript
API_USERNAME = 'In4zPhQySfqJUybAylQg'
API_PASSWORD = 'U0BIv2Z5RUoqh5opWgQLH9ozKMPayb8nnHpENtB3'
ACCOUNT_ID = '3844'
```

For production, use environment variables in Vercel:
```
PAYHERO_USERNAME=In4zPhQySfqJUybAylQg
PAYHERO_PASSWORD=U0BIv2Z5RUoqh5opWgQLH9ozKMPayb8nnHpENtB3
PAYHERO_ACCOUNT_ID=3844
PAYHERO_CALLBACK_URL=https://your-project.vercel.app/api/callback
```

## 📦 Deployment to Vercel

### Method 1: GitHub + Vercel Dashboard

1. **Upload to GitHub:**
   ```bash
   # Create new repository on GitHub
   # Upload all files
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Deploy on Vercel:**
   - Go to https://vercel.com/new
   - Import your GitHub repository
   - Framework: "Other"
   - Click Deploy

3. **Optional - Add Environment Variables:**
   - Settings → Environment Variables
   - Add the variables above (optional, as they're hardcoded)

### Method 2: Vercel CLI

```bash
# Login
vercel login

# Deploy
vercel

# Deploy to production
vercel --prod
```

## 🧪 Testing

### Test Phone Number:
```
Format 1: 0705809731
Format 2: 705809731
Format 3: 254705809731

All formats auto-convert to: 254705809731
```

### Test Amount:
```
Currently set to: KES 10 (for testing)
```

### Testing Flow:

1. **Open website** (local or deployed URL)
2. **Check localStorage:**
   - Open browser DevTools → Application → Local Storage
   - Check if `nyota_phone` exists
3. **Fill form:**
   - Name: Your Name
   - Phone: 0705809731 (will auto-format)
   - Amount: 10 (auto-filled, disabled)
4. **Submit:**
   - Click "Request Loan"
   - Phone number is saved to localStorage
5. **Check phone:**
   - M-Pesa STK push should arrive
   - Enter PIN to complete
6. **Refresh page:**
   - Phone number should auto-load
   - Badge shows "✓ SAVED"

## 💡 How It Works

### Frontend (index.html):

```javascript
// On page load
window.addEventListener('DOMContentLoaded', () => {
    loadPhoneFromStorage();  // Load saved phone
    setRandomAmount();        // Set amount to KES 10
});

// Save phone after successful submission
savePhoneToStorage(phone);

// Clear stored phone
clearStoredPhone();
```

### Backend (api/payment.js):

```javascript
// PayHero API Request
POST https://backend.payhero.co.ke/api/v2/payments

Body:
{
  amount: 10,
  phone_number: "254705809731",
  channel_id: "3844",
  provider: "m-pesa",
  external_reference: "NYOTA...",
  callback_url: "https://your-url/api/callback"
}

Headers:
Authorization: Basic SW40elBoUXlTZnFKVXliQXlsUWc6VTBCSXYyWjVSVW9xaDVvcFdnUUxIOW96S01QYXliOG5uSHBFTnRCMw==
```

### Webhook (api/callback.js):

```javascript
// Receives notifications from PayHero
// Processes: success, failed, pending
// Logs all events with detailed information
```

## 📊 LocalStorage Structure

```javascript
localStorage.setItem('nyota_phone', '254705809731');

// Storage Key: 'nyota_phone'
// Storage Value: '254705809731'
```

## 🔧 Customization

### Change Test Amount:

Edit `public/index.html`:
```javascript
function setRandomAmount() {
    const testAmount = 10; // Change this
    // ...
}
```

### Enable Random Amounts:

Uncomment in `setRandomAmount()`:
```javascript
const randomAmount = Math.floor(Math.random() * (5000 - 100 + 1)) + 100;
```

### Change Colors:

Edit CSS variables:
```css
:root {
    --primary: #00a86b;      /* Green */
    --secondary: #ffd700;    /* Gold */
}
```

## 🐛 Troubleshooting

### Phone Number Not Saving:

**Check:**
- Browser supports localStorage
- Not in incognito/private mode
- localStorage not disabled

**Fix:**
```javascript
// Test in browser console
localStorage.setItem('test', 'value');
console.log(localStorage.getItem('test')); // Should return 'value'
```

### Payment Not Working:

**Check:**
- Vercel function logs
- Phone format is 254XXXXXXXXX
- PayHero credentials are correct
- M-Pesa account is active

**View Logs:**
```
Vercel Dashboard → Functions → payment → Logs
```

### Phone Auto-Format Not Working:

**Check:**
- Input event listener is attached
- Phone input has correct ID: `id="phone"`
- No JavaScript errors in console

## 📞 API Documentation

Following PayHero's STK Push documentation:
https://docs.payhero.co.ke/docs/post-initiate-mpesa-stk-push-request

### Endpoint:
```
POST https://backend.payhero.co.ke/api/v2/payments
```

### Headers:
```
Content-Type: application/json
Authorization: Basic [base64_credentials]
```

### Request Body:
```json
{
  "amount": 10,
  "phone_number": "254705809731",
  "channel_id": "3844",
  "provider": "m-pesa",
  "external_reference": "NYOTA1234567890",
  "callback_url": "https://your-url/api/callback",
  "metadata": {
    "customer_name": "John Doe",
    "loan_reference": "NYOTA1234567890"
  }
}
```

### Response (Success):
```json
{
  "success": true,
  "reference": "PH_REF_123",
  "status": "pending"
}
```

## 💰 Cost

```
Vercel Hosting: FREE
GitHub: FREE
SSL Certificate: FREE
---
Total: $0/month

PayHero Transaction Fees: Per transaction
```

## 📱 Browser Support

- ✅ Chrome/Edge (90+)
- ✅ Firefox (88+)
- ✅ Safari (14+)
- ✅ Mobile browsers (iOS, Android)

Requires:
- localStorage support
- ES6+ JavaScript
- Fetch API

## 🔒 Security Notes

- ✅ Phone numbers saved locally (not on server)
- ✅ Credentials can use environment variables
- ✅ HTTPS required for production
- ✅ Input validation on both frontend and backend
- ✅ CORS properly configured

## 📄 License

MIT License - Free to use and modify

## 🆘 Support

**PayHero Documentation:**
https://docs.payhero.co.ke/

**Vercel Documentation:**
https://vercel.com/docs

**M-Pesa Support:**
https://www.safaricom.co.ke/mpesa

---

## 🎉 Ready to Deploy!

Your NYOTA Fund loan system is ready with:
- ✅ LocalStorage phone persistence
- ✅ Auto-formatted phone numbers
- ✅ Test amount (KES 10)
- ✅ PayHero integration
- ✅ Modern UI
- ✅ Mobile responsive

**Test Phone:** 0705809731 / 254705809731
**Test Amount:** KES 10

Deploy and start accepting loan applications! 🚀

# 🧪 PENDING SUBMISSIONS TESTING GUIDE

## How to Test Pending Submissions (Client & Admin Side)

---

## 📋 **Testing Checklist**

### **✅ Client Side (Photo Submission)**

#### **Prerequisites:**
1. ✅ Admin panel is working (you can see it)
2. ✅ You can start rounds
3. ✅ You're the highest holder (or test with highest holder wallet)

#### **Test Steps:**

1. **Start a Round**
   - Connect admin wallet
   - Enter target item (e.g., "Red Apple")
   - Click "Start Round"

2. **Wait for Submission Window**
   - Round runs for 22 minutes
   - Then 3-minute submission window opens
   - Debug panel should show "Current Phase: submission"

3. **Submit Photo (as Highest Holder)**
   - Connect highest holder wallet
   - Photo submission form should appear
   - Upload a test photo
   - Click "Submit Find"
   - Should see "Submission Successful!" message

4. **Verify Submission**
   - Check browser console for success
   - Photo should be uploaded to Supabase Storage

---

### **✅ Admin Side (Review Submissions)**

#### **Test Steps:**

1. **Check Admin Panel**
   - Connect admin wallet
   - Look for "Pending Submissions" section
   - Should show count: "Pending Submissions (1)"

2. **Review Submission**
   - Click on submitted photo
   - Should see photo, wallet address, submission time
   - Click "✓ Approve" or "✗ Reject"
   - Add notes if prompted

3. **Verify Status Change**
   - Submission should disappear from pending list
   - Check database for status update

---

## 🔍 **Debugging Steps**

### **If Photo Submission Doesn't Appear:**

1. **Check Debug Panel** (should be visible):
   ```
   Your Wallet: [your address]
   Highest Holder: [highest holder address]
   Is Highest Holder: ✅ Yes / ❌ No
   Current Phase: active/submission/ended
   Can Submit: ✅ Yes / ❌ No
   Active Round: ✅ Round #X / ❌ None
   ```

2. **Common Issues:**
   - ❌ **Not highest holder** → Need highest holder wallet
   - ❌ **No active round** → Start a round first
   - ❌ **Wrong phase** → Wait for submission window
   - ❌ **Wallet not connected** → Connect wallet

### **If Admin Panel Doesn't Show Submissions:**

1. **Check Admin Authentication:**
   - Make sure your wallet is in `ADMIN_ADDRESSES`
   - Check browser console for auth errors

2. **Check Backend Logs:**
   - Look for "Error fetching pending submissions"
   - Check Supabase connection

3. **Check Database:**
   - Verify submissions table exists
   - Check if submissions have `status = 'pending'`

---

## 🛠️ **Manual Testing Commands**

### **Check Database Directly:**

```sql
-- Check if submissions exist
SELECT * FROM submissions ORDER BY submitted_at DESC LIMIT 10;

-- Check pending submissions
SELECT * FROM submissions WHERE status = 'pending';

-- Check rounds
SELECT * FROM game_rounds ORDER BY created_at DESC LIMIT 5;
```

### **Test API Endpoints:**

```bash
# Test pending submissions endpoint
curl -X GET "https://your-backend.onrender.com/api/admin/submissions/pending" \
  -H "X-Wallet-Signature: [signature]" \
  -H "X-Wallet-Message: [message]" \
  -H "X-Wallet-Address: [your-wallet]"

# Test submission creation
curl -X POST "https://your-backend.onrender.com/api/submissions" \
  -H "Content-Type: application/json" \
  -H "X-Wallet-Signature: [signature]" \
  -H "X-Wallet-Message: [message]" \
  -H "X-Wallet-Address: [wallet]" \
  -d '{"photoBase64": "data:image/jpeg;base64,...", "roundId": "..."}'
```

---

## 🚨 **Common Issues & Solutions**

### **Issue: "Only the highest holder can submit"**
**Solution:** Connect with the wallet that has the most $FIND tokens

### **Issue: "Not in submission window"**
**Solution:** Wait for the 3-minute submission window (happens 22 minutes after round starts)

### **Issue: "Invalid round"**
**Solution:** Make sure you're submitting to the current active round

### **Issue: "Already submitted for this round"**
**Solution:** Each wallet can only submit once per round

### **Issue: Admin panel shows "No pending submissions"**
**Possible Causes:**
- No submissions have been made yet
- All submissions have been reviewed
- Database connection issue
- Authentication problem

---

## 📊 **Expected Flow**

1. **Admin starts round** → Round created in database
2. **Highest holder submits** → Submission created with `status = 'pending'`
3. **Admin reviews** → Status changed to `'approved'` or `'rejected'`
4. **Approved submissions** → Show in gallery

---

## ✅ **Success Indicators**

### **Client Side:**
- ✅ Photo submission form appears during submission window
- ✅ Upload completes successfully
- ✅ "Submission Successful!" message shown
- ✅ Photo visible in Supabase Storage

### **Admin Side:**
- ✅ Pending submissions count updates
- ✅ Photos display correctly in admin panel
- ✅ Approve/Reject buttons work
- ✅ Submissions disappear after review

---

## 🔧 **If Still Not Working**

1. **Check Render Logs** for errors
2. **Check Supabase Logs** for database issues
3. **Verify Environment Variables** are set correctly
4. **Test with a simple submission** (small photo, clear target item)
5. **Check browser console** for JavaScript errors

**The system should work end-to-end once you restart Render!** 🚀

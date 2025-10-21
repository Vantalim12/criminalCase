# 🚨 RENDER RESTART GUIDE

## Issue: REWARD_WALLET_PRIVATE_KEY Not Configured

You've updated the environment variable in Render, but the backend service needs to restart to pick up the new value.

---

## 🔄 **How to Restart Render Service**

### **Method 1: Manual Restart (Recommended)**

1. **Go to Render Dashboard**
   - Visit: https://dashboard.render.com
   - Sign in to your account

2. **Find Your Backend Service**
   - Look for your backend service (probably named `find-api` or similar)
   - Click on it to open the service details

3. **Restart the Service**
   - Click the **"Manual Deploy"** button
   - Or click **"Restart"** if available
   - This will restart the service with your new environment variables

### **Method 2: Trigger Redeploy**

1. **Make a Small Code Change**
   - Add a comment to any file in your backend
   - Commit and push to GitHub
   - This will trigger an automatic redeploy

2. **Or Update Environment Variable Again**
   - Go to Environment tab
   - Add a space to `REWARD_WALLET_PRIVATE_KEY` value
   - Save (this forces a restart)

---

## ✅ **Verify It's Working**

After restart, check:

1. **Admin Panel** - Should show reward wallet info
2. **Backend Logs** - Should show "Reward wallet initialized: [address]"
3. **No More Errors** - "REWARD_WALLET_PRIVATE_KEY not configured" should disappear

---

## 🔍 **Check Render Logs**

1. Go to your backend service in Render
2. Click **"Logs"** tab
3. Look for:
   - ✅ `"Reward wallet initialized: [address]"` (success)
   - ❌ `"REWARD_WALLET_PRIVATE_KEY not set"` (still not working)

---

## 🚨 **If Still Not Working**

### **Double-Check Environment Variable:**

1. **Verify the Key Name**:
   ```
   REWARD_WALLET_PRIVATE_KEY
   ```
   (exactly this, no typos)

2. **Verify the Value**:
   - Should be Base58-encoded private key
   - No quotes around it
   - No extra spaces

3. **Check Render Environment Tab**:
   - Make sure it's saved
   - Make sure it's not commented out

### **Test Locally First**:

Create `backend/.env` with your private key:
```env
REWARD_WALLET_PRIVATE_KEY=your-actual-private-key-here
```

Then restart local backend:
```bash
cd backend
npm run dev
```

Check local logs for "Reward wallet initialized" message.

---

## 📋 **Next Steps**

1. **Restart Render service** (Method 1 above)
2. **Check logs** for success message
3. **Test admin panel** - should show reward wallet info
4. **Try starting a round** - should work without errors

**The issue is just that Render needs to restart to pick up your new environment variable!** 🔄

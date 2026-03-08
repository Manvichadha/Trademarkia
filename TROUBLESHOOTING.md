# 🔧 Troubleshooting Guide - Critical Fixes

## ⚠️ **URGENT: Google Sign-In Not Working**

If clicking "Sign in with Google" falls back to offline mode instead of signing in, follow these steps:

---

### **Step 1: Configure Firebase Authentication (REQUIRED)**

Your Firebase project needs authentication enabled or sign-in will fail.

#### 1.1 Enable Google Sign-In

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **`trademarkia-bd8cd`**
3. Click **"Authentication"** in left sidebar
4. Click **"Get started"**
5. Click **"Sign-in method"** tab at top
6. Find **"Google"** in the list
7. Click on it
8. Toggle **"Enable"** to ON
9. Enter a support email (use your email)
10. Click **"Save"**

#### 1.2 Add Authorized Domains

1. Still in Authentication section
2. Click **"Settings"** tab
3. Scroll to **"Authorized domains"**
4. Click **"Add domain"**
5. Add: `localhost` (for development)
6. Later, add your production domain (e.g., `your-app.vercel.app`)

---

### **Step 2: Enable Firestore Database**

Without Firestore, user profiles can't be saved.

1. In Firebase Console, click **"Firestore Database"**
2. Click **"Create database"**
3. Choose **"Start in test mode"** (we'll secure it later)
4. Click **"Next"**
5. Select a location (choose closest to you)
   - For US: `us-central`
   - For Europe: `europe-west`
   - For Asia: `asia-southeast`
6. Click **"Enable"**

---

### **Step 3: Enable Realtime Database**

Required for presence system (seeing other users).

1. In Firebase Console, click **"Realtime Database"**
2. Click **"Create database"**
3. Choose **"Start in test mode"**
4. Click **"Next"**
5. Select same location as Firestore
6. Click **"Enable"**

---

### **Step 4: Verify Environment Variables**

Make sure your `.env.local` file has correct values:

```bash
# Check if file exists
cat /Users/viksitchadha/Desktop/Trademarkia/sheet-app/.env.local
```

You should see all these values:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDLO10CsgIGaMfWVpn8QygvXG-gGG43Qf8
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=trademarkia-bd8cd.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=trademarkia-bd8cd
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=trademarkia-bd8cd.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=164062172547
NEXT_PUBLIC_FIREBASE_APP_ID=1:164062172547:web:6d66ff1e90137529ac12b6
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://trademarkia-bd8cd-default-rtdb.firebaseio.com/
```

**IMPORTANT**: After updating `.env.local`, restart the dev server:

```bash
# Stop current server (Ctrl+C)
cd /Users/viksitchadha/Desktop/Trademarkia/sheet-app
npm run dev
```

---

### **Step 5: Test Authentication**

1. Open browser to: `http://localhost:3000`
2. You should be redirected to `/auth`
3. Click **"Sign in with Google"** button
4. Google popup should appear
5. Select your account
6. Should redirect to `/dashboard`

**If it still fails:**

- Open browser console (F12)
- Look for error messages
- Common errors:
  - `"Firebase: Error (auth/unauthorized-domain)"` → Add localhost to authorized domains
  - `"Firebase: Error (auth/operation-not-allowed)"` → Enable Google sign-in in Firebase Console
  - `"Missing Firebase config value"` → Check `.env.local` file

---

## 🎨 **Dashboard Issues - Buttons Not Working**

If dashboard buttons and navigation don't work:

### **Check JavaScript Console**

1. Press `F12` or `Cmd+Option+I` (Mac)
2. Click **"Console"** tab
3. Look for red error messages

Common issues:

#### **Error: "Cannot read property 'uid' of null"**
- **Cause**: User not logged in
- **Fix**: Complete authentication first

#### **Error: "Firebase is not defined"**
- **Cause**: Firebase config missing
- **Fix**: Check Step 4 above

#### **Error: "Permission denied"**
- **Cause**: Firestore security rules too strict
- **Fix**: Update rules (see below)

---

### **Update Firestore Security Rules**

For development, use permissive rules:

1. In Firebase Console, go to **Firestore Database**
2. Click **"Rules"** tab
3. Replace with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read/write their documents
    match /documents/{docId} {
      allow read, write: if request.auth != null;
      
      match /cells/{cellId} {
        allow read, write: if request.auth != null;
      }
      
      match /metadata/{metaId} {
        allow read, write: if request.auth != null;
      }
    }
    
    // Users collection
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

4. Click **"Publish"**

---

### **Update Realtime Database Rules**

1. In Firebase Console, go to **Realtime Database**
2. Click **"Rules"** tab
3. Replace with:

```json
{
  "rules": {
    "presence": {
      "$docId": {
        "$uid": {
          ".read": true,
          ".write": "$uid === auth.uid"
        }
      }
    }
  }
}
```

4. Click **"Publish"**

---

## 🐛 **Other Common Issues**

### **Issue: "New Sheet" button doesn't create document**

**Symptoms:**
- Click "New Document" or "New Sheet"
- Nothing happens
- No error message

**Diagnosis:**
1. Open browser console
2. Look for Firestore errors

**Solution:**
- Ensure Firestore is enabled (Step 2)
- Check security rules allow writes
- Verify user is signed in

---

### **Issue: Dashboard shows "Loading..." forever**

**Symptoms:**
- Stuck on "Warming up your workspace…"
- Never loads dashboard

**Diagnosis:**
- Check network tab (F12 → Network)
- Look for failed Firebase requests

**Solutions:**
1. **Clear browser cache**: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)
2. **Check Firebase config**: All env vars correct
3. **Restart dev server**: Stop and run `npm run dev` again

---

### **Issue: Profile picture/email not showing**

**Symptoms:**
- Top-right shows initials instead of photo
- Email shows as "Signed in" instead of actual email

**This is normal if:**
- User doesn't have Google profile picture
- Email privacy is restricted

**To show email:**
- The `user.email` field will populate automatically from Google
- Make sure user completed Google sign-in flow

---

## 📋 **Complete Testing Checklist**

After making all fixes:

- [ ] Firebase Authentication enabled with Google provider
- [ ] Authorized domains include `localhost`
- [ ] Firestore Database created in test mode
- [ ] Realtime Database created in test mode
- [ ] `.env.local` has all required values
- [ ] Dev server restarted after config changes
- [ ] Can sign in with Google successfully
- [ ] Redirects to dashboard after sign-in
- [ ] Dashboard shows user email/photo
- [ ] "New Document" button creates new sheet
- [ ] Can navigate between pages
- [ ] Left sidebar buttons clickable (even if just placeholders)

---

## 🆘 **Still Having Issues?**

### **Debug Mode**

Add this to your component to see what's happening:

```tsx
// In any component
useEffect(() => {
  console.log('Current user:', user);
  console.log('Firebase config:', {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? '✓' : '✗',
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? '✓' : '✗',
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? '✓' : '✗',
  });
}, [user]);
```

### **Check Firebase Initialization**

Create a test file: `sheet-app/app/test-firebase/page.tsx`

```tsx
"use client";

import { useEffect, useState } from "react";
import { getFirebaseClients } from "@/lib/firebase/config";

export default function TestFirebase() {
  const [status, setStatus] = useState("Testing...");

  useEffect(() => {
    try {
      const clients = getFirebaseClients();
      setStatus(`✅ Firebase initialized!
        Auth: ${clients.auth?.name ?? '✗'}
        Firestore: ${clients.firestore?.app?.name ?? '✗'}
        RealtimeDB: ${clients.realtimeDb?.app?.name ?? '✗'}
      `);
    } catch (error) {
      setStatus(`❌ Error: ${error}`);
    }
  }, []);

  return (
    <div className="p-8">
      <h1>Firebase Test</h1>
      <pre>{status}</pre>
    </div>
  );
}
```

Visit: `http://localhost:3000/test-firebase`

---

## ✅ **Success Indicators**

You'll know everything is working when:

1. ✅ Google sign-in popup appears
2. ✅ Can select account and sign in
3. ✅ Redirects to `/dashboard`
4. ✅ Dashboard shows your name/email
5. ✅ "New Document" button works
6. ✅ Can create and open sheets
7. ✅ No console errors
8. ✅ Real-time sync works between tabs

---

**Need Help?** 

Check these resources:
- [Firebase Docs](https://firebase.google.com/docs)
- [Next.js Docs](https://nextjs.org/docs)
- [README.md](./README.md) for setup instructions
- [DEPLOYMENT.md](./DEPLOYMENT.md) for production deployment

---

**Remember**: After ANY change to `.env.local` or Firebase settings, ALWAYS restart the dev server!

```bash
# Stop server (Ctrl+C)
# Then restart
npm run dev
```

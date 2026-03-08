# 🚀 Quick Start Guide - Get Running in 5 Minutes

## ⚡ **IMMEDIATE FIXES**

### **Problem 1: Google Sign-In Not Working**

**SYMPTOM**: Click "Sign in with Google" → Falls back to offline mode

**ROOT CAUSE**: Firebase Authentication not configured

**FIX (5 minutes)**:

```bash
# Step 1: Go to Firebase Console
https://console.firebase.google.com/

# Step 2: Select your project
trademarkia-bd8cd

# Step 3: Enable Authentication
Authentication → Get started → Sign-in method → Google → Enable → Save

# Step 4: Add authorized domain
Authentication → Settings → Authorized domains → Add "localhost"

# Step 5: Restart your dev server
Ctrl+C (to stop)
cd /Users/viksitchadha/Desktop/Trademarkia/sheet-app
npm run dev
```

---

### **Problem 2: Plain Auth Page (No Navbar)**

**ALREADY FIXED!** ✨

I've enhanced the auth page with:
- ✅ Beautiful navbar with logo and navigation
- ✅ Hero section with feature cards
- ✅ Ambient grid background animation
- ✅ Professional footer
- ✅ Responsive design (mobile-friendly)

**To see it**: Just refresh your browser at `http://localhost:3000/auth`

---

### **Problem 3: Dashboard Buttons Not Working**

**LIKELY CAUSES**:
1. User not properly signed in → Complete Step 1 first
2. Firestore not enabled → Enable in Firebase Console
3. Security rules too strict → Use test mode for development

**QUICK FIX**:

```bash
# In Firebase Console:
Firestore Database → Rules → Use this:

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /documents/{docId} {
      allow read, write: if request.auth != null;
      
      match /cells/{cellId} {
        allow read, write: if request.auth != null;
      }
      
      match /metadata/{metaId} {
        allow read, write: if request.auth != null;
      }
    }
    
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}

# Click "Publish"
```

---

## 📋 **Complete Setup Checklist**

Follow this EXACT order:

### **Phase 1: Firebase Configuration** (5 min)

- [ ] 1. Go to Firebase Console
- [ ] 2. Select project `trademarkia-bd8cd`
- [ ] 3. Enable Authentication with Google provider
- [ ] 4. Add `localhost` to authorized domains
- [ ] 5. Create Firestore Database (test mode)
- [ ] 6. Create Realtime Database (test mode)
- [ ] 7. Update Firestore security rules (use code above)

### **Phase 2: Local Environment** (2 min)

- [ ] 1. Verify `.env.local` exists with all values
- [ ] 2. Stop current dev server (Ctrl+C)
- [ ] 3. Clear Next.js cache: `rm -rf .next`
- [ ] 4. Restart: `npm run dev`

### **Phase 3: Test Everything** (3 min)

Open `http://localhost:3000` and verify:

- [ ] 1. See beautiful auth page with navbar
- [ ] 2. Click "Sign in with Google"
- [ ] 3. Google popup appears
- [ ] 4. Select your account
- [ ] 5. Redirects to `/dashboard`
- [ ] 6. Dashboard shows your name/email
- [ ] 7. Click "New Document" → Creates new sheet
- [ ] 8. Can open the sheet
- [ ] 9. Can edit cells
- [ ] 10. No console errors (F12)

---

## 🎯 **What Each Button Should Do**

### **Auth Page** (`/auth`)

| Element | Expected Behavior |
|---------|------------------|
| Logo (top-left) | Links to home |
| Dashboard link | Goes to `/dashboard` |
| GitHub link | Opens GitHub in new tab |
| Sign in with Google | Opens Google OAuth popup |
| Feature cards | Static display (no action) |

### **Dashboard** (`/dashboard`)

| Element | Expected Behavior |
|---------|------------------|
| Back button | Goes to `/auth` if not signed in |
| New Document button | Creates new sheet, opens editor |
| Document cards | Click to open that sheet |
| Sign out button | Signs out, redirects to `/auth` |
| Left sidebar items | Currently placeholders (cosmetic) |
| Stat cards | Display counts (auto-calculated) |

### **Sheet Editor** (`/sheet/[docId]`)

| Element | Expected Behavior |
|---------|------------------|
| Back button | Returns to dashboard |
| Document title | Click to edit (inline) |
| Sync indicator | Shows Live/Syncing/Offline |
| Activity button | Opens activity sidebar |
| Freeze buttons | Lock rows/columns |
| Toolbar buttons | Apply formatting |
| Cells | Click to select, double-click to edit |

---

## 🐛 **Debugging Tips**

### **Check if Firebase is Connected**

Open browser console (F12) and type:

```javascript
// Should show Firebase config values
console.log({
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
});
```

### **Check if User is Signed In**

In any component:

```tsx
const { user, loading } = useAuth();
console.log('User:', user);
console.log('Loading:', loading);
```

If `user` is `null` after sign-in, authentication failed.

### **Check Firestore Connection**

Look for these errors in console:
- `"Permission denied"` → Update security rules
- `"FirebaseError: Cannot query field"` → Check Firestore indexes
- `"Failed to get document"` → Network issue or Firestore not enabled

---

## 🆘 **Emergency Reset**

If nothing works, do a complete reset:

```bash
# 1. Stop everything
Ctrl+C

# 2. Clear all caches
cd /Users/viksitchadha/Desktop/Trademarkia/sheet-app
rm -rf .next
rm -rf node_modules

# 3. Reinstall dependencies
npm install

# 4. Restart
npm run dev
```

Then go through Phase 1 (Firebase setup) again.

---

## 📞 **Need More Help?**

Read these detailed guides:

1. **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** - Comprehensive debugging
2. **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Production deployment
3. **[README.md](./README.md)** - Full feature list

---

## ✅ **Success Looks Like This**

When everything works, you should see:

1. ✨ Beautiful auth page with hero section
2. 🔐 Google sign-in works smoothly
3. 📊 Dashboard loads with your profile
4. 📝 Can create and edit spreadsheets
5. 🔄 Real-time sync between tabs
6. 👥 Presence indicators show other users
7. 🎨 All buttons respond to clicks
8. ❌ Zero console errors

**If you have all this, you're ready to demo! 🎉**

---

**Estimated Time to Fix Everything**: 10-15 minutes  
**Difficulty Level**: Beginner (just follow steps)  
**Prerequisites**: Firebase account (free)

Good luck! 🚀

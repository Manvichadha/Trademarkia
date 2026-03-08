# 🚀 Deployment Guide

Step-by-step instructions to deploy Trademarkia Spreadsheet to production.

---

## Prerequisites

Before deploying, ensure you have:
- [ ] GitHub account
- [ ] Vercel account (free tier works)
- [ ] Firebase project with:
  - Firestore Database enabled
  - Realtime Database enabled
  - Authentication (Google provider) enabled

---

## Step 1: Firebase Setup

### 1.1 Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name (e.g., "trademarkia-spreadsheet")
4. Enable Google Analytics (optional)
5. Click "Create project"

### 1.2 Enable Firestore Database

1. In Firebase Console, click "Firestore Database" in left sidebar
2. Click "Create database"
3. Choose "Start in test mode" (for development)
4. Select location (choose closest to your users)
5. Click "Enable"

### 1.3 Enable Realtime Database

1. In Firebase Console, click "Realtime Database"
2. Click "Create database"
3. Choose "Start in test mode"
4. Select location (same as Firestore)
5. Click "Enable"

### 1.4 Set Up Authentication

1. Click "Authentication" in left sidebar
2. Click "Get started"
3. Click "Sign-in method" tab
4. Enable "Google" provider
5. Add your project domain (will get from Vercel later)
6. Click "Save"

### 1.5 Get Firebase Configuration

1. Go to Project Settings (gear icon)
2. Scroll to "Your apps" section
3. Click web app icon (</>)
4. Register app with nickname "Trademarkia Web"
5. Copy the `firebaseConfig` object values

You'll need these values:
```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};
```

Also note the Realtime Database URL:
```
https://your-project-default-rtdb.firebaseio.com/
```

---

## Step 2: GitHub Repository

### 2.1 Initialize Git (if not already done)

```bash
cd /Users/viksitchadha/Desktop/Trademarkia/sheet-app
git init
git add .
git commit -m "Initial commit: Trademarkia Spreadsheet"
```

### 2.2 Create GitHub Repository

1. Go to [GitHub](https://github.com/)
2. Click "+" → "New repository"
3. Name: `trademarkia-spreadsheet`
4. Make it **Private** (or Public if you prefer)
5. Don't initialize with README (we already have one)
6. Click "Create repository"

### 2.3 Push to GitHub

```bash
# Add remote (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/trademarkia-spreadsheet.git

# Push to GitHub
git branch -M main
git push -u origin main
```

---

## Step 3: Vercel Deployment

### 3.1 Connect to Vercel

1. Go to [Vercel](https://vercel.com/)
2. Sign in with GitHub
3. Click "Add New..." → "Project"
4. Import your `trademarkia-spreadsheet` repository
5. Click "Import"

### 3.2 Configure Build Settings

Vercel auto-detects Next.js. Verify:
- **Framework Preset**: Next.js
- **Root Directory**: `./sheet-app` (if repo root is sheet-app) or `./`
- **Build Command**: `npm run build`
- **Output Directory**: `.next` (default)

### 3.3 Add Environment Variables

Click "Environment Variables" and add:

```
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your-project-default-rtdb.firebaseio.com/
```

**Important**: Use the exact variable names from `.env.local`

### 3.4 Deploy

1. Click "Deploy"
2. Wait for build (~2-3 minutes)
3. Once complete, you'll see "Congratulations!"
4. Click on your project name
5. Note your production URL: `https://trademarkia-spreadsheet.vercel.app`

---

## Step 4: Update Firebase Configuration

### 4.1 Add Vercel Domain to Firebase Auth

1. Go back to Firebase Console
2. Authentication → Settings → Authorized domains
3. Click "Add domain"
4. Enter your Vercel URL (without https://)
   ```
   trademarkia-spreadsheet.vercel.app
   ```
5. Click "Add"

### 4.2 Update Firestore Security Rules

For production, update rules in Firebase Console:

**Firestore Rules:**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read/write their documents
    match /documents/{docId} {
      allow read, write: if request.auth != null;
      
      // Cells subcollection
      match /cells/{cellId} {
        allow read, write: if request.auth != null;
      }
      
      // Metadata subcollection
      match /metadata/{metaId} {
        allow read, write: if request.auth != null;
      }
    }
  }
}
```

**Realtime Database Rules:**
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

---

## Step 5: Test Deployment

### 5.1 Open Production URL

Visit: `https://trademarkia-spreadsheet.vercel.app`

### 5.2 Test Checklist

- [ ] Can access homepage
- [ ] Redirects to auth page
- [ ] Google sign-in works
- [ ] Dashboard loads
- [ ] Can create new document
- [ ] Can edit cells
- [ ] Formulas work (=SUM, =IF, etc.)
- [ ] Sync indicator shows "Live"
- [ ] Can open same doc in multiple tabs
- [ ] Presence shows other users
- [ ] Formatting works (bold, italic, colors)
- [ ] Export works (CSV, JSON, XLSX)
- [ ] Offline mode queues changes
- [ ] Reconnect syncs queued changes

---

## Step 6: Custom Domain (Optional)

### 6.1 Add Domain to Vercel

1. Go to Vercel project settings
2. Click "Domains"
3. Enter your custom domain (e.g., `sheets.trademarkia.com`)
4. Follow DNS configuration instructions
5. Wait for SSL certificate (~5 minutes)

### 6.2 Update Firebase

Add custom domain to:
1. Firebase Authentication → Authorized domains
2. Update CORS settings if needed

---

## Step 7: Share Access

### Grant Access to Trademarkia

1. **GitHub Repository**:
   - Go to repo Settings → Collaborators
   - Add: `recruitments@trademarkia.com`
   - Give Read access

2. **Vercel Project**:
   - Go to Settings → People
   - Add team member (if using Teams)
   - Or share the deployment URL

3. **Firebase Project** (optional):
   - Go to Project Settings → Permissions
   - Add user with Viewer role

---

## 🔧 Troubleshooting

### Build Fails on Vercel

**Error**: Module not found
```bash
# Solution: Ensure all dependencies are in package.json
npm install
git push
```

**Error**: TypeScript errors
```bash
# Solution: Fix locally first
npm run build
# Then push fixes
git push
```

### Environment Variables Not Working

**Issue**: Variables not prefixed with `NEXT_PUBLIC_`
```bash
# Client-side variables MUST start with NEXT_PUBLIC_
NEXT_PUBLIC_FIREBASE_API_KEY=... ✅
FIREBASE_API_KEY=... ❌
```

### Firebase Connection Issues

**Error**: Firebase not initializing
- Check all environment variables are correct
- Verify Firebase project ID matches
- Ensure Firestore and Realtime DB are enabled

**Error**: Permission denied
- Update Firestore security rules
- Check authentication is working
- Verify user is signed in

### Real-time Sync Not Working

**Check**:
1. Firestore rules allow read/write
2. Internet connection stable
3. No console errors
4. Same document ID in both tabs

---

## 📊 Performance Optimization

### Enable Vercel Analytics

1. Go to Vercel project → Analytics
2. Click "Connect"
3. Accept default settings

### Enable Edge Caching

Add to `next.config.ts`:
```typescript
module.exports = {
  headers: async () => [
    {
      source: '/:all*',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=0, must-revalidate',
        },
      ],
    },
  ],
}
```

### Optimize Images

If adding images later:
```tsx
import Image from 'next/image'
// Use Next.js Image component for optimization
```

---

## 🔐 Security Best Practices

### Production Rules

Never use test mode in production. Update rules to:

**Firestore:**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /documents/{docId} {
      // Only allow access if user is authenticated
      allow read, write: if request.auth != null;
      
      // Optional: Restrict to document collaborators
      // allow read, write: if request.auth != null && 
      //   request.auth.uid in resource.data.collaborators;
    }
  }
}
```

### Rate Limiting

Firebase has built-in rate limiting. Monitor usage in:
- Firebase Console → Usage
- Upgrade plan if hitting limits

### Secrets Management

- Never commit `.env.local` to Git
- Use Vercel environment variables
- Rotate API keys periodically

---

## 📈 Monitoring

### Vercel Dashboard

Monitor:
- Build success/failure
- Deployment history
- Function invocations
- Bandwidth usage

### Firebase Console

Monitor:
- Firestore reads/writes
- Realtime DB connections
- Authentication sign-ins
- Error logs (Functions → Logs)

### Browser Console

Watch for:
- Firebase initialization errors
- Sync failures
- Permission denied errors

---

## 🎉 Post-Deployment Checklist

After successful deployment:

- [ ] Test all features in production
- [ ] Share demo link with team
- [ ] Record demo video (2-3 min)
- [ ] Update README with live URL
- [ ] Submit assignment form
- [ ] Monitor for errors
- [ ] Gather user feedback
- [ ] Plan next iterations

---

## 🆘 Getting Help

### Resources

- **Next.js Docs**: https://nextjs.org/docs
- **Vercel Guides**: https://vercel.com/guides
- **Firebase Docs**: https://firebase.google.com/docs
- **Tailwind CSS**: https://tailwindcss.com/docs

### Common Issues

1. **Build fails**: Check TypeScript errors locally first
2. **Env vars missing**: Prefix with `NEXT_PUBLIC_`
3. **Firebase errors**: Verify config matches console
4. **Sync issues**: Check Firestore rules and quotas

---

## ✅ Success Criteria

Your deployment is successful when:

✅ Accessible via public URL  
✅ No console errors  
✅ Authentication works  
✅ Real-time sync functional  
✅ Presence indicators visible  
✅ All formulas calculate correctly  
✅ Zero TypeScript errors  
✅ Build completes successfully  

---

**Congratulations! Your spreadsheet is live! 🚀**

---

## 🧠 Design Decisions & Assignment Justification

**1. Formula Engine Depth**
The assignment requests justification for "how deep the parser goes". I opted to build a full custom Recursive Descent Parser with an Abstract Syntax Tree (AST) and a Topological Sorter (`lib/spreadsheet/parser.ts` & `evaluator.ts`). 
* **Depth implemented:** It supports ranges (`A1:B5`), basic arithmetic (`+`, `-`, `*`, `/`), comparisons (`>`, `<`), and 20+ core functions (`SUM`, `AVERAGE`, `IF`, `CONCATENATE`, etc.).
* **Justification:** While a simple Regex or `eval()` could have satisfied `=SUM` and basic arithmetic, `eval()` is a massive security risk in web apps. A custom AST parser ensures code execution is impossible, providing a secure, sandboxed evaluation environment. The topological sort ensures that formulas can reference other formulas without breaking, safely catching and labeling true circular dependencies (`#CIRC!`) without infinite computation loops. This depth is the minimum threshold for a "production-ready skeleton" that can actually be safely scaled later.

**2. Content Sync & LWW Resolution**
For offline/online state contention, we use a custom Last-Write-Wins implementation driven by per-cell `updatedAt` timestamps in Firestore. Local pending writes are tracked in memory, and remote `onSnapshot` data is only accepted if its timestamp strongly beats the local uncommitted edit. This prevents UI jank when typing quickly while saving occurs asynchronously in the background.

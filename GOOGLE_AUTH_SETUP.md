# Firebase Authentication Setup for Madness Journal

## 🚀 Quick Setup

### 1. Install Dependencies
```bash
npm install firebase@^10.7.1
```

### 2. Environment Configuration

Create a `.env.local` file in your project root:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key-here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef123456
```

### 3. Firebase Project Setup

#### Step 1: Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or select existing project
3. Follow the setup wizard
4. Enable Google Analytics (optional but recommended)

#### Step 2: Enable Authentication
1. In Firebase Console, go to "Authentication" > "Sign-in method"
2. Click on "Google" provider
3. Enable Google sign-in
4. Add your authorized domain (localhost for development)
5. Save the configuration

#### Step 3: Get Firebase Config
1. In Firebase Console, go to Project Settings (gear icon)
2. Scroll down to "Your apps" section
3. Click "Add app" > "Web" if you haven't added a web app
4. Register your app with a nickname
5. Copy the Firebase configuration object
6. Update your `.env.local` with the copied values

#### Step 4: Enable Firestore (for future use)
1. Go to "Firestore Database" in Firebase Console
2. Click "Create database"
3. Choose "Start in test mode" for development
4. Select a location close to your users

### 4. Start the Application
```bash
npm run dev
```

## 🔧 Features Implemented

### ✅ Authentication Flow
- **Sign In**: Users can sign in with Google via Firebase
- **Sign Out**: Users can sign out from the dropdown menu
- **Session Management**: Automatic session handling with Firebase Auth
- **Protected Routes**: Home page shows sign-in prompt for unauthenticated users

### ✅ User Interface
- **Loading State**: Shows spinner while checking authentication
- **User Profile**: Displays user avatar, name, and email from Google
- **Dropdown Menu**: User profile dropdown with sign-out option
- **Responsive Design**: Works on mobile and desktop

### ✅ Security
- **Environment Variables**: Secure credential storage
- **Firebase Security**: Built-in Firebase security features
- **Google OAuth**: Secure Google authentication flow

## 📁 Files Created/Modified

### New Files:
- `lib/firebase.ts` - Firebase configuration and initialization
- `components/firebase-auth-provider.tsx` - Firebase Auth context provider
- `.env.local.example` - Environment variables template
- `GOOGLE_AUTH_SETUP.md` - This setup guide

### Modified Files:
- `package.json` - Added Firebase dependency, removed NextAuth
- `app/layout.tsx` - Updated to use Firebase AuthProvider
- `app/page.tsx` - Updated to use Firebase Auth hooks
- `app/auth/signin/page.tsx` - Updated to use Firebase Auth

### Removed Files:
- `app/api/auth/[...nextauth]/route.ts` - No longer needed
- `components/auth-provider.tsx` - Replaced with Firebase provider

## 🎯 Usage

### For Users:
1. Visit the app homepage
2. Click "Sign In to Continue" if not authenticated
3. Click "Continue with Google" on the sign-in page
4. Grant permissions to your Google account
5. Access the journaling features with your profile

### For Developers:
- All authentication state is managed by Firebase Auth
- Use `useAuth()` hook to access user data and auth functions
- User data includes: `user.displayName`, `user.email`, `user.photoURL`
- Firebase Auth provides automatic session persistence

## 🔒 Security Notes

- Never commit `.env.local` to version control
- Use Firebase Security Rules for Firestore protection
- Enable Firebase App Check for additional security
- Monitor authentication logs in Firebase Console

## 🚀 Production Deployment

### Environment Variables for Production:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-production-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-production-domain.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-production-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-production-bucket.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-production-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-production-app-id
```

### Firebase Production Setup:
1. Add your production domain to authorized domains in Firebase Console
2. Update environment variables with production Firebase config
3. Set up Firebase Security Rules for Firestore
4. Enable Firebase App Check for additional security

## 🐛 Troubleshooting

### Common Issues:
1. **"Firebase App not initialized"**: Check if Firebase config is correct
2. **"Permission denied"**: Verify Firebase Security Rules
3. **"Invalid API key"**: Ensure environment variables are set correctly
4. **"Domain not authorized"**: Add domain to Firebase authorized domains

### Debug Mode:
Enable Firebase debug mode in browser console:
```javascript
localStorage.setItem('debug', 'firebase:*')
```

## 📚 Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Auth Guide](https://firebase.google.com/docs/auth)
- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Next.js with Firebase](https://nextjs.org/docs/authentication#firebase)

## 🔄 Migration from NextAuth

### What Changed:
- Replaced NextAuth.js with Firebase Authentication
- Updated all auth hooks and components
- Simplified configuration (no API routes needed)
- Better integration with Firestore for future data storage

### Benefits:
- **Easier Setup**: Less configuration required
- **Better Integration**: Native Firebase ecosystem
- **Real-time Ready**: Built for real-time features
- **Scalable**: Firebase handles scaling automatically 
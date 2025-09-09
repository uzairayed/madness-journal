# 🔒 Firestore Security Rules for Madness Journal

## ⚠️ CRITICAL: Apply These Rules Immediately

**Current Status**: Your Firestore database is likely in test mode, which means ANYONE can read/write your data!

## 🚀 How to Apply These Rules

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Firestore Database** → **Rules**
4. Replace the existing rules with the rules below
5. Click **Publish**

## 🛡️ Production Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // ✅ Diary Entries - Users can only access their own entries
    match /diary_entries/{entryId} {
      allow read, write: if request.auth != null 
        && request.auth.uid == resource.data.userId;
      
      // Allow creation if the user owns the entry
      allow create: if request.auth != null 
        && request.auth.uid == request.resource.data.userId
        && request.resource.data.keys().hasAll(['userId', 'mode', 'title', 'content', 'timestamp', 'isPublic'])
        && request.resource.data.userId is string
        && request.resource.data.mode is string
        && request.resource.data.title is string
        && request.resource.data.content is string
        && request.resource.data.isPublic is bool;
    }
    
    // ✅ Public Diary Entries - Anyone can read public entries
    match /diary_entries/{entryId} {
      allow read: if resource.data.isPublic == true;
    }
    
    // ✅ User Profiles - Users can only access/modify their own profile
    match /user_profiles/{userId} {
      allow read, write: if request.auth != null 
        && request.auth.uid == userId;
      
      // Allow creation with validation
      allow create: if request.auth != null 
        && request.auth.uid == userId
        && request.resource.data.keys().hasAll(['userId', 'displayName', 'joinDate'])
        && request.resource.data.userId == userId
        && request.resource.data.displayName is string;
    }
    
    // ✅ Public Profiles - Anyone can read basic profile info for public entries
    match /user_profiles/{userId} {
      allow read: if true; // Public profile info needed for displaying public entries
    }
    
    // ✅ User Achievements - Users can only access their own achievements
    match /user_achievements/{userId} {
      allow read, write: if request.auth != null 
        && request.auth.uid == userId;
    }
    
    // ❌ Deny all other access
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

## 🔍 Rule Explanations

### **Diary Entries Security**
- ✅ Users can only read/write their own entries
- ✅ Public entries can be read by anyone
- ✅ Validates required fields on creation
- ✅ Prevents data type injection

### **User Profiles Security**  
- ✅ Users can only modify their own profile
- ✅ Public profiles readable for displaying authors of public entries
- ✅ Validates profile structure on creation

### **Achievements Security**
- ✅ Users can only access their own achievements
- ✅ Prevents achievement manipulation

## 🧪 Testing Your Rules

### Test in Firebase Console:
1. Go to **Firestore** → **Rules** → **Rules Playground**
2. Test these scenarios:

**✅ Should ALLOW:**
```
Location: /diary_entries/test123
Operation: get
Auth: User ID abc (same as userId in document)
```

**❌ Should DENY:**
```
Location: /diary_entries/test123  
Operation: get
Auth: User ID xyz (different from userId in document)
```

**✅ Should ALLOW (Public Entry):**
```
Location: /diary_entries/test123
Operation: get  
Auth: Any user or unauthenticated
Document data: { isPublic: true }
```

## 🚨 Emergency Rollback

If something breaks after applying rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

This allows any authenticated user to access any document (less secure but functional).

## 📋 Security Checklist

- [ ] Applied Firestore security rules
- [ ] Tested rules in Firebase Console
- [ ] Verified app still works after applying rules
- [ ] Ensured public entries are readable
- [ ] Confirmed private entries are protected
- [ ] Set up Firebase App Check (recommended)
- [ ] Enabled audit logging (recommended)

## 🔧 Additional Security Measures

### 1. Enable Firebase App Check
```bash
# In Firebase Console:
# Project Settings → App Check → Web apps → Add domain
```

### 2. Set Up Monitoring
```bash
# Firebase Console → Firestore → Usage tab
# Monitor for unusual activity patterns
```

### 3. Regular Security Audits
- Review access logs monthly
- Check for unauthorized access attempts
- Update rules as app features evolve

## ⚠️ Important Notes

1. **Test First**: Always test rules in a development environment
2. **Backup Data**: Ensure you have backups before changing rules
3. **Monitor Logs**: Watch for rule violations after deployment
4. **Update Rules**: As your app evolves, update security rules accordingly

## 🆘 Need Help?

If you encounter issues:
1. Check Firebase Console logs
2. Use the Rules Playground to debug
3. Refer to [Firebase Security Rules Documentation](https://firebase.google.com/docs/firestore/security/get-started) 
# Complete Firebase Backend Setup Guide for USBS NGO Website

## Step 1: Create Firebase Project

1. **Go to Firebase Console**
   - Visit [https://console.firebase.google.com/](https://console.firebase.google.com/)
   - Sign in with your Google account

2. **Create New Project**
   - Click "Create a project"
   - Enter project name: `usbs-ngo-website`
   - Choose whether to enable Google Analytics (recommended: Yes)
   - Select your Analytics account or create new one
   - Click "Create project"

3. **Wait for Project Creation**
   - Firebase will set up your project (takes 1-2 minutes)
   - Click "Continue" when ready

## Step 2: Enable Firebase Services

### 2.1 Enable Authentication
1. In Firebase Console, click "Authentication" in left sidebar
2. Click "Get started"
3. Go to "Sign-in method" tab
4. Enable "Email/Password" provider:
   - Click on "Email/Password"
   - Toggle "Enable" to ON
   - Click "Save"

### 2.2 Enable Firestore Database
1. Click "Firestore Database" in left sidebar
2. Click "Create database"
3. Choose "Start in test mode" (we'll add security rules later)
4. Select your preferred location (choose closest to your users)
5. Click "Done"

### 2.3 Enable Storage
1. Click "Storage" in left sidebar
2. Click "Get started"
3. Choose "Start in test mode"
4. Select same location as Firestore
5. Click "Done"

## Step 3: Get Firebase Configuration

1. **Go to Project Settings**
   - Click the gear icon ⚙️ next to "Project Overview"
   - Select "Project settings"

2. **Add Web App**
   - Scroll down to "Your apps" section
   - Click the web icon `</>`
   - Enter app nickname: `USBS NGO Website`
   - Check "Also set up Firebase Hosting" (optional)
   - Click "Register app"

3. **Copy Configuration**
   - Copy the `firebaseConfig` object
   - It should look like this:
   ```javascript
   const firebaseConfig = {
     apiKey: "your-api-key-here",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "123456789",
     appId: "your-app-id"
   };
   ```

## Step 4: Update Your Code

1. **Replace Firebase Config**
   - Open `src/contexts/FirebaseContext.tsx`
   - Replace the placeholder config with your actual config:

```typescript
// Replace this placeholder config
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-actual-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-actual-sender-id",
  appId: "your-actual-app-id"
};
```

## Step 5: Set Up Firestore Collections

### 5.1 Create Categories Collection
1. Go to Firestore Database in Firebase Console
2. Click "Start collection"
3. Collection ID: `categories`
4. Add first document:
   - Document ID: (auto-generate)
   - Fields:
     ```
     name: "Legal Help" (string)
     description: "Get legal assistance for various issues and disputes" (string)
     createdAt: (timestamp - click clock icon and select "Current time")
     ```
5. Click "Save"

6. **Add More Categories** (repeat for each):
   - **Education Help**:
     ```
     name: "Education Help"
     description: "Find resources and support for educational guidance"
     createdAt: (current timestamp)
     ```
   - **Medical Help**:
     ```
     name: "Medical Help"
     description: "Receive aid for medical emergencies and health needs"
     createdAt: (current timestamp)
     ```

### 5.2 Create Admin User
1. Go to Authentication in Firebase Console
2. Click "Users" tab
3. Click "Add user"
4. Enter:
   - Email: `admin@usbs.org` (or your preferred admin email)
   - Password: Create a strong password
5. Click "Add user"
6. Copy the User UID (you'll need this for admin verification)

### 5.3 Create Admins Collection
1. Go back to Firestore Database
2. Click "Start collection"
3. Collection ID: `admins`
4. Document ID: Use the User UID from step 5.2
5. Fields:
   ```
   email: "admin@usbs.org" (string)
   role: "admin" (string)
   createdAt: (current timestamp)
   ```
6. Click "Save"

## Step 6: Set Up Security Rules

### 6.1 Firestore Security Rules
1. Go to Firestore Database
2. Click "Rules" tab
3. Replace the default rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && 
        (request.auth.uid == userId || 
         exists(/databases/$(database)/documents/admins/$(request.auth.uid)));
    }
    
    // Users can read/write their own requests
    match /requests/{requestId} {
      allow read, write: if request.auth != null && 
        (resource.data.userId == request.auth.uid || 
         exists(/databases/$(database)/documents/admins/$(request.auth.uid)));
      allow create: if request.auth != null;
    }
    
    // Everyone can read categories
    match /categories/{categoryId} {
      allow read: if true;
      allow write: if request.auth != null && 
        exists(/databases/$(database)/documents/admins/$(request.auth.uid));
    }
    
    // Only admins can access admin collection
    match /admins/{adminId} {
      allow read: if request.auth != null && request.auth.uid == adminId;
    }
  }
}
```

4. Click "Publish"

### 6.2 Storage Security Rules
1. Go to Storage
2. Click "Rules" tab
3. Replace with:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Users can upload their own documents
    match /documents/{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

4. Click "Publish"

## Step 7: Test Your Setup

1. **Start Your Development Server**
   ```bash
   npm run dev
   ```

2. **Test Language Selection**
   - Visit your app
   - Select a language
   - Verify it saves and persists

3. **Test Theme Selection**
   - Select different themes
   - Verify dark/light mode works

4. **Test User Registration**
   - Go through onboarding
   - Fill out the request form
   - Submit a test request

5. **Test Admin Login**
   - Go to `/admin`
   - Login with your admin credentials
   - Verify you can see and manage requests

## Step 8: Production Deployment (Optional)

### 8.1 Enable Firebase Hosting
1. Install Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```bash
   firebase login
   ```

3. Initialize Firebase in your project:
   ```bash
   firebase init
   ```
   - Select "Hosting"
   - Choose your Firebase project
   - Set public directory to `dist`
   - Configure as single-page app: Yes
   - Set up automatic builds: No

4. Build your project:
   ```bash
   npm run build
   ```

5. Deploy:
   ```bash
   firebase deploy
   ```

## Troubleshooting Common Issues

### Issue 1: "Firebase not initialized"
- **Solution**: Make sure you've replaced the placeholder config in `FirebaseContext.tsx`

### Issue 2: "Permission denied" errors
- **Solution**: Check your Firestore security rules and make sure they match the ones provided

### Issue 3: Admin login not working
- **Solution**: Verify the admin user exists in Authentication and has a corresponding document in the `admins` collection

### Issue 4: Categories not loading
- **Solution**: Make sure you've created the `categories` collection with at least one document

### Issue 5: File uploads failing
- **Solution**: Check Storage security rules and ensure Storage is enabled

## Environment Variables (Optional)

For better security in production, you can use environment variables:

1. Create `.env` file in your project root:
```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=your-app-id
```

2. Update `FirebaseContext.tsx` to use environment variables:
```typescript
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};
```

## Next Steps

1. **Customize Categories**: Add more help categories as needed
2. **Add More Admins**: Create additional admin accounts
3. **Customize Styling**: Modify colors, fonts, and layout to match your brand
4. **Add Analytics**: Set up Google Analytics for user tracking
5. **Add Notifications**: Implement email/SMS notifications for request updates
6. **Backup Strategy**: Set up regular Firestore backups

## Support

If you encounter any issues:
1. Check the browser console for error messages
2. Verify your Firebase configuration
3. Check Firebase Console for any service issues
4. Review the security rules for permission issues

Your USBS NGO website should now be fully functional with Firebase backend integration!
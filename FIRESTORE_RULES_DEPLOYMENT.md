# Firestore Security Rules Deployment Guide

## Overview
This document explains how to deploy the Firestore security rules for LeafGuard AI.

## Prerequisites
- Firebase project created
- Firebase CLI installed (`npm install -g firebase-tools`)
- Authenticated with Firebase (`firebase login`)

## Deployment Steps

### 1. Initialize Firebase in the project (if not already done)
```bash
cd "D:\Leaf Disease Prediction\LeafDiseaseAPI"
firebase init firestore
```
- Select your Firebase project
- When asked for Firestore rules file, enter: `firestore.rules`
- When asked for Firestore indexes file, enter: `firestore.indexes.json` (or create empty file)

### 2. Deploy Rules Only
```bash
firebase deploy --only firestore:rules
```

### 3. Verify Deployment
- Go to Firebase Console → Firestore Database → Rules
- Verify the rules match `firestore.rules` content
- Test with a test user account

## Rules Summary

The rules enforce:
1. **User profiles** (`/users/{userId}`): Users can only read/write their own profile
2. **Scan history** (`/scans/{scanId}`): Users can only access their own scans
3. **Plants** (`/plants/{plantId}`): Users can only access their own plants
4. **All other access**: Denied by default

## Key Security Features

- **Ownership validation**: Every operation validates `request.auth.uid == resource.data.userId`
- **userId immutability**: Users cannot change `userId` field to impersonate others
- **Create validation**: New documents must have `userId` matching authenticated UID
- **Default deny**: All unspecified paths are denied by default

## Testing Checklist

- [ ] Deploy rules to Firebase
- [ ] Login as User A, create scan
- [ ] Verify User A can read their scan
- [ ] Login as User B, try to read User A's scan (should fail)
- [ ] Login as User A, try to update scan with different userId (should fail)
- [ ] Login as User A, delete scan (should succeed)
- [ ] Login as User B, try to delete User A's scan (should fail)
- [ ] Test plants collection similarly

## Rollback Procedure
If issues arise:
```bash
# View deployment history
firebase firestore:rules:list

# Rollback to previous version
firebase firestore:rules:release <version_number>
```
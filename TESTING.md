# GDPI Testing Guide

## Quick Verification Checklist

This guide helps verify that all GDPI MVP features are working correctly.

## Prerequisites

- Node.js 18+ installed
- Dependencies installed (`npm install`)
- `.env` file created from `.env.example`

## 1. TypeScript Compilation

```bash
npx tsc --noEmit
```

**Expected Result**: No errors

## 2. Start Development Server

```bash
npx expo start -c
```

**Expected Result**: Metro bundler starts successfully on http://localhost:8081

## 3. Feature Testing

### 3.1 Login Flow

**Test Case**: User Authentication

1. Launch the app
2. Enter HOA ID: `hoa001`
3. Enter Email: `admin@hoa001.com`
4. Enter PIN: `1234`
5. Tap "Login"

**Expected Result**: 
- User is authenticated
- Home screen appears
- Welcome message shows "Welcome, admin@hoa001.com"
- Role shows "HOA Administrator"

**Alternate Test (Resident)**:
- Email: `resident@hoa001.com`
- PIN: `5678`
- Role should show "Resident"

### 3.2 Home Screen

**Test Case**: Navigation Options

**Expected Elements**:
- ✓ Welcome header with user email and role
- ✓ HOA ID display
- ✓ "AI Analyze My Quote" button
- ✓ "Manual Entry" button
- ✓ "Neighborhood Pricing" button
- ✓ "Manage Residents" button (admin only)
- ✓ Arizona Baseline Pricing card
- ✓ Common Hustler Tactics warning card
- ✓ Logout button

### 3.3 AI Quote Analysis

**Test Case**: Analyze Written Quote

1. From Home, tap "AI Analyze My Quote"
2. Enter quote text:
   ```
   Garage Door Repair Quote
   Torsion Springs (pair): $450
   Labor: $200
   Total: $650
   ```
3. Enter door setup: "Double, insulated, 7ft"
4. Select timing: "Scheduled"
5. Tap "Analyze Quote"

**Expected Result**:
- Loading spinner appears
- Within 3-5 seconds, results display:
  - Verdict badge (green/yellow/red)
  - Price Context explanation
  - Red Flags list
  - Vendor Questions (2-3)
  - Next Step recommendation
- Success message: "Analysis saved to your quote history"

**Test with After-Hours**:
1. Repeat with same quote
2. Select timing: "After-Hours"
3. Verify multiplier logic mentioned in price context

### 3.4 Manual Quote Entry

**Test Case**: Enter Quote Manually

1. From Home, tap "Manual Entry"
2. Select parts:
   - ✓ Torsion Springs (pair)
   - ✓ Rollers
3. Enter labor cost: "500"
4. Enter door setup: "Single, insulated, 8ft"
5. Select timing: "Scheduled"
6. Tap "Analyze Quote"

**Expected Result**:
- Same analysis format as AI Quote Analysis
- Quote saved to history

### 3.5 Neighborhood Pricing History

**Test Case**: View Community Data

1. From Home, tap "Neighborhood Pricing"
2. After submitting quotes above, data should appear

**Expected Elements**:
- Community Statistics card with:
  - Total Quotes count
  - Average Cost
  - Min/Max Cost
  - After-hours percentage
- Recent Quotes list showing:
  - Date
  - Verdict badge
  - Job type
  - Door setup
  - Timing
  - Amount
- Educational footer

**Empty State Test**:
- Use a different HOA ID to see empty state

### 3.6 Admin Roster Management

**Test Case**: Manage Residents (Admin Only)

1. Login as admin@hoa001.com
2. From Home, tap "Manage Residents"

**Add Resident**:
1. Enter email: "newresident@example.com"
2. Leave PIN empty (auto-generate)
3. Tap "Add Resident"

**Expected Result**:
- Alert shows new credentials
- Resident appears in list

**Rotate PIN**:
1. Find any resident in list
2. Tap "🔄 Rotate PIN"
3. Confirm

**Expected Result**:
- Alert shows new PIN
- PIN updated in list

**Edit Email**:
1. Tap "✏️ Edit Email"
2. Enter new email
3. Confirm

**Expected Result**:
- Email updated in list

**Remove Resident**:
1. Tap "🗑️ Remove"
2. Confirm deletion

**Expected Result**:
- Resident removed from list

### 3.7 Multi-Tenancy

**Test Case**: Data Isolation

1. Login as hoa001 user
2. Submit a quote
3. Logout
4. Login with different HOA ID (e.g., hoa002)
5. View Neighborhood Pricing

**Expected Result**:
- No quotes from hoa001 visible
- Data is strictly isolated by HOA ID

### 3.8 Logout

**Test Case**: User Logout

1. From Home, tap "Logout"
2. Confirm

**Expected Result**:
- User returned to Login screen
- Session cleared

## 4. Data Persistence

**Test Case**: AsyncStorage Persistence

1. Submit multiple quotes
2. Close and reopen app
3. Login again
4. View Neighborhood Pricing

**Expected Result**:
- All previously submitted quotes are still there
- Data persists across app restarts

## 5. Error Handling

### 5.1 Invalid Login

**Test Case**:
- HOA ID: `invalid`
- Email: `test@test.com`
- PIN: `0000`

**Expected Result**:
- Alert with error message
- Demo credentials shown in alert

### 5.2 Empty Fields

**Test Case**: Submit forms with empty fields

**Expected Result**:
- Appropriate validation errors
- Clear guidance on required fields

### 5.3 AI API Failure

**Test Case**: Invalid or missing API key

1. Don't set OPENAI_API_KEY in .env
2. Try to analyze a quote

**Expected Result**:
- Falls back to mock analysis
- Still provides verdict and guidance

## 6. Performance Tests

### 6.1 AI Analysis Speed

**Target**: < 5 seconds for quote analysis

**Test**:
1. Time from tapping "Analyze" to results appearing
2. Should be 3-5 seconds with real API
3. Should be < 1 second with mock analysis

### 6.2 Navigation Speed

**Target**: Instant navigation between screens

**Test**:
- Navigate between all screens
- Should feel smooth and responsive

### 6.3 Storage Operations

**Target**: < 500ms for local operations

**Test**:
- Add/remove residents
- Submit quotes
- Load history
- All should be near-instant

## 7. Security Tests

### 7.1 No PII in Quote History

**Test**:
1. Submit quotes with personal info in notes
2. Check stored data structure

**Expected Result**:
- Only anonymized data stored
- Notes truncated to 200 chars
- No email, address, or personal identifiers

### 7.2 PIN Security

**Test**:
- PINs are 4 digits
- Stored securely in AsyncStorage
- PIN rotation works correctly

### 7.3 HOA Data Isolation

**Test**:
- Create residents in multiple HOAs
- Verify no cross-HOA data access
- Admins can only see their HOA residents

## 8. Cross-Platform Testing

### iOS Testing

```bash
npx expo start --ios
```

**Verify**:
- All screens render correctly
- Touch interactions work
- SafeArea respected
- Keyboard behavior correct

### Android Testing

```bash
npx expo start --android
```

**Verify**:
- All screens render correctly
- Touch interactions work
- Back button behavior
- Keyboard behavior correct

### Web Testing (if needed)

```bash
npx expo start --web
```

## 9. Arizona Baseline Pricing Verification

**Test Case**: Compare quotes to baseline

| Service | Baseline | Test Quote | Expected Verdict |
|---------|----------|------------|-----------------|
| Service Call | $75-$150 | $100 | Green |
| Service Call | $75-$150 | $500 | Red |
| Torsion Springs | $320-$520 | $400 | Green |
| Torsion Springs | $320-$520 | $800 | Red |
| After-Hours Springs | $448-$1040 | $600 | Yellow/Green |

## 10. Known Limitations

- **Placeholder Assets**: Icon, splash, and adaptive-icon are minimal placeholders
- **OpenTelemetry**: Traces generated but need proper collector setup
- **No Backend**: All data stored locally in AsyncStorage
- **Mock Analysis**: Falls back to simple analysis without OpenAI API key

## Success Criteria

All features implemented: ✓
- [x] Login with HOA authentication
- [x] AI Quote Analysis (text input)
- [x] Manual Quote Entry (parts selection)
- [x] Neighborhood Pricing History
- [x] Admin Roster Management
- [x] Multi-tenancy (HOA isolation)
- [x] Arizona baseline pricing applied
- [x] Educational context provided
- [x] No PII leaks
- [x] TypeScript compilation passes
- [x] Expo dev server runs
- [x] All screens navigable

## Troubleshooting

### Issue: "Cannot find module" errors
**Solution**: Run `npm install` and restart Expo with `npx expo start -c`

### Issue: TypeScript errors
**Solution**: Run `npx tsc --noEmit` to identify and fix

### Issue: App crashes on startup
**Solution**: 
1. Verify `.env` file exists
2. Check all dependencies installed
3. Clear cache: `npx expo start -c`

### Issue: AI analysis fails
**Solution**: 
1. Check OPENAI_API_KEY in `.env`
2. App will fallback to mock analysis
3. Mock analysis still provides valid guidance

## Reporting Issues

When reporting issues, include:
1. Steps to reproduce
2. Expected vs actual behavior
3. Screenshots (if UI issue)
4. Console logs
5. Device/platform (iOS/Android/Web)
6. Node/Expo versions

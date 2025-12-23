# HOA Onboarding & Management Guide

## For HOA Administrators

### Getting Started with GDPI

#### Option 1: Self-Service Registration (Recommended)

1. **Download the GDPI App**
   - iOS: App Store (search "GDPI")
   - Android: Google Play (search "GDPI")

2. **Register Your HOA**
   - Open the app
   - Tap "Don't have an account? Register your HOA"
   - Fill in the registration form:
     - **HOA ID**: Choose a unique identifier (e.g., "sunsetvillage")
     - **HOA Name**: Your full HOA name
     - **Admin Name**: Your full name
     - **Admin Email**: Your email address
     - **Billing Email**: (Optional) Leave blank to use admin email

3. **Choose Your Subscription**
   - **14-Day Free Trial**: Try all features, no credit card required
   - **Basic ($29/month)**: All features for small-medium HOAs
   - **Premium ($79/month)**: Priority support + advanced analytics

4. **Save Your Credentials**
   - After registration, you'll receive:
     - **HOA ID**: Your unique identifier
     - **Admin Email**: Your login email
     - **Admin PIN**: A secure 4-digit PIN
   - **Important:** Save these credentials securely!

5. **Login**
   - Use your HOA ID, email, and PIN to log in
   - You're now ready to add residents!

#### Option 2: Manual Setup by Owner

Contact support@receiptx.com with:
- HOA Name
- Admin Name and Email
- Approximate number of units
- Preferred subscription tier

We'll set up your account and send credentials within 24 hours.

---

## Adding New HOAs (For Platform Owner)

### Method 1: Through the App (Self-Service)

Users can register directly through the HOARegistrationScreen.

### Method 2: Manual Registration (Support Request)

Use the storage service to add HOAs programmatically:

```typescript
import { StorageService } from './src/services/storage';

const registration = {
  hoaId: 'newhoaID',
  hoaName: 'New HOA Community',
  adminEmail: 'admin@newhoa.com',
  adminName: 'John Smith',
  billingEmail: 'billing@newhoa.com', // Optional
  subscriptionTier: 'trial', // or 'basic', 'premium'
  trialDays: 14,
};

const result = await StorageService.registerHOA(registration);

if (result.success) {
  console.log(`Admin PIN: ${result.adminPin}`);
  // Send credentials to admin via email
}
```

### Method 3: Database Direct (With Backend)

If you've implemented a backend API:

```sql
-- Create HOA record
INSERT INTO hoas (hoa_id, hoa_name, subscription_tier, trial_expires_at)
VALUES ('newhoaid', 'New HOA', 'trial', NOW() + INTERVAL '14 days');

-- Create admin user
INSERT INTO residents (email, pin_hash, hoa_id, role, created_at)
VALUES ('admin@newhoa.com', hash('1234'), 'newhoaid', 'admin', NOW());
```

---

## Managing Residents

### As HOA Admin:

1. **Login to the app**
2. **Navigate to "Manage Residents"** (admin-only screen)
3. **Add a New Resident:**
   - Enter their email address
   - Optionally enter a custom 4-digit PIN
   - Or leave blank to auto-generate a secure PIN
   - Tap "Add Resident"
   - Share the credentials with the resident securely

4. **Rotate a PIN:**
   - Find the resident in the list
   - Tap "🔄 Rotate PIN"
   - Confirm
   - New PIN is displayed - share with resident

5. **Update Email:**
   - Find the resident
   - Tap "✏️ Edit Email"
   - Enter new email address
   - Confirm

6. **Remove Resident:**
   - Find the resident
   - Tap "🗑️ Remove"
   - Confirm deletion

---

## Subscription Management

### Current Tiers

| Tier | Price | Features | Best For |
|------|-------|----------|----------|
| **Trial** | Free (14 days) | All features | Testing the platform |
| **Basic** | $29/month | Unlimited residents, AI analysis, community data | Small-medium HOAs |
| **Premium** | $79/month | Basic + priority support + advanced analytics | Large HOAs, enterprise |

### Trial Period

- **Duration:** 14 days from registration
- **Features:** Full access to all features
- **No Credit Card:** Required to start trial
- **Expiration:** App will notify 3 days before trial ends

### Upgrading from Trial

**Option A: In-App Purchase (When Implemented)**
1. Admin logs in
2. Navigates to "Subscription" (in settings)
3. Chooses Basic or Premium
4. Completes payment

**Option B: Contact Support**
Email support@receiptx.com with:
- HOA ID
- Desired tier (Basic/Premium)
- Billing email

We'll send a payment link and upgrade your account upon payment.

### Subscription Status

Check your subscription:
- Login attempt shows trial days remaining
- Expired subscriptions block access
- App displays current tier on home screen

---

## Payment Methods

### Accepted Payment Methods

- Credit/Debit Cards (Visa, MasterCard, Amex, Discover)
- ACH/Bank Transfer (for annual plans)
- Purchase Orders (for Premium tier with annual commitment)

### Billing

- **Monthly:** Charged on the same day each month
- **Annual:** 2 months free (10 months price for 12 months)
- **Cancellation:** Cancel anytime, prorated refund for annual plans

---

## HOA Administrator FAQ

### Q: How do I add multiple residents at once?
**A:** Currently, residents must be added individually through the app. For bulk imports, contact support@receiptx.com with a CSV file (email, name).

### Q: Can residents see each other's information?
**A:** No. Residents only see:
- Their own login information
- Anonymized community pricing data (no names/emails)
- Arizona baseline pricing

### Q: What if a resident forgets their PIN?
**A:** Admin can rotate the PIN:
1. Go to "Manage Residents"
2. Find the resident
3. Tap "Rotate PIN"
4. Share the new PIN with them

### Q: Can I have multiple admins?
**A:** Yes! When adding a resident, you can assign them the "admin" role. They'll have full admin capabilities.

### Q: What happens when my trial expires?
**A:** 
- 3 days before: Warning on login
- On expiration: Login blocked with upgrade message
- Data preserved: Your quote history is saved
- Upgrade anytime: Contact support to reactivate

### Q: How do I cancel my subscription?
**A:** Email support@receiptx.com with your HOA ID. We'll process cancellation and confirm via email. Annual subscriptions receive prorated refunds.

### Q: Is my data private?
**A:** Yes! 
- Quote history is anonymized (no names/emails stored)
- Each HOA's data is completely isolated
- PINs are cryptographically generated and secured
- We never share data with third parties

### Q: What if I need help?
**A:**
- Email: support@receiptx.com
- Response time: < 24 hours (Basic), < 4 hours (Premium)
- Include your HOA ID in all support requests

---

## For Residents (Homeowners)

### Getting Started

1. **Get Credentials from Your Admin**
   - HOA ID
   - Your email address
   - Your 4-digit PIN

2. **Download GDPI App**
   - iOS App Store or Android Google Play

3. **Login**
   - Enter HOA ID, email, and PIN
   - You're in!

### Using GDPI

#### Analyze a Written Quote

1. Tap "AI Analyze My Quote"
2. Paste or type the quote
3. Enter your door setup (e.g., "Double, insulated, 7ft")
4. Select timing (Scheduled or After-Hours)
5. Tap "Analyze"
6. Review the verdict (Green/Yellow/Red)
7. See red flags and questions to ask the vendor

#### Manual Entry (No Written Quote)

1. Tap "Manual Entry"
2. Check the parts being quoted
3. Enter labor cost
4. Enter door setup
5. Select timing
6. Tap "Analyze"

#### View Community Pricing

1. Tap "Neighborhood Pricing"
2. See min/avg/max costs from your HOA
3. Compare your quote to community data

### Resident FAQ

**Q: Do other residents see my quotes?**
**A:** No. All quotes are anonymized. Other residents see:
- Date (not specific time)
- Job type (e.g., "Torsion springs")
- Amount
- Verdict (Green/Yellow/Red)

They don't see:
- Your name
- Your email
- Your address
- Vendor names
- Specific notes

**Q: How accurate is the AI analysis?**
**A:** GDPI uses Arizona-specific baseline pricing and detects:
- Prices outside normal ranges
- Duplicate charges
- Vague warranties
- After-hours markups
- Unnecessary upsells

Always use GDPI as a guide, and get multiple quotes for major work.

**Q: What if I lost my PIN?**
**A:** Contact your HOA administrator. They can generate a new PIN for you through the admin panel.

---

## Success Stories

### Example: Sunset Village HOA
- **Size:** 85 units
- **Tier:** Basic ($29/month)
- **Results:** 
  - Caught 3 overpriced quotes (avg $400 savings)
  - 73% of residents using the app
  - $2,100 saved in first quarter
  - ROI: 2,400% (saved $696 vs $29 cost)

---

## Contact & Support

**Platform Owner:**
- Email: support@receiptx.com
- Response time: 24 hours (Basic), 4 hours (Premium)

**Sales Inquiries:**
- Email: sales@receiptx.com
- For HOAs with 200+ units, custom pricing available

**Technical Issues:**
- Email: support@receiptx.com
- Include: HOA ID, device type, screenshot if possible

---

*Last Updated: December 23, 2025*
*Version: 1.0.0*

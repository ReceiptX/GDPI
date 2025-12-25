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

3. **Lock Your Founding Rate**
   - Early access rate: **$1.99/month**
   - Rate is locked for **5 years** from registration
   - Every future GDPI feature is included during the lock

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

Contact [support@receiptx.com](mailto:support@receiptx.com) with:
- HOA Name
- Admin Name and Email
- Approximate number of units
- Billing contact (for the $1.99/month founding rate lock)

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
};

const result = await StorageService.registerHOA(registration);

if (result.success) {
   console.log(`Admin PIN: ${result.adminPin}`);
   console.log(`Founding rate lock expires: ${result.plan?.lockExpires}`);
   // Send credentials + lock confirmation via email
}
```

### Method 3: Database Direct (With Backend)

If you've implemented a backend API:

```sql
INSERT INTO hoas (hoa_id, hoa_name, locked_price_usd, lock_expires_at)
VALUES ('newhoaid', 'New HOA', 1.99, NOW() + INTERVAL '5 years');

-- Create admin user
INSERT INTO residents (email, pin_hash, hoa_id, role, created_at)
VALUES ('admin@newhoa.com', hash('1234'), 'newhoaid', 'admin', NOW());
```

---

## Managing Residents

### As HOA Admin

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

## Founding Rate & Billing

### Early Access Plan

| Plan | Price | Lock Length | Includes |
| --- | --- | --- | --- |
| Early Access Lock | $1.99 per month | 5 years (60 months) | Unlimited residents, AI analysis, neighborhood pricing, admin tools, red-flag detection, and every future GDPI service released during the lock |

### How the Lock Works

- **Price assurance:** Your HOA is billed $1.99/month for the entire 5-year term.
- **Future services:** Anything we ship during the lock (new dashboards, data connectors, etc.) is included at no additional cost.
- **No seat limits:** Invite the whole neighborhood—there are no per-resident or per-admin fees.
- **Continuity:** If you reinstall the app or migrate devices, the stored subscription record re-applies the lock automatically.

### Checking Your Status

- Registration confirmations include the lock expiration date.
- Upcoming releases will surface the lock date on the admin home screen.
- Email [support@receiptx.com](mailto:support@receiptx.com) with your HOA ID for an immediate status check.

### Making Changes During the Lock

- **Billing contact:** Email support with the HOA ID and new billing contact to update invoices.
- **Payment method:** Provide verification details plus the HOA ID; we'll send a secure link to update the card/ACH info.
- **Service questions:** Since new modules are included, there is nothing to approve—just start using them.

### After 5 Years

- We reach out 90 days before the lock ends with renewal options.
- You can renew at a loyalty rate that never exceeds our public price at that time.
- If you opt not to renew, GDPI will pause on the lock expiration date until a new plan is selected.

---

## Payment Methods

- Credit/debit cards (Visa, MasterCard, Amex, Discover)
- ACH/bank transfer for HOAs preferring invoicing
- Purchase orders for municipalities or master associations

Early-access billing is processed manually today via a secure payment link. Automated in-app billing arrives after we exit early access.

---

## HOA Administrator FAQ

### Q: How do I add multiple residents at once?

**A:** Email a CSV (email, name) to [support@receiptx.com](mailto:support@receiptx.com). We will import it within one business day.

### Q: Can residents see each other's information?

**A:** No. Residents only see anonymized neighborhood pricing trends plus their own quotes.

### Q: What if a resident forgets their PIN?

**A:** In **Manage Residents**, tap the profile, choose **Rotate PIN**, and share the new code.

### Q: Can I have multiple admins?

**A:** Yes. Set the resident's role to `admin` and they gain full admin privileges immediately.

### Q: What happens after the 5-year lock?

**A:** Ninety days prior, we send renewal options. If no decision is made, the account pauses on the lock end date but all data stays intact.

### Q: How do I cancel?

**A:** Email [support@receiptx.com](mailto:support@receiptx.com) with your HOA ID. We'll confirm the effective date (typically end of the current billing month).

### Q: Is my data private?

**A:** Yes. Quote data is siloed per HOA, PINs are generated with `expo-crypto`, and nothing is shared with third parties without your explicit request.

### Q: What if I need help?

**A:** Early-access customers receive 24-hour weekday response times. Include your HOA ID in every ticket for faster routing.

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
- **Plan:** Early Access Lock ($1.99/month)
- **Results:**
   - Caught 3 overpriced quotes (avg $400 savings)
   - 73% resident adoption in the first quarter
   - $2,100 saved while paying ~$24 during the same period

---

## Contact & Support

**Platform Owner:**

- Email: [support@receiptx.com](mailto:support@receiptx.com)
- Early-access response: 24 hours on business days

**Sales Inquiries:**

- Email: [sales@receiptx.com](mailto:sales@receiptx.com)
- For HOAs with 200+ units, custom pricing is available

**Technical Issues:**

- Email: [support@receiptx.com](mailto:support@receiptx.com)
- Include: HOA ID, device type, and screenshots when possible

---

*Last Updated: December 24, 2025*
*Version: 1.1.0*

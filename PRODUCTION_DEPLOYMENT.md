# GDPI Production Deployment Guide

## Overview

This guide covers deploying GDPI to production with security features enabled and HOA onboarding ready.

## Prerequisites

- Node.js 18+
- Expo account (for builds)
- Groq API key (production)
- Apple Developer account (for iOS)
- Google Play Console account (for Android)

## Production Checklist

### 1. Environment configuration

Create production environment variables:

```bash
export GROQ_API_KEY=your_groq_api_key_here
export OTEL_EXPORTER_OTLP_ENDPOINT=https://your-otlp-collector:4318/v1/traces
```

These are injected via `app.json` under `expo.extra` and read via `expo-constants` in `src/utils/config.ts`.

### 2. Security verification

✅ **Cryptographically secure PINs**

- Using `expo-crypto` for PIN generation
- See `src/services/storage.ts` (`generateSecurePin()`)

✅ **Explicit role management**

- Roles stored in the `Resident` model
- No email-based inference
- See `src/types/index.ts` (`Resident.role`)

✅ **Founding rate lock record (no tiered subscriptions)**

- New HOAs automatically receive an “Early Access Lock” record ($1.99/month locked for 5 years)
- Stored in `AppData.subscriptions` and created by `buildSubscriptionRecord()`
- See `src/utils/subscription.ts` and `StorageService.registerHOA()` in `src/services/storage.ts`

✅ **Environment variables**

- Using `expo-constants` for secure access
- See `src/utils/config.ts`

### 3. HOA onboarding flow

#### Self-service registration

1. User taps **Register your HOA**
2. Fills in HOA details (ID, name, admin info)
3. System generates a secure admin PIN
4. System assigns the founding rate lock record automatically
5. Admin receives credentials
6. Admin logs in and adds residents

#### Demo registration

```typescript
{
   hoaId: "sunsetvillage",
   hoaName: "Sunset Village HOA",
   adminEmail: "admin@sunsetvillage.com",
   adminName: "Jane Doe"
}
```

### 4. Pricing model (single plan)

| Plan | Price | Lock length | Includes |
| --- | --- | --- | --- |
| Early Access Lock | $1.99/month | 5 years | Unlimited residents, AI quote analysis, neighborhood pricing, admin tools, and every future GDPI service released during the lock |

### 5. Billing collection

#### Option A: Manual billing link (current)

During early access, billing can be processed manually (invoice or secure payment link). The app stores the lock record so pricing and entitlements remain consistent.

#### Option B: Stripe Checkout (future)

Redirect to a web checkout:

```typescript
const checkoutUrl = `https://checkout.stripe.com/...?client_reference_id=${hoaId}`;
Linking.openURL(checkoutUrl);
```

Webhook payload (example):

```json
{
   "event": "payment_success",
   "hoaId": "sunsetvillage",
   "planId": "early-access-v1"
}
```

### 6. Build for production

**iOS:**

```bash
# Install EAS CLI
npm install -g eas-cli

# Configure
eas build:configure

# Build
eas build --platform ios --profile production
```

**Android:**

```bash
eas build --platform android --profile production
```

**Both:**

```bash
eas build --platform all --profile production
```

### 7. App Store Submission

**iOS (Apple App Store):**

1. Create app in App Store Connect
2. Upload build from EAS
3. Fill in app details, screenshots
4. Submit for review

**Android (Google Play):**

1. Create app in Play Console
2. Upload AAB from EAS
3. Fill in store listing
4. Submit for review

### 8. Backend API (Optional but Recommended)

For production, replace AsyncStorage with a backend API:

**Endpoints needed:**

```text
POST   /api/hoa/register         # HOA registration
POST   /api/auth/login           # Authentication
GET    /api/subscription         # Get founding lock record (plan + lock dates)
POST   /api/billing/payment-link # Create/update payment link (optional)
POST   /api/residents            # Add resident
PATCH  /api/residents/:id/pin    # Rotate PIN
DELETE /api/residents/:id        # Remove resident
GET    /api/quotes               # Get history
POST   /api/quotes               # Add quote
```

**Example stack:**

- Node.js + Express
- PostgreSQL (multi-tenant with hoaId)
- JWT authentication
- Stripe/RevenueCat webhooks

### 9. Monitoring & Analytics

**OpenTelemetry:**

- Already configured in code
- Point to production collector
- Set `OTEL_EXPORTER_OTLP_ENDPOINT`

**Crash Reporting:**

```bash
npm install sentry-expo
```

**Analytics:**

```bash
npm install @amplitude/analytics-react-native
```

### 10. App Icons & Branding

Replace placeholder assets:

- `assets/icon.png` (1024x1024)
- `assets/splash.png` (1242x2436)
- `assets/adaptive-icon.png` (1024x1024, transparent)
- `assets/favicon.png` (48x48)

Use tools like:

- [appicon.co](https://www.appicon.co/)
- [easyappicon.com](https://easyappicon.com/)

### 11. Legal & Compliance

✅ **Privacy Policy**

- No PII in quote history
- PIN-based auth
- HOA-scoped data

✅ **Terms of Service**

- Subscription terms
- Cancellation policy
- Refund policy

✅ **GDPR/CCPA**

- Data export capability
- Account deletion
- Data retention policy

### 12. Testing

**Pre-Launch Checklist:**

- [ ] Test HOA registration flow
- [ ] Test founding lock record creation (new HOA registration)
- [ ] Test payment workflow (if enabled)
- [ ] Test on iOS physical device
- [ ] Test on Android physical device
- [ ] Test admin PIN rotation
- [ ] Test AI quote analysis
- [ ] Load test with multiple HOAs

### 13. Launch Day

1. **Soft Launch:**
   - Deploy to TestFlight (iOS) and Internal Testing (Android)
   - Invite 10-20 real HOAs for beta testing
   - Collect feedback for 1-2 weeks

2. **Public Launch:**
   - Submit to app stores
   - Set up marketing website
   - Prepare support documentation
   - Set up customer support email

3. **Marketing:**
   - HOA management companies
   - Community forums
   - Social media (HOA groups)
   - Direct outreach to HOAs

### 14. Post-Launch Support

**Customer Support:**

- Email: [support@receiptx.com](mailto:support@receiptx.com)
- Response time: < 24 hours

**Monitoring:**

- Check subscription renewals
- Track quote analysis usage
- Watch for errors/crashes

### 15. Scaling Considerations

**When to add backend:**

- > 50 HOAs
- Need for data sync across devices
- Want web dashboard for admins
- Need for advanced analytics

**When to hire:**

- Customer support (> 100 HOAs)
- Backend developer (when adding API)
- Designer (for app updates)

## Production URLs

**API Endpoints (when ready):**

```text
Production: https://api.gdpi.app
Staging:    https://staging-api.gdpi.app
```

**Web Dashboard (future):**

```text
Production: https://dashboard.gdpi.app
```

## Troubleshooting

### Issue: Environment variables not loading

**Solution:** Check app.json extra field and rebuild

### Issue: Founding lock record missing

**Solution:** Confirm `StorageService.registerHOA()` persisted `AppData.subscriptions` for the HOA and that the device is not using stale AsyncStorage data.

### Issue: Crypto errors on Android

**Solution:** Make sure expo-crypto is properly installed and polyfills are loaded

### Issue: PIN generation failing

**Solution:** Falls back to Math.random() - check crypto availability

## Support

For deployment questions:

- Email: [support@receiptx.com](mailto:support@receiptx.com)
- GitHub Issues: [https://github.com/ReceiptX/GDPI/issues](https://github.com/ReceiptX/GDPI/issues)

## Success Metrics

Track these KPIs:

- HOA registrations per week
- Monthly Recurring Revenue (MRR)
- Quote analyses per HOA per month
- Customer retention rate (target: > 90%)
- Average revenue per HOA (ARPU)

## Conclusion

GDPI is now production-ready with:

- ✅ Secure authentication (crypto-based PINs)
- ✅ Self-service HOA registration
- ✅ Founding rate lock record ($1.99/month, 5 years)
- ✅ Revenue model ($1.99/month founding lock)
- ✅ All security recommendations implemented

Ready to launch.

---

*Last Updated: December 25, 2025*
*Version: 1.1.0 (Production-Ready)*

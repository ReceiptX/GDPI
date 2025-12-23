# Security Considerations for GDPI

## Overview

This document outlines security considerations for the GDPI MVP and recommendations for production deployment.

## Current MVP Security Model

### Authentication
- **Method**: PIN-based (4 digits)
- **Storage**: AsyncStorage (local device only)
- **Session**: Cleared on logout
- **Limitation**: Demo-grade security suitable for MVP testing

### Role Assignment
- **Current**: Inferred from email address (contains 'admin')
- **Risk**: Not production-ready
- **Production Fix**: Store explicit `role` field in Resident model

### PIN Generation
- **Current**: Math.random() (not cryptographically secure)
- **Risk**: Predictable PINs in theory
- **Production Fix**: Use `expo-crypto` or `crypto.getRandomValues()`

### Environment Variables
- **Current**: Commented out `process.env` access
- **Risk**: Not properly configured for React Native
- **Production Fix**: Use `expo-constants` or `react-native-config`

### Data Storage
- **Current**: AsyncStorage (local only)
- **Risk**: No backup, no sync across devices
- **Production Fix**: Backend API with encrypted database

## Production Security Recommendations

### 1. Authentication & Authorization

#### Upgrade to Secure Auth
```typescript
// Use expo-auth-session with OAuth2
import * as AuthSession from 'expo-auth-session';

// Or implement JWT-based auth with backend
interface AuthToken {
  token: string;
  refreshToken: string;
  expiresAt: number;
}
```

#### Explicit Role Management
```typescript
interface Resident {
  email: string;
  pin?: string; // Optional in production with OAuth
  hoaId: string;
  role: 'admin' | 'homeowner'; // Explicit role field
  permissions: string[]; // Fine-grained permissions
}
```

### 2. PIN Security

#### Cryptographically Secure Generation
```typescript
import * as Crypto from 'expo-crypto';

function generateSecurePin(): string {
  const randomBytes = Crypto.getRandomBytes(2);
  const randomNumber = (randomBytes[0] << 8) | randomBytes[1];
  return (1000 + (randomNumber % 9000)).toString();
}
```

#### PIN Hashing (for backend storage)
```typescript
import * as Crypto from 'expo-crypto';

async function hashPin(pin: string): Promise<string> {
  return await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    pin + SALT
  );
}
```

### 3. Environment Configuration

#### Use Expo Constants
```typescript
import Constants from 'expo-constants';

const config = {
  apiKey: Constants.expoConfig?.extra?.openaiApiKey,
  otlpEndpoint: Constants.expoConfig?.extra?.otlpEndpoint,
};
```

#### Update app.json
```json
{
  "expo": {
    "extra": {
      "openaiApiKey": "${OPENAI_API_KEY}",
      "otlpEndpoint": "${OTEL_EXPORTER_OTLP_ENDPOINT}"
    }
  }
}
```

### 4. Data Protection

#### Encrypt Sensitive Data
```typescript
import * as SecureStore from 'expo-secure-store';

// Use SecureStore instead of AsyncStorage for sensitive data
await SecureStore.setItemAsync('user_session', JSON.stringify(user));
```

#### Backend API with Encryption
```typescript
// Example backend API call with HTTPS
const response = await fetch('https://api.gdpi.com/quotes', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(quote),
});
```

### 5. Network Security

#### Certificate Pinning
```typescript
// Use expo-ssl-pinning for certificate validation
import * as SSLPinning from 'expo-ssl-pinning';

await SSLPinning.fetch('https://api.gdpi.com/data', {
  // SSL pinning configuration
});
```

#### HTTPS Only
- All API calls must use HTTPS
- No mixed content
- Validate SSL certificates

### 6. Input Validation

#### Sanitize User Input
```typescript
function sanitizeInput(input: string): string {
  // Remove potentially dangerous characters
  return input
    .replace(/[<>]/g, '')
    .trim()
    .substring(0, 1000); // Limit length
}
```

#### Validate Email Format
```typescript
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
```

### 7. Rate Limiting

#### Implement Request Throttling
```typescript
class RateLimiter {
  private attempts: Map<string, number[]> = new Map();
  private maxAttempts = 5;
  private windowMs = 15 * 60 * 1000; // 15 minutes

  canProceed(key: string): boolean {
    const now = Date.now();
    const attempts = this.attempts.get(key) || [];
    
    // Remove old attempts outside window
    const recentAttempts = attempts.filter(
      time => now - time < this.windowMs
    );
    
    if (recentAttempts.length >= this.maxAttempts) {
      return false;
    }
    
    recentAttempts.push(now);
    this.attempts.set(key, recentAttempts);
    return true;
  }
}
```

### 8. Logging & Monitoring

#### Secure Logging
```typescript
// Never log sensitive data
console.log('User authenticated', {
  hoaId: user.hoaId,
  role: user.role,
  // DON'T LOG: email, pin, quotes, personal data
});

// Use proper log levels
console.error('Authentication failed', { reason: 'Invalid credentials' });
```

#### Security Event Monitoring
```typescript
interface SecurityEvent {
  type: 'login_failed' | 'pin_rotated' | 'admin_action';
  timestamp: string;
  hoaId: string;
  metadata: Record<string, any>;
}

function logSecurityEvent(event: SecurityEvent) {
  // Send to monitoring service (e.g., Sentry, DataDog)
  telemetry.traceOperation('security.event', event, async () => {
    // Log to backend
  });
}
```

## Current Security Posture

### ✅ What's Secure in MVP
- [x] No PII in quote history
- [x] HOA-level data isolation (multi-tenancy)
- [x] Local-only data storage (no external transmission)
- [x] Environment variables not committed to git
- [x] TypeScript type safety
- [x] Input truncation (notes limited to 200 chars)

### ⚠️ What Needs Hardening for Production
- [ ] Replace Math.random() with crypto-secure generation
- [ ] Implement explicit role storage (not email-based)
- [ ] Add proper environment variable handling
- [ ] Use SecureStore for sensitive data
- [ ] Implement backend API with authentication
- [ ] Add rate limiting for login attempts
- [ ] Implement PIN hashing
- [ ] Add certificate pinning
- [ ] Set up security monitoring
- [ ] Add input sanitization
- [ ] Implement session expiration
- [ ] Add audit logging

## Vulnerability Mitigation

### Against Common Attacks

#### SQL Injection
- **Status**: N/A (no SQL database in MVP)
- **Future**: Use parameterized queries with backend

#### XSS (Cross-Site Scripting)
- **Status**: Low risk (React Native, not web)
- **Mitigation**: Sanitize any user input displayed

#### CSRF (Cross-Site Request Forgery)
- **Status**: N/A (no web forms)
- **Future**: Use CSRF tokens with backend API

#### Man-in-the-Middle
- **Status**: Vulnerable (no certificate pinning)
- **Mitigation**: Implement SSL pinning in production

#### Brute Force Attacks
- **Status**: Vulnerable (no rate limiting)
- **Mitigation**: Add rate limiting and account lockout

#### Session Hijacking
- **Status**: Low risk (local storage only)
- **Future**: Use short-lived JWT tokens

## Security Checklist for Production

### Before Launch
- [ ] Replace Math.random() with secure crypto
- [ ] Implement explicit role management
- [ ] Set up expo-constants for environment vars
- [ ] Use SecureStore for sensitive data
- [ ] Add rate limiting for auth endpoints
- [ ] Implement backend API with HTTPS
- [ ] Add SSL certificate pinning
- [ ] Set up security monitoring (Sentry, etc.)
- [ ] Conduct security audit
- [ ] Penetration testing
- [ ] Review all TODO/FIXME comments
- [ ] Update privacy policy
- [ ] Get legal review of data handling

### Ongoing
- [ ] Regular dependency updates (npm audit)
- [ ] Security patch monitoring
- [ ] Quarterly security reviews
- [ ] User education on PIN security
- [ ] Incident response plan
- [ ] Regular backups
- [ ] Disaster recovery testing

## Reporting Security Issues

### For Security Researchers
If you discover a security vulnerability, please:

1. **DO NOT** open a public GitHub issue
2. Email: security@receiptx.com
3. Include:
   - Description of vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (optional)

### Response Timeline
- Acknowledgment: Within 24 hours
- Initial assessment: Within 3 business days
- Fix timeline: Varies by severity
- Public disclosure: After fix is deployed

## Compliance

### Data Privacy
- **GDPR**: No PII stored (compliant)
- **CCPA**: California residents' data rights (compliant)
- **COPPA**: No data from children under 13

### Industry Standards
- **OWASP Mobile Top 10**: Review against checklist
- **NIST Cybersecurity Framework**: Align practices
- **PCI DSS**: N/A (no payment processing)

## Resources

### Recommended Reading
- [OWASP Mobile Security](https://owasp.org/www-project-mobile-security/)
- [React Native Security](https://reactnative.dev/docs/security)
- [Expo Security](https://docs.expo.dev/guides/security/)

### Security Tools
- `npm audit` - Dependency vulnerability scanning
- `expo-secure-store` - Secure key-value storage
- `expo-crypto` - Cryptographic operations
- `expo-ssl-pinning` - Certificate pinning

## Conclusion

The current MVP implements basic security suitable for testing and demonstration. However, **significant hardening is required before production deployment**, particularly around:

1. Cryptographically secure PIN generation
2. Explicit role-based access control
3. Secure environment configuration
4. Backend API with proper authentication
5. Rate limiting and monitoring

Follow the recommendations in this document to upgrade from MVP to production-ready security.

---

*Last Updated: December 23, 2025*
*Security Contact: security@receiptx.com*

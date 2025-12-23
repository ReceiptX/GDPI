# GDPI Architecture Documentation

## Overview

GDPI (Garage Door Pricing Index) is a React Native mobile application built with Expo, designed as a multi-tenant SaaS platform for Arizona HOAs and homeowners to analyze garage door service quotes using AI.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    React Native UI                      │
│                   (Expo Framework)                      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Screens   │  │  Navigation  │  │  Components  │  │
│  └──────┬──────┘  └──────┬───────┘  └──────────────┘  │
│         │                │                             │
├─────────┴────────────────┴─────────────────────────────┤
│                   Services Layer                        │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐  │
│  │  AI Service  │  │   Storage    │  │ Telemetry   │  │
│  │  (OpenAI)    │  │ (AsyncStore) │  │   (OTEL)    │  │
│  └──────┬───────┘  └──────┬───────┘  └─────────────┘  │
│         │                 │                            │
├─────────┴─────────────────┴────────────────────────────┤
│                   External Services                     │
│  ┌──────────────┐  ┌──────────────┐                   │
│  │ OpenAI GPT-4 │  │ OTLP Collector│                  │
│  └──────────────┘  └──────────────┘                   │
└─────────────────────────────────────────────────────────┘
```

## Core Components

### 1. Type System (`src/types/index.ts`)

Defines all TypeScript interfaces and types used throughout the application:

- **User**: Authenticated user with HOA ID and role
- **Quote**: Anonymized quote data with verdict and pricing
- **Resident**: HOA resident with email and PIN
- **AIAnalysisResult**: Structured AI analysis output
- **BaselinePricing**: Arizona market rates reference

### 2. Services Layer

#### AI Service (`src/services/ai.ts`)

**Purpose**: Analyze garage door quotes using OpenAI GPT-4

**Key Features**:
- Builds structured prompts with Arizona baseline pricing
- Parses AI responses into structured format
- Fallback to mock analysis if API unavailable
- Applies after-hours multipliers (1.4x-2.0x)
- Detects red flags (duplicate charges, vague warranties, upsells)

**Flow**:
```
Quote Text → Build Prompt → OpenAI API → Parse Response → AIAnalysisResult
     ↓ (if API fails)
  Mock Analysis (rule-based)
```

#### Storage Service (`src/services/storage.ts`)

**Purpose**: Manage local data persistence with AsyncStorage

**Key Operations**:
- User authentication and session management
- Quote history CRUD (scoped by hoaId)
- Resident roster management (admin only)
- Multi-tenancy enforcement

**Data Structure**:
```typescript
{
  hoaId: string,
  residents: Resident[],
  quoteHistory: Quote[],
  subscribed?: boolean
}
```

**Security Features**:
- Automatic hoaId filtering
- No PII in quote history
- PIN-based authentication

#### Telemetry Service (`src/services/telemetry.ts`)

**Purpose**: OpenTelemetry observability

**Traced Operations**:
- AI analysis calls
- Storage operations
- Screen navigation
- User authentication

**Configuration**:
- OTLP HTTP exporter
- Configurable endpoint via environment
- Can be disabled in production

### 3. Navigation (`src/navigation/AppNavigator.tsx`)

**Type**: Native Stack Navigator

**Routes**:
- `Login`: Authentication screen
- `Home`: Main dashboard
- `AIQuoteAnalysis`: Paste/upload quote analysis
- `ManualQuoteEntry`: Manual parts and labor entry
- `NeighborhoodPricing`: Community pricing history
- `AdminRoster`: Resident management (admin only)

**Features**:
- Role-based routing (admin screens hidden for residents)
- Deep linking support
- Navigation telemetry

### 4. Screens

#### LoginScreen (`src/screens/LoginScreen.tsx`)

**Purpose**: HOA-based authentication

**Inputs**:
- HOA ID
- Email
- PIN (4 digits)

**Flow**:
```
Enter Credentials → Validate → Check Resident List → Set User Session → Navigate to Home
```

**Demo Data**:
- HOA: hoa001
- Admin: admin@hoa001.com / 1234
- Resident: resident@hoa001.com / 5678

#### HomeScreen (`src/screens/HomeScreen.tsx`)

**Purpose**: Main dashboard with navigation and education

**Sections**:
1. User info (welcome, role, HOA ID)
2. Action buttons (AI analyze, manual entry)
3. Community data link
4. Admin controls (if admin role)
5. Arizona baseline pricing card
6. Common hustler tactics warning

#### AIQuoteAnalysisScreen (`src/screens/AIQuoteAnalysisScreen.tsx`)

**Purpose**: Analyze pasted/uploaded quotes

**Flow**:
```
Paste Quote → Enter Door Setup → Select Timing → Analyze
                ↓
         AI Service
                ↓
    Display Results → Save to History
```

**Results Display**:
- Verdict badge (green/yellow/red)
- Price context explanation
- Red flags list
- Vendor questions (2-3)
- Next step recommendation

#### ManualQuoteEntryScreen (`src/screens/ManualQuoteEntryScreen.tsx`)

**Purpose**: Enter quotes without written text

**Inputs**:
- Part checkboxes (springs, rollers, opener, etc.)
- Labor cost
- Door setup
- Timing (scheduled/after-hours)
- Notes

**Flow**:
```
Select Parts → Enter Labor → Build Quote Text → AI Analysis → Display Results
```

#### NeighborhoodPricingScreen (`src/screens/NeighborhoodPricingScreen.tsx`)

**Purpose**: Display anonymized community pricing data

**Features**:
- Community statistics (min/avg/max, count)
- Recent quotes list (sorted by date)
- Anonymized display (no emails or addresses)
- HOA-scoped data only
- Educational footer

**Data Displayed Per Quote**:
- Date (not time)
- Job type
- Door setup
- Timing
- Amount
- Verdict
- Truncated notes

#### AdminRosterScreen (`src/screens/AdminRosterScreen.tsx`)

**Purpose**: Manage HOA residents (admin only)

**Features**:
- Add new residents (auto-generate or custom PIN)
- Rotate PINs for security
- Update email addresses
- Remove residents
- View current roster

**Security**:
- Only accessible to admin role
- Scoped to admin's HOA only
- PIN generation (4-digit random)

## Data Flow

### Quote Analysis Flow

```
1. User Input
   ├─ Text quote (AI Analysis Screen)
   └─ Manual entry (Manual Entry Screen)
          ↓
2. AI Service
   ├─ Build prompt with Arizona baseline
   ├─ Call OpenAI API (or fallback to mock)
   └─ Parse response into structured format
          ↓
3. Storage Service
   ├─ Create Quote object
   ├─ Anonymize data (truncate notes, no PII)
   └─ Save to AsyncStorage (scoped by hoaId)
          ↓
4. Display Results
   ├─ Show verdict and recommendations
   └─ Confirm saved to history
          ↓
5. Neighborhood Pricing
   └─ Aggregated quotes visible to HOA members
```

### Authentication Flow

```
1. Login Screen
   ├─ Enter HOA ID, email, PIN
   └─ Submit credentials
          ↓
2. Storage Service
   ├─ Query residents by hoaId
   ├─ Validate email and PIN match
   └─ Determine role (admin if email contains 'admin')
          ↓
3. Set User Session
   ├─ Store current user in AsyncStorage
   └─ Navigate to Home screen
          ↓
4. Role-Based Access
   ├─ Show/hide admin routes
   └─ Enable/disable admin features
```

### Multi-Tenancy Implementation

**Isolation Level**: HOA (hoaId)

**Enforcement Points**:
1. **Storage Layer**: All queries filtered by hoaId
2. **Authentication**: User assigned to specific hoaId
3. **Quote History**: Scoped by hoaId automatically
4. **Resident Management**: Admin can only see/manage own HOA

**Data Scoping Example**:
```typescript
// Storage service automatically filters
async getQuotesByHoaId(hoaId: string): Promise<Quote[]> {
  const appData = await this.getAppData();
  return appData.quoteHistory.filter(q => q.hoaId === hoaId);
}
```

## Arizona Baseline Pricing Engine

### Pricing Reference

```typescript
const ARIZONA_BASELINE: BaselinePricing = {
  serviceCall: [75, 150],
  torsionSprings: [320, 520],
  rollers: [180, 320],
  opener: [650, 900],
  panelSwap: [950, 1350],
  singleDoor: [1600, 2200],
  doubleDoor: [2400, 3600],
  torsionConversion: [420, 650],
  afterHoursMultiplier: [1.4, 2.0],
};
```

### Analysis Logic

1. **Extract Amount**: Parse quote text for dollar amounts
2. **Identify Job Type**: Detect keywords (springs, opener, door, etc.)
3. **Compare to Baseline**: Check if within expected range
4. **Apply Timing Multiplier**: 1.4-2.0x for after-hours
5. **Generate Verdict**:
   - **Green**: Within baseline ± 10%
   - **Yellow**: 10-30% over baseline or needs clarification
   - **Red**: >30% over baseline or major red flags

### Red Flag Detection

- Duplicate line items
- Vague "lifetime" warranties
- Unnecessary full door replacement
- Extreme labor markups (>50% of parts)
- Refurbished parts sold as new
- Missing warranty information

## Performance Considerations

### Target Metrics

- AI Analysis: < 5 seconds (3s with API, <1s with mock)
- Storage Operations: < 500ms
- Navigation: < 100ms
- App Startup: < 2 seconds

### Optimization Strategies

1. **Local-First**: AsyncStorage for instant access
2. **Lazy Loading**: Screens loaded on demand
3. **Minimal Dependencies**: Only essential packages
4. **Efficient Rendering**: FlatList for long lists
5. **API Fallback**: Mock analysis if OpenAI slow/unavailable

## Security & Privacy

### No PII Policy

**Quote History Excludes**:
- User email
- Physical addresses
- Phone numbers
- Vendor names (optional)
- Full notes (truncated to 200 chars)

**What's Stored**:
- Date (not time)
- Job type
- Door setup (generic: "double, insulated")
- Timing (scheduled/after-hours)
- Amount
- Verdict

### Authentication Security

- PIN-based (4 digits)
- Stored locally only
- No transmission to external servers
- Admin can rotate PINs
- Session cleared on logout

### Environment Security

- API keys in `.env` (gitignored)
- No hardcoded secrets
- Production keys via CI/CD
- Separate dev/prod configurations

## Extensibility

### Future Enhancements

1. **Backend Integration**:
   - Replace AsyncStorage with REST API
   - Real multi-tenancy with database
   - User registration/password reset

2. **Advanced AI**:
   - Image-based quote analysis (OCR)
   - Vendor reputation scoring
   - Price trend predictions

3. **Analytics**:
   - HOA admin dashboards
   - Quarterly pricing reports
   - Vendor comparison tools

4. **Monetization**:
   - RevenueCat integration (subscribed field ready)
   - Premium features (advanced analytics)
   - Vendor partnerships

5. **Additional States**:
   - Expand beyond Arizona
   - Regional pricing adjustments
   - State-specific regulations

## Development Workflow

### Local Development

```bash
1. npm install
2. Copy .env.example to .env
3. Add OPENAI_API_KEY (optional)
4. npx expo start -c
5. Press 'i' for iOS or 'a' for Android
```

### Testing

```bash
# Type checking
npx tsc --noEmit

# Manual testing
Follow TESTING.md guide

# Future: Add Jest for unit tests
npm test
```

### Building

```bash
# Development build
npx expo start

# Production build
npx expo build:ios
npx expo build:android
```

## Dependencies

### Core
- **expo**: ~50.0.0 - Framework
- **react-native**: 0.73.2 - Mobile platform
- **react**: 18.2.0 - UI library

### Navigation
- **@react-navigation/native**: ^6.1.9
- **@react-navigation/native-stack**: ^6.9.17
- **react-native-screens**: ~3.29.0
- **react-native-safe-area-context**: 4.8.2

### Storage
- **@react-native-async-storage/async-storage**: 1.21.0

### Telemetry
- **@opentelemetry/api**: ^1.7.0
- **@opentelemetry/exporter-trace-otlp-http**: ^0.46.0
- **@opentelemetry/sdk-trace-base**: ^1.19.0

### Environment
- **dotenv**: ^16.3.1

### Dev Tools
- **typescript**: ^5.3.3
- **@types/react**: ~18.2.45

## Troubleshooting

See TESTING.md for comprehensive troubleshooting guide.

## License

MIT License

## Support

For questions or issues:
- GitHub Issues: https://github.com/ReceiptX/GDPI/issues
- Email: support@receiptx.com

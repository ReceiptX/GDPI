# Garage Door Pricing Index (GDPI)

## Overview

GDPI is a multi-tenant SaaS platform for Arizona HOAs and homeowners that uses AI to analyze garage door service quotes, detect pricing red flags, and provide educational context around fair market rates.

## Features

- **AI-Powered Quote Analysis**: Upload or paste quotes for instant analysis with verdict, price context, and red flags
- **Manual Quote Entry**: Enter parts and labor costs when no written quote is available
- **Neighborhood Pricing History**: View anonymized community pricing data scoped to your HOA
- **Admin Controls**: HOA administrators can manage residents, rotate PINs, and view aggregated data
- **Educational Context**: Learn Arizona baseline pricing and common hustler tactics
- **Multi-Tenancy**: Strict HOA-level data isolation with no PII leaks

## Arizona Baseline Pricing

- Service Call: $75-$150
- Torsion Springs (pair, 2-car insulated): $320-$520
- Rollers + Tune-up (single door): $180-$320
- Opener Replacement (belt drive, 2-car): $650-$900
- Panel Swap (2 panels, double insulated): $950-$1,350
- Single Insulated Door: $1,600-$2,200
- Double Insulated Door: $2,400-$3,600
- Torsion Conversion: $420-$650
- After-Hours: typically 1.4×-2.0× scheduled rates

## Tech Stack

- **Frontend**: React Native with Expo (cross-platform iOS/Android)
- **Navigation**: React Navigation (native stack)
- **AI**: Groq API with Llama 3.1 70B (free tier: 14,400 requests/day)
- **Storage**: AsyncStorage for local persistence
- **Observability**: OpenTelemetry (OTLP traces)
- **Language**: TypeScript

## Prerequisites

- Node.js 18+ and npm
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (macOS) or Android Studio (for Android development)
- Expo Go app on physical device (optional, for testing)

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/ReceiptX/GDPI.git
cd GDPI
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

Edit `.env` and add your Groq API key:

```
GROQ_API_KEY=gsk_your-actual-groq-api-key-here
APP_ROLE_DEFAULT=homeowner
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318/v1/traces
```

**Get your free Groq API key**: Visit [console.groq.com](https://console.groq.com) to sign up and get 14,400 free requests per day.

**Important**: Never commit your `.env` file. It's already in `.gitignore`.

### 4. Start the Development Server

```bash
npm start
# or
npx expo start -c
```

### 5. Run on Device/Emulator

- **iOS Simulator**: Press `i` in the terminal
- **Android Emulator**: Press `a` in the terminal  
- **Physical Device**: Scan the QR code with Expo Go app

## Demo Credentials

The app comes with demo data for testing:

**HOA ID**: `hoa001`

**Admin User**:
- Email: `admin@hoa001.com`
- PIN: `1234`

**Resident User**:
- Email: `resident@hoa001.com`
- PIN: `5678`

## Project Structure

```
GDPI/
├── App.tsx                      # Main app entry point
├── app.json                     # Expo configuration
├── package.json                 # Dependencies
├── tsconfig.json                # TypeScript configuration
├── .env.example                 # Environment variables template
├── src/
│   ├── navigation/
│   │   └── AppNavigator.tsx     # Navigation configuration
│   ├── screens/
│   │   ├── LoginScreen.tsx      # HOA authentication
│   │   ├── HomeScreen.tsx       # Main dashboard
│   │   ├── AIQuoteAnalysisScreen.tsx
│   │   ├── ManualQuoteEntryScreen.tsx
│   │   ├── NeighborhoodPricingScreen.tsx
│   │   └── AdminRosterScreen.tsx
│   ├── services/
│   │   ├── ai.ts                # OpenAI integration
│   │   ├── storage.ts           # AsyncStorage utilities
│   │   └── telemetry.ts         # OpenTelemetry tracing
│   └── types/
│       └── index.ts             # TypeScript type definitions
└── assets/                      # Images and icons
```

## Usage Guide

### For Residents

1. **Login**: Enter your HOA ID, email, and PIN
2. **Analyze Quote**: 
   - Choose "AI Analyze My Quote" to paste a written quote
   - Or choose "Manual Entry" to enter parts and labor costs
3. **Review Results**: See verdict (green/yellow/red), price context, red flags, and questions to ask
4. **Check Community Data**: View "Neighborhood Pricing" to see anonymized quotes from your HOA

### For HOA Admins

1. **Login**: Use your admin credentials
2. **Manage Residents**: 
   - Navigate to "Manage Residents"
   - Add new residents (auto-generates secure PINs)
   - Rotate PINs for security
   - Update email addresses
   - Remove residents when needed
3. **View Analytics**: Check aggregated community pricing data

## Development

### Type Checking

```bash
npm run type-check
# or
npx tsc --noEmit
```

### Linting

The project uses TypeScript's built-in type checking. Extend with ESLint if needed.

### Testing

Run the app on both iOS and Android simulators to ensure cross-platform compatibility:

```bash
# iOS
npx expo start --ios

# Android
npx expo start --android
```

## Architecture Notes

### Multi-Tenancy

- All quote data is scoped by `hoaId`
- Storage services filter data automatically
- No cross-HOA data leaks
- Admin actions are restricted to their own HOA

### Data Privacy

- No PII stored in quote history
- Only anonymized job type, timing, amount, and verdict
- Resident roster secured with PIN-based authentication
- Environment secrets never committed to repository

### AI Analysis

- Uses OpenAI GPT-4 for intelligent quote analysis
- Falls back to mock analysis if API key not configured
- Applies Arizona-specific baseline pricing rules
- Detects common pricing red flags and upsells

### Observability

- OpenTelemetry traces all AI calls, storage operations, and navigation
- Configurable OTLP endpoint for production monitoring
- Can be disabled via environment configuration

## Deployment

### Production Checklist

- [ ] Set production OpenAI API key via CI/CD secrets
- [ ] Configure production OTLP endpoint for telemetry
- [ ] Review and update app.json for store submissions
- [ ] Test on physical iOS and Android devices
- [ ] Build production bundles with `expo build`
- [ ] Submit to Apple App Store and Google Play Store

### Environment Variables in Production

Use Expo's environment secrets management or your CI/CD pipeline to inject:

```bash
OPENAI_API_KEY=<production-key>
OTEL_EXPORTER_OTLP_ENDPOINT=<production-endpoint>
```

## Troubleshooting

### "Cannot find module" errors

```bash
npm install
npx expo start -c
```

### TypeScript errors

```bash
npx tsc --noEmit
```

### App crashes on startup

- Check that `.env` file exists (copy from `.env.example`)
- Verify all dependencies are installed
- Clear Expo cache: `npx expo start -c`

### OpenAI API errors

- Verify API key is valid in `.env`
- Check API quota and billing
- App will fall back to mock analysis if API unavailable

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- Open a GitHub issue
- Contact: support@receiptx.com

## Acknowledgments

- Arizona garage door pricing data based on market research
- Built with Expo and React Navigation
- AI powered by OpenAI GPT-4

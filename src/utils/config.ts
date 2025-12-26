import Constants from 'expo-constants';

/**
 * Production-ready configuration using expo-constants
 * Environment variables are injected via app.json extra field
 */

const config = {
  // Groq API configuration (free tier: 14,400 requests/day)
  // Get your free API key at console.groq.com
  groqApiKey: Constants.expoConfig?.extra?.groqApiKey || 'your_groq_api_key_here',
  otlpEndpoint: Constants.expoConfig?.extra?.otlpEndpoint || 'http://localhost:4318/v1/traces',

  // OCR (Quote photo -> text)
  // Default provider: OCR.Space (https://ocr.space/ocrapi)
  // Set OCRSPACE_API_KEY in your environment / EAS secrets, then rebuild.
  ocrSpaceApiKey: Constants.expoConfig?.extra?.ocrSpaceApiKey || 'your_ocrspace_api_key_here',
};

export default config;

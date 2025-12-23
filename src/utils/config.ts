import Constants from 'expo-constants';

/**
 * Production-ready configuration using expo-constants
 * Environment variables are injected via app.json extra field
 */

const config = {
  openaiApiKey: Constants.expoConfig?.extra?.openaiApiKey || 'your_openai_api_key_here',
  otlpEndpoint: Constants.expoConfig?.extra?.otlpEndpoint || 'http://localhost:4318/v1/traces',
};

export default config;

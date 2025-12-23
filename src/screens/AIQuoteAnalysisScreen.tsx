import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { User, JobTiming, Quote, QuoteVerdict } from '../types';
import { AIService } from '../services/ai';
import { StorageService } from '../services/storage';
import { telemetry } from '../services/telemetry';

type AIQuoteAnalysisScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'AIQuoteAnalysis'
>;

interface AIQuoteAnalysisScreenProps {
  navigation: AIQuoteAnalysisScreenNavigationProp;
  user: User;
}

export default function AIQuoteAnalysisScreen({
  navigation,
  user,
}: AIQuoteAnalysisScreenProps) {
  const [quoteText, setQuoteText] = useState('');
  const [timing, setTiming] = useState<JobTiming>('scheduled');
  const [doorSetup, setDoorSetup] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleAnalyze = async () => {
    if (!quoteText.trim()) {
      Alert.alert('Error', 'Please enter or paste a quote');
      return;
    }

    if (!doorSetup.trim()) {
      Alert.alert('Error', 'Please specify your door setup (e.g., "Double, insulated, 7ft")');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      // Get API key from environment
      // Note: In React Native, environment variables need special handling
      // For MVP, using placeholder. In production, use expo-constants or secure config
      const apiKey = 'your_openai_api_key_here'; // Replace with secure config in production
      const aiService = new AIService(apiKey);

      await telemetry.traceOperation(
        'ai.analyze_quote',
        { timing, doorSetup, inputLength: quoteText.length },
        async () => {
          const analysis = await aiService.analyzeQuote(quoteText, timing, doorSetup);
          setResult(analysis);

          // Save to quote history
          const quote: Quote = {
            id: Date.now().toString(),
            hoaId: user.hoaId,
            submittedAt: new Date().toISOString(),
            jobType: extractJobType(quoteText),
            timing,
            doorSetup,
            quotedAmount: extractAmount(quoteText),
            verdict: analysis.verdict,
            notes: quoteText.substring(0, 200),
          };

          await StorageService.addQuote(quote);
        }
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to analyze quote. Please try again.');
      console.error('Analysis error:', error);
    } finally {
      setLoading(false);
    }
  };

  const extractJobType = (text: string): string => {
    const lower = text.toLowerCase();
    if (lower.includes('spring')) return 'Torsion springs';
    if (lower.includes('roller')) return 'Rollers';
    if (lower.includes('opener')) return 'Opener replacement';
    if (lower.includes('panel')) return 'Panel swap';
    if (lower.includes('door')) return 'Door replacement';
    return 'General service';
  };

  const extractAmount = (text: string): number => {
    const match = text.match(/\$?(\d+(?:,\d{3})*(?:\.\d{2})?)/);
    return match ? parseFloat(match[1].replace(/,/g, '')) : 0;
  };

  const getVerdictColor = (verdict: QuoteVerdict) => {
    switch (verdict) {
      case 'green':
        return '#10b981';
      case 'yellow':
        return '#f59e0b';
      case 'red':
        return '#ef4444';
    }
  };

  const getVerdictLabel = (verdict: QuoteVerdict) => {
    switch (verdict) {
      case 'green':
        return '✅ FAIR PRICE';
      case 'yellow':
        return '⚠️ ASK QUESTIONS';
      case 'red':
        return '🚨 OVERPRICED/RISKY';
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.instructions}>
          Paste or type the quote text below. Include all line items, pricing, and any
          warranty information.
        </Text>

        <Text style={styles.label}>Quote Text *</Text>
        <TextInput
          style={styles.textArea}
          placeholder="Paste your quote here..."
          value={quoteText}
          onChangeText={setQuoteText}
          multiline
          numberOfLines={8}
          textAlignVertical="top"
        />

        <Text style={styles.label}>Door Setup *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., Double, insulated, 7ft"
          value={doorSetup}
          onChangeText={setDoorSetup}
        />

        <Text style={styles.label}>Service Timing</Text>
        <View style={styles.radioGroup}>
          <TouchableOpacity
            style={[styles.radioButton, timing === 'scheduled' && styles.radioButtonSelected]}
            onPress={() => setTiming('scheduled')}
          >
            <Text
              style={[
                styles.radioButtonText,
                timing === 'scheduled' && styles.radioButtonTextSelected,
              ]}
            >
              Scheduled
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.radioButton, timing === 'after-hours' && styles.radioButtonSelected]}
            onPress={() => setTiming('after-hours')}
          >
            <Text
              style={[
                styles.radioButtonText,
                timing === 'after-hours' && styles.radioButtonTextSelected,
              ]}
            >
              After-Hours
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.analyzeButton, loading && styles.analyzeButtonDisabled]}
          onPress={handleAnalyze}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.analyzeButtonText}>Analyze Quote</Text>
          )}
        </TouchableOpacity>

        {result && (
          <View style={styles.resultCard}>
            <View
              style={[
                styles.verdictBadge,
                { backgroundColor: getVerdictColor(result.verdict) },
              ]}
            >
              <Text style={styles.verdictText}>{getVerdictLabel(result.verdict)}</Text>
            </View>

            <View style={styles.resultSection}>
              <Text style={styles.resultSectionTitle}>Price Context</Text>
              <Text style={styles.resultText}>{result.priceContext}</Text>
            </View>

            <View style={styles.resultSection}>
              <Text style={styles.resultSectionTitle}>Red Flags</Text>
              {result.redFlags.map((flag: string, index: number) => (
                <Text key={index} style={styles.resultItem}>
                  • {flag}
                </Text>
              ))}
            </View>

            <View style={styles.resultSection}>
              <Text style={styles.resultSectionTitle}>Questions for Vendor</Text>
              {result.vendorQuestions.map((question: string, index: number) => (
                <Text key={index} style={styles.resultItem}>
                  {index + 1}. {question}
                </Text>
              ))}
            </View>

            <View style={styles.resultSection}>
              <Text style={styles.resultSectionTitle}>Next Step</Text>
              <Text style={styles.resultText}>{result.nextStep}</Text>
            </View>

            <Text style={styles.savedNote}>✓ Analysis saved to your quote history</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  instructions: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
    lineHeight: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    minHeight: 150,
  },
  radioGroup: {
    flexDirection: 'row',
    gap: 12,
  },
  radioButton: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  radioButtonSelected: {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
  },
  radioButtonText: {
    fontSize: 14,
    color: '#6b7280',
  },
  radioButtonTextSelected: {
    color: '#2563eb',
    fontWeight: '600',
  },
  analyzeButton: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  analyzeButtonDisabled: {
    backgroundColor: '#93c5fd',
  },
  analyzeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  resultCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  verdictBadge: {
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  verdictText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  resultSection: {
    marginBottom: 16,
  },
  resultSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  resultText: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
  },
  resultItem: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 6,
    lineHeight: 20,
  },
  savedNote: {
    fontSize: 12,
    color: '#10b981',
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '600',
  },
});

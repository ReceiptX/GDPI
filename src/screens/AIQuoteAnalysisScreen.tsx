import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { AIAnalysisResult, JobTiming, Quote, QuoteVerdict, User } from '../types';
import { AIService } from '../services/ai';
import { StorageService } from '../services/storage';
import { telemetry } from '../services/telemetry';
import config from '../utils/config';
import { colors, spacing, radius } from '../utils/theme';

type AIQuoteAnalysisScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'AIQuoteAnalysis'>;

interface AIQuoteAnalysisScreenProps {
  navigation: AIQuoteAnalysisScreenNavigationProp;
  user: User;
}

export default function AIQuoteAnalysisScreen({ user }: AIQuoteAnalysisScreenProps) {
  const [quoteText, setQuoteText] = useState('');
  const [timing, setTiming] = useState<JobTiming>('scheduled');
  const [doorSetup, setDoorSetup] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AIAnalysisResult | null>(null);

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
        return colors.success;
      case 'yellow':
        return colors.warning;
      case 'red':
        return colors.danger;
    }
  };

  const getVerdictLabel = (verdict: QuoteVerdict) => {
    switch (verdict) {
      case 'green':
        return 'FAIR PRICE';
      case 'yellow':
        return 'ASK QUESTIONS';
      case 'red':
        return 'OVERPRICED / RISKY';
    }
  };

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
      const apiKey = config.groqApiKey;
      const aiService = new AIService(apiKey);

      await telemetry.traceOperation('ai.analyze_quote', { timing, doorSetup, inputLength: quoteText.length }, async () => {
        const analysis = await aiService.analyzeQuote(quoteText, timing, doorSetup);
        setResult(analysis);

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
      });
    } catch (error) {
      console.error('Analysis error:', error);
      Alert.alert('Error', 'Failed to analyze quote. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.instructions}>
        Paste or type the quote text below. Include line items, totals, and any warranty language.
      </Text>

      <Text style={styles.label}>Quote Text *</Text>
      <TextInput
        style={styles.textArea}
        placeholder="Paste your quote here..."
        placeholderTextColor={colors.textMuted}
        value={quoteText}
        onChangeText={setQuoteText}
        multiline
        numberOfLines={10}
        textAlignVertical="top"
      />

      <Text style={styles.label}>Door Setup *</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g., Double, insulated, 7ft"
        placeholderTextColor={colors.textMuted}
        value={doorSetup}
        onChangeText={setDoorSetup}
      />

      <Text style={styles.label}>Timing</Text>
      <View style={styles.segmented}>
        <TouchableOpacity
          style={[styles.segment, timing === 'scheduled' && styles.segmentSelected]}
          onPress={() => setTiming('scheduled')}
        >
          <Text style={[styles.segmentText, timing === 'scheduled' && styles.segmentTextSelected]}>Scheduled</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.segment, timing === 'after-hours' && styles.segmentSelected]}
          onPress={() => setTiming('after-hours')}
        >
          <Text style={[styles.segmentText, timing === 'after-hours' && styles.segmentTextSelected]}>After-hours</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={[styles.analyzeBtn, loading && styles.analyzeBtnDisabled]} onPress={handleAnalyze} disabled={loading}>
        {loading ? <ActivityIndicator color={colors.text} /> : <Text style={styles.analyzeBtnText}>Analyze Quote</Text>}
      </TouchableOpacity>

      {result && (
        <View style={styles.resultCard}>
          <View style={[styles.verdictBadge, { backgroundColor: getVerdictColor(result.verdict) }]}>
            <Text style={styles.verdictText}>{getVerdictLabel(result.verdict)}</Text>
          </View>

          <View style={styles.resultSection}>
            <Text style={styles.resultTitle}>Price context</Text>
            <Text style={styles.resultText}>{result.priceContext}</Text>
          </View>

          <View style={styles.resultSection}>
            <Text style={styles.resultTitle}>Red flags</Text>
            {result.redFlags.length === 0 ? (
              <Text style={styles.resultMuted}>None detected.</Text>
            ) : (
              result.redFlags.map((flag, index) => (
                <Text key={`${flag}-${index}`} style={styles.resultItem}>• {flag}</Text>
              ))
            )}
          </View>

          <View style={styles.resultSection}>
            <Text style={styles.resultTitle}>Questions for the vendor</Text>
            {result.vendorQuestions.length === 0 ? (
              <Text style={styles.resultMuted}>No questions suggested.</Text>
            ) : (
              result.vendorQuestions.map((q, index) => (
                <Text key={`${q}-${index}`} style={styles.resultItem}>
                  {index + 1}. {q}
                </Text>
              ))
            )}
          </View>

          <View style={styles.resultSection}>
            <Text style={styles.resultTitle}>Next step</Text>
            <Text style={styles.resultText}>{result.nextStep}</Text>
          </View>

          <Text style={styles.savedNote}>✓ Analysis saved to your HOA history</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  instructions: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.textMuted,
    fontWeight: '700',
  },
  label: {
    marginTop: spacing.md,
    marginBottom: 8,
    fontSize: 13,
    fontWeight: '900',
    color: colors.text,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    backgroundColor: colors.surfaceMuted,
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  textArea: {
    minHeight: 170,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: 12,
    backgroundColor: colors.surfaceMuted,
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  segmented: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  segment: {
    flex: 1,
    height: 44,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.accentSoft,
  },
  segmentText: {
    color: colors.textMuted,
    fontWeight: '800',
    fontSize: 13,
  },
  segmentTextSelected: {
    color: colors.text,
  },
  analyzeBtn: {
    marginTop: spacing.lg,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.accentAlt,
    borderWidth: 1,
    borderColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  analyzeBtnDisabled: {
    backgroundColor: 'rgba(56, 189, 248, 0.35)',
  },
  analyzeBtnText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '900',
  },
  resultCard: {
    marginTop: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  verdictBadge: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
  },
  verdictText: {
    fontSize: 12,
    fontWeight: '900',
    color: colors.bg,
    letterSpacing: 0.6,
  },
  resultSection: {
    marginTop: spacing.md,
  },
  resultTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: colors.accent,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
    marginBottom: 6,
  },
  resultText: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.text,
    fontWeight: '700',
  },
  resultMuted: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.textMuted,
    fontWeight: '700',
  },
  resultItem: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.text,
    fontWeight: '700',
    marginBottom: 6,
  },
  savedNote: {
    marginTop: spacing.md,
    fontSize: 12,
    fontWeight: '800',
    color: colors.textMuted,
  },
});

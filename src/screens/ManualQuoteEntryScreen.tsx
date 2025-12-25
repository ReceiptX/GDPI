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
import { User, JobTiming, Quote, ManualQuoteEntry as ManualEntry } from '../types';
import { AIService } from '../services/ai';
import { StorageService } from '../services/storage';
import { telemetry } from '../services/telemetry';
import config from '../utils/config';
import { colors } from '../utils/theme';

type ManualQuoteEntryScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'ManualQuoteEntry'
>;

interface ManualQuoteEntryScreenProps {
  navigation: ManualQuoteEntryScreenNavigationProp;
  user: User;
}

export default function ManualQuoteEntryScreen({
  navigation,
  user,
}: ManualQuoteEntryScreenProps) {
  const [parts, setParts] = useState({
    torsionSprings: false,
    rollers: false,
    hinges: false,
    cables: false,
    opener: false,
    panels: false,
    fullDoor: false,
  });
  const [otherParts, setOtherParts] = useState('');
  const [laborCost, setLaborCost] = useState('');
  const [timing, setTiming] = useState<JobTiming>('scheduled');
  const [doorSetup, setDoorSetup] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const togglePart = (part: keyof typeof parts) => {
    setParts({ ...parts, [part]: !parts[part] });
  };

  const handleAnalyze = async () => {
    const selectedParts = Object.entries(parts).filter(([_, selected]) => selected);
    
    if (selectedParts.length === 0 && !otherParts.trim()) {
      Alert.alert('Error', 'Please select at least one part or service');
      return;
    }

    if (!laborCost.trim()) {
      Alert.alert('Error', 'Please enter the labor cost');
      return;
    }

    if (!doorSetup.trim()) {
      Alert.alert('Error', 'Please specify your door setup');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      // Build quote text from manual entry
      const quoteText = buildQuoteText();
      
      // Get API key from configuration (production-ready)
      // Using Groq API with free tier (14,400 requests/day)
      const apiKey = config.groqApiKey;
      const aiService = new AIService(apiKey);

      await telemetry.traceOperation(
        'ai.analyze_manual_quote',
        { timing, doorSetup, partCount: selectedParts.length },
        async () => {
          const analysis = await aiService.analyzeQuote(quoteText, timing, doorSetup);
          setResult(analysis);

          // Save to quote history
          const quote: Quote = {
            id: Date.now().toString(),
            hoaId: user.hoaId,
            submittedAt: new Date().toISOString(),
            jobType: getJobType(),
            timing,
            doorSetup,
            quotedAmount: parseFloat(laborCost) || 0,
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

  const buildQuoteText = (): string => {
    let text = 'Garage Door Service Quote\n\n';
    text += 'Parts & Services:\n';
    
    if (parts.torsionSprings) text += '- Torsion Springs (pair)\n';
    if (parts.rollers) text += '- Rollers replacement\n';
    if (parts.hinges) text += '- Hinges replacement\n';
    if (parts.cables) text += '- Cables replacement\n';
    if (parts.opener) text += '- Opener replacement\n';
    if (parts.panels) text += '- Panel replacement\n';
    if (parts.fullDoor) text += '- Full door replacement\n';
    if (otherParts) text += `- ${otherParts}\n`;
    
    text += `\nLabor Cost: $${laborCost}\n`;
    if (notes) text += `\nNotes: ${notes}`;
    
    return text;
  };

  const getJobType = (): string => {
    if (parts.fullDoor) return 'Full door replacement';
    if (parts.opener) return 'Opener replacement';
    if (parts.torsionSprings) return 'Torsion springs';
    if (parts.panels) return 'Panel replacement';
    if (parts.rollers) return 'Rollers';
    return 'General service';
  };

  const getVerdictColor = (verdict: string) => {
    switch (verdict) {
      case 'green': return colors.success;
      case 'yellow': return colors.warning;
      case 'red': return colors.danger;
    }
  };

  const getVerdictLabel = (verdict: string) => {
    switch (verdict) {
      case 'green': return '✅ FAIR PRICE';
      case 'yellow': return '⚠️ ASK QUESTIONS';
      case 'red': return '🚨 OVERPRICED/RISKY';
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.instructions}>
          Select the parts and services included in your quote, then enter the total labor
          cost.
        </Text>

        <Text style={styles.label}>Parts & Services</Text>
        <View style={styles.checkboxGroup}>
          {[
            { key: 'torsionSprings', label: 'Torsion Springs (pair)' },
            { key: 'rollers', label: 'Rollers' },
            { key: 'hinges', label: 'Hinges' },
            { key: 'cables', label: 'Cables' },
            { key: 'opener', label: 'Opener' },
            { key: 'panels', label: 'Panels' },
            { key: 'fullDoor', label: 'Full Door Replacement' },
          ].map((item) => (
            <TouchableOpacity
              key={item.key}
              style={styles.checkbox}
              onPress={() => togglePart(item.key as keyof typeof parts)}
            >
              <View
                style={[
                  styles.checkboxBox,
                  parts[item.key as keyof typeof parts] && styles.checkboxBoxChecked,
                ]}
              >
                {parts[item.key as keyof typeof parts] && (
                  <Text style={styles.checkboxCheck}>✓</Text>
                )}
              </View>
              <Text style={styles.checkboxLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Other Parts/Services</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., Weatherstripping, tune-up"
          placeholderTextColor={colors.textMuted}
          value={otherParts}
          onChangeText={setOtherParts}
        />

        <Text style={styles.label}>Total Labor Cost *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., 450"
          placeholderTextColor={colors.textMuted}
          value={laborCost}
          onChangeText={setLaborCost}
          keyboardType="numeric"
        />

        <Text style={styles.label}>Door Setup *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., Double, insulated, 7ft"
          placeholderTextColor={colors.textMuted}
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

        <Text style={styles.label}>Additional Notes (Optional)</Text>
        <TextInput
          style={styles.textArea}
          placeholder="Any other details about the quote..."
          placeholderTextColor={colors.textMuted}
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />

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
    backgroundColor: colors.bg,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  instructions: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 16,
    lineHeight: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: colors.surfaceMuted,
    color: colors.text,
  },
  textArea: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: colors.surfaceMuted,
    color: colors.text,
    minHeight: 100,
  },
  checkboxGroup: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 8,
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  checkboxBox: {
    width: 24,
    height: 24,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 4,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceMuted,
  },
  checkboxBoxChecked: {
    backgroundColor: colors.accentAlt,
    borderColor: colors.accent,
  },
  checkboxCheck: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
  checkboxLabel: {
    fontSize: 16,
    color: colors.text,
  },
  radioGroup: {
    flexDirection: 'row',
    gap: 12,
  },
  radioButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  radioButtonSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.accentSoft,
  },
  radioButtonText: {
    fontSize: 14,
    color: colors.textMuted,
  },
  radioButtonTextSelected: {
    color: colors.accent,
    fontWeight: '700',
  },
  analyzeButton: {
    backgroundColor: colors.accentAlt,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  analyzeButtonDisabled: {
    backgroundColor: 'rgba(56, 189, 248, 0.35)',
  },
  analyzeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  resultCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  verdictBadge: {
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  verdictText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
  },
  resultSection: {
    marginBottom: 16,
  },
  resultSectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 8,
  },
  resultText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  resultItem: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 6,
    lineHeight: 20,
  },
  savedNote: {
    fontSize: 12,
    color: colors.success,
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '700',
  },
});

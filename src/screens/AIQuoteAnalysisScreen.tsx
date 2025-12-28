import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AIAnalysisResult, JobTiming, Quote, QuoteVerdict, User } from '../types';
import { AIService } from '../services/ai';
import { OCRService } from '../services/ocr';
import { StorageService } from '../services/storage';
import { telemetry } from '../services/telemetry';
import config from '../utils/config';
import { colors, spacing, radius, fonts } from '../utils/theme';
import { RootStackParamList } from '../navigation/AppNavigator';

interface AIQuoteAnalysisScreenProps {
  user: User;
  navigation?: NativeStackNavigationProp<RootStackParamList>;
  /**
   * paste: only written quote
   * manual: only part checklist + total cost
   * combined: accept either/both and send both to the AI
   */
  entryMode?: 'paste' | 'manual' | 'combined';
}

type DoorType = 'single' | 'double' | 'unknown';
type DoorHeight = '7ft' | '8ft' | 'unknown';
type DoorInsulation = 'insulated' | 'non-insulated' | 'unknown';

const MANUAL_PART_CATEGORIES = [
  {
    title: 'Springs & counterbalance',
    items: [
      { key: 'torsionSprings', label: 'Torsion springs (pair)' },
      { key: 'extensionSprings', label: 'Extension springs (pair)' },
      { key: 'torsionConversion', label: 'Conversion to torsion system' },
      { key: 'cableOffDrum', label: 'Cable off drum / reset & re-tension' },
    ],
  },
  {
    title: 'Torsion hardware (often bundled with springs)',
    items: [
      { key: 'liftCables', label: 'Lift cables' },
      { key: 'drums', label: 'Drums' },
      { key: 'centerBearing', label: 'Center bearing' },
      { key: 'endBearings', label: 'End bearings' },
      { key: 'bearingPlates', label: 'Bearing plates / end plates' },
      { key: 'bottomBrackets', label: 'Bottom brackets' },
    ],
  },
  {
    title: 'Door hardware & track',
    items: [
      { key: 'rollers', label: 'Rollers' },
      { key: 'hinges', label: 'Hinges' },
      { key: 'topBrackets', label: 'Top brackets' },
      { key: 'strut', label: 'Strut / reinforcement bar' },
      { key: 'track', label: 'Track replacement' },
      { key: 'trackHardware', label: 'Track hardware (angle, bolts, flags)' },
      { key: 'alignment', label: 'Track/door alignment or re-hang' },
    ],
  },
  {
    title: 'Weather seals',
    items: [
      { key: 'weathersealBottom', label: 'Bottom seal (astragal)' },
      { key: 'weathersealPerimeter', label: 'Perimeter seal (top/sides)' },
    ],
  },
  {
    title: 'Opener & accessories',
    items: [
      { key: 'opener', label: 'Opener replacement' },
      { key: 'openerBeltChain', label: 'Belt/chain' },
      { key: 'openerTrolley', label: 'Trolley / carriage' },
      { key: 'openerGear', label: 'Gear & sprocket' },
      { key: 'openerLogicBoard', label: 'Logic board' },
      { key: 'safetySensors', label: 'Safety sensors / photo eyes' },
      { key: 'wallButton', label: 'Wall button' },
      { key: 'keypad', label: 'Keypad' },
      { key: 'remotes', label: 'Remotes' },
    ],
  },
  {
    title: 'Door sections',
    items: [
      { key: 'panels', label: 'Panel/section replacement' },
      { key: 'fullDoor', label: 'Full door replacement' },
    ],
  },
  {
    title: 'Service items',
    items: [
      { key: 'serviceCall', label: 'Service call / diagnostic fee' },
      { key: 'tuneUp', label: 'Tune-up / maintenance' },
      { key: 'lock', label: 'Manual lock / handle set' },
    ],
  },
] as const;

type ManualPartKey = (typeof MANUAL_PART_CATEGORIES)[number]['items'][number]['key'];

const INITIAL_MANUAL_PARTS: Record<ManualPartKey, boolean> = {
  torsionSprings: false,
  extensionSprings: false,
  torsionConversion: false,
  cableOffDrum: false,

  liftCables: false,
  drums: false,
  centerBearing: false,
  endBearings: false,
  bearingPlates: false,
  bottomBrackets: false,

  rollers: false,
  hinges: false,
  topBrackets: false,
  strut: false,
  track: false,
  trackHardware: false,
  alignment: false,

  weathersealBottom: false,
  weathersealPerimeter: false,

  opener: false,
  openerBeltChain: false,
  openerTrolley: false,
  openerGear: false,
  openerLogicBoard: false,
  safetySensors: false,
  wallButton: false,
  keypad: false,
  remotes: false,

  panels: false,
  fullDoor: false,

  serviceCall: false,
  tuneUp: false,
  lock: false,
};

export default function AIQuoteAnalysisScreen({ user, navigation, entryMode = 'combined' }: AIQuoteAnalysisScreenProps) {
  const [quoteText, setQuoteText] = useState('');
  const [timing, setTiming] = useState<JobTiming>('scheduled');
  const [doorType, setDoorType] = useState<DoorType>('unknown');
  const [doorHeight, setDoorHeight] = useState<DoorHeight>('unknown');
  const [doorInsulation, setDoorInsulation] = useState<DoorInsulation>('unknown');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AIAnalysisResult | null>(null);
  const [analysisMeta, setAnalysisMeta] = useState<{ amount: number; jobType: string; timing: JobTiming } | null>(null);

  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrStatus, setOcrStatus] = useState<string>('');
  const [quotePhotoUri, setQuotePhotoUri] = useState<string | null>(null);

  const [parts, setParts] = useState<Record<ManualPartKey, boolean>>({ ...INITIAL_MANUAL_PARTS });
  const [otherParts, setOtherParts] = useState('');
  const [totalCost, setTotalCost] = useState('');
  const [notes, setNotes] = useState('');

  const togglePart = (part: ManualPartKey) => {
    setParts({ ...parts, [part]: !parts[part] });
  };

  const getManualJobType = (): string => {
    const priority: Array<[ManualPartKey, string]> = [
      ['fullDoor', 'Full door replacement'],
      ['panels', 'Panel/section replacement'],
      ['opener', 'Opener replacement'],
      ['torsionConversion', 'Torsion conversion'],
      ['torsionSprings', 'Torsion springs'],
      ['extensionSprings', 'Extension springs'],
      ['liftCables', 'Lift cables'],
      ['cableOffDrum', 'Cable off drum / reset'],
      ['track', 'Track replacement'],
      ['rollers', 'Rollers'],
      ['weathersealBottom', 'Weather seal'],
      ['tuneUp', 'Tune-up'],
      ['serviceCall', 'Service call'],
    ];

    for (const [k, label] of priority) {
      if (parts[k]) return label;
    }

    return otherParts.trim().length > 0 ? 'General service' : 'General service';
  };

  const buildManualSummaryText = (): string => {
    const anySelected = Object.values(parts).some(Boolean);
    const anyOther = otherParts.trim().length > 0;

    let text = 'MANUAL ENTRY (homeowner-provided)\n';
    text += 'Parts & Services:\n';

    for (const category of MANUAL_PART_CATEGORIES) {
      const selected = category.items.filter((it) => parts[it.key]);
      if (selected.length === 0) continue;
      text += `${category.title}:\n`;
      for (const item of selected) {
        text += `- ${item.label}\n`;
      }
    }

    if (anyOther) text += `- ${otherParts.trim()}\n`;
    if (!anySelected && !anyOther) text += '- (none selected)\n';

    if (totalCost.trim()) {
      text += `\nTotal Cost (parts + labor): $${totalCost.trim()}\n`;
    }
    if (notes.trim()) {
      text += `\nNotes: ${notes.trim()}\n`;
    }

    return text;
  };

  const buildAnalysisInput = (): string => {
    const hasPaste = quoteText.trim().length > 0;
    const hasManual =
      Object.values(parts).some(Boolean) ||
      otherParts.trim().length > 0 ||
      totalCost.trim().length > 0 ||
      notes.trim().length > 0;

    let text = 'Analyze this Arizona garage door service quote. Use all available info.\n\n';

    if (hasPaste) {
      text += 'ORIGINAL QUOTE TEXT:\n';
      text += `${quoteText.trim()}\n\n`;
    }

    if (hasManual) {
      text += `${buildManualSummaryText()}\n`;
    }

    text += 'Guidance:\n';
    text += '- Evaluate whether the overall job price makes sense for the described work.\n';
    text += '- If pricing is above typical, ask for a calm explanation of specs and what is included.\n';
    text += '- If the quote text and manual entry conflict, list what to clarify.\n';

    return text;
  };

  const buildDoorSetup = (): string => {
    const typeLabel = doorType === 'single' ? 'Single' : doorType === 'double' ? 'Double' : 'Unknown';
    const insLabel =
      doorInsulation === 'insulated' ? 'insulated' : doorInsulation === 'non-insulated' ? 'non-insulated' : 'insulation unknown';
    const heightLabel = doorHeight === '7ft' ? '7ft' : doorHeight === '8ft' ? '8ft' : 'height unknown';
    return `${typeLabel} door, ${insLabel}, ${heightLabel}`;
  };

  const runOcrOnUri = async (uri: string) => {
    setOcrLoading(true);
    setOcrStatus('Extracting text from photo…');
    try {
      const res = await OCRService.extractTextFromImageUri(uri);
      setQuoteText((prev) => {
        const next = prev.trim().length > 0 ? `${prev.trim()}\n\n${res.text}` : res.text;
        return next;
      });
      setOcrStatus('Quote text added from photo.');
    } catch (e: any) {
      const msg = e?.message ? String(e.message) : 'OCR failed.';
      setOcrStatus('');
      Alert.alert('OCR failed', msg);
    } finally {
      setOcrLoading(false);
    }
  };

  const handleTakeQuotePhoto = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission needed', 'Camera permission is required to take a quote photo.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      quality: 0.8,
      allowsEditing: true,
    });

    if (result.canceled) return;
    const uri = result.assets?.[0]?.uri;
    if (!uri) return;
    setQuotePhotoUri(uri);
    await runOcrOnUri(uri);
  };

  const handlePickQuotePhoto = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission needed', 'Photo library permission is required to select a quote photo.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
    });

    if (result.canceled) return;
    const uri = result.assets?.[0]?.uri;
    if (!uri) return;
    setQuotePhotoUri(uri);
    await runOcrOnUri(uri);
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
    const hasPaste = quoteText.trim().length > 0;
    const hasManualParts = Object.values(parts).some(Boolean) || otherParts.trim().length > 0;
    const hasManual = hasManualParts || totalCost.trim().length > 0 || notes.trim().length > 0;

    if (entryMode === 'paste' && !hasPaste) {
      Alert.alert('Error', 'Please enter or paste a written quote');
      return;
    }
    if (entryMode === 'manual') {
      if (!hasManualParts) {
        Alert.alert('Error', 'Please select at least one part/service (or add Other Parts/Services)');
        return;
      }
      if (!totalCost.trim()) {
        Alert.alert('Error', 'Please enter the total cost');
        return;
      }
    }
    if (entryMode === 'combined' && !hasPaste && !hasManual) {
      Alert.alert('Error', 'Paste a quote or enter the job details manually');
      return;
    }
    if (doorType === 'unknown') {
      Alert.alert('Error', 'Please select your door type (single or double)');
      return;
    }

    const doorSetup = buildDoorSetup();

    setLoading(true);
    setResult(null);
    setAnalysisMeta(null);
    try {
      const apiKey = config.groqApiKey;
      const aiService = new AIService(apiKey);

      const analysisInput = buildAnalysisInput();

      await telemetry.traceOperation(
        'ai.analyze_quote',
        {
          timing,
          doorSetup,
          entryMode,
          hasPaste,
          hasManual,
          inputLength: analysisInput.length,
        },
        async () => {
        const analysis = await aiService.analyzeQuote(analysisInput, timing, doorSetup);

        const parsedTotalCost = parseFloat(totalCost);
        const amount = !Number.isNaN(parsedTotalCost) && parsedTotalCost > 0 ? parsedTotalCost : extractAmount(quoteText);
        const jobType = hasManualParts ? getManualJobType() : extractJobType(quoteText);

        setResult(analysis);
        setAnalysisMeta({ amount, jobType, timing });

        const quote: Quote = {
          id: Date.now().toString(),
          hoaId: user.hoaId,
          submittedAt: new Date().toISOString(),
          jobType,
          timing,
          doorSetup,
          quotedAmount: amount,
          verdict: analysis.verdict,
          notes: analysisInput.substring(0, 200),
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
        {entryMode === 'paste'
          ? 'Paste or type the quote text below. Include line items, totals, and any warranty language.'
          : entryMode === 'manual'
            ? 'Select the parts/services and enter the total cost. The AI will sanity-check the overall job price and suggest friendly questions.'
            : 'Paste a written quote and/or enter the job details manually. The AI will sanity-check the overall job price and suggest friendly questions.'}
      </Text>

      {entryMode !== 'manual' && (
        <>
          <Text style={styles.label}>Quote Text {entryMode === 'paste' ? '*' : '(optional)'}</Text>

          <View style={styles.warningCard}>
            <Text style={styles.warningTitle}>Before you call a technician (3 quick checks)</Text>
            <Text style={styles.warningItem}>• Door won’t close: clean/align photo-eye sensors, remove obstructions, check “Lock/Vacation” on the wall button, and try again.</Text>
            <Text style={styles.warningItem}>• Remote/opener seems dead: replace remote battery, confirm the opener has power (outlet/GFCI/breaker), and make sure the trolley is engaged (not in manual-release).</Text>
            <Text style={styles.warningItem}>• Door is heavy/crooked/loud: stop using it—look for a broken spring or frayed cable. If anything looks broken, don’t force it; schedule a tech.</Text>
          </View>

          <View style={styles.ocrRow}>
            <TouchableOpacity
              style={[styles.ocrBtn, (ocrLoading || loading) && styles.ocrBtnDisabled]}
              onPress={handleTakeQuotePhoto}
              disabled={ocrLoading || loading}
            >
              {ocrLoading ? <ActivityIndicator color={colors.text} /> : <Text style={styles.ocrBtnText}>Take Photo</Text>}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.ocrBtn, (ocrLoading || loading) && styles.ocrBtnDisabled]}
              onPress={handlePickQuotePhoto}
              disabled={ocrLoading || loading}
            >
              <Text style={styles.ocrBtnText}>Choose Photo</Text>
            </TouchableOpacity>
          </View>

          {!!ocrStatus && <Text style={styles.hint}>{ocrStatus}</Text>}
          {!!quotePhotoUri && !ocrStatus && <Text style={styles.hint}>Photo selected.</Text>}

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
        </>
      )}

      {entryMode !== 'paste' && (
        <>
          <Text style={styles.label}>Parts & Services {entryMode === 'manual' ? '*' : '(optional)'}</Text>

          <View style={styles.warningCard}>
            <Text style={styles.warningTitle}>Before you call a technician (3 quick checks)</Text>
            <Text style={styles.warningItem}>• Door won’t close: clean/align photo-eye sensors, remove obstructions, check “Lock/Vacation” on the wall button, and try again.</Text>
            <Text style={styles.warningItem}>• Remote/opener seems dead: replace remote battery, confirm the opener has power (outlet/GFCI/breaker), and make sure the trolley is engaged (not in manual-release).</Text>
            <Text style={styles.warningItem}>• Door is heavy/crooked/loud: stop using it—look for a broken spring or frayed cable. If anything looks broken, don’t force it; schedule a tech.</Text>
          </View>

          {MANUAL_PART_CATEGORIES.map((category) => (
            <View key={category.title} style={styles.partSection}>
              <Text style={styles.partSectionTitle}>{category.title}</Text>
              <View style={styles.checkboxGroup}>
                {category.items.map((item) => (
                  <TouchableOpacity key={item.key} style={styles.checkbox} onPress={() => togglePart(item.key)}>
                    <View style={[styles.checkboxBox, parts[item.key] && styles.checkboxBoxChecked]}>
                      {parts[item.key] && <Text style={styles.checkboxCheck}>✓</Text>}
                    </View>
                    <Text style={styles.checkboxLabel}>{item.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}

          {parts.torsionSprings && (
            <Text style={styles.hint}>
              Springs benchmark: if the wire size is ≤ 0.250, scheduled springs-only pricing commonly shouldn’t exceed ~$600. If it’s higher, ask what makes it premium (spring type/cycle rating/wire size) and what’s included.
            </Text>
          )}

          {(parts.torsionSprings || parts.extensionSprings || parts.torsionConversion) && (
            <Text style={styles.hint}>
              Tip: If the quote lists center bearing/end bearings/drums as separate line items, ask whether those are actually needed and whether any of them are normally included with the spring job.
            </Text>
          )}

          <Text style={styles.label}>Other Parts/Services</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Weatherstripping, tune-up"
            placeholderTextColor={colors.textMuted}
            value={otherParts}
            onChangeText={setOtherParts}
          />
          <Text style={styles.hint}>
            Tip: a tune-up is often bundled with other work; as a standalone service it’s commonly ~$60–$75.
          </Text>

          <Text style={styles.label}>Total Cost (parts + labor) {entryMode === 'manual' ? '*' : '(optional)'}</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., 750"
            placeholderTextColor={colors.textMuted}
            value={totalCost}
            onChangeText={setTotalCost}
            keyboardType="numeric"
          />
          <Text style={styles.hint}>Enter the full amount on the quote (including parts, labor, and fees).</Text>

          <Text style={styles.label}>Notes (Optional)</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Any other details about the job or what the tech said…"
            placeholderTextColor={colors.textMuted}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </>
      )}

      <Text style={styles.label}>Door type *</Text>
      <View style={styles.checkboxGroup}>
        {(
          [
            { key: 'single' as const, label: 'Single door' },
            { key: 'double' as const, label: 'Double door' },
          ]
        ).map((item) => (
          <TouchableOpacity
            key={item.key}
            style={styles.checkbox}
            onPress={() => setDoorType(item.key)}
          >
            <View style={[styles.checkboxBox, doorType === item.key && styles.checkboxBoxChecked]}>
              {doorType === item.key && <Text style={styles.checkboxCheck}>✓</Text>}
            </View>
            <Text style={styles.checkboxLabel}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Door details (optional)</Text>
      <Text style={styles.hint}>If you’re not sure, leave these as “Unknown”.</Text>

      <Text style={styles.label}>Height</Text>
      <View style={styles.segmented}>
        <TouchableOpacity
          style={[styles.segment, doorHeight === 'unknown' && styles.segmentSelected]}
          onPress={() => setDoorHeight('unknown')}
        >
          <Text style={[styles.segmentText, doorHeight === 'unknown' && styles.segmentTextSelected]}>Unknown</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.segment, doorHeight === '7ft' && styles.segmentSelected]}
          onPress={() => setDoorHeight('7ft')}
        >
          <Text style={[styles.segmentText, doorHeight === '7ft' && styles.segmentTextSelected]}>7ft</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.segment, doorHeight === '8ft' && styles.segmentSelected]}
          onPress={() => setDoorHeight('8ft')}
        >
          <Text style={[styles.segmentText, doorHeight === '8ft' && styles.segmentTextSelected]}>8ft</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>Insulation</Text>
      <View style={styles.segmented}>
        <TouchableOpacity
          style={[styles.segment, doorInsulation === 'unknown' && styles.segmentSelected]}
          onPress={() => setDoorInsulation('unknown')}
        >
          <Text style={[styles.segmentText, doorInsulation === 'unknown' && styles.segmentTextSelected]}>Unknown</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.segment, doorInsulation === 'non-insulated' && styles.segmentSelected]}
          onPress={() => setDoorInsulation('non-insulated')}
        >
          <Text style={[styles.segmentText, doorInsulation === 'non-insulated' && styles.segmentTextSelected]}>Non‑insulated</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.segment, doorInsulation === 'insulated' && styles.segmentSelected]}
          onPress={() => setDoorInsulation('insulated')}
        >
          <Text style={[styles.segmentText, doorInsulation === 'insulated' && styles.segmentTextSelected]}>Insulated</Text>
        </TouchableOpacity>
      </View>

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

          <View style={styles.valueModule}>
            <Text style={styles.valueModuleTitle}>Value: potential avoided cost</Text>
            <Text style={styles.valueModuleAmount}>{getAvoidedCostLabel(result.verdict, result.redFlags.length)}</Text>
            <Text style={styles.valueModuleBody}>
              {analysisMeta?.amount ? `Quote total captured: $${Math.round(analysisMeta.amount).toLocaleString()}. ` : ''}
              Even a small imbalance can cascade into hardware and opener wear. GDPI helps you identify “not normal” early.
            </Text>

            <View style={styles.valueModuleActions}>
              <TouchableOpacity
                style={[styles.valueModuleBtn, styles.valueModuleBtnPrimary]}
                onPress={() => {
                  if (typeof navigation?.navigate === 'function') {
                    navigation.navigate('ValueTimeline');
                  } else {
                    Alert.alert('Value timeline', 'Open the “Why $1.99 matters” timeline from the Home screen.');
                  }
                }}
              >
                <Text style={styles.valueModuleBtnTextPrimary}>See why</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.valueModuleBtn, styles.valueModuleBtnSecondary]}
                onPress={() => Alert.alert('Subscriber-only', 'Proof checklists and step-by-step verification guidance are available to subscribers.')}
              >
                <Text style={styles.valueModuleBtnTextSecondary}>Unlock proof checks</Text>
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.resultMuted}>
            The goal is to know the typical price, then calmly ask what drives anything above it. Premium parts can justify a higher total—clear specs and itemization should back it up.
          </Text>

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
            <Text style={styles.resultTitle}>Questions to ask (friendly)</Text>
            <Text style={styles.resultMuted}>
              If the quote is above typical, ask for the specifics (itemized parts/labor/fees, materials/specs, warranty). If they won’t explain clearly, get another quote.
            </Text>
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

function getAvoidedCostLabel(verdict: QuoteVerdict, redFlagCount: number) {
  const bump = Math.min(2, Math.floor(redFlagCount / 2));

  if (verdict === 'red') {
    const min = 800 + bump * 200;
    const max = 1500 + bump * 250;
    return `$${min.toLocaleString()}–$${max.toLocaleString()}+`;
  }

  if (verdict === 'yellow') {
    const min = 300 + bump * 150;
    const max = 900 + bump * 200;
    return `$${min.toLocaleString()}–$${max.toLocaleString()}`;
  }

  const min = 100;
  const max = 300;
  return `$${min}–$${max}`;
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
    fontFamily: fonts.body,
  },
  label: {
    marginTop: spacing.md,
    marginBottom: 8,
    fontSize: 13,
    fontFamily: fonts.bodyStrong,
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
    fontFamily: fonts.body,
  },
  ocrRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  ocrBtn: {
    flex: 1,
    height: 44,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ocrBtnDisabled: {
    opacity: 0.6,
  },
  ocrBtnText: {
    color: colors.text,
    fontSize: 13,
    fontFamily: fonts.bodyBold,
  },
  hint: {
    marginTop: 8,
    fontSize: 12,
    lineHeight: 16,
    color: colors.textMuted,
    fontFamily: fonts.body,
  },
  warningCard: {
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
    backgroundColor: 'rgba(250, 204, 21, 0.08)',
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.warning,
  },
  warningTitle: {
    fontSize: 13,
    fontFamily: fonts.headingStrong,
    color: colors.warning,
    marginBottom: 8,
  },
  warningItem: {
    fontSize: 13,
    color: colors.text,
    marginBottom: 6,
    fontFamily: fonts.body,
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
    fontFamily: fonts.body,
  },
  checkboxGroup: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.sm,
  },
  partSection: {
    marginTop: spacing.sm,
  },
  partSectionTitle: {
    marginBottom: 8,
    fontSize: 12,
    fontFamily: fonts.headingStrong,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
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
    borderRadius: 6,
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
    fontFamily: fonts.bodyBold,
  },
  checkboxLabel: {
    fontSize: 15,
    color: colors.text,
    fontFamily: fonts.bodyStrong,
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
    fontFamily: fonts.bodyStrong,
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
    backgroundColor: 'rgba(59, 130, 246, 0.35)',
  },
  analyzeBtnText: {
    color: colors.text,
    fontSize: 14,
    fontFamily: fonts.bodyBold,
  },
  resultCard: {
    marginTop: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  valueModule: {
    marginTop: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(34, 211, 238, 0.28)',
    backgroundColor: 'rgba(34, 211, 238, 0.08)',
    padding: spacing.md,
  },
  valueModuleTitle: {
    fontSize: 12,
    fontFamily: fonts.headingStrong,
    color: colors.accent,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  valueModuleAmount: {
    marginTop: 6,
    fontSize: 18,
    fontFamily: fonts.heading,
    color: colors.text,
  },
  valueModuleBody: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 18,
    fontFamily: fonts.body,
    color: colors.text,
  },
  valueModuleActions: {
    marginTop: spacing.sm,
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  valueModuleBtn: {
    height: 40,
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  valueModuleBtnPrimary: {
    backgroundColor: colors.accentAlt,
    borderColor: colors.accent,
  },
  valueModuleBtnSecondary: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },
  valueModuleBtnTextPrimary: {
    fontSize: 13,
    fontFamily: fonts.bodyBold,
    color: colors.text,
  },
  valueModuleBtnTextSecondary: {
    fontSize: 13,
    fontFamily: fonts.bodyStrong,
    color: colors.text,
  },
  verdictBadge: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
  },
  verdictText: {
    fontSize: 12,
    fontFamily: fonts.bodyBold,
    color: colors.bg,
    letterSpacing: 0.6,
  },
  resultSection: {
    marginTop: spacing.md,
  },
  resultTitle: {
    fontSize: 12,
    fontFamily: fonts.headingStrong,
    color: colors.accent,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
    marginBottom: 6,
  },
  resultText: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.text,
    fontFamily: fonts.body,
  },
  resultMuted: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.textMuted,
    fontFamily: fonts.body,
  },
  resultItem: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.text,
    fontFamily: fonts.body,
    marginBottom: 6,
  },
  savedNote: {
    marginTop: spacing.md,
    fontSize: 12,
    fontFamily: fonts.bodyStrong,
    color: colors.textMuted,
  },
});

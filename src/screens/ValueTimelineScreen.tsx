import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { colors, fonts, radius, spacing } from '../utils/theme';

type ValueTimelineNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ValueTimeline'>;

type Props = {
  navigation: ValueTimelineNavigationProp;
};

type TimelineStep = {
  key: 'day1' | 'week1' | 'month1' | 'months6';
  label: string;
  notice: string[];
  happening: string;
  costRange: string;
  note?: string;
};

const STEPS: TimelineStep[] = [
  {
    key: 'day1',
    label: 'Day 1',
    notice: ['Door feels unusually heavy or flies up', 'Banging / loud pop when moving', 'Door won\'t stay halfway open'],
    happening: 'The system is out of balance. That\'s a safety risk and it stresses everything that moves.',
    costRange: '$0–$150',
    note: 'If caught early, it\'s often a simple correction.',
  },
  {
    key: 'week1',
    label: '1 week',
    notice: ['Noisy operation', 'Uneven lift / jerky movement', 'Opener sounds strained'],
    happening: 'Cables, drums, rollers, and bearings take extra load every cycle.',
    costRange: '$150–$400',
  },
  {
    key: 'month1',
    label: '1 month',
    notice: ['Door hesitates or jerks', 'Sensors trigger randomly', 'Visible wear on rollers/cables'],
    happening: 'Wear accelerates. You\'re paying for secondary damage, not just the original mistake.',
    costRange: '$400–$800',
  },
  {
    key: 'months6',
    label: '1–6 months',
    notice: ['Broken spring', 'Door won\'t open or slams shut', 'Opener failure'],
    happening: 'A small imbalance can cascade into a major repair and a safety incident.',
    costRange: '$800–$1,500+',
  },
];

export default function ValueTimelineScreen({ navigation }: Props) {
  const [activeKey, setActiveKey] = useState<TimelineStep['key']>('day1');

  const active = useMemo(() => STEPS.find((s) => s.key === activeKey) ?? STEPS[0], [activeKey]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>Value preview</Text>
        <Text style={styles.title}>How a $1.99/mo check can prevent a $800+ mess</Text>
        <Text style={styles.subtitle}>
          Many garage door problems start small. When key parts are mis-sized or installed incorrectly, the door can run out of balance—
          and the costs tend to climb over time.
        </Text>
      </View>

      <View style={styles.stepTabs}>
        {STEPS.map((s) => {
          const selected = s.key === activeKey;
          return (
            <TouchableOpacity
              key={s.key}
              style={[styles.stepTab, selected && styles.stepTabSelected]}
              onPress={() => setActiveKey(s.key)}
            >
              <Text style={[styles.stepTabText, selected && styles.stepTabTextSelected]}>{s.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.card}>
        <View style={styles.rowBetween}>
          <Text style={styles.cardTitle}>What you might notice</Text>
          <View style={styles.costPill}>
            <Text style={styles.costPillLabel}>Typical added cost</Text>
            <Text style={styles.costPillValue}>{active.costRange}</Text>
          </View>
        </View>

        <View style={{ marginTop: spacing.sm }}>
          {active.notice.map((n) => (
            <Text key={n} style={styles.bullet}>
              • {n}
            </Text>
          ))}
        </View>

        <Text style={styles.cardTitle}>What\'s happening</Text>
        <Text style={styles.body}>{active.happening}</Text>
        {active.note ? <Text style={styles.note}>{active.note}</Text> : null}
      </View>

      <View style={styles.callout}>
        <Text style={styles.calloutTitle}>What GDPI does differently</Text>
        <Text style={styles.body}>
          GDPI helps you recognize what “normal” looks like (price baselines + questions to ask) so you can spot bad quotes early—without
          drama.
        </Text>
        <Text style={styles.locked}>
          Subscriber-only: proof checklists and step-by-step verification guidance.
        </Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.primaryBtn} onPress={() => navigation.navigate('AIQuoteAnalysis')}>
          <Text style={styles.primaryBtnText}>Analyze my quote</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.secondaryBtnText}>Back</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, paddingBottom: spacing.xl },

  hero: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  eyebrow: {
    fontSize: 12,
    fontFamily: fonts.bodyStrong,
    color: colors.textMuted,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  title: {
    marginTop: 8,
    fontSize: 20,
    lineHeight: 26,
    fontFamily: fonts.heading,
    color: colors.text,
  },
  subtitle: {
    marginTop: spacing.sm,
    fontSize: 13,
    lineHeight: 18,
    fontFamily: fonts.body,
    color: colors.textMuted,
  },

  stepTabs: { flexDirection: 'row', gap: 10, marginTop: spacing.md, flexWrap: 'wrap' },
  stepTab: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceMuted,
  },
  stepTabSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.accentSoft,
  },
  stepTabText: { fontSize: 12, fontFamily: fonts.bodyStrong, color: colors.textMuted },
  stepTabTextSelected: { color: colors.text },

  card: {
    marginTop: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: spacing.md },
  cardTitle: {
    marginTop: spacing.md,
    fontSize: 12,
    fontFamily: fonts.headingStrong,
    color: colors.accent,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  bullet: { marginTop: 6, fontSize: 13, lineHeight: 18, fontFamily: fonts.body, color: colors.text },
  body: { marginTop: 8, fontSize: 13, lineHeight: 18, fontFamily: fonts.body, color: colors.textMuted },
  note: { marginTop: spacing.sm, fontSize: 12, lineHeight: 16, fontFamily: fonts.body, color: colors.text },

  costPill: {
    borderWidth: 1,
    borderColor: colors.accent,
    backgroundColor: colors.surfaceElevated,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minWidth: 140,
  },
  costPillLabel: { fontSize: 10, fontFamily: fonts.bodyStrong, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.7 },
  costPillValue: { marginTop: 4, fontSize: 14, fontFamily: fonts.headingStrong, color: colors.text },

  callout: {
    marginTop: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(34, 211, 238, 0.28)',
    backgroundColor: 'rgba(34, 211, 238, 0.08)',
    padding: spacing.lg,
  },
  calloutTitle: { fontSize: 14, fontFamily: fonts.headingStrong, color: colors.text },
  locked: { marginTop: spacing.sm, fontSize: 12, fontFamily: fonts.bodyStrong, color: colors.text },

  actions: { marginTop: spacing.lg, gap: spacing.sm },
  primaryBtn: {
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.accentAlt,
    borderWidth: 1,
    borderColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: { fontSize: 14, fontFamily: fonts.bodyBold, color: colors.text },
  secondaryBtn: {
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtnText: { fontSize: 14, fontFamily: fonts.bodyStrong, color: colors.text },
});

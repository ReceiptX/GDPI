import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { User } from '../types';
import { StorageService } from '../services/storage';
import { colors, spacing, radius, fonts } from '../utils/theme';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

interface HomeScreenProps {
  navigation: HomeScreenNavigationProp;
  user: User;
  onLogout: () => void;
}

export default function HomeScreen({ navigation, user, onLogout }: HomeScreenProps) {
  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await StorageService.clearCurrentUser();
          onLogout();
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerCard}>
        <Text style={styles.welcome}>Welcome</Text>
        <Text style={styles.email}>{user.email}</Text>
        <View style={styles.metaRow}>
          <Text style={styles.metaPill}>{user.role === 'admin' ? 'Admin' : 'Resident'}</Text>
          <Text style={styles.metaText}>HOA: {user.hoaId}</Text>
        </View>
      </View>

      <View style={styles.valueCard}>
        <Text style={styles.valueEyebrow}>Savings snapshot</Text>
        <Text style={styles.valueTitle}>A $1.99 check can prevent an $800+ mistake</Text>
        <Text style={styles.valueBody}>
          Small issues (like an out-of-balance door) often cascade into hardware and opener damage. GDPI helps you spot “not normal”
          early.
        </Text>

        <View style={styles.valueActions}>
          <TouchableOpacity
            style={[styles.valueBtn, styles.valueBtnPrimary]}
            onPress={() => navigation.navigate('AIQuoteAnalysis')}
          >
            <Text style={styles.valueBtnTextPrimary}>Check my quote</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.valueBtn, styles.valueBtnSecondary]}
            onPress={() => navigation.navigate('ValueTimeline')}
          >
            <Text style={styles.valueBtnTextSecondary}>See the timeline</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Actions</Text>

      <TouchableOpacity style={[styles.cardBtn, styles.cardBtnPrimary]} onPress={() => navigation.navigate('AIQuoteAnalysis')}>
        <Text style={styles.cardBtnTitle}>AI Quote Analysis</Text>
        <Text style={styles.cardBtnSub}>Paste a written quote (or snap a photo) and/or add parts + total cost for a full sanity check.</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.cardBtn} onPress={() => navigation.navigate('ManualQuoteEntry')}>
        <Text style={styles.cardBtnTitle}>Manual Quote Entry</Text>
        <Text style={styles.cardBtnSub}>Skip the paste step and go straight to the parts/services checklist + total cost.</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.cardBtn} onPress={() => navigation.navigate('NeighborhoodPricing')}>
        <Text style={styles.cardBtnTitle}>Neighborhood Pricing</Text>
        <Text style={styles.cardBtnSub}>See min/avg/max pricing from your HOA's history.</Text>
      </TouchableOpacity>

      {user.role === 'admin' && (
        <TouchableOpacity style={[styles.cardBtn, styles.cardBtnAdmin]} onPress={() => navigation.navigate('AdminRoster')}>
          <Text style={styles.cardBtnTitle}>Manage Residents</Text>
          <Text style={styles.cardBtnSub}>Add/remove residents, rotate PINs, and assign roles.</Text>
        </TouchableOpacity>
      )}

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Arizona baseline pricing (quick reference)</Text>
        <Text style={styles.infoItem}>• Service call: $75–$150</Text>
        <Text style={styles.infoItem}>• Torsion springs (pair): $320–$520</Text>
        <Text style={styles.infoItem}>• Opener replacement: $450–$950</Text>
        <Text style={styles.infoItem}>• Double door replacement: $2,400–$3,600</Text>
      </View>

      <View style={styles.warningCard}>
        <Text style={styles.warningTitle}>Before you call a technician (3 quick checks)</Text>
        <Text style={styles.warningItem}>• Door won’t close: clean/align photo-eye sensors, remove obstructions, check “Lock/Vacation” on the wall button, and try again.</Text>
        <Text style={styles.warningItem}>• Remote/opener seems dead: replace remote battery, confirm the opener has power (outlet/GFCI/breaker), and make sure the trolley is engaged (not in manual-release).</Text>
        <Text style={styles.warningItem}>• Door is heavy/crooked/loud: stop using it—look for a broken spring or frayed cable. If anything looks broken, don’t force it; schedule a tech.</Text>
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
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
  headerCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  valueCard: {
    marginTop: spacing.md,
    backgroundColor: 'rgba(34, 211, 238, 0.08)',
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(34, 211, 238, 0.28)',
  },
  valueEyebrow: {
    fontSize: 12,
    fontFamily: fonts.bodyStrong,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1.1,
  },
  valueTitle: {
    marginTop: 6,
    fontSize: 16,
    lineHeight: 20,
    fontFamily: fonts.headingStrong,
    color: colors.text,
  },
  valueBody: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 18,
    fontFamily: fonts.body,
    color: colors.text,
  },
  valueActions: {
    marginTop: spacing.md,
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  valueBtn: {
    height: 44,
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  valueBtnPrimary: {
    backgroundColor: colors.accentAlt,
    borderColor: colors.accent,
  },
  valueBtnSecondary: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },
  valueBtnTextPrimary: {
    fontSize: 13,
    fontFamily: fonts.bodyBold,
    color: colors.text,
  },
  valueBtnTextSecondary: {
    fontSize: 13,
    fontFamily: fonts.bodyStrong,
    color: colors.text,
  },
  welcome: {
    fontSize: 12,
    fontFamily: fonts.bodyStrong,
    color: colors.textMuted,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  email: {
    fontSize: 20,
    fontFamily: fonts.heading,
    color: colors.text,
    marginTop: 6,
  },
  metaRow: {
    marginTop: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  metaPill: {
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    color: colors.accent,
    fontSize: 12,
    fontFamily: fonts.bodyStrong,
  },
  metaText: {
    fontSize: 13,
    color: colors.textMuted,
    fontFamily: fonts.body,
  },
  sectionTitle: {
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    fontSize: 14,
    fontFamily: fonts.headingStrong,
    color: colors.text,
  },
  cardBtn: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  cardBtnPrimary: {
    borderColor: colors.accent,
    backgroundColor: colors.surfaceElevated,
  },
  cardBtnAdmin: {
    borderColor: colors.success,
    backgroundColor: 'rgba(74, 222, 128, 0.08)',
  },
  cardBtnTitle: {
    fontSize: 16,
    fontFamily: fonts.headingStrong,
    color: colors.text,
  },
  cardBtnSub: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textMuted,
    fontFamily: fonts.body,
  },
  infoCard: {
    marginTop: spacing.md,
    backgroundColor: 'rgba(34, 211, 238, 0.08)',
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  infoTitle: {
    fontSize: 14,
    fontFamily: fonts.headingStrong,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  infoItem: {
    fontSize: 13,
    color: colors.text,
    marginBottom: 6,
    fontFamily: fonts.body,
  },
  warningCard: {
    marginTop: spacing.md,
    backgroundColor: 'rgba(250, 204, 21, 0.08)',
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.warning,
  },
  warningTitle: {
    fontSize: 14,
    fontFamily: fonts.headingStrong,
    color: colors.warning,
    marginBottom: spacing.sm,
  },
  warningItem: {
    fontSize: 13,
    color: colors.text,
    marginBottom: 6,
    fontFamily: fonts.body,
  },
  logoutBtn: {
    marginTop: spacing.lg,
    height: 48,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceMuted,
  },
  logoutText: {
    color: colors.textMuted,
    fontFamily: fonts.bodyStrong,
    fontSize: 14,
  },
});

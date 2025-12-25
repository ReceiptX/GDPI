import React from "react";
import { SafeAreaView, View, Text, StyleSheet, Pressable } from "react-native";
import { GDPILogo } from "../components/GDPILogo";
import { colors, spacing, radius } from "../utils/theme";
import { EARLY_ACCESS_PLAN, formatCurrency } from "../utils/subscription";

export default function LandingScreen({ navigation }: any) {
  const planPrice = formatCurrency(EARLY_ACCESS_PLAN.price);
  const planInterval = EARLY_ACCESS_PLAN.billingInterval === 'annual' ? 'yr' : 'mo';
  const threeYearCost = EARLY_ACCESS_PLAN.price * 36;
  const threeYearCostLabel = `~${formatCurrency(threeYearCost)}`;

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.container}>
        <GDPILogo size={56} />

        <View style={styles.hero}>
          <Text style={styles.h1}>Clear quotes. Faster decisions.</Text>
          <Text style={styles.p}>
            GDPI helps HOAs standardize quote intake, compare options, and track neighborhood pricing with confidence.
          </Text>
        </View>

        <View style={styles.rateCard}>
          <Text style={styles.rateBadge}>Founding rate</Text>
          <Text style={styles.ratePrice}>
            {planPrice}
            <Text style={styles.rateInterval}>/{planInterval}</Text>
          </Text>
          <Text style={styles.rateCopy}>
            Locked for {EARLY_ACCESS_PLAN.lockDurationYears} years and includes every GDPI service released during that window.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Why GDPI</Text>
          <Text style={styles.cardItem}> Consistent quote capture and audit-ready notes</Text>
          <Text style={styles.cardItem}> Side-by-side analysis powered by your data</Text>
          <Text style={styles.cardItem}> Neighborhood pricing visibility for better negotiations</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>3 things to check before calling a tech</Text>
          <Text style={styles.cardSubtitle}>
            Doing these 60‑second checks can help avoid surprises that easily exceed {threeYearCostLabel} (about 3 years of GDPI at {planPrice}/{planInterval}).
          </Text>

          <View style={styles.valueGrid}>
            <View style={styles.valueCard}>
              <Text style={styles.valueTitle}>1) Door won’t close? Check the safety sensors</Text>
              <Text style={styles.valueBody}>
                Look at the two photo‑eye sensors near the bottom left/right of the door track. Clear anything blocking them, make sure they’re straight and facing each other, and confirm both indicator lights are on (often one red, one green).
              </Text>
              <Text style={styles.valueHow}>GDPI helps: capture symptoms + ask the right questions before paying a trip fee.</Text>
            </View>

            <View style={styles.valueCard}>
              <Text style={styles.valueTitle}>2) Remote works intermittently? Replace the battery</Text>
              <Text style={styles.valueBody}>
                A weak battery can reduce range or work “sometimes.” Swap the remote battery (and keypad battery if you have one), then compare with a spare remote if available.
              </Text>
              <Text style={styles.valueHow}>GDPI helps: document the quick checks you tried and avoid unnecessary diagnostics.</Text>
            </View>

            <View style={styles.valueCard}>
              <Text style={styles.valueTitle}>3) Opener looks “dead”? Check power & GFCI first</Text>
              <Text style={styles.valueBody}>
                If nothing responds (remote or wall button), confirm the opener is plugged in and reset the garage GFCI outlet/breaker if it tripped. Then try the wall button again.
              </Text>
              <Text style={styles.valueHow}>GDPI helps: keep a clear incident log for your HOA and reduce repeat visits.</Text>
            </View>
          </View>

          <Text style={styles.valueDisclaimer}>
            Safety note: don’t disable safety systems or force a stuck door. If the door is off‑track, slams, or makes loud popping/grinding sounds, stop and call a pro.
          </Text>
        </View>

        <View style={styles.actions}>
          <Pressable style={[styles.btn, styles.btnPrimary]} onPress={() => navigation.navigate("Login")}>
            <Text style={[styles.btnText, styles.btnTextPrimary]}>Sign in</Text>
          </Pressable>

          <Pressable style={[styles.btn, styles.btnSecondary]} onPress={() => navigation.navigate("HOARegistration")}>
            <Text style={[styles.btnText, styles.btnTextSecondary]}>Register your HOA</Text>
          </Pressable>
        </View>

        <Text style={styles.footnote}>
          Founding HOAs lock {planPrice}/{planInterval} for {EARLY_ACCESS_PLAN.lockDurationYears} years. Built for privacy, traceability, and responsible AI assistance.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  container: { flex: 1, padding: spacing.lg, justifyContent: "center" },

  hero: { marginTop: spacing.lg },
  h1: { fontSize: 28, fontWeight: "900", color: colors.text, marginBottom: spacing.sm },
  p: { fontSize: 14, color: colors.textMuted, lineHeight: 20 },

  rateCard: {
    marginTop: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  rateBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.xl,
    backgroundColor: colors.surfaceMuted,
    color: colors.accent,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  ratePrice: { fontSize: 32, fontWeight: "900", color: colors.text },
  rateInterval: { fontSize: 16, fontWeight: "700", color: colors.textMuted },
  rateCopy: { marginTop: spacing.xs, fontSize: 14, color: colors.textMuted, lineHeight: 20 },

  card: {
    marginTop: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTitle: { fontSize: 14, fontWeight: "800", color: colors.accent, marginBottom: spacing.sm },
  cardSubtitle: { marginTop: -4, marginBottom: spacing.md, fontSize: 13, color: colors.textMuted, lineHeight: 18 },
  cardItem: { fontSize: 13, color: colors.text, lineHeight: 20, marginBottom: 6 },

  valueGrid: { gap: spacing.sm },
  valueCard: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  valueTitle: { fontSize: 13, fontWeight: "900", color: colors.text, marginBottom: 6 },
  valueBody: { fontSize: 13, color: colors.textMuted, lineHeight: 18 },
  valueHow: { marginTop: spacing.xs, fontSize: 12, color: colors.text, lineHeight: 18, fontWeight: "700" },
  valueDisclaimer: { marginTop: spacing.sm, fontSize: 12, color: colors.textMuted, lineHeight: 18 },

  actions: { marginTop: spacing.lg, gap: spacing.sm },
  btn: { height: 48, borderRadius: radius.md, alignItems: "center", justifyContent: "center", borderWidth: 1 },
  btnPrimary: { backgroundColor: colors.accentAlt, borderColor: colors.accent },
  btnSecondary: { backgroundColor: colors.surfaceMuted, borderColor: colors.border },
  btnText: { fontSize: 14, fontWeight: "800" },
  btnTextPrimary: { color: colors.text },
  btnTextSecondary: { color: colors.text },

  footnote: { marginTop: spacing.md, fontSize: 12, color: colors.textMuted },
});

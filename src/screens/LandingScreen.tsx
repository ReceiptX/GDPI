import React from "react";
import { SafeAreaView, View, Text, StyleSheet, Pressable } from "react-native";
import { GDPILogo } from "../components/GDPILogo";
import { colors, spacing, radius } from "../utils/theme";

export default function LandingScreen({ navigation }: any) {
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

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Why GDPI</Text>
          <Text style={styles.cardItem}> Consistent quote capture and audit-ready notes</Text>
          <Text style={styles.cardItem}> Side-by-side analysis powered by your data</Text>
          <Text style={styles.cardItem}> Neighborhood pricing visibility for better negotiations</Text>
        </View>

        <View style={styles.actions}>
          <Pressable style={[styles.btn, styles.btnPrimary]} onPress={() => navigation.navigate("Login")}>
            <Text style={[styles.btnText, styles.btnTextPrimary]}>Sign in</Text>
          </Pressable>

          <Pressable style={[styles.btn, styles.btnSecondary]} onPress={() => navigation.navigate("HOARegistration")}>
            <Text style={[styles.btnText, styles.btnTextSecondary]}>Register your HOA</Text>
          </Pressable>
        </View>

        <Text style={styles.footnote}>Built for privacy, traceability, and responsible AI assistance.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  container: { flex: 1, padding: spacing.lg, justifyContent: "center" },

  hero: { marginTop: spacing.lg },
  h1: { fontSize: 28, fontWeight: "900", color: colors.text, marginBottom: spacing.sm },
  p: { fontSize: 14, color: colors.muted, lineHeight: 20 },

  card: {
    marginTop: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTitle: { fontSize: 14, fontWeight: "800", color: colors.brandNavy, marginBottom: spacing.sm },
  cardItem: { fontSize: 13, color: colors.text, lineHeight: 20, marginBottom: 6 },

  actions: { marginTop: spacing.lg, gap: spacing.sm },
  btn: { height: 48, borderRadius: radius.md, alignItems: "center", justifyContent: "center", borderWidth: 1 },
  btnPrimary: { backgroundColor: colors.brandNavy, borderColor: colors.brandNavy },
  btnSecondary: { backgroundColor: colors.surface, borderColor: colors.border },
  btnText: { fontSize: 14, fontWeight: "800" },
  btnTextPrimary: { color: colors.surface },
  btnTextSecondary: { color: colors.brandNavy },

  footnote: { marginTop: spacing.md, fontSize: 12, color: colors.muted },
});

import React from "react";
import { View, StyleSheet, Text } from "react-native";
import { colors } from "../utils/theme";

type Props = { size?: number; showWordmark?: boolean };

export function GDPILogo({ size = 48, showWordmark = true }: Props) {
  const r = Math.round(size * 0.26);
  const ring = Math.max(6, Math.round(size * 0.14));
  const innerPad = Math.round(size * 0.18);

  return (
    <View style={styles.row}>
      <View style={[styles.mark, { width: size, height: size, borderRadius: r, backgroundColor: colors.brandNavy }]}>
        <View
          style={{
            position: "absolute",
            left: innerPad,
            top: innerPad,
            width: size - innerPad * 2,
            height: size - innerPad * 2,
            borderRadius: Math.round((size - innerPad * 2) * 0.35),
            borderWidth: ring,
            borderColor: colors.brandTeal,
          }}
        />
        <View
          style={{
            position: "absolute",
            right: -Math.round(size * 0.06),
            top: Math.round(size * 0.44),
            width: Math.round(size * 0.42),
            height: Math.round(size * 0.16),
            backgroundColor: colors.brandNavy,
            borderRadius: Math.round(size * 0.08),
          }}
        />
        <View
          style={{
            position: "absolute",
            left: 0,
            bottom: 0,
            width: size,
            height: Math.round(size * 0.32),
            backgroundColor: colors.brandTealSoft,
          }}
        />
      </View>

      {showWordmark ? (
        <View style={styles.wordmark}>
          <Text style={styles.title}>GDPI</Text>
          <Text style={styles.subtitle}>Pricing intelligence you can trust</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center" },
  mark: { overflow: "hidden" },
  wordmark: { marginLeft: 12 },
  title: { fontSize: 20, fontWeight: "800", color: colors.brandNavy, letterSpacing: 0.5 },
  subtitle: { marginTop: 2, fontSize: 12, color: colors.muted },
});

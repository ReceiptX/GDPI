import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { User, Quote } from '../types';
import { StorageService } from '../services/storage';
import { telemetry } from '../services/telemetry';
import { colors, fonts } from '../utils/theme';

type NeighborhoodPricingScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'NeighborhoodPricing'
>;

interface NeighborhoodPricingScreenProps {
  navigation: NeighborhoodPricingScreenNavigationProp;
  user: User;
}

export default function NeighborhoodPricingScreen({
  navigation,
  user,
}: NeighborhoodPricingScreenProps) {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    min: 0,
    max: 0,
    avg: 0,
    total: 0,
    afterHoursCount: 0,
  });

  useEffect(() => {
    loadQuotes();
  }, []);

  const loadQuotes = async () => {
    setLoading(true);
    try {
      await telemetry.traceOperation(
        'storage.load_quotes',
        { hoaId: user.hoaId },
        async () => {
          const hoaQuotes = await StorageService.getQuotesByHoaId(user.hoaId);
          setQuotes(hoaQuotes);
          calculateStats(hoaQuotes);
        }
      );
    } catch (error) {
      console.error('Error loading quotes:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (quotesList: Quote[]) => {
    if (quotesList.length === 0) {
      setStats({ min: 0, max: 0, avg: 0, total: 0, afterHoursCount: 0 });
      return;
    }

    const amounts = quotesList.map(q => q.quotedAmount);
    const min = Math.min(...amounts);
    const max = Math.max(...amounts);
    const avg = amounts.reduce((a, b) => a + b, 0) / amounts.length;
    const afterHoursCount = quotesList.filter(q => q.timing === 'after-hours').length;

    setStats({
      min,
      max,
      avg: Math.round(avg),
      total: quotesList.length,
      afterHoursCount,
    });
  };

  const formatDate = (isoDate: string): string => {
    const date = new Date(isoDate);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getVerdictColor = (verdict: string) => {
    switch (verdict) {
      case 'green': return colors.success;
      case 'yellow': return colors.warning;
      case 'red': return colors.danger;
      default: return colors.textMuted;
    }
  };

  const getVerdictSymbol = (verdict: string) => {
    switch (verdict) {
      case 'green': return '✅';
      case 'yellow': return '⚠️';
      case 'red': return '🚨';
      default: return '•';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={styles.loadingText}>Loading pricing history...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.headerText}>
          Anonymized pricing data from your HOA community
        </Text>

        {quotes.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>No Data Yet</Text>
            <Text style={styles.emptyStateText}>
              As residents submit quotes, anonymized pricing history will appear here.
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.statsCard}>
              <Text style={styles.statsTitle}>Community Statistics</Text>
              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{stats.total}</Text>
                  <Text style={styles.statLabel}>Total Quotes</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>${stats.avg}</Text>
                  <Text style={styles.statLabel}>Avg Cost</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>${stats.min}</Text>
                  <Text style={styles.statLabel}>Min Cost</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>${stats.max}</Text>
                  <Text style={styles.statLabel}>Max Cost</Text>
                </View>
              </View>
              <Text style={styles.statsFooter}>
                {stats.afterHoursCount} after-hours quotes (
                {Math.round((stats.afterHoursCount / stats.total) * 100)}%)
              </Text>
            </View>

            <Text style={styles.sectionTitle}>Recent Quotes</Text>
            {quotes
              .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
              .map((quote) => (
                <View key={quote.id} style={styles.quoteCard}>
                  <View style={styles.quoteHeader}>
                    <Text style={styles.quoteDate}>{formatDate(quote.submittedAt)}</Text>
                    <View style={[styles.verdictBadge, { backgroundColor: getVerdictColor(quote.verdict) }]}>
                      <Text style={styles.verdictText}>
                        {getVerdictSymbol(quote.verdict)} {quote.verdict.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.quoteJobType}>{quote.jobType}</Text>
                  <Text style={styles.quoteDetail}>Setup: {quote.doorSetup}</Text>
                  <Text style={styles.quoteDetail}>
                    Timing: {quote.timing === 'after-hours' ? '🌙 After-Hours' : '☀️ Scheduled'}
                  </Text>
                  <Text style={styles.quoteAmount}>${quote.quotedAmount.toFixed(2)}</Text>
                  {quote.notes && (
                    <Text style={styles.quoteNotes} numberOfLines={2}>
                      {quote.notes}
                    </Text>
                  )}
                </View>
              ))}
          </>
        )}

        <View style={styles.educationCard}>
          <Text style={styles.educationTitle}>How to Compare Quotes</Text>
          <Text style={styles.educationItem}>
            1. Check timing: After-hours should be 1.4-2.0× scheduled rates
          </Text>
          <Text style={styles.educationItem}>
            2. Compare similar jobs: Torsion springs vs torsion springs
          </Text>
          <Text style={styles.educationItem}>
            3. Watch for outliers: Very high or low prices need scrutiny
          </Text>
          <Text style={styles.educationItem}>
            4. Ask vendors to justify pricing above community average
          </Text>
        </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.bg,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textMuted,
  },
  headerText: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 16,
    lineHeight: 20,
  },
  emptyState: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    marginTop: 32,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontFamily: fonts.headingStrong,
    color: colors.text,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
  statsCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statsTitle: {
    fontSize: 18,
    fontFamily: fonts.headingStrong,
    color: colors.text,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 12,
  },
  statItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.surfaceMuted,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontFamily: fonts.heading,
    color: colors.accent,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 4,
  },
  statsFooter: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: fonts.headingStrong,
    color: colors.text,
    marginBottom: 12,
  },
  quoteCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  quoteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  quoteDate: {
    fontSize: 12,
    color: colors.textMuted,
  },
  verdictBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  verdictText: {
    fontSize: 10,
    fontFamily: fonts.bodyStrong,
    color: '#fff',
  },
  quoteJobType: {
    fontSize: 16,
    fontFamily: fonts.headingStrong,
    color: colors.text,
    marginBottom: 8,
  },
  quoteDetail: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 4,
  },
  quoteAmount: {
    fontSize: 20,
    fontFamily: fonts.heading,
    color: colors.accentAlt,
    marginTop: 8,
  },
  quoteNotes: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 8,
    fontStyle: 'italic',
  },
  educationCard: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  educationTitle: {
    fontSize: 16,
    fontFamily: fonts.headingStrong,
    color: colors.text,
    marginBottom: 12,
  },
  educationItem: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 8,
    lineHeight: 20,
  },
});

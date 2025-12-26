import React from 'react';
import { User } from '../types';
import AIQuoteAnalysisScreen from './AIQuoteAnalysisScreen';

interface ManualQuoteEntryScreenProps {
  user: User;
}

export default function ManualQuoteEntryScreen({
  user,
}: ManualQuoteEntryScreenProps) {
  return <AIQuoteAnalysisScreen user={user} entryMode="manual" />;
}

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, SafeAreaView, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SPACING, FONT } from './theme';

import CalculatorScreen from './screens/CalculatorScreen';
import UnitConverterScreen from './screens/UnitConverterScreen';
import PricesScreen from './screens/PricesScreen';
import HistoryScreen from './screens/HistoryScreen';

const HISTORY_KEY = 'calc_history_v1';
const TABS = [
  { key: 'calc', label: 'محاسبه', icon: '🧮' },
  { key: 'convert', label: 'تبدیل واحد', icon: '📐' },
  { key: 'prices', label: 'نرخ‌ها', icon: '💰' },
  { key: 'history', label: 'تاریخچه', icon: '🕓' },
];

export default function App() {
  const [tab, setTab] = useState('calc');
  const [history, setHistory] = useState([]);
  const [rates, setRates] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(HISTORY_KEY);
        if (stored) setHistory(JSON.parse(stored));
      } catch (e) {
        // ignore
      }
    })();
  }, []);

  const persistHistory = useCallback(async (next) => {
    setHistory(next);
    try {
      await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(next.slice(-100)));
    } catch (e) {
      // ignore
    }
  }, []);

  const addHistory = useCallback(
    (entry) => {
      persistHistory([...history, entry]);
    },
    [history, persistHistory]
  );

  const clearHistory = useCallback(() => {
    persistHistory([]);
  }, [persistHistory]);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>ماشین‌حساب پیشرفته</Text>
      </View>

      <View style={styles.content}>
        {tab === 'calc' && <CalculatorScreen onAddHistory={addHistory} />}
        {tab === 'convert' && <UnitConverterScreen rates={rates} />}
        {tab === 'prices' && <PricesScreen onRatesLoaded={setRates} />}
        {tab === 'history' && (
          <HistoryScreen
            history={history}
            onClear={clearHistory}
            onReuse={() => setTab('calc')}
          />
        )}
      </View>

      <View style={styles.tabBar}>
        {TABS.map((t) => (
          <TouchableOpacity
            key={t.key}
            style={styles.tabButton}
            onPress={() => setTab(t.key)}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabIcon, tab === t.key && styles.tabIconActive]}>{t.icon}</Text>
            <Text style={[styles.tabLabel, tab === t.key && styles.tabLabelActive]}>
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background, paddingTop: Platform.OS === 'android' ? 24 : 0 },
  header: { paddingVertical: SPACING.sm, alignItems: 'center' },
  headerTitle: { color: COLORS.text, fontSize: FONT.sizeBody, fontWeight: FONT.weightBold },
  content: { flex: 1 },
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  tabButton: { flex: 1, alignItems: 'center', paddingVertical: 10 },
  tabIcon: { fontSize: 18, opacity: 0.5 },
  tabIconActive: { opacity: 1 },
  tabLabel: { color: COLORS.textMuted, fontSize: 11, marginTop: 2 },
  tabLabelActive: { color: COLORS.primary, fontWeight: FONT.weightBold },
});

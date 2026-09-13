import React, { useEffect, useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { COLORS, SPACING, FONT } from '../theme';
import { BRSAPI_KEY, CONVERT_RIAL_TO_TOMAN, PRICE_REFRESH_INTERVAL_SECONDS } from '../config';

function formatToman(n) {
  if (typeof n !== 'number' || isNaN(n)) return '-';
  return Math.round(n).toLocaleString('en-US');
}

export default function PricesScreen({ onRatesLoaded }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const load = useCallback(async () => {
    if (!BRSAPI_KEY || BRSAPI_KEY === 'YOUR_FREE_API_KEY_HERE') {
      setError('کلید API تنظیم نشده — فایل config.js را ویرایش کن.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const url = `https://Api.BrsApi.ir/Market/Gold_Currency.php?key=${BRSAPI_KEY}`;
      const res = await fetch(url);
      const json = await res.json();

      const gold = Array.isArray(json.gold) ? json.gold : [];
      const currency = Array.isArray(json.currency) ? json.currency : [];

      const normalize = (arr, kind) =>
        arr.map((raw) => {
          let price = Number(raw.price ?? raw.Price ?? 0);
          if (CONVERT_RIAL_TO_TOMAN) price = price / 10;
          return {
            symbol: raw.symbol || raw.name_en || raw.name,
            name: raw.name || raw.name_en || raw.symbol,
            price,
            unit: raw.unit || 'تومان',
            changePercent: raw.change_percent ?? raw.changePercent ?? null,
            kind,
          };
        });

      const combined = [...normalize(gold, 'gold'), ...normalize(currency, 'currency')];
      setItems(combined);
      setLastUpdated(new Date());
      if (onRatesLoaded) {
        onRatesLoaded(
          combined.map((c) => ({ symbol: c.symbol, name: c.name, priceToman: c.price }))
        );
      }
    } catch (e) {
      setError('دریافت اطلاعات ناموفق بود. اتصال اینترنت یا کلید API را بررسی کن.');
    } finally {
      setLoading(false);
    }
  }, [onRatesLoaded]);

  useEffect(() => {
    load();
    if (PRICE_REFRESH_INTERVAL_SECONDS > 0) {
      const id = setInterval(load, PRICE_REFRESH_INTERVAL_SECONDS * 1000);
      return () => clearInterval(id);
    }
  }, [load]);

  const renderItem = ({ item }) => (
    <View style={styles.row}>
      <View style={styles.left}>
        <Text style={styles.price}>
          {formatToman(item.price)} <Text style={styles.unit}>{item.unit}</Text>
        </Text>
        {item.changePercent != null && (
          <Text
            style={[
              styles.change,
              { color: Number(item.changePercent) >= 0 ? COLORS.up : COLORS.down },
            ]}
          >
            {item.changePercent}%
          </Text>
        )}
      </View>
      <Text style={styles.name}>{item.name}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>نرخ لحظه‌ای طلا و ارز</Text>
        {lastUpdated && (
          <Text style={styles.updated}>
            آخرین به‌روزرسانی: {lastUpdated.toLocaleTimeString('fa-IR')}
          </Text>
        )}
      </View>

      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={load} style={styles.retryButton}>
            <Text style={styles.retryText}>تلاش دوباره</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={items}
        keyExtractor={(item, idx) => item.symbol + idx}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={load} tintColor={COLORS.primary} />
        }
        contentContainerStyle={{ paddingBottom: SPACING.lg }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { padding: SPACING.md, alignItems: 'flex-end' },
  title: { color: COLORS.text, fontSize: FONT.sizeLarge, fontWeight: FONT.weightBold },
  updated: { color: COLORS.textMuted, fontSize: FONT.sizeSmall, marginTop: 4 },
  errorBox: {
    margin: SPACING.md,
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    alignItems: 'center',
  },
  errorText: { color: COLORS.danger, textAlign: 'center', marginBottom: 8 },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  retryText: { color: '#1A1D24', fontWeight: FONT.weightBold },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    marginHorizontal: SPACING.md,
    marginVertical: 4,
    padding: SPACING.md,
    borderRadius: 12,
  },
  left: { alignItems: 'flex-start' },
  name: { color: COLORS.text, fontSize: FONT.sizeBody, fontWeight: FONT.weightMedium },
  price: { color: COLORS.text, fontSize: FONT.sizeBody, fontWeight: FONT.weightBold },
  unit: { color: COLORS.textMuted, fontSize: FONT.sizeSmall, fontWeight: '400' },
  change: { fontSize: FONT.sizeSmall, marginTop: 2 },
});

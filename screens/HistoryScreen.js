import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, SPACING, FONT } from '../theme';

export default function HistoryScreen({ history, onClear, onReuse }) {
  if (!history || history.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>هنوز محاسبه‌ای ثبت نشده</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={onClear}>
          <Text style={styles.clearText}>پاک کردن همه</Text>
        </TouchableOpacity>
        <Text style={styles.title}>تاریخچه محاسبات</Text>
      </View>
      <FlatList
        data={[...history].reverse()}
        keyExtractor={(item) => String(item.time)}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.row} onPress={() => onReuse && onReuse(item)}>
            <Text style={styles.result}>= {item.result}</Text>
            <Text style={styles.expr}>{item.expression}</Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={{ paddingBottom: SPACING.lg }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
  },
  title: { color: COLORS.text, fontSize: FONT.sizeLarge, fontWeight: FONT.weightBold },
  clearText: { color: COLORS.danger, fontSize: FONT.sizeS

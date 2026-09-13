import React, { useState, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { COLORS, SPACING, FONT } from '../theme';

const CATEGORIES = {
  length: {
    label: 'طول',
    base: 'm',
    units: {
      m: { label: 'متر', toBase: 1 },
      km: { label: 'کیلومتر', toBase: 1000 },
      cm: { label: 'سانتی‌متر', toBase: 0.01 },
      mm: { label: 'میلی‌متر', toBase: 0.001 },
      mile: { label: 'مایل', toBase: 1609.344 },
      yard: { label: 'یارد', toBase: 0.9144 },
      foot: { label: 'فوت', toBase: 0.3048 },
      inch: { label: 'اینچ', toBase: 0.0254 },
    },
  },
  weight: {
    label: 'وزن',
    base: 'kg',
    units: {
      kg: { label: 'کیلوگرم', toBase: 1 },
      g: { label: 'گرم', toBase: 0.001 },
      mg: { label: 'میلی‌گرم', toBase: 0.000001 },
      ton: { label: 'تن', toBase: 1000 },
      lb: { label: 'پوند', toBase: 0.45359237 },
      oz: { label: 'اونس', toBase: 0.0283495 },
      mesghal: { label: 'مثقال', toBase: 0.00462 },
    },
  },
  temperature: {
    label: 'دما',
    base: 'c',
    units: {
      c: { label: 'سلسیوس' },
      f: { label: 'فارنهایت' },
      k: { label: 'کلوین' },
    },
  },
};

function convertTemperature(value, from, to) {
  let celsius;
  if (from === 'c') celsius = value;
  else if (from === 'f') celsius = ((value - 32) * 5) / 9;
  else celsius = value - 273.15;

  if (to === 'c') return celsius;
  if (to === 'f') return (celsius * 9) / 5 + 32;
  return celsius + 273.15;
}

export default function UnitConverterScreen({ rates }) {
  const [category, setCategory] = useState('length');
  const [fromUnit, setFromUnit] = useState('m');
  const [toUnit, setToUnit] = useState('km');
  const [input, setInput] = useState('1');

  const currencyUnits = useMemo(() => {
    if (!rates || rates.length === 0) return null;
    const units = {};
    rates.forEach((r) => {
      units[r.symbol] = { label: r.name, toBase: r.priceToman };
    });
    units.TOMAN = { label: 'تومان', toBase: 1 };
    return units;
  }, [rates]);

  const unitsForCategory = category === 'currency' ? currencyUnits : CATEGORIES[category]?.units;

  const changeCategory = (cat) => {
    setCategory(cat);
    if (cat === 'currency') {
      if (currencyUnits) {
        const keys = Object.keys(currencyUnits);
        setFromUnit(keys.includes('USD') ? 'USD' : keys[0]);
        setToUnit('TOMAN');
      }
    } else {
      const keys = Object.keys(CATEGORIES[cat].units);
      setFromUnit(keys[0]);
      setToUnit(keys[1] || keys[0]);
    }
  };

  const result = useMemo(() => {
    const num = parseFloat(input);
    if (isNaN(num)) return '';

    if (category === 'temperature') {
      return convertTemperature(num, fromUnit, toUnit).toFixed(2);
    }

    if (category === 'currency') {
      if (!unitsForCategory || !unitsForCategory[fromUnit] || !unitsForCategory[toUnit]) return '...';
      const baseValue = num * unitsForCategory[fromUnit].toBase;
      const converted = baseValue / unitsForCategory[toUnit].toBase;
      return converted.toLocaleString('en-US', { maximumFractionDigits: 2 });
    }

    const units = CATEGORIES[category].units;
    if (!units[fromUnit] || !units[toUnit]) return '';
    const baseValue = num * units[fromUnit].toBase;
    const converted = baseValue / units[toUnit].toBase;
    return converted.toLocaleString('en-US', { maximumFractionDigits: 6 });
  }, [input, fromUnit, toUnit, category, unitsForCategory]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: SPACING.md }}>
      <View style={styles.categoryRow}>
        {Object.keys(CATEGORIES).map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[styles.catButton, category === cat && styles.catButtonActive]}
            onPress={() => changeCategory(cat)}
          >
            <Text style={[styles.catText, category === cat && styles.catTextActive]}>
              {CATEGORIES[cat].label}
            </Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          style={[styles.catButton, category === 'currency' && styles.catButtonActive]}
          onPress={() => changeCategory('currency')}
        >
          <Text style={[styles.catText, category === 'currency' && styles.catTextActive]}>ارز</Text>
        </TouchableOpacity>
      </View>

      {category === 'currency' && !currencyUnits && (
        <Text style={styles.warning}>
          نرخ ارز هنوز بارگذاری نشده — از تب «نرخ‌ها» بازدید کن تا اطلاعات لود بشه.
        </Text>
      )}

      <Text style={styles.label}>مقدار</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={input}
        onChangeText={setInput}
        placeholder="0"
        placeholderTextColor={COLORS.textMuted}
      />

      <View style={styles.unitRow}>
        <UnitPicker
          units={unitsForCategory}
          selected={fromUnit}
          onSelect={setFromUnit}
          label="از"
        />
        <TouchableOpacity
          style={styles.swapButton}
          onPress={() => {
            setFromUnit(toUnit);
            setToUnit(fromUnit);
          }}
        >
          <Text style={styles.swapText}>⇄</Text>
        </TouchableOpacity>
        <UnitPicker
          units={unitsForCategory}
          selected={toUnit}
          onSelect={setToUnit}
          label="به"
        />
      </View>

      <View style={styles.resultBox}>
        <Text style={styles.resultLabel}>نتیجه</Text>
        <Text style={styles.resultValue}>{result}</Text>
      </View>
    </ScrollView>
  );
}

function UnitPicker({ units, selected, onSelect, label }) {
  if (!units) return <View style={{ flex: 1 }} />;
  return (
    <View style={{ flex: 1 }}>
      <Text style={styles.smallLabel}>{label}</Text>
      <ScrollView style={styles.pickerBox} nestedScrollEnabled>
        {Object.keys(units).map((u) => (
          <TouchableOpacity
            key={u}
            style={[styles.pickerItem, selected === u && styles.pickerItemActive]}
            onPress={() => onSelect(u)}
          >
            <Text style={[styles.pickerText, selected === u && styles.pickerTextActive]}>
              {units[u].label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  categoryRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: SPACING.md },
  catButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    marginEnd: 8,
    marginBottom: 8,
  },
  catButtonActive: { backgroundColor: COLORS.primary },
  catText: { color: COLORS.textMuted, fontSize: FONT.sizeSmall },
  catTextActive: { color: '#1A1D24', fontWeight: FONT.weightBold },
  warning: { color: COLORS.primary, marginBottom: SPACING.md, textAlign: 'right' },
  label: { color: COLORS.textMuted, textAlign: 'right', marginBottom: 4 },
  smallLabel: { color: COLORS.textMuted, fontSize: FONT.sizeSmall, textAlign: 'center', marginBottom: 4 },
  input: {
    backgroundColor: COLORS.surface,
    color: COLORS.text,
    fontSize: FONT.sizeLarge,
    borderRadius: 12,
    padding: SPACING.md,
    textAlign: 'right',
    marginBottom: SPACING.md,
  },
  unitRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: SPACING.md },
  swapButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    marginHorizontal: 8,
  },
  swapText: { fontSize: 18, color: '#1A1D24' },
  pickerBox: {
    maxHeight: 150,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
  },
  pickerItem: { paddingVertical: 10, paddingHorizontal: 12 },
  pickerItemActive: { backgroundColor: COLORS.surfaceLight },
  pickerText: { color: COLORS.textMuted, textAlign: 'center' },
  pickerTextActive: { color: COLORS.primary, fontWeight: FONT.weightBold },
  resultBox: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: SPACING.lg,
    alignItems: 'center',
  },
  resultLabel: { color: COLORS.textMuted, marginBottom: 8 },
  resultValue: { color: COLORS.text, fontSize: FONT.sizeLarge, fontWeight: FONT.weightBold },
});

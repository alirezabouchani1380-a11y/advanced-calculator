import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { COLORS, SPACING, FONT } from '../theme';
import { evaluateExpression } from '../utils/evaluator';

const BASIC_ROWS = [
  ['C', '⌫', '%', '÷'],
  ['7', '8', '9', '×'],
  ['4', '5', '6', '−'],
  ['1', '2', '3', '+'],
  ['±', '0', '.', '='],
];

const SCI_ROWS = [
  ['sin(', 'cos(', 'tan(', 'DEG'],
  ['log(', 'ln(', '√(', '^'],
  ['(', ')', 'π', 'e'],
];

export default function CalculatorScreen({ onAddHistory }) {
  const [expression, setExpression] = useState('');
  const [result, setResult] = useState('');
  const [showScientific, setShowScientific] = useState(false);
  const [isDegrees, setIsDegrees] = useState(true);
  const [error, setError] = useState(false);

  const press = (key) => {
    setError(false);
    if (key === 'C') {
      setExpression('');
      setResult('');
      return;
    }
    if (key === '⌫') {
      setExpression((e) => e.slice(0, -1));
      return;
    }
    if (key === '=') {
      try {
        const value = evaluateExpression(
          expression.replace(/e(?![0-9A-Za-z])/g, 'E'),
          { isDegrees }
        );
        setResult(String(value));
        if (onAddHistory) {
          onAddHistory({ expression, result: String(value), time: Date.now() });
        }
      } catch (err) {
        setResult('خطا');
        setError(true);
      }
      return;
    }
    if (key === 'DEG') {
      setIsDegrees((d) => !d);
      return;
    }
    if (key === '±') {
      setExpression((e) => (e.startsWith('-') ? e.slice(1) : '-' + e));
      return;
    }
    if (key === 'e') {
      setExpression((e) => e + 'e');
      return;
    }
    setExpression((e) => e + key);
  };

  const renderButton = (key) => {
    const isOperator = ['÷', '×', '−', '+', '='].includes(key);
    const isFunc = ['C', '⌫', '%', '±', 'DEG'].includes(key);
    return (
      <TouchableOpacity
        key={key}
        style={[
          styles.button,
          isOperator && styles.operatorButton,
          isFunc && styles.funcButton,
          key === 'DEG' && isDegrees && styles.degActive,
        ]}
        onPress={() => press(key)}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.buttonText,
            isOperator && styles.operatorText,
            isFunc && styles.funcText,
          ]}
        >
          {key === 'DEG' ? (isDegrees ? 'DEG' : 'RAD') : key}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.displayArea} contentContainerStyle={{ justifyContent: 'flex-end', flexGrow: 1 }}>
        <Text style={styles.expressionText} numberOfLines={2}>
          {expression || '0'}
        </Text>
        <Text style={[styles.resultText, error && { color: COLORS.danger }]} numberOfLines={1}>
          {result}
        </Text>
      </ScrollView>

      <TouchableOpacity
        style={styles.toggleRow}
        onPress={() => setShowScientific((s) => !s)}
      >
        <Text style={styles.toggleText}>
          {showScientific ? '▲ بستن حالت علمی' : '▼ حالت علمی'}
        </Text>
      </TouchableOpacity>

      {showScientific && (
        <View style={styles.sciGrid}>
          {SCI_ROWS.map((row, i) => (
            <View key={i} style={styles.row}>
              {row.map(renderButton)}
            </View>
          ))}
        </View>
      )}

      <View style={styles.grid}>
        {BASIC_ROWS.map((row, i) => (
          <View key={i} style={styles.row}>
            {row.map(renderButton)}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  displayArea: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
  },
  expressionText: {
    color: COLORS.textMuted,
    fontSize: FONT.sizeLarge,
    textAlign: 'right',
    writingDirection: 'ltr',
  },
  resultText: {
    color: COLORS.text,
    fontSize: FONT.sizeDisplay,
    fontWeight: FONT.weightBold,
    textAlign: 'right',
    writingDirection: 'ltr',
    marginTop: SPACING.sm,
  },
  toggleRow: {
    alignItems: 'center',
    paddingVertical: SPACING.xs,
  },
  toggleText: { color: COLORS.secondary, fontSize: FONT.sizeSmall },
  sciGrid: { paddingHorizontal: SPACING.sm },
  grid: { paddingHorizontal: SPACING.sm, paddingBottom: SPACING.md },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 4 },
  button: {
    flex: 1,
    marginHorizontal: 4,
    height: 60,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  operatorButton: { backgroundColor: COLORS.primary },
  funcButton: { backgroundColor: COLORS.surfaceLight },
  degActive: { backgroundColor: COLORS.secondary },
  buttonText: { color: COLORS.text, fontSize: 20, fontWeight: FONT.weightMedium },
  operatorText: { color: '#1A1D24', fontWeight: FONT.weightBold },
  funcText: { color: COLORS.textMuted },
});

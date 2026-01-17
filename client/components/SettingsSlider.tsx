import React from "react";
import { StyleSheet, View } from "react-native";
import Slider from "@react-native-community/slider";

import { ThemedText } from "@/components/ThemedText";
import { Fonts, Spacing } from "@/constants/theme";

interface SettingsSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  formatValue?: (value: number) => string;
  onValueChange: (value: number) => void;
}

export function SettingsSlider({
  label,
  value,
  min,
  max,
  step = 1,
  unit = "",
  formatValue,
  onValueChange,
}: SettingsSliderProps) {
  const displayValue = formatValue ? formatValue(value) : `${value}${unit}`;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.label}>{label}</ThemedText>
        <ThemedText style={styles.value}>{displayValue}</ThemedText>
      </View>
      <Slider
        style={styles.slider}
        value={value}
        minimumValue={min}
        maximumValue={max}
        step={step}
        onValueChange={onValueChange}
        minimumTrackTintColor="#FF3B30"
        maximumTrackTintColor="#3A3A3C"
        thumbTintColor="#FF3B30"
      />
      <View style={styles.range}>
        <ThemedText style={styles.rangeText}>{min}{unit}</ThemedText>
        <ThemedText style={styles.rangeText}>{max}{unit}</ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    backgroundColor: "#1C1C1E",
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#330A09",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  label: {
    color: "#AEAEB2",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 1.5,
    fontFamily: Fonts?.mono,
    textTransform: "uppercase",
  },
  value: {
    color: "#FF3B30",
    fontSize: 14,
    fontWeight: "700",
    fontFamily: Fonts?.mono,
  },
  slider: {
    width: "100%",
    height: 40,
  },
  range: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  rangeText: {
    color: "#3A3A3C",
    fontSize: 11,
    fontFamily: Fonts?.mono,
  },
});

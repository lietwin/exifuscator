import React from "react";
import { StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { Fonts, Spacing } from "@/constants/theme";

interface MetadataRowProps {
  label: string;
  originalValue?: string;
  processedValue?: string;
  mode: "before" | "after";
  processMode?: "scorched" | "ghosted";
}

export function MetadataRow({
  label,
  originalValue,
  processedValue,
  mode,
  processMode = "scorched",
}: MetadataRowProps) {
  const value = mode === "before" ? originalValue : processedValue;
  const hasOriginal = originalValue !== undefined && originalValue !== "—";
  const hasProcessed = processedValue !== undefined && processedValue !== "—";
  
  const isStripped = hasOriginal && !hasProcessed;
  const isModified = hasOriginal && hasProcessed && originalValue !== processedValue;
  const isUnchanged = hasOriginal && hasProcessed && originalValue === processedValue;

  const getValueStyle = () => {
    if (mode === "after") {
      if (isStripped) return styles.strippedValue;
      if (isModified) return processMode === "scorched" ? styles.strippedValue : styles.modifiedValue;
    }
    return styles.normalValue;
  };

  const getDisplayValue = () => {
    if (mode === "after" && isStripped) {
      return "—STRIPPED—";
    }
    return value || "—";
  };

  return (
    <View style={styles.row}>
      <ThemedText style={styles.label}>{label}</ThemedText>
      <ThemedText style={[styles.value, getValueStyle()]} numberOfLines={1}>
        {getDisplayValue()}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: "#330A09",
  },
  label: {
    color: "#AEAEB2",
    fontSize: 12,
    fontWeight: "500",
    letterSpacing: 1,
    fontFamily: Fonts?.mono,
    flex: 1,
  },
  value: {
    fontSize: 12,
    fontFamily: Fonts?.mono,
    textAlign: "right",
    flex: 1,
  },
  normalValue: {
    color: "#FFFFFF",
  },
  strippedValue: {
    color: "#FF3B30",
    fontWeight: "700",
  },
  modifiedValue: {
    color: "#FF9500",
    fontWeight: "700",
  },
});

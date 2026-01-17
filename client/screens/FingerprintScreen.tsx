import React, { useState } from "react";
import { StyleSheet, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { RouteProp, useRoute } from "@react-navigation/native";

import { SegmentedControl } from "@/components/SegmentedControl";
import { MetadataRow } from "@/components/MetadataRow";
import { ThemedText } from "@/components/ThemedText";
import { Spacing, Fonts } from "@/constants/theme";
import {
  ProcessingResult,
  ExifData,
  getExifFieldLabel,
  formatExifValue,
} from "@/lib/exif-processor";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

const DISPLAY_FIELDS = [
  "gpsLatitude",
  "gpsLongitude",
  "deviceMake",
  "deviceModel",
  "software",
  "dateTime",
  "dateTimeOriginal",
  "imageWidth",
  "imageHeight",
  "orientation",
  "exposureTime",
  "fNumber",
  "isoSpeed",
  "focalLength",
  "lensModel",
  "artist",
  "copyright",
];

export default function FingerprintScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const route = useRoute<RouteProp<RootStackParamList, "Fingerprint">>();
  const { result } = route.params;

  const [viewMode, setViewMode] = useState<0 | 1>(0);

  const accentColor = result.mode === "scorched" ? "#FF3B30" : "#FF9500";
  const modeLabel = result.mode === "scorched" ? "SCORCHED EARTH" : "GHOSTED";

  const getFieldValue = (exif: ExifData, field: string): string => {
    const value = (exif as Record<string, unknown>)[field];
    return formatExifValue(field, value);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.xl,
        paddingBottom: insets.bottom + Spacing.xl,
        paddingHorizontal: Spacing.lg,
      }}
      scrollIndicatorInsets={{ bottom: insets.bottom }}
    >
      <View style={styles.header}>
        <ThemedText style={[styles.modeLabel, { color: accentColor }]}>
          {modeLabel}
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          Compare metadata before and after processing
        </ThemedText>
      </View>

      <View style={styles.segmentContainer}>
        <SegmentedControl
          options={["BEFORE", "AFTER"]}
          selectedIndex={viewMode}
          onSelect={(index) => setViewMode(index as 0 | 1)}
          accentColor={accentColor}
        />
      </View>

      <View style={styles.tableContainer}>
        {DISPLAY_FIELDS.map((field) => {
          const originalValue = getFieldValue(result.originalExif, field);
          const processedValue = getFieldValue(result.processedExif, field);
          
          if (originalValue === "—" && processedValue === "—") {
            return null;
          }

          return (
            <MetadataRow
              key={field}
              label={getExifFieldLabel(field)}
              originalValue={originalValue}
              processedValue={processedValue}
              mode={viewMode === 0 ? "before" : "after"}
              processMode={result.mode}
            />
          );
        })}
      </View>

      <View style={styles.summary}>
        <ThemedText style={styles.summaryText}>
          {result.mode === "scorched"
            ? "All metadata has been completely removed from this image."
            : "Identifiable metadata has been obfuscated with synthetic noise."}
        </ThemedText>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  header: {
    marginBottom: Spacing["2xl"],
  },
  modeLabel: {
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 2,
    fontFamily: Fonts?.mono,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    color: "#AEAEB2",
    fontSize: 13,
    fontFamily: Fonts?.mono,
  },
  segmentContainer: {
    marginBottom: Spacing.xl,
  },
  tableContainer: {
    backgroundColor: "#1C1C1E",
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#330A09",
    overflow: "hidden",
  },
  summary: {
    marginTop: Spacing.xl,
    padding: Spacing.lg,
    backgroundColor: "#1C1C1E",
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#330A09",
  },
  summaryText: {
    color: "#AEAEB2",
    fontSize: 12,
    fontFamily: Fonts?.mono,
    textAlign: "center",
    lineHeight: 18,
  },
});

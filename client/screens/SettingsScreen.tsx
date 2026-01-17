import React, { useState, useEffect, useCallback } from "react";
import { StyleSheet, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import * as Haptics from "expo-haptics";

import { SettingsSlider } from "@/components/SettingsSlider";
import { DeviceProfilePicker } from "@/components/DeviceProfilePicker";
import { ThemedText } from "@/components/ThemedText";
import { Spacing, Fonts } from "@/constants/theme";
import { loadSettings, saveSettings, AppSettings, DEFAULT_SETTINGS } from "@/lib/storage";

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();

  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    loadSettings().then(setSettings);
  }, []);

  const updateSetting = useCallback(<K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K]
  ) => {
    setSettings((prev) => {
      const updated = { ...prev, [key]: value };
      saveSettings(updated);
      return updated;
    });
  }, []);

  const handleProfileSelect = useCallback((profile: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    updateSetting("deviceProfile", profile);
  }, [updateSetting]);

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
        <ThemedText style={styles.title}>GHOSTING CONFIG</ThemedText>
        <ThemedText style={styles.subtitle}>
          Configure noise parameters for Ghosted mode processing
        </ThemedText>
      </View>

      <View style={styles.section}>
        <SettingsSlider
          label="GPS JITTER RADIUS"
          value={settings.gpsRadiusKm}
          min={1}
          max={5}
          step={0.5}
          unit="km"
          formatValue={(v) => `${v}km`}
          onValueChange={(value) => updateSetting("gpsRadiusKm", value)}
        />
      </View>

      <View style={styles.section}>
        <SettingsSlider
          label="TIMESTAMP SHIFT"
          value={settings.timestampShiftHours}
          min={1}
          max={48}
          step={1}
          unit="hr"
          formatValue={(v) => `±${v}hr`}
          onValueChange={(value) => updateSetting("timestampShiftHours", value)}
        />
      </View>

      <View style={styles.section}>
        <DeviceProfilePicker
          selectedProfile={settings.deviceProfile}
          onSelect={handleProfileSelect}
        />
      </View>

      <View style={styles.infoSection}>
        <ThemedText style={styles.infoTitle}>HOW IT WORKS</ThemedText>
        <View style={styles.infoItem}>
          <ThemedText style={styles.infoLabel}>GPS JITTER</ThemedText>
          <ThemedText style={styles.infoText}>
            Randomly offsets location coordinates within the specified radius
          </ThemedText>
        </View>
        <View style={styles.infoItem}>
          <ThemedText style={styles.infoLabel}>TIMESTAMP SHIFT</ThemedText>
          <ThemedText style={styles.infoText}>
            Randomly adjusts photo timestamps within the specified range
          </ThemedText>
        </View>
        <View style={styles.infoItem}>
          <ThemedText style={styles.infoLabel}>DEVICE SPOOF</ThemedText>
          <ThemedText style={styles.infoText}>
            Replaces device make, model, and software with selected profile
          </ThemedText>
        </View>
      </View>

      <View style={styles.securityNote}>
        <ThemedText style={styles.securityText}>
          All processing happens on-device. No data is transmitted or stored externally.
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
  title: {
    color: "#FF3B30",
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
  section: {
    marginBottom: Spacing.xl,
  },
  infoSection: {
    marginTop: Spacing.lg,
    padding: Spacing.lg,
    backgroundColor: "#1C1C1E",
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#330A09",
  },
  infoTitle: {
    color: "#AEAEB2",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.5,
    fontFamily: Fonts?.mono,
    marginBottom: Spacing.lg,
  },
  infoItem: {
    marginBottom: Spacing.lg,
  },
  infoLabel: {
    color: "#FF3B30",
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 1,
    fontFamily: Fonts?.mono,
    marginBottom: Spacing.xs,
  },
  infoText: {
    color: "#AEAEB2",
    fontSize: 12,
    fontFamily: Fonts?.mono,
    lineHeight: 18,
  },
  securityNote: {
    marginTop: Spacing.xl,
    padding: Spacing.lg,
    backgroundColor: "rgba(48, 209, 88, 0.1)",
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "rgba(48, 209, 88, 0.3)",
  },
  securityText: {
    color: "#30D158",
    fontSize: 12,
    fontFamily: Fonts?.mono,
    textAlign: "center",
    lineHeight: 18,
  },
});

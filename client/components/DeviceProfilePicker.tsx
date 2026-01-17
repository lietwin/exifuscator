import React from "react";
import { StyleSheet, View, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { Fonts, Spacing } from "@/constants/theme";

const DEVICE_PROFILES = [
  "iPhone 12",
  "Galaxy S21",
  "Generic Citizen Device",
];

interface DeviceProfilePickerProps {
  selectedProfile: string;
  onSelect: (profile: string) => void;
}

export function DeviceProfilePicker({
  selectedProfile,
  onSelect,
}: DeviceProfilePickerProps) {
  return (
    <View style={styles.container}>
      <ThemedText style={styles.label}>DEVICE SPOOF PROFILE</ThemedText>
      <View style={styles.options}>
        {DEVICE_PROFILES.map((profile) => {
          const isSelected = profile === selectedProfile;
          return (
            <Pressable
              key={profile}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onSelect(profile);
              }}
              style={[
                styles.option,
                isSelected && styles.optionSelected,
              ]}
            >
              <ThemedText
                style={[
                  styles.optionText,
                  isSelected && styles.optionTextSelected,
                ]}
              >
                {profile}
              </ThemedText>
              {isSelected ? (
                <Feather name="check" size={16} color="#FF3B30" />
              ) : null}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#1C1C1E",
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#330A09",
    overflow: "hidden",
  },
  label: {
    color: "#AEAEB2",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 1.5,
    fontFamily: Fonts?.mono,
    textTransform: "uppercase",
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: "#330A09",
  },
  options: {
    gap: 0,
  },
  option: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: "#330A09",
  },
  optionSelected: {
    backgroundColor: "rgba(255, 59, 48, 0.1)",
  },
  optionText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: Fonts?.mono,
  },
  optionTextSelected: {
    color: "#FF3B30",
    fontWeight: "600",
  },
});

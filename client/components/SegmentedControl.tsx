import React from "react";
import { StyleSheet, View, Pressable } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { Fonts, Spacing } from "@/constants/theme";

interface SegmentedControlProps {
  options: string[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  accentColor?: string;
}

export function SegmentedControl({
  options,
  selectedIndex,
  onSelect,
  accentColor = "#FF3B30",
}: SegmentedControlProps) {
  return (
    <View style={styles.container}>
      {options.map((option, index) => {
        const isSelected = index === selectedIndex;
        return (
          <Pressable
            key={option}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onSelect(index);
            }}
            style={[
              styles.option,
              isSelected && { backgroundColor: accentColor },
            ]}
          >
            <ThemedText
              style={[
                styles.optionText,
                isSelected && styles.selectedText,
              ]}
            >
              {option}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "#1C1C1E",
    borderRadius: 4,
    padding: 2,
    borderWidth: 1,
    borderColor: "#330A09",
  },
  option: {
    flex: 1,
    paddingVertical: Spacing.md,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 2,
  },
  optionText: {
    color: "#AEAEB2",
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 1,
    fontFamily: Fonts?.mono,
  },
  selectedText: {
    color: "#FFFFFF",
  },
});

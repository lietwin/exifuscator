import React from "react";
import { StyleSheet, Pressable, ViewStyle, StyleProp, Platform } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  WithSpringConfig,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { Spacing, Shadows, Fonts } from "@/constants/theme";

interface TacticalButtonProps {
  onPress?: () => void;
  label: string;
  variant: "scorched" | "ghosted";
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
  testID?: string;
}

const springConfig: WithSpringConfig = {
  damping: 15,
  mass: 0.3,
  stiffness: 150,
  overshootClamping: true,
  energyThreshold: 0.001,
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function TacticalButton({
  onPress,
  label,
  variant,
  style,
  disabled = false,
  testID,
}: TacticalButtonProps) {
  const scale = useSharedValue(1);

  const backgroundColor = variant === "scorched" ? "#FF3B30" : "#FF9500";
  const textColor = variant === "scorched" ? "#FFFFFF" : "#000000";

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (!disabled) {
      scale.value = withSpring(0.97, springConfig);
    }
  };

  const handlePressOut = () => {
    if (!disabled) {
      scale.value = withSpring(1, springConfig);
    }
  };

  const handlePress = () => {
    if (!disabled && onPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      onPress();
    }
  };

  return (
    <AnimatedPressable
      testID={testID}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      style={[
        styles.button,
        {
          backgroundColor,
          opacity: disabled ? 0.3 : 1,
        },
        Shadows.actionButton,
        style,
        animatedStyle,
      ]}
    >
      <ThemedText
        style={[
          styles.buttonText,
          { color: textColor, fontFamily: Fonts?.mono },
        ]}
      >
        {label}
      </ThemedText>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: Spacing.buttonHeight,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 0,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
});

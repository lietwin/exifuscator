import React, { useEffect } from "react";
import { StyleSheet, View, Pressable } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
  cancelAnimation,
} from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { Fonts } from "@/constants/theme";

type StatusState = "idle" | "processing" | "success" | "error";

interface StatusIndicatorProps {
  state: StatusState;
  mode?: "scorched" | "ghosted";
  onSharePress?: () => void;
}

export function StatusIndicator({ state, mode = "scorched", onSharePress }: StatusIndicatorProps) {
  const opacity = useSharedValue(1);
  const scale = useSharedValue(1);

  const accentColor = mode === "scorched" ? "#FF3B30" : "#FF9500";

  useEffect(() => {
    if (state === "processing") {
      opacity.value = withRepeat(
        withSequence(
          withTiming(0.3, { duration: 500 }),
          withTiming(1, { duration: 500 })
        ),
        -1,
        false
      );
    } else {
      cancelAnimation(opacity);
      opacity.value = withTiming(1, { duration: 200 });
    }
  }, [state, opacity]);

  const animatedTextStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onSharePress?.();
  };

  if (state === "idle") {
    return (
      <View style={styles.container}>
        <ThemedText style={styles.idleText}>SELECT AN IMAGE TO PROCESS</ThemedText>
      </View>
    );
  }

  if (state === "processing") {
    return (
      <View style={styles.container}>
        <Animated.View style={animatedTextStyle}>
          <ThemedText style={[styles.processingText, { color: accentColor }]}>
            PROCESSING...
          </ThemedText>
        </Animated.View>
      </View>
    );
  }

  if (state === "error") {
    return (
      <View style={styles.container}>
        <Feather name="alert-circle" size={24} color="#FF3B30" />
        <ThemedText style={styles.errorText}>PROCESSING FAILED</ThemedText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.successRow}>
        <Feather name="check-circle" size={24} color="#30D158" />
        <ThemedText style={styles.successText}>SANITIZED</ThemedText>
      </View>
      <Animated.View style={animatedButtonStyle}>
        <Pressable
          onPress={handlePress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={styles.shareButton}
          testID="button-share"
        >
          <Feather name="share" size={20} color="#FFFFFF" />
          <ThemedText style={styles.shareText}>TAP TO SHARE</ThemedText>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    paddingVertical: 24,
  },
  idleText: {
    color: "#AEAEB2",
    fontSize: 13,
    fontWeight: "500",
    letterSpacing: 1.5,
    fontFamily: Fonts?.mono,
    textAlign: "center",
  },
  processingText: {
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 2,
    fontFamily: Fonts?.mono,
  },
  successRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  successText: {
    color: "#30D158",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 1.5,
    fontFamily: Fonts?.mono,
  },
  errorText: {
    color: "#FF3B30",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 1.5,
    fontFamily: Fonts?.mono,
    marginTop: 8,
  },
  shareButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#2C2C2E",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#330A09",
  },
  shareText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 1,
    fontFamily: Fonts?.mono,
  },
});

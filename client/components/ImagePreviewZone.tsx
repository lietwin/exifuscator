import React from "react";
import { StyleSheet, View, Pressable, Image } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  WithSpringConfig,
} from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { Fonts } from "@/constants/theme";

interface ImagePreviewZoneProps {
  imageUri?: string | null;
  onPress: () => void;
  isProcessed?: boolean;
  testID?: string;
}

const springConfig: WithSpringConfig = {
  damping: 15,
  mass: 0.3,
  stiffness: 150,
  overshootClamping: true,
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function ImagePreviewZone({
  imageUri,
  onPress,
  isProcessed = false,
  testID,
}: ImagePreviewZoneProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98, springConfig);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, springConfig);
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <AnimatedPressable
      testID={testID}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.container, animatedStyle]}
    >
      <View style={[styles.previewBox, isProcessed && styles.previewBoxProcessed]}>
        {imageUri ? (
          <Image
            source={{ uri: imageUri }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.emptyState}>
            <Feather name="crosshair" size={64} color="#FF3B30" />
            <ThemedText style={styles.emptyText}>TAP TO SELECT IMAGE</ThemedText>
          </View>
        )}
        {isProcessed ? (
          <View style={styles.processedBadge}>
            <Feather name="check" size={20} color="#30D158" />
            <ThemedText style={styles.processedText}>SANITIZED</ThemedText>
          </View>
        ) : null}
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  previewBox: {
    width: 280,
    height: 280,
    borderWidth: 1,
    borderColor: "#FF3B30",
    borderRadius: 4,
    backgroundColor: "#1C1C1E",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  previewBoxProcessed: {
    borderColor: "#30D158",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  emptyText: {
    color: "#FF3B30",
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 1.5,
    fontFamily: Fonts?.mono,
  },
  processedBadge: {
    position: "absolute",
    bottom: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    gap: 6,
  },
  processedText: {
    color: "#30D158",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
    fontFamily: Fonts?.mono,
  },
});

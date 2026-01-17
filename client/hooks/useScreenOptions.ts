import { Platform } from "react-native";
import { NativeStackNavigationOptions } from "@react-navigation/native-stack";
import { isLiquidGlassAvailable } from "expo-glass-effect";

import { Fonts } from "@/constants/theme";

interface UseScreenOptionsParams {
  transparent?: boolean;
}

export function useScreenOptions({
  transparent = true,
}: UseScreenOptionsParams = {}): NativeStackNavigationOptions {
  return {
    headerTitleAlign: "center",
    headerTransparent: transparent,
    headerBlurEffect: "dark",
    headerTintColor: "#FF3B30",
    headerTitleStyle: {
      fontSize: 14,
      fontWeight: "700",
      letterSpacing: 2,
      fontFamily: Fonts?.mono,
    },
    headerStyle: {
      backgroundColor: Platform.select({
        ios: undefined,
        android: "#000000",
        web: "#000000",
      }),
    },
    gestureEnabled: true,
    gestureDirection: "horizontal",
    fullScreenGestureEnabled: isLiquidGlassAvailable() ? false : true,
    contentStyle: {
      backgroundColor: "#000000",
    },
  };
}

import React from "react";
import { Pressable, StyleSheet } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import { HeaderButton } from "@react-navigation/elements";

import ProcessScreen from "@/screens/ProcessScreen";
import SettingsScreen from "@/screens/SettingsScreen";
import FingerprintScreen from "@/screens/FingerprintScreen";
import { HeaderTitle } from "@/components/HeaderTitle";
import { useScreenOptions } from "@/hooks/useScreenOptions";
import { ProcessingResult } from "@/lib/exif-processor";

export type RootStackParamList = {
  Process: undefined;
  Settings: undefined;
  Fingerprint: { result: ProcessingResult };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootStackNavigator() {
  const screenOptions = useScreenOptions();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="Process"
        component={ProcessScreen}
        options={({ navigation }) => ({
          headerTitle: () => <HeaderTitle title="EXIFUSCATOR" />,
          headerLeft: () => (
            <HeaderButton
              onPress={() => navigation.navigate("Settings")}
              pressColor="transparent"
              pressOpacity={0.6}
            >
              <Feather name="settings" size={22} color="#FF3B30" />
            </HeaderButton>
          ),
          headerRight: () => (
            <HeaderButton
              onPress={() => {}}
              pressColor="transparent"
              pressOpacity={0.6}
              disabled
            >
              <Feather name="shield" size={22} color="#3A3A3C" />
            </HeaderButton>
          ),
        })}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          headerTitle: "CONFIG",
          headerBackTitle: "",
        }}
      />
      <Stack.Screen
        name="Fingerprint"
        component={FingerprintScreen}
        options={{
          headerTitle: "DIGITAL FINGERPRINT",
          headerBackTitle: "",
        }}
      />
    </Stack.Navigator>
  );
}

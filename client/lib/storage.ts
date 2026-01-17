import AsyncStorage from "@react-native-async-storage/async-storage";

const SETTINGS_KEY = "@exifuscator_settings";

export interface AppSettings {
  gpsRadiusKm: number;
  timestampShiftHours: number;
  deviceProfile: string;
}

export const DEFAULT_SETTINGS: AppSettings = {
  gpsRadiusKm: 3,
  timestampShiftHours: 12,
  deviceProfile: "Generic Citizen Device",
};

export async function loadSettings(): Promise<AppSettings> {
  try {
    const stored = await AsyncStorage.getItem(SETTINGS_KEY);
    if (stored) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
    }
  } catch (error) {
    console.warn("Failed to load settings:", error);
  }
  return DEFAULT_SETTINGS;
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  try {
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.warn("Failed to save settings:", error);
  }
}

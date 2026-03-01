import React, { useState, useEffect, useCallback } from "react";
import { StyleSheet, View, Platform, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import * as MediaLibrary from "expo-media-library";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import * as Haptics from "expo-haptics";

import { ImagePreviewZone } from "@/components/ImagePreviewZone";
import { TacticalButton } from "@/components/TacticalButton";
import { StatusIndicator } from "@/components/StatusIndicator";
import { Spacing } from "@/constants/theme";
import { loadSettings, AppSettings, DEFAULT_SETTINGS } from "@/lib/storage";
import {
  processImageScorched,
  processImageGhosted,
  ProcessingResult,
} from "@/lib/exif-processor";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

type StatusState = "idle" | "processing" | "success" | "error";

function decimalToRational(val: number): [number, number] {
  const denom = 10000;
  return [Math.round(val * denom), denom];
}

function decimalDegreesToDMS(dd: number): [[number, number], [number, number], [number, number]] {
  const abs = Math.abs(dd);
  const deg = Math.floor(abs);
  const minFloat = (abs - deg) * 60;
  const min = Math.floor(minFloat);
  const sec = (minFloat - min) * 60;
  return [[deg, 1], [min, 1], [Math.round(sec * 100), 100]];
}

function buildPiexifFromNativeExif(piexif: any, nativeExif: Record<string, any>) {
  const zeroth: Record<number, any> = {};
  const exifIfd: Record<number, any> = {};
  const gpsIfd: Record<number, any> = {};

  if (nativeExif.Make) zeroth[piexif.ImageIFD.Make] = nativeExif.Make;
  if (nativeExif.Model) zeroth[piexif.ImageIFD.Model] = nativeExif.Model;
  if (nativeExif.Software) zeroth[piexif.ImageIFD.Software] = nativeExif.Software;
  if (nativeExif.DateTime) zeroth[piexif.ImageIFD.DateTime] = nativeExif.DateTime;
  if (nativeExif.Orientation) zeroth[piexif.ImageIFD.Orientation] = nativeExif.Orientation;
  if (nativeExif.Copyright) zeroth[piexif.ImageIFD.Copyright] = nativeExif.Copyright;
  if (nativeExif.Artist) zeroth[piexif.ImageIFD.Artist] = nativeExif.Artist;
  if (nativeExif.PixelXDimension) zeroth[piexif.ImageIFD.ImageWidth] = nativeExif.PixelXDimension;
  if (nativeExif.PixelYDimension) zeroth[piexif.ImageIFD.ImageLength] = nativeExif.PixelYDimension;
  if (nativeExif.XResolution) zeroth[piexif.ImageIFD.XResolution] = decimalToRational(nativeExif.XResolution);
  if (nativeExif.YResolution) zeroth[piexif.ImageIFD.YResolution] = decimalToRational(nativeExif.YResolution);

  if (nativeExif.DateTimeOriginal) exifIfd[piexif.ExifIFD.DateTimeOriginal] = nativeExif.DateTimeOriginal;
  if (nativeExif.DateTimeDigitized) exifIfd[piexif.ExifIFD.DateTimeDigitized] = nativeExif.DateTimeDigitized;
  if (nativeExif.ISOSpeedRatings != null) {
    exifIfd[piexif.ExifIFD.ISOSpeedRatings] = Array.isArray(nativeExif.ISOSpeedRatings)
      ? nativeExif.ISOSpeedRatings[0] : nativeExif.ISOSpeedRatings;
  }
  if (nativeExif.ExposureTime != null) exifIfd[piexif.ExifIFD.ExposureTime] = decimalToRational(nativeExif.ExposureTime);
  if (nativeExif.FNumber != null) exifIfd[piexif.ExifIFD.FNumber] = decimalToRational(nativeExif.FNumber);
  if (nativeExif.FocalLength != null) exifIfd[piexif.ExifIFD.FocalLength] = decimalToRational(nativeExif.FocalLength);
  if (nativeExif.LensModel) exifIfd[piexif.ExifIFD.LensModel] = nativeExif.LensModel;
  if (nativeExif.LensMake) exifIfd[piexif.ExifIFD.LensMake] = nativeExif.LensMake;
  if (nativeExif.Flash != null) exifIfd[piexif.ExifIFD.Flash] = nativeExif.Flash;

  const lat = nativeExif.GPSLatitude;
  const lng = nativeExif.GPSLongitude;
  if (lat != null && lng != null) {
    gpsIfd[piexif.GPSIFD.GPSLatitude] = decimalDegreesToDMS(lat);
    gpsIfd[piexif.GPSIFD.GPSLatitudeRef] = lat >= 0 ? "N" : "S";
    gpsIfd[piexif.GPSIFD.GPSLongitude] = decimalDegreesToDMS(lng);
    gpsIfd[piexif.GPSIFD.GPSLongitudeRef] = lng >= 0 ? "E" : "W";
  }
  if (nativeExif.GPSAltitude != null) {
    gpsIfd[piexif.GPSIFD.GPSAltitude] = decimalToRational(Math.abs(nativeExif.GPSAltitude));
    gpsIfd[piexif.GPSIFD.GPSAltitudeRef] = nativeExif.GPSAltitude >= 0 ? 0 : 1;
  }

  return { "0th": zeroth, Exif: exifIfd, GPS: gpsIfd, "1st": {}, Interop: {} };
}

export default function ProcessScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [status, setStatus] = useState<StatusState>("idle");
  const [processMode, setProcessMode] = useState<"scorched" | "ghosted">("scorched");
  const [processingResult, setProcessingResult] = useState<ProcessingResult | null>(null);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    loadSettings().then(setSettings);
  }, []);

  const pickImage = useCallback(async () => {
    const { status: permissionStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionStatus !== "granted") {
      if (Platform.OS !== "web") {
        Alert.alert(
          "Permission Required",
          "Camera roll access is needed to select images for processing.",
          [{ text: "OK" }]
        );
      }
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: false,
      quality: 1,
      exif: true,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setImageUri(asset.uri);
      
      try {
        const isHeic = asset.mimeType === "image/heic" || 
          asset.mimeType === "image/heif" ||
          asset.uri.toLowerCase().endsWith(".heic") ||
          asset.uri.toLowerCase().endsWith(".heif");

        if (isHeic) {
          const manipulated = await ImageManipulator.manipulateAsync(
            asset.uri,
            [],
            { format: ImageManipulator.SaveFormat.JPEG, base64: true }
          );

          if (manipulated.base64) {
            let dataUri = `data:image/jpeg;base64,${manipulated.base64}`;

            if (asset.exif) {
              try {
                const piexif = (await import("piexifjs")).default;
                const exifObj = buildPiexifFromNativeExif(piexif, asset.exif);
                const exifBytes = piexif.dump(exifObj);
                dataUri = piexif.insert(exifBytes, dataUri);
              } catch (e) {
                console.warn("HEIC EXIF injection failed:", e);
              }
            }

            setImageBase64(dataUri);
          }
        } else {
          const base64 = await FileSystem.readAsStringAsync(asset.uri, {
            encoding: FileSystem.EncodingType.Base64,
          });
          setImageBase64(`data:image/jpeg;base64,${base64}`);
        }
      } catch (error) {
        console.error("Image read failed:", error);
        Alert.alert("Error", "Failed to read image data.");
      }
      
      setStatus("idle");
      setProcessingResult(null);
    }
  }, []);

  const processImage = useCallback(async (mode: "scorched" | "ghosted") => {
    if (!imageBase64) return;

    setStatus("processing");
    setProcessMode(mode);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    setTimeout(() => {
      try {
        let result: ProcessingResult;
        
        if (mode === "scorched") {
          result = processImageScorched(imageBase64);
        } else {
          result = processImageGhosted(imageBase64, {
            gpsRadiusKm: settings.gpsRadiusKm,
            timestampShiftHours: settings.timestampShiftHours,
            deviceProfile: settings.deviceProfile,
          });
        }

        setProcessingResult(result);
        setStatus("success");
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (error) {
        console.error("Processing failed:", error);
        setStatus("error");
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    }, 500);
  }, [imageBase64, settings]);

  const shareImage = useCallback(async () => {
    if (!processingResult) return;

    try {
      const base64Data = processingResult.processedImageBase64.replace(
        /^data:image\/\w+;base64,/,
        ""
      );

      const filename = `exifuscator_${Date.now()}.jpg`;
      const fileUri = `${FileSystem.cacheDirectory}${filename}`;

      await FileSystem.writeAsStringAsync(fileUri, base64Data, {
        encoding: "base64",
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: "image/jpeg",
          dialogTitle: "Share Sanitized Image",
        });
      } else {
        const { status: saveStatus } = await MediaLibrary.requestPermissionsAsync();
        if (saveStatus === "granted") {
          await MediaLibrary.saveToLibraryAsync(fileUri);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          Alert.alert("Saved", "Image saved to camera roll.");
        }
      }
    } catch (error) {
      console.error("Share failed:", error);
      Alert.alert("Error", "Failed to share image.");
    }
  }, [processingResult]);

  const viewFingerprint = useCallback(() => {
    if (processingResult) {
      navigation.navigate("Fingerprint", { result: processingResult });
    }
  }, [navigation, processingResult]);

  const hasImage = Boolean(imageUri);
  const isProcessed = status === "success";

  return (
    <View style={[styles.container, { paddingTop: headerHeight + Spacing.lg }]}>
      <View style={styles.previewSection}>
        <ImagePreviewZone
          imageUri={isProcessed && processingResult 
            ? `data:image/jpeg;base64,${processingResult.processedImageBase64.replace(/^data:image\/\w+;base64,/, "")}`
            : imageUri
          }
          onPress={pickImage}
          isProcessed={isProcessed}
          testID="button-select-image"
        />
      </View>

      <View style={styles.buttonsSection}>
        <TacticalButton
          label="ERASE METADATA"
          variant="scorched"
          onPress={() => processImage("scorched")}
          disabled={!hasImage || status === "processing"}
          testID="button-scorched"
        />
        <TacticalButton
          label="GHOST METADATA"
          variant="ghosted"
          onPress={() => processImage("ghosted")}
          disabled={!hasImage || status === "processing"}
          testID="button-ghosted"
        />
      </View>

      <View style={[styles.statusSection, { paddingBottom: insets.bottom + Spacing.lg }]}>
        <StatusIndicator
          state={status}
          mode={processMode}
          onSharePress={shareImage}
          onViewFingerprint={viewFingerprint}
          hasResult={isProcessed}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  previewSection: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.lg,
  },
  buttonsSection: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  statusSection: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: Spacing.lg,
  },
});

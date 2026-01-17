# Exifuscator

## Overview
Exifuscator is a tactical privacy tool for instantly sanitizing photo metadata before sharing. Built for journalists, activists, and privacy-conscious users who need rapid EXIF data removal or obfuscation.

## Current State
MVP implementation with core features:
- Image selection from camera roll
- Two processing modes: "Scorched Earth" (complete removal) and "Ghosted" (synthetic noise)
- Digital Fingerprint viewer for before/after comparison
- Configurable ghosting parameters (GPS radius, timestamp shift, device spoofing)
- Edge-only processing with secure handling

## Project Architecture

### Frontend (Expo React Native)
```
client/
├── App.tsx                 # Root app with navigation
├── screens/
│   ├── ProcessScreen.tsx   # Main processing interface
│   ├── FingerprintScreen.tsx # Metadata comparison viewer
│   └── SettingsScreen.tsx  # Ghosting configuration
├── components/
│   ├── TacticalButton.tsx  # Dual-action buttons
│   ├── ImagePreviewZone.tsx # Image selection/preview
│   ├── StatusIndicator.tsx # Processing status
│   ├── MetadataRow.tsx     # Fingerprint table rows
│   ├── SegmentedControl.tsx # Before/After toggle
│   ├── SettingsSlider.tsx  # Config sliders
│   └── DeviceProfilePicker.tsx # Device spoof selector
├── lib/
│   ├── exif-processor.ts   # EXIF manipulation logic
│   └── storage.ts          # Settings persistence
└── navigation/
    └── RootStackNavigator.tsx # Stack-only navigation
```

### Backend (Express.js)
Minimal backend - all processing happens on-device. Server provides landing page only.

## Recent Changes
- Initial MVP implementation
- Tactical dark mode UI with brutalist design
- EXIF processing with piexifjs library
- GPS jitter, timestamp shifting, device spoofing features
- Settings persistence with AsyncStorage

## User Preferences
- Dark mode only (forced via userInterfaceStyle)
- Monospace typography for tactical aesthetic
- Red (#FF3B30) primary, Amber (#FF9500) secondary colors
- Stack-only navigation (no tabs)

## Key Technical Decisions
- All EXIF processing happens client-side using piexifjs
- No backend API calls for image processing (privacy-first)
- Settings stored locally with @react-native-async-storage/async-storage
- Share functionality uses expo-sharing for cross-platform support

# Exifuscator Design Guidelines

## Brand Identity

**Purpose**: Exifuscator is a tactical privacy tool for journalists, activists, and privacy-conscious users who need instant metadata sanitization before sharing photos publicly.

**Aesthetic Direction**: Brutalist utilitarian with military precision. Think command-line interface meets tactical gear—stark, high-contrast, zero-tolerance for decoration. Every pixel serves function. The app feels like a security tool, not a social app.

**Memorable Element**: The dual-action buttons ("Scorched Earth" red, "Ghosted" amber) against pure black backgrounds with monospace typography create an unmistakable tactical interface.

## Navigation Architecture

**Root Navigation**: Stack-only (no tabs). This is a mission-critical utility, not a browsing experience.

**Screen Flow**:
1. **Process Screen** (Home) - Primary image selection and dual-action processing
2. **Fingerprint Viewer** - Diagnostic metadata comparison (accessible via header button)
3. **Settings** - Ghosting parameters configuration (accessible via header button)

## Screen-by-Screen Specifications

### 1. Process Screen (Home)
**Purpose**: Select image → process → share in 2 taps.

**Layout**:
- Header: Transparent, left: Settings gear icon, right: Fingerprint diagnostic icon
- Top inset: headerHeight + 24px
- Bottom inset: insets.bottom + 24px
- Content: Non-scrollable, fixed layout

**Components**:
- **Image Preview Zone** (top 40% of screen):
  - Centered 280x280px square with 1px red border (#FF3B30)
  - Empty state: "TAP TO SELECT IMAGE" in monospace text
  - Selected state: Shows chosen image
  - Tap target: Opens image picker (camera roll + camera)
  
- **Dual-Action Buttons** (center 30%):
  - "SCORCHED EARTH" button: 90% screen width, 72px height, solid red (#FF3B30), white monospace label
  - 16px vertical spacing
  - "GHOSTED" button: 90% screen width, 72px height, solid amber (#FF9500), black monospace label
  - Both disabled (30% opacity) until image selected
  - Floating shadow: offset (0,2), opacity 0.15, radius 3
  
- **Status Indicator** (bottom 30%):
  - Processing state: Animated dots "PROCESSING..." in red/amber (matches selected action)
  - Success state: "✓ SANITIZED" + "TAP TO SHARE" prompt
  - Auto-triggers system share sheet after 500ms

### 2. Fingerprint Viewer Screen
**Purpose**: Technical metadata audit showing before/after comparison.

**Layout**:
- Header: Default navigation header, title "DIGITAL FINGERPRINT", left: Back arrow
- Top inset: 24px
- Bottom inset: insets.bottom + 24px
- Content: Scrollable

**Components**:
- **Before/After Toggle**: Segmented control at top, red/amber accent colors
- **Metadata Table**: Monospace font, key-value pairs in table rows
  - GPS Coordinates, Device Make/Model, Timestamp, Software, etc.
  - Removed fields shown with "—STRIPPED—" in red
  - Modified fields shown with old → new values in amber

### 3. Settings Screen
**Purpose**: Configure ghosting noise parameters.

**Layout**:
- Header: Default navigation header, title "GHOSTING CONFIG", left: Back arrow
- Top inset: 24px
- Bottom inset: insets.bottom + 24px
- Content: Scrollable form

**Components**:
- **GPS Jitter Radius Slider**: 1km - 5km range, current value displayed in monospace
- **Timestamp Shift Intensity**: ±1hr - ±48hr range selector
- **Device Spoof Profile**: Dropdown with options (iPhone 12, Galaxy S21, Generic Citizen Device)
- All controls use red accent color (#FF3B30)

## Color Palette

**Background**: Pure black (#000000)  
**Surface**: Dark gray (#1C1C1E) for cards/containers  
**Primary (Danger/Scorched)**: Alert red (#FF3B30)  
**Secondary (Warning/Ghost)**: Amber (#FF9500)  
**Text Primary**: White (#FFFFFF)  
**Text Secondary**: Light gray (#AEAEB2)  
**Border/Divider**: Dark red (#330A09)

## Typography

**Font**: System monospace (SF Mono on iOS, Roboto Mono on Android) for tactical aesthetic  
**Scale**:
- Action Button: 16px Bold, uppercase, letter-spacing 1.5px
- Screen Title: 14px Bold, uppercase, letter-spacing 2px
- Body/Labels: 13px Regular
- Metadata Values: 12px Regular, monospace

## Visual Design

- All buttons use solid fills (no gradients)
- Pressed state: 60% opacity
- No rounded corners (0px border radius) except image preview (4px)
- Minimal drop shadows only on floating action buttons
- 1px hairline borders in dark red (#330A09) for structure

## Assets to Generate

**icon.png** - App icon featuring a stylized photo frame with crosshairs and "X" overlay in red/amber tactical design. **WHERE USED**: Device home screen.

**splash-icon.png** - Simplified version of app icon for launch screen. **WHERE USED**: App startup.

**empty-image-preview.png** - Tactical crosshair reticle graphic in dark red on transparent background (140x140px). **WHERE USED**: Process Screen image preview zone when no image selected.

**ghost-mode-badge.png** - Small amber ghost icon (32x32px) for mode indicator. **WHERE USED**: Settings screen, status indicators.

**scorched-earth-badge.png** - Small red fire icon (32x32px) for mode indicator. **WHERE USED**: Settings screen, status indicators.
import piexif from "piexifjs";

export interface ExifData {
  gpsLatitude?: number;
  gpsLongitude?: number;
  deviceMake?: string;
  deviceModel?: string;
  software?: string;
  dateTime?: string;
  dateTimeOriginal?: string;
  dateTimeDigitized?: string;
  imageWidth?: number;
  imageHeight?: number;
  orientation?: number;
  xResolution?: number;
  yResolution?: number;
  copyright?: string;
  artist?: string;
  exposureTime?: string;
  fNumber?: string;
  isoSpeed?: number;
  focalLength?: string;
  flash?: string;
  lensModel?: string;
  raw?: Record<string, unknown>;
}

export interface ProcessingResult {
  originalExif: ExifData;
  processedExif: ExifData;
  processedImageBase64: string;
  mode: "scorched" | "ghosted";
}

export interface GhostingConfig {
  gpsRadiusKm: number;
  timestampShiftHours: number;
  deviceProfile: string;
}

const DEVICE_PROFILES: Record<string, { make: string; model: string; software: string }> = {
  "iPhone 12": {
    make: "Apple",
    model: "iPhone 12",
    software: "17.0",
  },
  "Galaxy S21": {
    make: "Samsung",
    model: "SM-G991U",
    software: "One UI 6.0",
  },
  "Generic Citizen Device": {
    make: "Generic",
    model: "Smartphone",
    software: "Unknown",
  },
};

function parseGpsCoordinate(gpsData: number[][], ref: string): number | undefined {
  if (!gpsData || gpsData.length < 3) return undefined;
  
  const degrees = gpsData[0][0] / gpsData[0][1];
  const minutes = gpsData[1][0] / gpsData[1][1];
  const seconds = gpsData[2][0] / gpsData[2][1];
  
  let decimal = degrees + minutes / 60 + seconds / 3600;
  
  if (ref === "S" || ref === "W") {
    decimal = -decimal;
  }
  
  return decimal;
}

function formatExposureTime(value: number[]): string | undefined {
  if (!value || value.length < 2) return undefined;
  const numerator = value[0];
  const denominator = value[1];
  if (denominator === 1) return `${numerator}s`;
  return `1/${Math.round(denominator / numerator)}s`;
}

function formatFNumber(value: number[]): string | undefined {
  if (!value || value.length < 2) return undefined;
  return `f/${(value[0] / value[1]).toFixed(1)}`;
}

function formatFocalLength(value: number[]): string | undefined {
  if (!value || value.length < 2) return undefined;
  return `${(value[0] / value[1]).toFixed(1)}mm`;
}

export function extractExifData(imageBase64: string): ExifData {
  try {
    const exifObj = piexif.load(imageBase64);
    const exifData: ExifData = { raw: {} };

    const zeroth = exifObj["0th"] || {};
    const exif = exifObj["Exif"] || {};
    const gps = exifObj["GPS"] || {};

    exifData.deviceMake = zeroth[piexif.ImageIFD.Make];
    exifData.deviceModel = zeroth[piexif.ImageIFD.Model];
    exifData.software = zeroth[piexif.ImageIFD.Software];
    exifData.dateTime = zeroth[piexif.ImageIFD.DateTime];
    exifData.imageWidth = zeroth[piexif.ImageIFD.ImageWidth];
    exifData.imageHeight = zeroth[piexif.ImageIFD.ImageLength];
    exifData.orientation = zeroth[piexif.ImageIFD.Orientation];
    exifData.copyright = zeroth[piexif.ImageIFD.Copyright];
    exifData.artist = zeroth[piexif.ImageIFD.Artist];

    if (zeroth[piexif.ImageIFD.XResolution]) {
      const xRes = zeroth[piexif.ImageIFD.XResolution];
      exifData.xResolution = xRes[0] / xRes[1];
    }
    if (zeroth[piexif.ImageIFD.YResolution]) {
      const yRes = zeroth[piexif.ImageIFD.YResolution];
      exifData.yResolution = yRes[0] / yRes[1];
    }

    exifData.dateTimeOriginal = exif[piexif.ExifIFD.DateTimeOriginal];
    exifData.dateTimeDigitized = exif[piexif.ExifIFD.DateTimeDigitized];
    exifData.isoSpeed = exif[piexif.ExifIFD.ISOSpeedRatings];

    if (exif[piexif.ExifIFD.ExposureTime]) {
      exifData.exposureTime = formatExposureTime(exif[piexif.ExifIFD.ExposureTime]);
    }
    if (exif[piexif.ExifIFD.FNumber]) {
      exifData.fNumber = formatFNumber(exif[piexif.ExifIFD.FNumber]);
    }
    if (exif[piexif.ExifIFD.FocalLength]) {
      exifData.focalLength = formatFocalLength(exif[piexif.ExifIFD.FocalLength]);
    }
    
    exifData.lensModel = exif[piexif.ExifIFD.LensModel];

    if (gps[piexif.GPSIFD.GPSLatitude] && gps[piexif.GPSIFD.GPSLatitudeRef]) {
      exifData.gpsLatitude = parseGpsCoordinate(
        gps[piexif.GPSIFD.GPSLatitude],
        gps[piexif.GPSIFD.GPSLatitudeRef]
      );
    }
    if (gps[piexif.GPSIFD.GPSLongitude] && gps[piexif.GPSIFD.GPSLongitudeRef]) {
      exifData.gpsLongitude = parseGpsCoordinate(
        gps[piexif.GPSIFD.GPSLongitude],
        gps[piexif.GPSIFD.GPSLongitudeRef]
      );
    }

    exifData.raw = {
      "0th": zeroth,
      Exif: exif,
      GPS: gps,
    };

    return exifData;
  } catch (error) {
    console.warn("Failed to extract EXIF data:", error);
    return {};
  }
}

function jitterGps(lat: number, lng: number, radiusKm: number): { lat: number; lng: number } {
  const radiusDeg = radiusKm / 111;
  const randomAngle = Math.random() * 2 * Math.PI;
  const randomRadius = Math.random() * radiusDeg;
  
  return {
    lat: lat + randomRadius * Math.cos(randomAngle),
    lng: lng + randomRadius * Math.sin(randomAngle),
  };
}

function shiftTimestamp(dateString: string, hoursShift: number): string {
  const parts = dateString.split(" ");
  if (parts.length !== 2) return dateString;
  
  const datePart = parts[0].replace(/:/g, "-");
  const timePart = parts[1];
  
  const date = new Date(`${datePart}T${timePart}`);
  const shiftMs = hoursShift * 60 * 60 * 1000;
  const randomShift = (Math.random() - 0.5) * 2 * shiftMs;
  date.setTime(date.getTime() + randomShift);
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  
  return `${year}:${month}:${day} ${hours}:${minutes}:${seconds}`;
}

function decimalToGpsCoordinate(decimal: number): [number[], number[], number[]] {
  const absolute = Math.abs(decimal);
  const degrees = Math.floor(absolute);
  const minutesFloat = (absolute - degrees) * 60;
  const minutes = Math.floor(minutesFloat);
  const seconds = (minutesFloat - minutes) * 60;
  
  return [
    [degrees, 1],
    [minutes, 1],
    [Math.round(seconds * 100), 100],
  ];
}

export function processImageScorched(imageBase64: string): ProcessingResult {
  const originalExif = extractExifData(imageBase64);
  
  try {
    const processedImageBase64 = piexif.remove(imageBase64);
    
    return {
      originalExif,
      processedExif: {},
      processedImageBase64,
      mode: "scorched",
    };
  } catch (error) {
    console.warn("Failed to remove EXIF:", error);
    return {
      originalExif,
      processedExif: {},
      processedImageBase64: imageBase64,
      mode: "scorched",
    };
  }
}

export function processImageGhosted(
  imageBase64: string,
  config: GhostingConfig
): ProcessingResult {
  const originalExif = extractExifData(imageBase64);
  
  try {
    const exifObj = piexif.load(imageBase64);
    const zeroth = exifObj["0th"] || {};
    const exif = exifObj["Exif"] || {};
    const gps = exifObj["GPS"] || {};

    const profile = DEVICE_PROFILES[config.deviceProfile] || DEVICE_PROFILES["Generic Citizen Device"];
    zeroth[piexif.ImageIFD.Make] = profile.make;
    zeroth[piexif.ImageIFD.Model] = profile.model;
    zeroth[piexif.ImageIFD.Software] = profile.software;

    if (zeroth[piexif.ImageIFD.DateTime]) {
      zeroth[piexif.ImageIFD.DateTime] = shiftTimestamp(
        zeroth[piexif.ImageIFD.DateTime],
        config.timestampShiftHours
      );
    }
    if (exif[piexif.ExifIFD.DateTimeOriginal]) {
      exif[piexif.ExifIFD.DateTimeOriginal] = shiftTimestamp(
        exif[piexif.ExifIFD.DateTimeOriginal],
        config.timestampShiftHours
      );
    }
    if (exif[piexif.ExifIFD.DateTimeDigitized]) {
      exif[piexif.ExifIFD.DateTimeDigitized] = shiftTimestamp(
        exif[piexif.ExifIFD.DateTimeDigitized],
        config.timestampShiftHours
      );
    }

    if (gps[piexif.GPSIFD.GPSLatitude] && gps[piexif.GPSIFD.GPSLongitude]) {
      const origLat = parseGpsCoordinate(
        gps[piexif.GPSIFD.GPSLatitude],
        gps[piexif.GPSIFD.GPSLatitudeRef]
      );
      const origLng = parseGpsCoordinate(
        gps[piexif.GPSIFD.GPSLongitude],
        gps[piexif.GPSIFD.GPSLongitudeRef]
      );
      
      if (origLat !== undefined && origLng !== undefined) {
        const jittered = jitterGps(origLat, origLng, config.gpsRadiusKm);
        
        gps[piexif.GPSIFD.GPSLatitude] = decimalToGpsCoordinate(jittered.lat);
        gps[piexif.GPSIFD.GPSLatitudeRef] = jittered.lat >= 0 ? "N" : "S";
        gps[piexif.GPSIFD.GPSLongitude] = decimalToGpsCoordinate(jittered.lng);
        gps[piexif.GPSIFD.GPSLongitudeRef] = jittered.lng >= 0 ? "E" : "W";
      }
    }

    delete zeroth[piexif.ImageIFD.Artist];
    delete zeroth[piexif.ImageIFD.Copyright];
    delete exif[piexif.ExifIFD.LensModel];
    delete exif[piexif.ExifIFD.LensMake];
    delete exif[piexif.ExifIFD.CameraOwnerName];
    delete exif[piexif.ExifIFD.BodySerialNumber];
    delete exif[piexif.ExifIFD.LensSerialNumber];

    exifObj["0th"] = zeroth;
    exifObj["Exif"] = exif;
    exifObj["GPS"] = gps;

    const exifBytes = piexif.dump(exifObj);
    const processedImageBase64 = piexif.insert(exifBytes, imageBase64);
    const processedExif = extractExifData(processedImageBase64);

    return {
      originalExif,
      processedExif,
      processedImageBase64,
      mode: "ghosted",
    };
  } catch (error) {
    console.warn("Failed to ghost EXIF:", error);
    return processImageScorched(imageBase64);
  }
}

export function getExifFieldLabel(key: string): string {
  const labels: Record<string, string> = {
    gpsLatitude: "GPS LATITUDE",
    gpsLongitude: "GPS LONGITUDE",
    deviceMake: "DEVICE MAKE",
    deviceModel: "DEVICE MODEL",
    software: "SOFTWARE",
    dateTime: "DATE/TIME",
    dateTimeOriginal: "ORIGINAL DATE",
    dateTimeDigitized: "DIGITIZED DATE",
    imageWidth: "IMAGE WIDTH",
    imageHeight: "IMAGE HEIGHT",
    orientation: "ORIENTATION",
    xResolution: "X RESOLUTION",
    yResolution: "Y RESOLUTION",
    copyright: "COPYRIGHT",
    artist: "ARTIST",
    exposureTime: "EXPOSURE",
    fNumber: "APERTURE",
    isoSpeed: "ISO",
    focalLength: "FOCAL LENGTH",
    flash: "FLASH",
    lensModel: "LENS",
  };
  return labels[key] || key.toUpperCase();
}

export function formatExifValue(key: string, value: unknown): string {
  if (value === undefined || value === null) return "—";
  
  if (key === "gpsLatitude" || key === "gpsLongitude") {
    const num = value as number;
    return num.toFixed(6) + "°";
  }
  
  if (key === "orientation") {
    const orientations: Record<number, string> = {
      1: "Normal",
      2: "Flipped H",
      3: "Rotated 180°",
      4: "Flipped V",
      5: "Rotated 90° CCW + Flipped",
      6: "Rotated 90° CW",
      7: "Rotated 90° CW + Flipped",
      8: "Rotated 90° CCW",
    };
    return orientations[value as number] || String(value);
  }
  
  if (key === "xResolution" || key === "yResolution") {
    return `${value} DPI`;
  }
  
  if (key === "imageWidth" || key === "imageHeight") {
    return `${value}px`;
  }
  
  return String(value);
}

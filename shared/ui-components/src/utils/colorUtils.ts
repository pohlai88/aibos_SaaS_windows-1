// Color contrast utilities for WCAG compliance
export interface ColorContrast {
  ratio: number;
  passes: {
    AA: boolean;
    AALarge: boolean;
    AAA: boolean;
    AAALarge: boolean;
  };
}

// WCAG contrast ratio thresholds
const WCAG_THRESHOLDS = {
  AA: 4.5,
  AALarge: 3,
  AAA: 7,
  AAALarge: 4.5,
};

// Convert hex to RGB
export const hexToRgb = (hex: string): [number, number, number] => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) throw new Error(`Invalid hex color: ${hex}`);

  return [parseInt(result[1]!, 16), parseInt(result[2]!, 16), parseInt(result[3]!, 16)];
};

// Convert RGB to hex
export const rgbToHex = (r: number, g: number, b: number): string => {
  const toHex = (n: number) => {
    const hex = Math.round(n).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

// Calculate relative luminance
export const getRelativeLuminance = (r: number, g: number, b: number): number => {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * (rs ?? 0) + 0.7152 * (gs ?? 0) + 0.0722 * (bs ?? 0);
};

// Calculate contrast ratio between two colors
export const getContrastRatio = (color1: string, color2: string): number => {
  const [r1, g1, b1] = hexToRgb(color1);
  const [r2, g2, b2] = hexToRgb(color2);

  const l1 = getRelativeLuminance(r1, g1, b1);
  const l2 = getRelativeLuminance(r2, g2, b2);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
};

// Check if contrast ratio meets WCAG requirements
export const checkContrastCompliance = (color1: string, color2: string): ColorContrast => {
  const ratio = getContrastRatio(color1, color2);

  return {
    ratio,
    passes: {
      AA: ratio >= WCAG_THRESHOLDS.AA,
      AALarge: ratio >= WCAG_THRESHOLDS.AALarge,
      AAA: ratio >= WCAG_THRESHOLDS.AAA,
      AAALarge: ratio >= WCAG_THRESHOLDS.AAALarge,
    },
  };
};

// Find accessible text color for a background
export const findAccessibleTextColor = (
  backgroundColor: string,
  targetRatio: number = WCAG_THRESHOLDS.AA,
): string => {
  const [r, g, b] = hexToRgb(backgroundColor);
  const bgLuminance = getRelativeLuminance(r, g, b);

  // If background is dark, use light text; if light, use dark text
  const isDark = bgLuminance < 0.5;

  // Start with white or black
  let textColor = isDark ? '#FFFFFF' : '#000000';
  let currentRatio = getContrastRatio(backgroundColor, textColor);

  // If we already meet the target ratio, return the color
  if (currentRatio >= targetRatio) {
    return textColor;
  }

  // Adjust the color to meet the target ratio
  const adjustColor = (color: string, factor: number): string => {
    const [r, g, b] = hexToRgb(color);
    const newR = Math.max(0, Math.min(255, r * factor));
    const newG = Math.max(0, Math.min(255, g * factor));
    const newB = Math.max(0, Math.min(255, b * factor));
    return rgbToHex(newR, newG, newB);
  };

  // Binary search for the right color
  let minFactor = 0;
  let maxFactor = isDark ? 2 : 0.5;

  for (let i = 0; i < 10; i++) {
    const factor = (minFactor + maxFactor) / 2;
    const testColor = adjustColor(textColor, factor);
    const testRatio = getContrastRatio(backgroundColor, testColor);

    if (testRatio >= targetRatio) {
      textColor = testColor;
      maxFactor = factor;
    } else {
      minFactor = factor;
    }
  }

  return textColor;
};

// Generate accessible color palette (basic version)
export const generateBasicAccessiblePalette = (
  baseColor: string,
  variants: number = 9,
): string[] => {
  const [r, g, b] = hexToRgb(baseColor);
  const palette: string[] = [];

  for (let i = 0; i < variants; i++) {
    const factor = 1 - (i / (variants - 1)) * 0.8; // 0.2 to 1.0
    const newR = Math.max(0, Math.min(255, r * factor));
    const newG = Math.max(0, Math.min(255, g * factor));
    const newB = Math.max(0, Math.min(255, b * factor));
    palette.push(rgbToHex(newR, newG, newB));
  }

  return palette;
};

// Validate color accessibility for a component
export const validateComponentColors = (
  background: string,
  text: string,
  border?: string,
  accent?: string,
): {
  isValid: boolean;
  issues: string[];
  suggestions: Record<string, string>;
} => {
  const issues: string[] = [];
  const suggestions: Record<string, string> = {};

  // Check text contrast
  const textContrast = checkContrastCompliance(background, text);
  if (!textContrast.passes.AA) {
    issues.push(
      `Text contrast ratio ${textContrast.ratio.toFixed(2)} is below WCAG AA standard (4.5)`,
    );
    suggestions['text'] = findAccessibleTextColor(background, WCAG_THRESHOLDS.AA);
  }

  // Check border contrast if provided
  if (border) {
    const borderContrast = checkContrastCompliance(background, border);
    if (!borderContrast.passes.AA) {
      issues.push(
        `Border contrast ratio ${borderContrast.ratio.toFixed(2)} is below WCAG AA standard (4.5)`,
      );
      suggestions['border'] = findAccessibleTextColor(background, WCAG_THRESHOLDS.AA);
    }
  }

  // Check accent contrast if provided
  if (accent) {
    const accentContrast = checkContrastCompliance(background, accent);
    if (!accentContrast.passes.AA) {
      issues.push(
        `Accent contrast ratio ${accentContrast.ratio.toFixed(2)} is below WCAG AA standard (4.5)`,
      );
      suggestions['accent'] = findAccessibleTextColor(background, WCAG_THRESHOLDS.AA);
    }
  }

  return {
    isValid: issues.length === 0,
    issues,
    suggestions,
  };
};

// Generate accessible theme colors
export const generateAccessibleTheme = (primaryColor: string) => {
  const [r, g, b] = hexToRgb(primaryColor);
  const luminance = getRelativeLuminance(r, g, b);

  // Generate background colors
  const backgrounds = {
    primary: primaryColor,
    secondary: rgbToHex(r * 0.9, g * 0.9, b * 0.9),
    tertiary: rgbToHex(r * 0.8, g * 0.8, b * 0.8),
    surface: luminance > 0.5 ? '#FFFFFF' : '#1A1A1A',
    background: luminance > 0.5 ? '#F8F9FA' : '#0A0A0A',
  };

  // Generate text colors
  const texts = {
    primary: findAccessibleTextColor(backgrounds.primary, WCAG_THRESHOLDS.AA),
    secondary: findAccessibleTextColor(backgrounds.secondary, WCAG_THRESHOLDS.AA),
    tertiary: findAccessibleTextColor(backgrounds.tertiary, WCAG_THRESHOLDS.AA),
    onSurface: findAccessibleTextColor(backgrounds.surface, WCAG_THRESHOLDS.AA),
    onBackground: findAccessibleTextColor(backgrounds.background, WCAG_THRESHOLDS.AA),
  };

  // Generate semantic colors
  const semantic = {
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
  };

  return {
    backgrounds,
    texts,
    semantic,
    primary: primaryColor,
  };
};

// Color blindness simulation
export const simulateColorBlindness = (
  color: string,
  type: 'protanopia' | 'deuteranopia' | 'tritanopia',
): string => {
  const [r, g, b] = hexToRgb(color);

  // Color blindness transformation matrices
  const matrices = {
    protanopia: [
      [0.567, 0.433, 0],
      [0.558, 0.442, 0],
      [0, 0.242, 0.758],
    ],
    deuteranopia: [
      [0.625, 0.375, 0],
      [0.7, 0.3, 0],
      [0, 0.3, 0.7],
    ],
    tritanopia: [
      [0.95, 0.05, 0],
      [0, 0.433, 0.567],
      [0, 0.475, 0.525],
    ],
  };

  const matrix = matrices[type]!;
  const newR = r * matrix[0]![0]! + g * matrix[0]![1]! + b * matrix[0]![2]!;
  const newG = r * matrix[1]![0]! + g * matrix[1]![1]! + b * matrix[1]![2]!;
  const newB = r * matrix[2]![0]! + g * matrix[2]![1]! + b * matrix[2]![2]!;

  return rgbToHex(
    Math.max(0, Math.min(255, newR)),
    Math.max(0, Math.min(255, newG)),
    Math.max(0, Math.min(255, newB)),
  );
};

// Check if colors are distinguishable for color blind users
export const checkColorBlindnessAccessibility = (
  colors: string[],
): {
  isAccessible: boolean;
  issues: string[];
  suggestions: string[];
} => {
  const issues: string[] = [];
  const suggestions: string[] = [];

  // Check each pair of colors
  for (let i = 0; i < colors.length; i++) {
    for (let j = i + 1; j < colors.length; j++) {
      const color1 = colors[i];
      const color2 = colors[j];

      // Check for all types of color blindness
      const types: Array<'protanopia' | 'deuteranopia' | 'tritanopia'> = [
        'protanopia',
        'deuteranopia',
        'tritanopia',
      ];

      for (const type of types) {
        const sim1 = simulateColorBlindness(color1!, type);
        const sim2 = simulateColorBlindness(color2!, type);
        const contrast = getContrastRatio(sim1, sim2);

        if (contrast < 2.0) {
          issues.push(
            `Colors ${color1} and ${color2} are not distinguishable for ${type} users (contrast: ${contrast.toFixed(2)})`,
          );
          suggestions.push(
            `Consider using colors with higher contrast or adding patterns/icons to distinguish between ${color1} and ${color2}`,
          );
        }
      }
    }
  }

  return {
    isAccessible: issues.length === 0,
    issues,
    suggestions,
  };
};

// Generate high contrast theme
export const generateHighContrastTheme = (baseColor: string) => {
  const [r, g, b] = hexToRgb(baseColor);
  const luminance = getRelativeLuminance(r, g, b);

  // High contrast colors
  const highContrast = {
    background: luminance > 0.5 ? '#000000' : '#FFFFFF',
    surface: luminance > 0.5 ? '#1A1A1A' : '#F0F0F0',
    text: luminance > 0.5 ? '#FFFFFF' : '#000000',
    primary: luminance > 0.5 ? '#FFFF00' : '#0000FF', // Yellow or Blue for high contrast
    border: luminance > 0.5 ? '#FFFFFF' : '#000000',
  };

  return highContrast;
};

// Color utility functions
export const lighten = (color: string, amount: number): string => {
  const [r, g, b] = hexToRgb(color);
  const factor = 1 + amount;

  return rgbToHex(
    Math.max(0, Math.min(255, r * factor)),
    Math.max(0, Math.min(255, g * factor)),
    Math.max(0, Math.min(255, b * factor)),
  );
};

export const darken = (color: string, amount: number): string => {
  const [r, g, b] = hexToRgb(color);
  const factor = 1 - amount;

  return rgbToHex(
    Math.max(0, Math.min(255, r * factor)),
    Math.max(0, Math.min(255, g * factor)),
    Math.max(0, Math.min(255, b * factor)),
  );
};

export const saturate = (color: string, amount: number): string => {
  const [r, g, b] = hexToRgb(color);

  // Convert to HSL, adjust saturation, convert back
  // Simplified version - in practice, you'd use a proper HSL conversion
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  const saturation = delta / max;

  const newSaturation = Math.max(0, Math.min(1, saturation * (1 + amount)));
  const newDelta = max * newSaturation;

  const mid = (max + min) / 2;
  const newR = mid + (newDelta * (r - mid)) / delta;
  const newG = mid + (newDelta * (g - mid)) / delta;
  const newB = mid + (newDelta * (b - mid)) / delta;

  return rgbToHex(
    Math.max(0, Math.min(255, newR)),
    Math.max(0, Math.min(255, newG)),
    Math.max(0, Math.min(255, newB)),
  );
};

// Accessibility-focused color palette generator
export const generateAccessiblePalette = (
  baseColor: string,
  options: {
    variants?: number;
    ensureContrast?: boolean;
    targetRatio?: number;
    includeSemantic?: boolean;
  } = {},
) => {
  const {
    variants = 9,
    ensureContrast = true,
    targetRatio = WCAG_THRESHOLDS.AA,
    includeSemantic = true,
  } = options;

  const palette = generateBasicAccessiblePalette(baseColor, variants);

  if (ensureContrast) {
    // Ensure all colors meet contrast requirements
    const validatedPalette = palette.map((color) => {
      const contrast = checkContrastCompliance('#FFFFFF', color);
      if (!contrast.passes.AA) {
        return findAccessibleTextColor('#FFFFFF', targetRatio);
      }
      return color;
    });

    return validatedPalette;
  }

  if (includeSemantic) {
    return {
      ...palette,
      semantic: {
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#3B82F6',
      },
    };
  }

  return palette;
};

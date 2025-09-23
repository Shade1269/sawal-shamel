function normalizeHex(color) {
  if (!color) {
    return null;
  }

  const hex = color.trim().replace(/^#/, '');
  if (hex.length === 3) {
    return hex
      .split('')
      .map((char) => char + char)
      .join('');
  }

  if (hex.length === 6) {
    return hex;
  }

  return null;
}

function hexToRgb(color) {
  const normalized = normalizeHex(color);
  if (!normalized) {
    return null;
  }

  const value = parseInt(normalized, 16);
  const r = (value >> 16) & 0xff;
  const g = (value >> 8) & 0xff;
  const b = value & 0xff;
  return [r, g, b];
}

function relativeLuminance(color) {
  const rgb = hexToRgb(color);
  if (!rgb) {
    return null;
  }

  const [r, g, b] = rgb.map((component) => {
    const channel = component / 255;
    return channel <= 0.03928 ? channel / 12.92 : Math.pow((channel + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function getContrastRatio(foreground, background) {
  const fgLum = relativeLuminance(foreground);
  const bgLum = relativeLuminance(background);

  if (fgLum == null || bgLum == null) {
    return Number.NaN;
  }

  const lighter = Math.max(fgLum, bgLum);
  const darker = Math.min(fgLum, bgLum);

  return (lighter + 0.05) / (darker + 0.05);
}

export const addColorOpacity = (color: string, opacity: number): string => {
  if (!color || typeof color !== "string") return color;
  const hex = color.trim();

  // #RGB ili #RRGGBB ili #RRGGBBAA
  const hexRegex = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;
  if (!hexRegex.test(hex)) return color;

  // Ako već ima alpha (#RRGGBBAA)
  if (hex.length === 9) return color;

  // Proširi #RGB u #RRGGBB
  const normalizedHex =
    hex.length === 4 ? `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}` : hex;

  const alpha = Math.round(Math.min(Math.max(opacity, 0), 1) * 255)
    .toString(16)
    .padStart(2, "0");

  return normalizedHex + alpha;
};

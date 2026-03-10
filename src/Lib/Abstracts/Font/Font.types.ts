export const FONT_SIZE_KEYS = ["s", "m", "l", "xl"] as const;
export type FontSizeKey = (typeof FONT_SIZE_KEYS)[number];
export type FontSizeDefs = { fontSize: number; lineHeight: number };
export const FONT_FAMILY_KEYS = ["primary", "secondary"] as const;
export type FontFamilyKey = (typeof FONT_FAMILY_KEYS)[number];

export const SPACING_KEYS = ["half", "full", "double", "quad", "octa"] as const;
export type SpacingKey = (typeof SPACING_KEYS)[number];

export type SpacingRect = {
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
};

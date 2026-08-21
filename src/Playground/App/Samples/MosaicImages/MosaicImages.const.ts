import type { Size2d } from "@thewaver/ss-utils";

import type { MosaicImageSource } from "../../../../Lib/Exotics/Mosaic/Mosaic.types";

const SHAPES: Size2d[] = [
    { width: 1600, height: 900 },
    { width: 900, height: 1600 },
    { width: 1200, height: 1200 },
    { width: 1500, height: 1000 },
    { width: 1000, height: 1500 },
    { width: 2000, height: 800 },
    { width: 800, height: 1000 },
    { width: 1400, height: 1050 },
    { width: 1050, height: 1400 },
    { width: 1800, height: 750 },
    { width: 960, height: 960 },
    { width: 1100, height: 1650 },
];

const HUE_STEP = 37;
const HUE_ORIGIN = 190;
const SATURATION_PERCENT = 55;
const LIGHTNESS_PERCENT = 48;
const LABEL_SIZE_RATIO = 3;

const toSvg = (shape: Size2d, hue: number, label: string) =>
    [
        `<svg xmlns="http://www.w3.org/2000/svg" width="${shape.width}" height="${shape.height}">`,
        `<rect width="${shape.width}" height="${shape.height}" fill="hsl(${hue} ${SATURATION_PERCENT}% ${LIGHTNESS_PERCENT}%)"/>`,
        `<text x="50%" y="50%" fill="white" font-family="sans-serif" text-anchor="middle" dominant-baseline="central"`,
        ` font-size="${Math.min(shape.width, shape.height) / LABEL_SIZE_RATIO}">${label}</text>`,
        `</svg>`,
    ].join("");

const toSource = (shape: Size2d, index: number): MosaicImageSource => ({
    src: `data:image/svg+xml,${encodeURIComponent(toSvg(shape, HUE_ORIGIN + index * HUE_STEP, `${index + 1}`))}`,
    alt: `Sample ${index + 1}, ${shape.width} by ${shape.height}`,
});

export namespace MosaicImages {
    export const SAMPLE_SOURCES: MosaicImageSource[] = SHAPES.map(toSource);

    export const SAMPLE_SHAPES = {
        square: { width: 1, height: 1 },
        landscape: { width: 16, height: 9 },
        portrait: { width: 9, height: 16 },
        panorama: { width: 3, height: 1 },
    } satisfies Record<string, Size2d>;

    export type SampleShapeKey = keyof typeof SAMPLE_SHAPES;

    export const SAMPLE_SHAPE_KEYS = Object.keys(SAMPLE_SHAPES) as SampleShapeKey[];
}

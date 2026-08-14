import type { CellAnimationFn } from "../CellAnimationKeyframes.types";
import { CellAnimationKeyframeUtils } from "../CellAnimationKeyframes.utils";

export const swarmCcw: CellAnimationFn = CellAnimationKeyframeUtils.fromStops([
    { at: 0, translateX: 200, translateY: 200, scaleX: 0, scaleY: 0, rotate: 360 },
    { at: 0.1, translateX: 200, translateY: -200, scaleX: 5, scaleY: 5, rotate: 360 },
    { at: 0.2, translateX: -200, translateY: -200, scaleX: 10, scaleY: 10, rotate: 320 },
    { at: 0.3, translateX: -200, translateY: 200, scaleX: 15, scaleY: 15, rotate: 280 },
    { at: 0.4, translateX: 100, translateY: 200, scaleX: 20, scaleY: 20, rotate: 240 },
    { at: 0.5, translateX: 100, translateY: -100, scaleX: 25, scaleY: 25, rotate: 200 },
    { at: 0.6, translateX: -100, translateY: -100, scaleX: 35, scaleY: 35, rotate: 160 },
    { at: 0.7, translateX: -100, translateY: 100, scaleX: 45, scaleY: 45, rotate: 120 },
    { at: 0.8, translateX: 0, translateY: 100, scaleX: 60, scaleY: 60, rotate: 80 },
    { at: 0.9, translateX: 0, translateY: 0, scaleX: 80, scaleY: 80, rotate: 40 },
    { at: 1, translateX: 0, translateY: 0, scaleX: 100, scaleY: 100, rotate: 0 },
]);

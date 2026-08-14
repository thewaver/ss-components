import { CellAnimationZones } from "../../CellAnimationZones/CellAnimationZones.const";
import type { CellAnimationFn } from "../CellAnimationKeyframes.types";

export const quadrantScatter: CellAnimationFn = (timeline, defs) => {
    const offset = (1 - timeline) * 200;
    const scale = 20 + timeline * 80;

    return {
        translateX: CellAnimationZones.isInZone("right", defs)
            ? offset
            : CellAnimationZones.isInZone("left", defs)
              ? -offset
              : 0,
        translateY: CellAnimationZones.isInZone("bottom", defs)
            ? offset
            : CellAnimationZones.isInZone("top", defs)
              ? -offset
              : 0,
        scaleX: scale,
        scaleY: scale,
        opacity: timeline * 100,
    };
};

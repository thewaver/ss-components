import type { CellAnimationFn } from "../CellAnimationKeyframes.types";
import { CellAnimationKeyframeUtils } from "../CellAnimationKeyframes.utils";
import { carouselBottom } from "./carouselBottom";
import { carouselLeft } from "./carouselLeft";
import { carouselRight } from "./carouselRight";
import { carouselTop } from "./carouselTop";
import { zoomIn } from "./zoomIn";

export const _carouselQuadrant: CellAnimationFn = CellAnimationKeyframeUtils._fromZones(
    [
        { zone: "top", animation: carouselTop },
        { zone: "bottom", animation: carouselBottom },
        { zone: "left", animation: carouselLeft },
        { zone: "right", animation: carouselRight },
    ],
    zoomIn,
);

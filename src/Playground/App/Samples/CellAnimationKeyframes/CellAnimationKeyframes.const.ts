import type { Point2d } from "@thewaver/ss-utils";

import type {
    CellAnimationEvaluationDefs,
    CellAnimationEvaluationResult,
} from "../../../../Lib/Exotics/CellAnimation/CellAnimation.types";
import { CellAnimationBreakpoints } from "../CellAnimationBreakpoints/CellAnimationBreakpoints.const";
import type { CellAnimationFn } from "./CellAnimationKeyframes.types";
import { _carouselQuadrant } from "./Samples/_carouselQuadrant";
import { _cubeBottom } from "./Samples/_cubeBottom";
import { _cubeLeft } from "./Samples/_cubeLeft";
import { _cubeRight } from "./Samples/_cubeRight";
import { _cubeTop } from "./Samples/_cubeTop";
import { _developDefault } from "./Samples/_developDefault";
import { _elasticQuadrant } from "./Samples/_elasticQuadrant";
import { _flipHorizontal } from "./Samples/_flipHorizontal";
import { _flipVertical } from "./Samples/_flipVertical";
import { _hingeQuadrant } from "./Samples/_hingeQuadrant";
import { _invertFlash } from "./Samples/_invertFlash";
import { _popQuadrant } from "./Samples/_popQuadrant";
import { _pullQuadrant } from "./Samples/_pullQuadrant";
import { _rollQuadrant } from "./Samples/_rollQuadrant";
import { _stampDefault } from "./Samples/_stampDefault";
import { _swingDefault } from "./Samples/_swingDefault";
import { blurDefault } from "./Samples/blurDefault";
import { bounceDefault } from "./Samples/bounceDefault";
import { carouselBottom } from "./Samples/carouselBottom";
import { carouselLeft } from "./Samples/carouselLeft";
import { carouselRight } from "./Samples/carouselRight";
import { carouselTop } from "./Samples/carouselTop";
import { dripDefault } from "./Samples/dripDefault";
import { elasticDown } from "./Samples/elasticDown";
import { elasticLeft } from "./Samples/elasticLeft";
import { elasticRight } from "./Samples/elasticRight";
import { elasticUp } from "./Samples/elasticUp";
import { encircleCcw } from "./Samples/encircleCcw";
import { encircleCw } from "./Samples/encircleCw";
import { fadeInFlash } from "./Samples/fadeInFlash";
import { fadeInFlicker } from "./Samples/fadeInFlicker";
import { fadeInLinear } from "./Samples/fadeInLinear";
import { hingeBottom } from "./Samples/hingeBottom";
import { hingeLeft } from "./Samples/hingeLeft";
import { hingeRight } from "./Samples/hingeRight";
import { hingeTop } from "./Samples/hingeTop";
import { hopLeft } from "./Samples/hopLeft";
import { hopRight } from "./Samples/hopRight";
import { popBottomLeft } from "./Samples/popBottomLeft";
import { popBottomRight } from "./Samples/popBottomRight";
import { popCenter } from "./Samples/popCenter";
import { popTopLeft } from "./Samples/popTopLeft";
import { popTopRight } from "./Samples/popTopRight";
import { pullDown } from "./Samples/pullDown";
import { pullHorizontal } from "./Samples/pullHorizontal";
import { pullLeft } from "./Samples/pullLeft";
import { pullRight } from "./Samples/pullRight";
import { pullUp } from "./Samples/pullUp";
import { pullVertical } from "./Samples/pullVertical";
import { quadrantScatter } from "./Samples/quadrantScatter";
import { rollDownLeft } from "./Samples/rollDownLeft";
import { rollDownRight } from "./Samples/rollDownRight";
import { rollUpLeft } from "./Samples/rollUpLeft";
import { rollUpRight } from "./Samples/rollUpRight";
import { shakeDown } from "./Samples/shakeDown";
import { shootUp } from "./Samples/shootUp";
import { skewCcw } from "./Samples/skewCcw";
import { skewCw } from "./Samples/skewCw";
import { spinDownCcw } from "./Samples/spinDownCcw";
import { spinDownCw } from "./Samples/spinDownCw";
import { spinUpCcw } from "./Samples/spinUpCcw";
import { spinUpCw } from "./Samples/spinUpCw";
import { swarmCcw } from "./Samples/swarmCcw";
import { swarmCw } from "./Samples/swarmCw";
import { tumbleLeft } from "./Samples/tumbleLeft";
import { tumbleRight } from "./Samples/tumbleRight";
import { zoomIn } from "./Samples/zoomIn";
import { zoomOut } from "./Samples/zoomOut";

export namespace CellAnimationKeyframes {
    export const ANIMATION_TYPES = [
        "blurDefault",
        "bounceDefault",
        "carouselBottom",
        "carouselLeft",
        "carouselRight",
        "carouselTop",
        "dripDefault",
        "elasticDown",
        "elasticLeft",
        "elasticRight",
        "elasticUp",
        "encircleCcw",
        "encircleCw",
        "fadeInFlash",
        "fadeInFlicker",
        "fadeInLinear",
        "hingeBottom",
        "hingeLeft",
        "hingeRight",
        "hingeTop",
        "hopLeft",
        "hopRight",
        "popBottomLeft",
        "popBottomRight",
        "popCenter",
        "popTopLeft",
        "popTopRight",
        "pullDown",
        "pullHorizontal",
        "pullLeft",
        "pullRight",
        "pullUp",
        "pullVertical",
        "quadrantScatter",
        "rollDownLeft",
        "rollDownRight",
        "rollUpLeft",
        "rollUpRight",
        "shakeDown",
        "shootUp",
        "skewCcw",
        "skewCw",
        "spinDownCcw",
        "spinDownCw",
        "spinUpCcw",
        "spinUpCw",
        "swarmCcw",
        "swarmCw",
        "tumbleLeft",
        "tumbleRight",
        "zoomIn",
        "zoomOut",
        "_developDefault",
        "_invertFlash",
        "_flipHorizontal",
        "_flipVertical",
        "_cubeLeft",
        "_cubeRight",
        "_cubeTop",
        "_cubeBottom",
        "_swingDefault",
        "_stampDefault",
        "_carouselQuadrant",
        "_hingeQuadrant",
        "_elasticQuadrant",
        "_pullQuadrant",
        "_popQuadrant",
        "_rollQuadrant",
    ] as const;
    export type AnimationType = (typeof ANIMATION_TYPES)[number];

    const animationRegistry: Record<AnimationType, CellAnimationFn> = {
        blurDefault,
        bounceDefault,
        carouselBottom,
        carouselLeft,
        carouselRight,
        carouselTop,
        dripDefault,
        elasticDown,
        elasticLeft,
        elasticRight,
        elasticUp,
        encircleCcw,
        encircleCw,
        fadeInFlash,
        fadeInFlicker,
        fadeInLinear,
        hingeBottom,
        hingeLeft,
        hingeRight,
        hingeTop,
        hopLeft,
        hopRight,
        popBottomLeft,
        popBottomRight,
        popCenter,
        popTopLeft,
        popTopRight,
        pullDown,
        pullHorizontal,
        pullLeft,
        pullRight,
        pullUp,
        pullVertical,
        quadrantScatter,
        rollDownLeft,
        rollDownRight,
        rollUpLeft,
        rollUpRight,
        shakeDown,
        shootUp,
        skewCcw,
        skewCw,
        spinDownCcw,
        spinDownCw,
        spinUpCcw,
        spinUpCw,
        swarmCcw,
        swarmCw,
        tumbleLeft,
        tumbleRight,
        zoomIn,
        zoomOut,
        _developDefault,
        _invertFlash,
        _flipHorizontal,
        _flipVertical,
        _cubeLeft,
        _cubeRight,
        _cubeTop,
        _cubeBottom,
        _swingDefault,
        _stampDefault,
        _carouselQuadrant,
        _hingeQuadrant,
        _elasticQuadrant,
        _pullQuadrant,
        _popQuadrant,
        _rollQuadrant,
    };

    export const computeAnimation = (
        type: AnimationType,
        breakpoints: CellAnimationBreakpoints.BreakpointTupleTriple,
        defs: CellAnimationEvaluationDefs & { origin: Point2d },
        timeline: number,
        easing?: CellAnimationBreakpoints.Easing,
    ): CellAnimationEvaluationResult =>
        animationRegistry[type](CellAnimationBreakpoints.computeLocalTimeline(breakpoints, timeline, easing), defs);
}

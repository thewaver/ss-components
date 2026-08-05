import { AnimNames } from "../lib/animation-utils";
import { OriginFunc } from "../lib/origin-func";
import { WeightFunc } from "../lib/weight-func";

export const DEFAULTS = {
  ANIMATION: {
    NAME: AnimNames.ZoomIn.Default,
    DURATION: 500,
    DELAY: 15,
    END_KEYFRAME: 500 + 15 * 100,
    TIMING_FUNCTION: "linear",
  },
  PATTERN: {
    CELL_COUNT: {
      ROWS: 7,
      COLS: 7,
    },
    WEIGHT_FUNC: WeightFunc.Random.Default,
    ORIGIN_FUNC: OriginFunc.Center,
  },
};

export const LABELS = {
  TUTORIAL: "overview",
  API_DOCS: "API docs",
  WIZARD: "builder",
  GALLERY: "gallery",
  GET_CODE: "get code",
};

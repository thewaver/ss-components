import type { JSX } from "solid-js/h/jsx-runtime";

import { CssStyleConst } from "@thewaver/ss-utils";

export type TextMetricValue = 0 | (string & {});
export type TextMetricKey = (typeof CssStyleConst.CSS_KEYS_USED_TO_MEASURE_TEXT)[number];
export type TextMetricsStyle = Pick<JSX.CSSProperties, TextMetricKey>;
export type TextNonMetricStyle = Omit<JSX.CSSProperties, TextMetricKey>;

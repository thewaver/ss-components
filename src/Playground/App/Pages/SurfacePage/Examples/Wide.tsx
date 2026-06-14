import { createUniqueId } from "solid-js";

import { CSSUtils } from "../../../../../Lib/Abstracts/CSS/CSS.utils";
import { Surface } from "../../../../../Lib/Fundamentals/Surface/Surface";
import type { AccessorProps } from "../../../../../Lib/Utils/typeUtils";
import type { SurfaceExampleProps } from "../SurfacePage.types";

import * as styles from "../SurfacePage.css";

type Props = SurfaceExampleProps &
    AccessorProps<{
        borderRadius: number;
        borderWidth: number;
    }>;

export const WideExample = (props: Props) => {
    const strokeId = createUniqueId();
    const fillId = createUniqueId();

    return (
        <Surface
            getBorderRadii={() => CSSUtils.spreadRadius(props.getBorderRadius())}
            getBorderWidths={() => CSSUtils.spreadWidth(props.getBorderWidth())}
            getPaddings={() => CSSUtils.spreadPadding(20)}
            getStrokeDefs={(getSize, getBorderWidths, getBorderRadii, getState) =>
                props.getStrokeConfig().getColorDefs(strokeId, getState, {
                    getSize,
                    getBorderWidths,
                    getBorderRadii,
                    getAnimationDurationMs: props.getAnimationDurationMs,
                    getColors: props.getColors,
                    getShouldApplyBlur: props.getShouldApplyBlur,
                })
            }
            getFillDefs={(getSize, getBorderRadii, getState) =>
                props.getFillConfig().getColorDefs(fillId, getState, {
                    getSize,
                    getBorderRadii,
                    getAnimationDurationMs: props.getAnimationDurationMs,
                    getColors: props.getColors,
                    getShouldApplyBlur: props.getShouldApplyBlur,
                })
            }
            renderChildren={(outer, inner) => (
                <div class={[styles.borderedContentWide, props.getShouldPadChildren?.() ? inner : outer].join(" ")}>
                    I have a border
                </div>
            )}
        />
    );
};

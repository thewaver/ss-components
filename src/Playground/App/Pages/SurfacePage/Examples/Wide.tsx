import { createUniqueId } from "solid-js";

import { CSSUtils } from "../../../../../Lib/Abstracts/CSS/CSS.utils";
import { Surface } from "../../../../../Lib/Fundamentals/Surface/Surface";
import type { SurfaceExampleProps } from "../SurfacePage.types";

import * as styles from "../SurfacePage.css";

type Props = SurfaceExampleProps;

export const WideExample = (props: Props) => {
    const strokeId = createUniqueId();

    return (
        <Surface
            getBorderRadii={() => CSSUtils.spreadRadius(props.getBorderRadius())}
            getBorderWidths={() => CSSUtils.spreadWidth(props.getBorderWidth())}
            getPaddings={() => CSSUtils.spreadPadding(20)}
            getStrokeDefs={(getSize, getBorderWidths, getBorderRadii, getState) =>
                props.getStrokeConfig().getSVGDefs(strokeId, getState, {
                    getSize,
                    getBorderWidths,
                    getBorderRadii,
                    getAnimationDurationMs: props.getAnimationDurationMs,
                    getColors: props.getColors,
                    getBlurWidth: props.getBlurWidth,
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

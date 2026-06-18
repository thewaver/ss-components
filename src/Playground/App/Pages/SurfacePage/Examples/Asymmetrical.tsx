import { createUniqueId } from "solid-js";

import { CSSUtils } from "../../../../../Lib/Abstracts/CSS/CSS.utils";
import { Surface } from "../../../../../Lib/Fundamentals/Surface/Surface";
import type { SurfaceExampleProps } from "../SurfacePage.types";

import * as styles from "../SurfacePage.css";

type Props = SurfaceExampleProps;

export const AsymmetricalExample = (props: Props) => {
    const strokeId = createUniqueId();

    return (
        <Surface
            getBorderRadii={() => ({
                borderBottomLeftRadius: props.getBorderRadius() * 2,
                borderBottomRightRadius: props.getBorderRadius(),
                borderTopLeftRadius: props.getBorderRadius(),
                borderTopRightRadius: props.getBorderRadius() * 2,
            })}
            getBorderWidths={() => ({
                borderTopWidth: props.getBorderWidth(),
                borderRightWidth: props.getBorderWidth() * 2,
                borderBottomWidth: props.getBorderWidth() * 2,
                borderLeftWidth: props.getBorderWidth(),
            })}
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
                <div class={[styles.borderedContent, props.getShouldPadChildren?.() ? inner : outer].join(" ")}>
                    I have a border
                </div>
            )}
        />
    );
};

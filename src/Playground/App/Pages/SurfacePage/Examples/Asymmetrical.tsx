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

export const AsymmetricalExample = (props: Props) => {
    const strokeId = createUniqueId();
    const fillId = createUniqueId();

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
                <div class={[styles.borderedContent, props.getShouldPadChildren?.() ? inner : outer].join(" ")}>
                    I have a border
                </div>
            )}
        />
    );
};

import { createUniqueId } from "solid-js";

import { CSSUtils } from "../../../../../Lib/Abstracts/CSS/CSS.utils";
import { Surface } from "../../../../../Lib/Elements/Surface/Surface";
import type { SurfaceExampleProps } from "../SurfacePage.types";

import * as styles from "../SurfacePage.css";

type Props = SurfaceExampleProps;

export const WideExample = (props: Props) => {
    const strokeId = createUniqueId();

    return (
        <Surface
            getBorderRadii={() => CSSUtils.spreadRadius(props.getBorderRadius())}
            getBorderWidths={() => CSSUtils.spreadWidth(props.getBorderWidth())}
            getLameExponents={() => CSSUtils.spreadCornerShape(props.getLameExponent())}
            getStrokeDefs={(getSize) =>
                props.getStrokeConfig().getSVGDefs(strokeId, undefined, {
                    getSize,
                    getAnimationDurationMs: props.getAnimationDurationMs,
                    getColors: props.getColors,
                    getBlurWidth: props.getBlurWidth,
                })
            }
            renderChildren={(_, getClipPath) => (
                <div
                    class={styles.borderedContentWide}
                    style={props.getShouldClipChildren?.() ? { "clip-path": `path("${getClipPath()}")` } : {}}
                >
                    I have a border
                </div>
            )}
        />
    );
};

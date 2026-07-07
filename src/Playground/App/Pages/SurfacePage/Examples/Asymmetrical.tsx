import { createUniqueId } from "solid-js";

import { Surface } from "../../../../../Lib/Elements/Surface/Surface";
import type { SurfaceExampleProps } from "../SurfacePage.types";

import * as styles from "../SurfacePage.css";

type Props = SurfaceExampleProps;

export const AsymmetricalExample = (props: Props) => {
    const strokeId = createUniqueId();

    return (
        <Surface
            getBorderRadii={() => ({
                borderBottomLeftRadius: props.getBorderRadius() * 2,
                borderBottomRightRadius: props.getBorderRadius() * 4,
                borderTopLeftRadius: props.getBorderRadius(),
                borderTopRightRadius: props.getBorderRadius() * 2,
            })}
            getBorderWidths={() => ({
                borderTopWidth: props.getBorderWidth(),
                borderRightWidth: props.getBorderWidth() * 2,
                borderBottomWidth: props.getBorderWidth() * 2,
                borderLeftWidth: props.getBorderWidth(),
            })}
            getLameExponents={() => ({
                cornerBottomLeftShape: props.getLameExponent() * -1,
                cornerBottomRightShape: props.getLameExponent(),
                cornerTopLeftShape: props.getLameExponent(),
                cornerTopRightShape: props.getLameExponent() * -1,
            })}
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
                    class={styles.borderedContent}
                    style={props.getShouldClipChildren?.() ? { "clip-path": `path("${getClipPath()}")` } : {}}
                >
                    I have a border
                </div>
            )}
        />
    );
};

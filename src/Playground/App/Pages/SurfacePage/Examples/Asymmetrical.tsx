import { createUniqueId } from "solid-js";

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
            getStrokeDefs={(getSize, getBorderWidths, getBorderRadii) =>
                props.getStrokeConfig().getColorDefs(strokeId, {
                    getSize,
                    getBorderWidths,
                    getBorderRadii,
                    getAnimationDurationMs: props.getAnimationDurationMs,
                    getColors: props.getColors,
                    getShouldApplyBlur: props.getShouldApplyBlur,
                })
            }
            getFillDefs={(getSize, getBorderRadii) =>
                props.getFillConfig().getColorDefs(fillId, {
                    getSize,
                    getBorderRadii,
                    getAnimationDurationMs: props.getAnimationDurationMs,
                    getColors: props.getColors,
                })
            }
            getShouldPadChildren={props.getShouldPadChildren}
        >
            <div class={styles.borderedContent}>I have a border</div>
        </Surface>
    );
};

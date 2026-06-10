import { createUniqueId } from "solid-js";

import { Surface } from "../../../../../Lib/Fundamentals/Surface/Surface";
import { SurfaceUtils } from "../../../../../Lib/Fundamentals/Surface/Surface.utils";
import type { AccessorProps } from "../../../../../Lib/Utils/typeUtils";
import type { SurfaceExampleProps } from "../SurfacePage.types";

import * as styles from "../SurfacePage.css";

type Props = SurfaceExampleProps &
    AccessorProps<{
        borderRadius: number;
        borderWidth: number;
    }>;

export const SymmetricalExample = (props: Props) => {
    const strokeId = createUniqueId();
    const fillId = createUniqueId();

    return (
        <Surface
            getBorderRadii={() => SurfaceUtils.spreadRadius(props.getBorderRadius())}
            getBorderWidths={() => SurfaceUtils.spreadWidth(props.getBorderWidth())}
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

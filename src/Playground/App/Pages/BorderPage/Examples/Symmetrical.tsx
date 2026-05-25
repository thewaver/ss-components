import { createUniqueId } from "solid-js";

import { Border } from "../../../../../Lib/Fundamentals/Border/Border";
import { BorderUtils } from "../../../../../Lib/Fundamentals/Border/Border.utils";
import type { AccessorProps } from "../../../../../Lib/Utils/typeUtils";
import type { BorderExampleProps } from "../BorderPage.types";

import * as styles from "../BorderPage.css";

type Props = BorderExampleProps &
    AccessorProps<{
        borderRadius: number;
        borderWidth: number;
    }>;

export const SymmetricalExample = (props: Props) => {
    const id = createUniqueId();

    return (
        <Border
            getBorderRadii={() => BorderUtils.spreadRadius(props.getBorderRadius())}
            getBorderWidths={() => BorderUtils.spreadWidth(props.getBorderWidth())}
            getFillDefs={(getSize, getBorderWidths, getBorderRadii) =>
                props.getConfig().getFillDefs(id, {
                    getSize,
                    getBorderWidths,
                    getBorderRadii,
                    getAnimationDurationMs: props.getAnimationDurationMs,
                })
            }
            getIsSolid={props.getIsSolid}
        >
            <div class={[styles.borderedContent, props.getConfig().class].join(" ")}>I have a border</div>
        </Border>
    );
};

import { createUniqueId } from "solid-js";

import { Border } from "../../../../../Lib/Fundamentals/Border/Border";
import type { AccessorProps } from "../../../../../Lib/Utils/typeUtils";
import type { BorderExampleProps } from "../BorderPage.types";

import * as styles from "../BorderPage.css";

type Props = BorderExampleProps &
    AccessorProps<{
        borderRadius: number;
        borderWidth: number;
    }>;

export const AsymmetricalExample = (props: Props) => {
    const id = createUniqueId();

    return (
        <Border
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
            getFillDefs={(getSize, getBorderWidths, getBorderRadii) =>
                props.getConfig().getFillDefs(id, {
                    getSize,
                    getBorderWidths,
                    getBorderRadii,
                    getAnimationDurationMs: props.getAnimationDurationMs,
                    getColors: props.getColors,
                })
            }
            getIsSolid={props.getIsSolid}
        >
            <div class={[styles.borderedContent, props.getConfig().class].join(" ")}>I have a border</div>
        </Border>
    );
};

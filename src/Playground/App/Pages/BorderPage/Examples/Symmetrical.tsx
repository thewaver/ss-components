import { createUniqueId } from "solid-js";

import { SVGGradientDefsUtils } from "../../../../../Lib/Abstracts/SVG/Defs/Gradient/SVGGradientDefs.utils";
import type { SVGDefs } from "../../../../../Lib/Abstracts/SVG/Defs/SVGDefs.types";
import { Border } from "../../../../../Lib/Fundamentals/Border/Border";
import { BorderUtils } from "../../../../../Lib/Fundamentals/Border/Border.utils";
import type { AccessorProps } from "../../../../../Lib/Utils/typeUtils";

import * as styles from "../BorderPage.css";

const getFillDefs = (id: string): SVGDefs => ({
    gradient: {
        id,
        defsElement: SVGGradientDefsUtils.setLinearGradient(
            {
                id,
                colors: [{ value: "#FF00FF" }, { value: "#FFFF00" }, { value: "#FF00FF" }],
            },
            <animateTransform
                attributeName="gradientTransform"
                type="translate"
                from="-1 0.5"
                to="1 0.5"
                dur="2s"
                repeatCount="indefinite"
            />,
        ),
    },
});

type Props = AccessorProps<{
    borderRadius: number;
    borderWidth: number;
}>;

export const SymmetricalExample = (props: Props) => {
    const id = createUniqueId();

    return (
        <Border
            getClass={() => styles.borderedContainerSwipe}
            getBorderRadii={() => BorderUtils.spreadRadius(props.getBorderRadius())}
            getBorderWidths={() => BorderUtils.spreadWidth(props.getBorderWidth())}
            getFillDefs={() => getFillDefs(id)}
        >
            <div class={styles.borderedContent}>I have a border</div>
        </Border>
    );
};

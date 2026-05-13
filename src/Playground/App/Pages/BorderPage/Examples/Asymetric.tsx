import { createUniqueId } from "solid-js";

import { SVGGradientDefsUtils } from "../../../../../Lib/Abstracts/SVG/Defs/Gradient/SVGGradientDefs.utils";
import type { SVGDefs } from "../../../../../Lib/Abstracts/SVG/Defs/SVGDefs.types";
import { Border } from "../../../../../Lib/Fundamentals/Border/Border";
import type { AccessorProps } from "../../../../../Lib/Utils/typeUtils";

import * as styles from "../BorderPage.css";

const getFillDefs = (id: string): SVGDefs => ({
    gradient: {
        id,
        defsElement: SVGGradientDefsUtils.setLinearGradient(
            {
                id,
                colors: [{ value: "#FF00FF" }, { value: "#FFFF00" }],
                angle: 45,
            },
            <animateTransform
                attributeName="gradientTransform"
                type="rotate"
                from="0 0.5 0.5"
                to="360 0.5 0.5"
                dur="5s"
                repeatCount="indefinite"
            />,
        ),
    },
});

type Props = AccessorProps<{
    borderRadius: number;
    borderWidth: number;
}>;

export const AsymetricExample = (props: Props) => {
    const id = createUniqueId();

    return (
        <Border
            getClass={() => styles.borderedContainer}
            getBorderRadii={() => ({
                borderBottomLeftRadius: props.getBorderRadius(),
                borderBottomRightRadius: props.getBorderRadius(),
                borderTopLeftRadius: props.getBorderRadius(),
                borderTopRightRadius: props.getBorderRadius() * 2,
            })}
            getBorderWidths={() => ({
                borderTopWidth: props.getBorderWidth(),
                borderRightWidth: props.getBorderWidth(),
                borderBottomWidth: props.getBorderWidth() * 2,
                borderLeftWidth: props.getBorderWidth(),
            })}
            getFillDefs={() => getFillDefs(id)}
        >
            <div class={styles.borderedContent}>I have a border</div>
        </Border>
    );
};

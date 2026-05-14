import { createUniqueId } from "solid-js";

import { SVGGradientDefsUtils } from "../../../../../Lib/Abstracts/SVG/Defs/Gradient/SVGGradientDefs.utils";
import type { SVGDefs } from "../../../../../Lib/Abstracts/SVG/Defs/SVGDefs.types";
import { Border } from "../../../../../Lib/Fundamentals/Border/Border";
import type { AccessorProps } from "../../../../../Lib/Utils/typeUtils";

import * as styles from "../BorderPage.css";

const getFillDefsPlain = (): SVGDefs[] => [
    {
        color: "#FF00FF",
    },
];

const getFillDefs = (id: string): SVGDefs[] => [
    {
        gradient: {
            id: `gradient1-${id}`,
            defsElement: SVGGradientDefsUtils.getLinearGradient(
                {
                    id: `gradient1-${id}`,
                    colors: [{ value: "#FF00FF" }, { value: "#00FFFF" }],
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
    },
    {
        gradient: {
            id: `gradient2-${id}`,
            defsElement: SVGGradientDefsUtils.getLinearGradient(
                {
                    id: `gradient2-${id}`,
                    colors: [{ value: "transparent" }, { value: "#FFFF00" }],
                    angle: 45,
                },
                <animateTransform
                    attributeName="gradientTransform"
                    type="rotate"
                    from="360 0.5 0.5"
                    to="0 0.5 0.5"
                    dur="2.5s"
                    repeatCount="indefinite"
                />,
            ),
        },
    },
];

type Props = AccessorProps<{
    borderRadius: number;
    borderWidth: number;
    isPlain?: boolean;
}>;

export const AsymmetricalExample = (props: Props) => {
    const id = createUniqueId();

    return (
        <Border
            getClass={() => (props.getIsPlain?.() ? styles.borderedContainerPlain : styles.borderedContainerRotate)}
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
            getFillDefs={() => (props.getIsPlain?.() ? getFillDefsPlain() : getFillDefs(id))}
        >
            <div class={styles.borderedContent}>I have a border</div>
        </Border>
    );
};

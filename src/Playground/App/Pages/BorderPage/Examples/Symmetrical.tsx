import { createUniqueId } from "solid-js";

import { SVGFilterDefsFactory } from "../../../../../Lib/Abstracts/SVG/Defs/Filter/SVGFilterDefs.factory";
import { SVGGradientDefsUtils } from "../../../../../Lib/Abstracts/SVG/Defs/Gradient/SVGGradientDefs.utils";
import type { SVGDefs } from "../../../../../Lib/Abstracts/SVG/Defs/SVGDefs.types";
import { Border } from "../../../../../Lib/Fundamentals/Border/Border";
import { BorderUtils } from "../../../../../Lib/Fundamentals/Border/Border.utils";
import type { AccessorProps } from "../../../../../Lib/Utils/typeUtils";

import * as styles from "../BorderPage.css";

const getFillDefs = (id: string): SVGDefs[] => [
    {
        color: "#FF00FF",
        filter: {
            id: `filter1-${id}`,
            defsElement: new SVGFilterDefsFactory(`filter1-${id}`)
                .addHueRotationFilter(
                    { deg: 0 },
                    <animate
                        attributeName="values"
                        values="0;360;0;360;0;360;0;0;360;0;360;0;360;0;360;0;360;0;360;0;0;360;0;360;0;360;0"
                        keyTimes="0;0.01;0.02;0.03;0.04;0.05;0.06;0.44;0.45;0.46;0.47;0.48;0.49;0.5;0.51;0.52;0.53;0.54;0.55;0.56;0.94;0.95;0.96;0.97;0.98;0.99;1"
                        dur="5s"
                        repeatCount="indefinite"
                    />,
                )
                .getFilterPrimitives(),
        },
    },
    {
        gradient: {
            id: `gradient3-${id}`,
            defsElement: SVGGradientDefsUtils.getLinearGradient(
                {
                    id: `gradient3-${id}`,
                    colors: [{ value: "transparent" }, { value: "#FFFF00" }, { value: "transparent" }],
                },
                <animateTransform
                    attributeName="gradientTransform"
                    type="translate"
                    values="-1 0.5;1 0.5;-1 0.5"
                    dur="5s"
                    repeatCount="indefinite"
                />,
            ),
        },
    },
];

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

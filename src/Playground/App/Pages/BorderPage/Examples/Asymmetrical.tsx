import { createUniqueId } from "solid-js";

import { SVGFilterDefsFactory } from "../../../../../Lib/Abstracts/SVG/Defs/Filter/SVGFilterDefs.factory";
import { SVGGradientDefsUtils } from "../../../../../Lib/Abstracts/SVG/Defs/Gradient/SVGGradientDefs.utils";
import type { SVGDefs } from "../../../../../Lib/Abstracts/SVG/Defs/SVGDefs.types";
import { Border } from "../../../../../Lib/Fundamentals/Border/Border";
import type { AccessorProps } from "../../../../../Lib/Utils/typeUtils";

import * as styles from "../BorderPage.css";

const getFillDefs = (id: string): SVGDefs => ({
    gradient: {
        id: `gradient-${id}`,
        defsElement: SVGGradientDefsUtils.setLinearGradient(
            {
                id: `gradient-${id}`,
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
    filter: {
        id: `filter-${id}`,
        defsElement: new SVGFilterDefsFactory(`filter-${id}`)
            .addGaussianBlurFilter({ stdDeviation: 10 })
            .getFilterPrimitives(),
    },
});

type Props = AccessorProps<{
    borderRadius: number;
    borderWidth: number;
}>;

export const AsymmetricalExample = (props: Props) => {
    const id = createUniqueId();

    return (
        <Border
            getClass={() => styles.borderedContainerRotate}
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
            getFillDefs={() => getFillDefs(id)}
        >
            <div class={styles.borderedContent}>I have a border</div>
        </Border>
    );
};

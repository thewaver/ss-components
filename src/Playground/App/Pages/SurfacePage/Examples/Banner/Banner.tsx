import { createUniqueId } from "solid-js";

import type { Size2d } from "@thewaver/ss-utils";

import { CSSUtils } from "../../../../../../Lib/Abstracts/CSS/CSS.utils";
import { SVGDefsSamples } from "../../../../../../Lib/Abstracts/SVG/Defs/SVGDefs.const";
import { Surface } from "../../../../../../Lib/Composites/Surface/Surface";
import type { SurfaceProps } from "../../../../../../Lib/Composites/Surface/Surface.types";
import knight from "../../../../knight.png";

import * as styles from "./Banner.css";

const getDefs = (getSize: () => Size2d, id: string) =>
    SVGDefsSamples.Gradient.SAMPLE_CONFIGS["flowDiagonal_2s"].getSVGDefs(id, undefined, {
        getSize,
        getAnimationDurationMs: () => 4000,
        getColors: () => ({
            background: "#282420",
            primary: "#FFFF00",
            secondary: "#C0C000",
            tertiary: "#808000",
        }),
    });

const getConfig = (id: string): SurfaceProps => ({
    getBorderRadii: () => CSSUtils.spreadRadius(styles.borderRadius),
    getBorderWidths: () => CSSUtils.spreadWidth(4),
    getStrokeDefs: (getSize) => getDefs(getSize, id),
    getFillDefs: (getSize) => [
        ...getDefs(getSize, id),
        {
            color: "black",
            opacity: 0.5,
        },
    ],
});

export const BannerExample = () => {
    const id = createUniqueId();

    return (
        <div class={styles.root}>
            <Surface {...getConfig(id)}>
                <div class={styles.content}>
                    <img class={styles.image} src={knight} style={{ "vertical-align": "middle" }} />
                    <span>
                        <b>{"Alert! Alert!"}</b>
                        <br />
                        {"Sir Face pleads for your attention!!"}
                    </span>
                </div>
            </Surface>
        </div>
    );
};

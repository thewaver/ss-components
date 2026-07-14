import { createUniqueId } from "solid-js";

import { CSSUtils } from "../../../../../../Lib/Abstracts/CSS/CSS.utils";
import { SVGDefsSamples } from "../../../../../../Lib/Abstracts/SVG/Defs/SVGDefs.const";
import { Surface } from "../../../../../../Lib/Composites/Surface/Surface";
import type { SurfaceProps } from "../../../../../../Lib/Composites/Surface/Surface.types";
import knight_profile from "../../../../knight_profile.webp";

import * as styles from "./Avatar.css";

const getConfig = (strokeId: string): SurfaceProps => ({
    getBorderRadii: () => CSSUtils.spreadRadius(styles.width * 0.5),
    getBorderWidths: () => CSSUtils.spreadWidth(4),
    getStrokeDefs: (getSize) =>
        SVGDefsSamples.Gradient.SAMPLE_CONFIGS["sweepDiagonalDesync_4x"].getSVGDefs(strokeId, undefined, {
            getSize,
            getAnimationDurationMs: () => 4000,
            getColors: () => ({
                background: "#282420",
                primary: "#FFFF00",
                secondary: "#00FFFF",
                tertiary: "#FF00FF",
            }),
            getBlurWidth: () => 4,
        }),
});

export const AvatarExample = () => {
    const strokeId = createUniqueId();

    return (
        <div class={styles.root}>
            <Surface {...getConfig(strokeId)}>
                <img src={knight_profile} width="100%" />
            </Surface>
        </div>
    );
};

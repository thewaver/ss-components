import { createUniqueId } from "solid-js";

import { CSSUtils } from "@thewaver/ss-utils";

import { SVGDefsSamples } from "../../../../../../Lib/Abstracts/SVG/Defs/SVGDefs.const";
import { Surface } from "../../../../../../Lib/Composites/Surface/Surface";
import type { SurfaceProps } from "../../../../../../Lib/Composites/Surface/Surface.types";
import knight_profile from "../../../../knight_profile.webp";

import * as styles from "./Avatar.css";

const getConfig = (strokeId: string): SurfaceProps => ({
    getBorderRadii: () => CSSUtils.spreadRadius(styles.width * 0.5),
    getBorderWidths: () => CSSUtils.spreadWidth(4),
    computeStrokeDefs: (getSize) =>
        SVGDefsSamples.Gradient.SAMPLE_CONFIGS["sweep_diag_async_4"].computeSVGDefs(strokeId, undefined, {
            getSize,
            animationDurationMs: 4000,
            colors: {
                background: "#282420",
                primary: "#FFFF00",
                secondary: "#00FFFF",
                tertiary: "#FF00FF",
            },
            blurWidth: 4,
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

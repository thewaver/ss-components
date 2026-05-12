import { createSignal, createUniqueId } from "solid-js";

import { SVGGradientDefsUtils } from "../../../../Lib/Abstracts/SVG/Defs/Gradient/SVGGradientDefs.utils";
import { Border } from "../../../../Lib/Fundamentals/Border/Border";

import * as pageStyles from "../Pages.css";
import * as styles from "./BorderPage.css";

export const BorderPage = () => {
    const id = createUniqueId();

    const [getBorderWidth, setBorderWidth] = createSignal(4);
    const [getBorderRadius, setBorderRadius] = createSignal(20);

    return (
        <div class={styles.root}>
            <div class={[styles.container, pageStyles.container].join(" ")}>
                {"Fat bottom, rounder topRight:"}
                <Border
                    getBorderRadii={() => ({
                        borderBottomLeftRadius: getBorderRadius(),
                        borderBottomRightRadius: getBorderRadius(),
                        borderTopLeftRadius: getBorderRadius(),
                        borderTopRightRadius: getBorderRadius() * 4,
                    })}
                    getBorderWidths={() => ({
                        borderTopWidth: getBorderWidth(),
                        borderRightWidth: getBorderWidth(),
                        borderBottomWidth: getBorderWidth() * 2,
                        borderLeftWidth: getBorderWidth(),
                    })}
                    getFillDefs={() => ({
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
                    })}
                >
                    <div class={styles.borderedElement}>I have a border</div>
                </Border>

                <div class={pageStyles.props}>
                    <div class={pageStyles.propPanel}>
                        <div>{"Border width (px)"}</div>
                        <input
                            type="number"
                            min={0}
                            max={20}
                            step={1}
                            value={getBorderWidth()}
                            onInput={(e) =>
                                setBorderWidth((prev) => Math.min(Math.max(Number(e.target.value) ?? prev, 0), 20))
                            }
                        />
                    </div>

                    <div class={pageStyles.propPanel}>
                        <div>{"Border radius (px)"}</div>
                        <input
                            type="number"
                            min={0}
                            max={80}
                            step={5}
                            value={getBorderRadius()}
                            onInput={(e) =>
                                setBorderRadius((prev) => Math.min(Math.max(Number(e.target.value) ?? prev, 0), 80))
                            }
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

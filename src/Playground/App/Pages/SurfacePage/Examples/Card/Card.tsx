import { createSignal } from "solid-js";

import { CSSUtils } from "@thewaver/ss-utils";

import { Surface } from "../../../../../../Lib/Composites/Surface/Surface";
import type { SurfaceProps } from "../../../../../../Lib/Composites/Surface/Surface.types";
import { Preview } from "../../../../../../Lib/Fundamentals/Preview/Preview";
import knight_profile from "../../../../knight_profile.webp";
import { PageButtonContent } from "../../../../StyledComponents/ButtonContent/ButtonContent";

import { themeVars } from "../../../../Theme.css";
import * as styles from "./Card.css";

const COLLAPSED_HEIGHT = 200;

const config: SurfaceProps = {
    getBorderRadii: () => CSSUtils.spreadRadius(styles.borderRadius),
    getBorderWidths: () => CSSUtils.spreadWidth(2),
    computeStrokeDefs: () => [
        {
            color: themeVars.color.primary.main,
            opacity: 0.5,
        },
    ],
    computeFillDefs: () => [
        {
            color: themeVars.color.primary.contrast,
        },
    ],
};

export const CardExample = () => {
    const expandedSignal = createSignal(false);

    return (
        <div class={styles.root}>
            <Surface {...config}>
                <div class={styles.surfaceRoot}>
                    <div class={styles.pic}>
                        <img src={knight_profile} width="100%" />
                        <div class={styles.picContent}>
                            <div class={styles.name}>{"Sir Face"}</div>
                            <div class={styles.role}>
                                {"UI/UX Vanguard | 600+ Years Forging Pixel-Perfect Experiences"}
                            </div>
                        </div>
                    </div>
                    <div class={styles.surfaceCntent}>
                        <Preview
                            expandedSignal={expandedSignal}
                            getCollapsedHeight={() => COLLAPSED_HEIGHT}
                            renderContent={() => (
                                <div class={styles.bios}>
                                    <div class={styles.bio}>
                                        {
                                            "Greetings, travelers. I am Sir Face, and as my name implies, I am entirely dedicated to the presentation layer. For over six centuries, I’ve been defending users against terrible UI and slaying dragons in the DOM."
                                        }
                                    </div>
                                    <div class={styles.bio}>
                                        {
                                            "I began my career in the early 1400s, applying gold leaf to illuminated manuscripts—the original CSS. Since then, I've traded my broadsword for a mechanical keyboard, specializing in building robust, user-facing applications. I firmly believe that a user interface should be exactly like a good suit of plate armor: polished to a mirror shine, perfectly articulated, and capable of deflecting any critical errors."
                                        }
                                    </div>
                                    <div class={styles.bio}>
                                        {
                                            "Whether I'm aligning a flexbox or leading a cavalry charge against technical debt, I bring chivalry and pixel-perfection to every sprint."
                                        }
                                    </div>
                                </div>
                            )}
                            renderOverlay={(getVisibilityTarget, getTransitionDurationMs) => (
                                <div
                                    class={styles.bioFade}
                                    style={{
                                        opacity: getVisibilityTarget(),
                                        transition: `opacity ${getTransitionDurationMs()}ms`,
                                    }}
                                />
                            )}
                            renderTrigger={(getFlags) => (
                                <PageButtonContent getFlags={getFlags}>
                                    {getFlags().isExpanded ? "Show less" : "Read more"}
                                </PageButtonContent>
                            )}
                        />
                    </div>
                </div>
            </Surface>
        </div>
    );
};

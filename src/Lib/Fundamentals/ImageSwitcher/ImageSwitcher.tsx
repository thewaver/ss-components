import { createEffect, createMemo, createSignal } from "solid-js";

import { MathUtils } from "@thewaver/ss-utils";

import { ImageSwitcherProps } from "./ImageSwitcher.types";

import * as styles from "./ImageSwitcher.css";

export const DEFAULT_IMAGE_SWITCHER_TRANSITION_DURATION_MS = 100;

export const ImageSwitcher = (props: ImageSwitcherProps) => {
    const [getPrevImage, setPrevImage] = createSignal<string>();
    const [getCurrentImage, setCurrentImage] = createSignal<string>();
    const [getVersion, setVersion] = createSignal(0);

    const getTransitionDurationMs = createMemo(
        () => props.getTransitionDurationMs?.() ?? DEFAULT_IMAGE_SWITCHER_TRANSITION_DURATION_MS,
    );

    const isEven = createMemo(() => MathUtils.isEven(getVersion()));

    createEffect(() => {
        const src = props.getSrc();
        const onLoad = props.onLoad;

        if (src !== getCurrentImage()) {
            setPrevImage(getCurrentImage());
            setCurrentImage(src);
            setVersion((prev) => prev + 1);

            if (src && onLoad) {
                const img = new Image();
                img.crossOrigin = "anonymous";
                img.src = src;
                img.onload = onLoad;
            }
        }
    });

    return (
        <div class={styles.imageSwitcherRoot}>
            <img
                class={styles.imageSwitcherImage}
                src={isEven() ? getCurrentImage() : getPrevImage()}
                style={{
                    "opacity": isEven() ? 1 : 0,
                    "transition-duration": `${getTransitionDurationMs()}ms`,
                }}
            />
            <img
                class={styles.imageSwitcherImage}
                src={!isEven() ? getCurrentImage() : getPrevImage()}
                style={{
                    "opacity": !isEven() ? 1 : 0,
                    "transition-duration": `${getTransitionDurationMs()}ms`,
                }}
            />
        </div>
    );
};

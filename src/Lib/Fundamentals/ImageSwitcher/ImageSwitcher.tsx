import { createEffect, createMemo, createSignal, onCleanup, untrack } from "solid-js";

import { MathUtils } from "@thewaver/ss-utils";

import type { ImageSwitcherProps } from "./ImageSwitcher.types";

import * as styles from "./ImageSwitcher.css";

const DEFAULT_IMAGE_SWITCHER_TRANSITION_DURATION_MS = 100;

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

        if (src === untrack(getCurrentImage)) return;

        setPrevImage(untrack(getCurrentImage));
        setCurrentImage(src);
        setVersion((prev) => prev + 1);

        if (!src || !onLoad) return;

        const img = new Image();

        onCleanup(() => {
            img.onload = null;
            img.onerror = null;
            img.src = "";
        });

        img.crossOrigin = "anonymous";
        img.onload = onLoad;
        img.onerror = () => {
            console.warn(`ImageSwitcher: failed to preload image: ${src}`);
        };
        img.src = src;
    });

    return (
        <div class={styles.imageSwitcherRoot}>
            <img
                class={styles.imageSwitcherImage}
                style={{
                    "opacity": isEven() ? 1 : 0,
                    "transition-duration": `${getTransitionDurationMs()}ms`,
                }}
                src={isEven() ? getCurrentImage() : getPrevImage()}
                alt=""
            />
            <img
                class={styles.imageSwitcherImage}
                style={{
                    "opacity": !isEven() ? 1 : 0,
                    "transition-duration": `${getTransitionDurationMs()}ms`,
                }}
                src={!isEven() ? getCurrentImage() : getPrevImage()}
                alt=""
            />
        </div>
    );
};

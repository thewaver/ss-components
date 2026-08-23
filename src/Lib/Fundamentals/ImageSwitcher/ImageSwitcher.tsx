import { createEffect, createMemo, createSignal, onCleanup, untrack } from "solid-js";

import { MathUtils } from "@thewaver/ss-utils";

import { access } from "../../Utils/propUtils";
import type { ImageSwitcherProps } from "./ImageSwitcher.types";

import * as styles from "./ImageSwitcher.css";

const DEFAULT_IMAGE_SWITCHER_TRANSITION_DURATION_MS = 100;

export const ImageSwitcher = (props: ImageSwitcherProps) => {
    const [getPrevImage, setPrevImage] = createSignal<string>();
    const [getCurrentImage, setCurrentImage] = createSignal<string>();
    const [getVersion, setVersion] = createSignal(0);

    const getTransitionDurationMs = createMemo(
        () => access(props.transitionDurationMs) ?? DEFAULT_IMAGE_SWITCHER_TRANSITION_DURATION_MS,
    );

    const isEven = createMemo(() => MathUtils.isEven(getVersion()));

    createEffect(() => {
        const src = access(props.src);
        const onLoad = props.onLoad;

        if (src === untrack(getCurrentImage)) return;

        const swap = () => {
            setPrevImage(untrack(getCurrentImage));
            setCurrentImage(src);
            setVersion((prev) => prev + 1);
        };

        if (!src) {
            swap();
            return;
        }

        const img = new Image();

        onCleanup(() => {
            img.onload = null;
            img.onerror = null;
            img.src = "";
        });

        img.crossOrigin = "anonymous";
        img.onload = (e) => {
            swap();
            onLoad?.call(img, e);
        };
        img.onerror = () => {
            console.warn(`ImageSwitcher: failed to preload image: ${src}`);
            swap();
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
                    "visibility": (isEven() ? getCurrentImage() : getPrevImage()) ? undefined : "hidden",
                }}
                src={isEven() ? getCurrentImage() : getPrevImage()}
                alt=""
            />
            <img
                class={styles.imageSwitcherImage}
                style={{
                    "opacity": !isEven() ? 1 : 0,
                    "transition-duration": `${getTransitionDurationMs()}ms`,
                    "visibility": (!isEven() ? getCurrentImage() : getPrevImage()) ? undefined : "hidden",
                }}
                src={!isEven() ? getCurrentImage() : getPrevImage()}
                alt=""
            />
        </div>
    );
};

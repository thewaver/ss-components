import { createEffect, createMemo, createSignal, on, onCleanup, onMount } from "solid-js";

import { MathUtils } from "@thewaver/ss-utils";

import { AudioUtils } from "../../Abstracts/Audio/Audio.utils";
import type { AudioSwitcherProps } from "./AudioSwitcher.types";

const DEFAULT_AUDIO_SWITCHER_CROSSFADE_MS = 500;
const DEFAULT_AUDIO_SWITCHER_CROSSFADE_STEPS = 25;
const DEFAULT_AUDIO_SWITCHER_VOLUME = 0.5;

export const AudioSwitcher = (props: AudioSwitcherProps) => {
    let fadeInTickHandler: ReturnType<typeof setInterval> | undefined;
    let fadeOutTickHandler: ReturnType<typeof setInterval> | undefined;

    const [getAudioA] = createSignal(new Audio());
    const [getAudioB] = createSignal(new Audio());
    const [getCurrentSrc, setCurrentSrc] = createSignal<string>();
    const [getVersion, setVersion] = createSignal(0);

    const isEven = createMemo(() => MathUtils.isEven(getVersion()));
    const getVolume = createMemo(() => props.getVolume?.() ?? DEFAULT_AUDIO_SWITCHER_VOLUME);
    const getStep = createMemo(() => getVolume() / DEFAULT_AUDIO_SWITCHER_CROSSFADE_STEPS);

    const getIntervalMs = createMemo(
        () =>
            (props.getCrossfadeMs?.() ?? DEFAULT_AUDIO_SWITCHER_CROSSFADE_MS) / DEFAULT_AUDIO_SWITCHER_CROSSFADE_STEPS,
    );

    const getActiveElement = createMemo(() => (isEven() ? getAudioA() : getAudioB()));

    const getInactiveElement = createMemo(() => (!isEven() ? getAudioA() : getAudioB()));

    const fadeIn = (element: HTMLAudioElement) => {
        const step = getStep();
        const volume = getVolume();

        const fadeInTick = () => {
            element.volume = Math.min(element.volume + step, volume);

            if (element.volume === volume) {
                clearInterval(fadeInTickHandler);
            }
        };

        clearInterval(fadeInTickHandler);

        element.volume = 0;
        element
            .play()
            .then(() => {
                fadeInTickHandler = setInterval(fadeInTick, getIntervalMs());
            })
            .catch((err) => {
                console.warn("Playback prevented by browser autoplay restrictions:", err);
                clearInterval(fadeInTickHandler);
            });
    };

    const fadeOut = (element: HTMLAudioElement) => {
        const step = getStep();

        const fadeOutTick = () => {
            element.volume = Math.max(element.volume - step, 0);

            if (element.volume === 0) {
                element.pause();
                clearInterval(fadeOutTickHandler);
            }
        };

        clearInterval(fadeOutTickHandler);

        fadeOutTickHandler = setInterval(fadeOutTick, getIntervalMs());
    };

    const controller = createMemo(() => ({
        play: () => {
            const active = getActiveElement();

            if (active && !AudioUtils.isPlaying(active)) {
                clearInterval(fadeOutTickHandler);
                fadeIn(active);

                return true;
            }
            return false;
        },

        pause: () => {
            const active = getActiveElement();

            if (active && AudioUtils.isPlaying(active)) {
                clearInterval(fadeInTickHandler);
                fadeOut(active);

                return true;
            }
            return false;
        },

        reset: () => {
            const active = getActiveElement();

            if (active) {
                active.currentTime = 0;

                return true;
            }
            return false;
        },
    }));

    createEffect(
        on(getVolume, (volume) => {
            const active = getActiveElement();

            if (active && !fadeInTickHandler) {
                active.volume = volume;
            }
        }),
    );

    createEffect(() => {
        const src = props.getSrc();

        if (src !== getCurrentSrc()) {
            setCurrentSrc(src);
            setVersion((v) => v + 1);

            const active = getActiveElement();
            const inactive = getInactiveElement();

            fadeOut(inactive);

            if (src) {
                active.src = src;
                active.loop = true;
                active.currentTime = 0;

                fadeIn(active);
            }
        }
    });

    onCleanup(() => {
        clearInterval(fadeInTickHandler);
        clearInterval(fadeOutTickHandler);
        getAudioA().pause();
        getAudioB().pause();
    });

    onMount(() => {
        props.getController?.(controller());
    });

    return null;
};

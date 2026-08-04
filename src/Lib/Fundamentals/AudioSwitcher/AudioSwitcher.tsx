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
    let isMounted = false;

    const audioA = new Audio();
    const audioB = new Audio();

    const [getCurrentSrc, setCurrentSrc] = createSignal<string>();
    const [getVersion, setVersion] = createSignal(0);

    const isEven = createMemo(() => MathUtils.isEven(getVersion()));
    const getVolume = createMemo(() => props.getVolume?.() ?? DEFAULT_AUDIO_SWITCHER_VOLUME);
    const getStep = createMemo(() => getVolume() / DEFAULT_AUDIO_SWITCHER_CROSSFADE_STEPS);

    const getIntervalMs = createMemo(
        () =>
            (props.getCrossfadeMs?.() ?? DEFAULT_AUDIO_SWITCHER_CROSSFADE_MS) / DEFAULT_AUDIO_SWITCHER_CROSSFADE_STEPS,
    );

    const getActiveElement = createMemo(() => (isEven() ? audioA : audioB));

    const getInactiveElement = createMemo(() => (!isEven() ? audioA : audioB));

    const clearFadeIn = () => {
        clearInterval(fadeInTickHandler);
        fadeInTickHandler = undefined;
    };

    const clearFadeOut = () => {
        clearInterval(fadeOutTickHandler);
        fadeOutTickHandler = undefined;
    };

    const fadeIn = (element: HTMLAudioElement) => {
        const step = getStep();
        const volume = getVolume();

        const fadeInTick = () => {
            element.volume = Math.min(element.volume + step, volume);

            if (element.volume === volume) {
                clearFadeIn();
            }
        };

        clearFadeIn();

        element.volume = 0;
        element
            .play()
            .then(() => {
                if (!isMounted || element !== getActiveElement()) return;

                fadeInTickHandler = setInterval(fadeInTick, getIntervalMs());
            })
            .catch((err) => {
                console.warn("Playback prevented by browser autoplay restrictions:", err);
                clearFadeIn();
            });
    };

    const fadeOut = (element: HTMLAudioElement) => {
        const step = getStep();

        const fadeOutTick = () => {
            element.volume = Math.max(element.volume - step, 0);

            if (element.volume === 0) {
                element.pause();
                clearFadeOut();
            }
        };

        clearFadeOut();

        fadeOutTickHandler = setInterval(fadeOutTick, getIntervalMs());
    };

    const controller = createMemo(() => ({
        play: () => {
            const active = getActiveElement();

            if (active && !AudioUtils.isPlaying(active)) {
                clearFadeOut();
                fadeIn(active);

                return true;
            }
            return false;
        },

        pause: () => {
            const active = getActiveElement();

            if (active && AudioUtils.isPlaying(active)) {
                clearFadeIn();
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

            if (AudioUtils.isPlaying(inactive)) {
                fadeOut(inactive);
            }

            if (src) {
                active.src = src;
                active.loop = true;
                active.currentTime = 0;

                fadeIn(active);
            }
        }
    });

    onCleanup(() => {
        isMounted = false;
        clearFadeIn();
        clearFadeOut();

        for (const element of [audioA, audioB]) {
            element.pause();
            element.src = "";
            element.load();
        }
    });

    onMount(() => {
        isMounted = true;
        props.onMount?.(controller());
    });

    return null;
};

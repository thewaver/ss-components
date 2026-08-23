import { createEffect, createMemo, createSignal, on, onCleanup, onMount } from "solid-js";

import { AudioUtils } from "@thewaver/ss-utils";
import { MathUtils } from "@thewaver/ss-utils";

import type { AnimDirection } from "../../Abstracts/Anim/Anim.types";
import { SignalMirror } from "../../Abstracts/SignalMirror/SignalMirror";
import { access } from "../../Utils/propUtils";
import type { AudioSwitcherProps } from "./AudioSwitcher.types";

const DEFAULT_AUDIO_SWITCHER_CROSSFADE_MS = 500;
const DEFAULT_AUDIO_SWITCHER_CROSSFADE_STEPS = 25;
const DEFAULT_AUDIO_SWITCHER_VOLUME = 0.5;

type Fade = {
    handle: ReturnType<typeof setInterval>;
    direction: AnimDirection;
};

export const AudioSwitcher = (props: AudioSwitcherProps) => {
    const fades = new Map<HTMLAudioElement, Fade>();

    let isMounted = false;

    const audioA = new Audio();
    const audioB = new Audio();

    const [getCurrentSrc, setCurrentSrc] = createSignal<string>();
    const [getVersion, setVersion] = createSignal(0);

    const isEven = createMemo(() => MathUtils.isEven(getVersion()));
    const getVolume = createMemo(() => access(props.volume) ?? DEFAULT_AUDIO_SWITCHER_VOLUME);
    const getStep = createMemo(() => getVolume() / DEFAULT_AUDIO_SWITCHER_CROSSFADE_STEPS);

    const getIntervalMs = createMemo(
        () =>
            (access(props.crossfadeMs) ?? DEFAULT_AUDIO_SWITCHER_CROSSFADE_MS) / DEFAULT_AUDIO_SWITCHER_CROSSFADE_STEPS,
    );

    const getActiveElement = createMemo(() => (isEven() ? audioA : audioB));

    const getInactiveElement = createMemo(() => (!isEven() ? audioA : audioB));

    const getFadeDirection = (element: HTMLAudioElement) => fades.get(element)?.direction;

    const clearFade = (element: HTMLAudioElement) => {
        const fade = fades.get(element);

        if (!fade) return;

        clearInterval(fade.handle);
        fades.delete(element);
    };

    const startFade = (element: HTMLAudioElement, direction: AnimDirection, tick: () => void) => {
        clearFade(element);

        fades.set(element, { handle: setInterval(tick, getIntervalMs()), direction });
    };

    const fadeIn = (element: HTMLAudioElement) => {
        const step = getStep();
        const volume = getVolume();

        const fadeInTick = () => {
            element.volume = Math.min(element.volume + step, volume);

            if (element.volume === volume) {
                clearFade(element);
            }
        };

        clearFade(element);

        element.volume = 0;
        element
            .play()
            .then(() => {
                if (!isMounted || element !== getActiveElement()) return;
                if (getFadeDirection(element) === "out") return;

                startFade(element, "in", fadeInTick);
            })
            .catch((err) => {
                console.warn("Playback prevented by browser autoplay restrictions:", err);
                clearFade(element);
            });
    };

    const fadeOut = (element: HTMLAudioElement) => {
        const step = getStep();

        const fadeOutTick = () => {
            element.volume = Math.max(element.volume - step, 0);

            if (element.volume === 0) {
                element.pause();
                clearFade(element);
            }
        };

        startFade(element, "out", fadeOutTick);
    };

    const [getIsPlaying] = SignalMirror.createOptional(() => props.playbackSignal, false);

    createEffect(() => {
        const active = getActiveElement();

        if (!active) return;

        if (getIsPlaying()) {
            if (!AudioUtils.isPlaying(active) || getFadeDirection(active) === "out") fadeIn(active);

            return;
        }

        if (AudioUtils.isPlaying(active) && getFadeDirection(active) !== "out") fadeOut(active);
    });

    const controller = createMemo(() => ({
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

            if (active && !fades.has(active)) {
                active.volume = volume;
            }
        }),
    );

    createEffect(() => {
        const src = access(props.src);

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

        for (const element of [audioA, audioB]) {
            clearFade(element);
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

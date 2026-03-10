import { createEffect, createMemo, createSignal, onCleanup } from "solid-js";

import { MathUtils } from "@thewaver/ss-utils";

import { AudioSwitcherProps } from "./AudioSwitcher.types";

const DEFAULT_CROSSFADE_MS = 500;
const CROSSFADE_STEPS = 25;
const MAX_VOLUME = 0.5;

export const AudioSwitcher = (props: AudioSwitcherProps) => {
    const [getAudioA] = createSignal(new Audio());
    const [getAudioB] = createSignal(new Audio());
    const [getCurrentSrc, setCurrentSrc] = createSignal<string>();
    const [getVersion, setVersion] = createSignal(0);

    const isEven = createMemo(() => MathUtils.isEven(getVersion()));

    createEffect(() => {
        let tickHandler: NodeJS.Timeout | undefined;

        onCleanup(() => {
            clearInterval(tickHandler);
        });

        const intervalMs = (props.getCrossfadeMs?.() ?? DEFAULT_CROSSFADE_MS) / CROSSFADE_STEPS;
        const src = props.getSrc();

        if (src !== getCurrentSrc()) {
            setCurrentSrc(src);
            setVersion((v) => v + 1);

            const active = isEven() ? getAudioA() : getAudioB();
            const inactive = !isEven() ? getAudioA() : getAudioB();
            const step = MAX_VOLUME / CROSSFADE_STEPS;

            const crossFadeTick = () => {
                inactive.volume = Math.max(inactive.volume - step, 0);
                active.volume = Math.min(active.volume + step, MAX_VOLUME);

                if (inactive.volume === 0 && active.volume === MAX_VOLUME) {
                    inactive.pause();
                    inactive.currentTime = 0;
                    clearInterval(tickHandler);
                }
            };

            clearInterval(tickHandler);

            if (src) {
                active.src = src;
                active.loop = true;
                active.volume = 0;
                active.currentTime = 0;
                active.onloadeddata = () => {
                    tickHandler = setInterval(crossFadeTick, intervalMs);
                };
                active.play().catch(() => {
                    tickHandler = setInterval(crossFadeTick, intervalMs);
                });
            } else {
                tickHandler = setInterval(crossFadeTick, intervalMs);
            }
        }
    });

    return null;
};

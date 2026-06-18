import { type Accessor, createEffect, createSignal, onCleanup } from "solid-js";

const FPS_INTERVAL_MS = 1000;

export namespace FPSUtils {
    export const createMonitor = (getIsEnabled: Accessor<boolean>, startupTimeMs: number = 0) => {
        const [getFPS, setFPS] = createSignal({ current: 0, average: 0 });

        createEffect(() => {
            let cycleFrameCount = 0;
            let totalFrameCount = 0;
            let lastTime: number;
            let firstTime: number;
            let rafId: ReturnType<typeof requestAnimationFrame>;
            let timeoutHandle: ReturnType<typeof setTimeout>;

            onCleanup(() => {
                clearTimeout(timeoutHandle);
                cancelAnimationFrame(rafId);
                setFPS({ current: 0, average: 0 });
            });

            if (!getIsEnabled()) return;

            const updateFPS = () => {
                const now = performance.now();

                cycleFrameCount++;
                totalFrameCount++;

                if (now - lastTime >= FPS_INTERVAL_MS) {
                    const current = (cycleFrameCount * FPS_INTERVAL_MS) / (now - lastTime);
                    const average = (totalFrameCount * FPS_INTERVAL_MS) / (now - firstTime);

                    cycleFrameCount = 0;
                    lastTime = now;

                    setFPS({ current, average });
                }

                rafId = requestAnimationFrame(updateFPS);
            };

            timeoutHandle = setTimeout(() => {
                lastTime = performance.now();
                firstTime = lastTime;

                rafId = requestAnimationFrame(updateFPS);
            }, startupTimeMs);
        });

        return { getFPS };
    };
}

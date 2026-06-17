import { type Accessor, createEffect, createSignal, onCleanup } from "solid-js";

const FPS_INTERVAL_MS = 1000;

export namespace FPSUtils {
    export const createMonitor = (getIsEnabled: Accessor<boolean>, startupTimeMs: number = FPS_INTERVAL_MS) => {
        const [getFPS, setFPS] = createSignal({ current: 0, average: 0 });

        createEffect(() => {
            let cycleFrameCount = 0;
            let totalFrameCount = 0;
            let lastTime: number;
            let firstTime: number;
            let rafId: ReturnType<typeof requestAnimationFrame>;

            onCleanup(() => {
                cancelAnimationFrame(rafId);
                setFPS({ current: 0, average: 0 });

                cycleFrameCount = 0;
                totalFrameCount = 0;
                lastTime = 0;
                firstTime = 0;
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

            setTimeout(() => {
                lastTime = performance.now();
                firstTime = lastTime;

                rafId = requestAnimationFrame(updateFPS);
            }, startupTimeMs);
        });

        return { getFPS };
    };
}

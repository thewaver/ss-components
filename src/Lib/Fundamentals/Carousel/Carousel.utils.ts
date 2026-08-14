import type { CarouselStep } from "./Carousel.types";

export namespace CarouselUtils {
    export const wrapIndex = (index: number, count: number) => {
        if (count < 1) return 0;

        return ((Math.trunc(index) % count) + count) % count;
    };

    export const getStepTarget = (step: CarouselStep, index: number, count: number) =>
        wrapIndex(index + (step === "previous" ? -1 : 1), count);
}

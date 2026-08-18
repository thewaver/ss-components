import { RotationUtils } from "../../Abstracts/Rotation/Rotation.utils";
import type { CarouselStep } from "./Carousel.types";

export namespace CarouselUtils {
    export const wrapIndex = RotationUtils.wrapIndex;

    export const getStepTarget = (step: CarouselStep, index: number, count: number) =>
        wrapIndex(index + (step === "previous" ? -1 : 1), count);
}

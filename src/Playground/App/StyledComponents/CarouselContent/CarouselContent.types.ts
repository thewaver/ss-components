import type { ParentProps } from "solid-js";

import type { InteractionFlags } from "../../../../Lib/Abstracts/Interaction/Interaction.types";
import type {
    CarouselPickFlags,
    CarouselRotationFlags,
    CarouselSlideState,
    CarouselStepFlags,
} from "../../../../Lib/Fundamentals/Carousel/Carousel.types";
import type { AccessorProps } from "../../../../Lib/Utils/typeUtils";

export type CarouselSlideProps = ParentProps<
    AccessorProps<{
        state: CarouselSlideState;
    }>
>;

export type CarouselStepProps = AccessorProps<{
    flags: InteractionFlags<CarouselStepFlags>;
}>;

export type CarouselPickProps = AccessorProps<{
    flags: InteractionFlags<CarouselPickFlags>;
}>;

export type CarouselRotationProps = AccessorProps<{
    flags: InteractionFlags<CarouselRotationFlags>;
}>;

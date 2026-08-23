import type { InteractionFlags } from "../../../../Lib/Abstracts/Interaction/Interaction.types";
import type {
    CarouselPickFlags,
    CarouselRotationFlags,
    CarouselSlideState,
    CarouselStepFlags,
} from "../../../../Lib/Fundamentals/Carousel/Carousel.types";
import type { AccessorProps } from "../../../../Lib/Utils/typeUtils";

export type CarouselSlideProps = AccessorProps<{
    state: CarouselSlideState;
}>;

export type CarouselStepProps = AccessorProps<{
    flags: InteractionFlags<CarouselStepFlags>;
}>;

export type CarouselPickProps = AccessorProps<{
    flags: InteractionFlags<CarouselPickFlags>;
}>;

export type CarouselRotationProps = AccessorProps<{
    flags: InteractionFlags<CarouselRotationFlags>;
}>;

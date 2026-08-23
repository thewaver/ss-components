import { For } from "solid-js";

import { Radio } from "../../../../../Lib/Fundamentals/Input/Radio/Radio";
import { RadioGroup } from "../../../../../Lib/Fundamentals/Input/RadioGroup/RadioGroup";
import { PageRadioStarContent } from "../../../StyledComponents/RadioStarContent/RadioStarContent";
import type { RadioRatingExampleProps } from "../RadioPage.types";

const RATING_OPTIONS = [1, 2, 3, 4, 5];

type Props = RadioRatingExampleProps;

export const RatingExample = (props: Props) => (
    <RadioGroup valueSignal={props.valueSignal} ariaLabel={"Rating"} dir={"row"} gap={0}>
        <For each={RATING_OPTIONS}>
            {(rating) => (
                <Radio
                    value={() => rating}
                    ariaLabel={() => (rating === 1 ? "1 star" : `${rating} stars`)}
                    onMouseEnter={() => {
                        props.hoveredSignal[1](rating);
                    }}
                    onMouseLeave={() => {
                        props.hoveredSignal[1](undefined);
                    }}
                    renderContent={(getFlags) => (
                        <PageRadioStarContent
                            flags={getFlags}
                            isFilled={() => rating <= (props.hoveredSignal[0]() ?? props.valueSignal[0]())}
                        />
                    )}
                />
            )}
        </For>
    </RadioGroup>
);

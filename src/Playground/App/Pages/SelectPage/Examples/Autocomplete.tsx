import type { Signal } from "solid-js";

import { Select } from "../../../../../Lib/Fundamentals/Input/Select/Select";
import type { SelectOption } from "../../../../../Lib/Fundamentals/Input/Select/Select.types";
import { access } from "../../../../../Lib/Utils/propUtils";
import type { MaybeAccessor } from "../../../../../Lib/Utils/typeUtils";
import { PagePopoverSurface } from "../../../StyledComponents/PopoverSurface/PopoverSurface";
import { PageSelectContent, computePageSelectTextStyle } from "../../../StyledComponents/SelectContent/SelectContent";
import { PageSelectOptionContent } from "../../../StyledComponents/SelectOptionContent/SelectOptionContent";
import { PLACEHOLDER, QUERY_PADDING } from "../SelectPage.const";
import type { Airport } from "../SelectPage.types";

import * as popupStyles from "../../../StyledComponents/PopoverSurface/PopoverSurface.css";

type Props = {
    valueSignal: Signal<Airport | undefined>;
    querySignal: Signal<string>;
    options: MaybeAccessor<SelectOption<Airport>[]>;
};

export const AutocompleteExample = (props: Props) => {
    return (
        <Select
            valueSignal={props.valueSignal}
            querySignal={props.querySignal}
            options={props.options}
            ariaLabel={"Airport"}
            padding={() => QUERY_PADDING}
            computeTextStyle={computePageSelectTextStyle}
            renderContent={(getSelectedOption, getFlags) => (
                <PageSelectContent flags={getFlags}>{getSelectedOption()?.value.city ?? PLACEHOLDER}</PageSelectContent>
            )}
            renderOption={(getOption, getFlags) => (
                <PageSelectOptionContent flags={getFlags}>
                    {getOption().value.city} ({getOption().value.code})
                </PageSelectOptionContent>
            )}
            renderPopup={(renderOptions, getVisibilityTarget, getTransitionDurationMs, getPlacement) => (
                <PagePopoverSurface
                    visibilityTarget={getVisibilityTarget}
                    transitionDurationMs={getTransitionDurationMs}
                    placement={getPlacement}
                >
                    {access(props.options).length ? (
                        renderOptions()
                    ) : (
                        <div class={popupStyles.popoverSurfaceEmpty}>No airport matches that</div>
                    )}
                </PagePopoverSurface>
            )}
        />
    );
};

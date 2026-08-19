import type { Signal } from "solid-js";

import { Select } from "../../../../../Lib/Fundamentals/Input/Select/Select";
import type { SelectOption } from "../../../../../Lib/Fundamentals/Input/Select/Select.types";
import { PagePopoverSurface } from "../../../StyledComponents/PopoverSurface/PopoverSurface";
import { PageSelectContent, computePageSelectTextStyle } from "../../../StyledComponents/SelectContent/SelectContent";
import { PageSelectOptionContent } from "../../../StyledComponents/SelectOptionContent/SelectOptionContent";
import { PLACEHOLDER, QUERY_PADDING } from "../SelectPage.const";
import type { Airport } from "../SelectPage.types";

import * as popupStyles from "../../../StyledComponents/PopoverSurface/PopoverSurface.css";

type Props = {
    valueSignal: Signal<Airport | undefined>;
    querySignal: Signal<string>;
    getOptions: () => SelectOption<Airport>[];
};

export const AutocompleteExample = (props: Props) => (
    <Select
        valueSignal={props.valueSignal}
        querySignal={props.querySignal}
        getOptions={props.getOptions}
        getAriaLabel={() => "Airport"}
        getPadding={() => QUERY_PADDING}
        computeTextStyle={computePageSelectTextStyle}
        renderContent={(getSelectedOption, getFlags) => (
            <PageSelectContent getFlags={getFlags}>{getSelectedOption()?.value.city ?? PLACEHOLDER}</PageSelectContent>
        )}
        renderOption={(getOption, getFlags) => (
            <PageSelectOptionContent getFlags={getFlags}>
                {getOption().value.city} ({getOption().value.code})
            </PageSelectOptionContent>
        )}
        renderPopup={(renderOptions, getVisibilityTarget, getTransitionDurationMs, getPlacement) => (
            <PagePopoverSurface
                getVisibilityTarget={getVisibilityTarget}
                getTransitionDurationMs={getTransitionDurationMs}
                getPlacement={getPlacement}
            >
                {props.getOptions().length ? (
                    renderOptions()
                ) : (
                    <div class={popupStyles.popoverSurfaceEmpty}>No airport matches that</div>
                )}
            </PagePopoverSurface>
        )}
    />
);

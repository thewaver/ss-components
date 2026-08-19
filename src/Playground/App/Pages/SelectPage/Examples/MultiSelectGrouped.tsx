import type { Signal } from "solid-js";

import { MultiSelect } from "../../../../../Lib/Fundamentals/Input/MultiSelect/MultiSelect";
import type { SelectItem } from "../../../../../Lib/Fundamentals/Input/Select/Select.types";
import { PagePopoverSurface } from "../../../StyledComponents/PopoverSurface/PopoverSurface";
import { PageSelectContent, computePageSelectTextStyle } from "../../../StyledComponents/SelectContent/SelectContent";
import { PageSelectGroupContent } from "../../../StyledComponents/SelectGroupContent/SelectGroupContent";
import { PageSelectOptionContent } from "../../../StyledComponents/SelectOptionContent/SelectOptionContent";
import { PLACEHOLDER, QUERY_PADDING } from "../SelectPage.const";

import * as popupStyles from "../../../StyledComponents/PopoverSurface/PopoverSurface.css";

type Props = {
    valuesSignal: Signal<string[]>;
    querySignal: Signal<string>;
    getOptions: () => SelectItem<string>[];
};

export const MultiSelectGroupedExample = (props: Props) => (
    <MultiSelect
        valuesSignal={props.valuesSignal}
        querySignal={props.querySignal}
        getOptions={props.getOptions}
        getAriaLabel={() => "Countries"}
        getPadding={() => QUERY_PADDING}
        computeTextStyle={computePageSelectTextStyle}
        renderContent={(getSelectedOptions, getFlags) => (
            <PageSelectContent getFlags={getFlags}>
                {getSelectedOptions().length ? `${getSelectedOptions().length} selected` : PLACEHOLDER}
            </PageSelectContent>
        )}
        renderGroup={(getGroup) => <PageSelectGroupContent>{getGroup().label}</PageSelectGroupContent>}
        renderOption={(getOption, getFlags) => (
            <PageSelectOptionContent getFlags={getFlags}>{getOption().value}</PageSelectOptionContent>
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
                    <div class={popupStyles.popoverSurfaceEmpty}>No country matches that</div>
                )}
            </PagePopoverSurface>
        )}
    />
);

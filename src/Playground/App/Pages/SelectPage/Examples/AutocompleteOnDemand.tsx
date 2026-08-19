import { Show } from "solid-js";
import type { Signal } from "solid-js";

import { Select } from "../../../../../Lib/Fundamentals/Input/Select/Select";
import type { SelectOption } from "../../../../../Lib/Fundamentals/Input/Select/Select.types";
import { PagePopoverSurface } from "../../../StyledComponents/PopoverSurface/PopoverSurface";
import { PageSelectContent, computePageSelectTextStyle } from "../../../StyledComponents/SelectContent/SelectContent";
import { PageSelectOptionContent } from "../../../StyledComponents/SelectOptionContent/SelectOptionContent";
import { PLACEHOLDER, QUERY_PADDING } from "../SelectPage.const";
import type { Delivery } from "../SelectPage.types";

import * as popupStyles from "../../../StyledComponents/PopoverSurface/PopoverSurface.css";

type Props = {
    valueSignal: Signal<Delivery | undefined>;
    querySignal: Signal<string>;
    getOptions: () => SelectOption<Delivery>[];
    getHasMore: () => boolean;
    getIsSearching: () => boolean;
    getTotal: () => number;
    onReachEnd: () => void;
};

export const AutocompleteOnDemandExample = (props: Props) => (
    <Select
        valueSignal={props.valueSignal}
        querySignal={props.querySignal}
        getOptions={props.getOptions}
        getHasMoreOptions={props.getHasMore}
        getAriaLabel={() => "Route"}
        getPadding={() => QUERY_PADDING}
        computeTextStyle={computePageSelectTextStyle}
        renderContent={(getSelectedOption, getFlags) => (
            <PageSelectContent getFlags={getFlags}>{getSelectedOption()?.value.name ?? PLACEHOLDER}</PageSelectContent>
        )}
        renderOption={(getOption, getFlags) => (
            <PageSelectOptionContent getFlags={getFlags} getDescription={() => getOption().value.description}>
                {getOption().value.name}
            </PageSelectOptionContent>
        )}
        renderPopup={(renderOptions, getVisibilityTarget, getTransitionDurationMs, getPlacement) => (
            <PagePopoverSurface
                getVisibilityTarget={getVisibilityTarget}
                getTransitionDurationMs={getTransitionDurationMs}
                getPlacement={getPlacement}
            >
                {renderOptions()}

                <Show when={props.getIsSearching()}>
                    <div class={popupStyles.popoverSurfaceEmpty}>Searching…</div>
                </Show>

                <Show when={!props.getIsSearching() && props.getTotal() < 1}>
                    <div class={popupStyles.popoverSurfaceEmpty}>No route matches that</div>
                </Show>
            </PagePopoverSurface>
        )}
        onReachEnd={props.onReachEnd}
    />
);

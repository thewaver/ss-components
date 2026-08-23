import { Show } from "solid-js";
import type { Signal } from "solid-js";

import { Select } from "../../../../../Lib/Fundamentals/Input/Select/Select";
import type { SelectOption } from "../../../../../Lib/Fundamentals/Input/Select/Select.types";
import { access } from "../../../../../Lib/Utils/propUtils";
import type { MaybeAccessor } from "../../../../../Lib/Utils/typeUtils";
import { PagePopoverSurface } from "../../../StyledComponents/PopoverSurface/PopoverSurface";
import { PageSelectContent, computePageSelectTextStyle } from "../../../StyledComponents/SelectContent/SelectContent";
import { PageSelectOptionContent } from "../../../StyledComponents/SelectOptionContent/SelectOptionContent";
import { PLACEHOLDER, QUERY_PADDING } from "../SelectPage.const";
import type { Delivery } from "../SelectPage.types";

import * as popupStyles from "../../../StyledComponents/PopoverSurface/PopoverSurface.css";

type Props = {
    valueSignal: Signal<Delivery | undefined>;
    querySignal: Signal<string>;
    options: MaybeAccessor<SelectOption<Delivery>[]>;
    hasMore: MaybeAccessor<boolean>;
    isSearching: MaybeAccessor<boolean>;
    total: MaybeAccessor<number>;
    onReachEnd: () => void;
};

export const AutocompleteOnDemandExample = (props: Props) => {
    return (
        <Select
            valueSignal={props.valueSignal}
            querySignal={props.querySignal}
            options={props.options}
            hasMoreOptions={props.hasMore}
            ariaLabel={"Route"}
            padding={() => QUERY_PADDING}
            computeTextStyle={computePageSelectTextStyle}
            renderContent={(getSelectedOption, getFlags) => (
                <PageSelectContent flags={getFlags}>{getSelectedOption()?.value.name ?? PLACEHOLDER}</PageSelectContent>
            )}
            renderOption={(getOption, getFlags) => (
                <PageSelectOptionContent flags={getFlags} description={() => getOption().value.description}>
                    {getOption().value.name}
                </PageSelectOptionContent>
            )}
            renderPopup={(renderOptions, getVisibilityTarget, getTransitionDurationMs, getPlacement) => (
                <PagePopoverSurface
                    visibilityTarget={getVisibilityTarget}
                    transitionDurationMs={getTransitionDurationMs}
                    placement={getPlacement}
                >
                    {renderOptions()}

                    <Show when={access(props.isSearching)}>
                        <div class={popupStyles.popoverSurfaceEmpty}>Searching…</div>
                    </Show>

                    <Show when={!access(props.isSearching) && access(props.total) < 1}>
                        <div class={popupStyles.popoverSurfaceEmpty}>No route matches that</div>
                    </Show>
                </PagePopoverSurface>
            )}
            onReachEnd={props.onReachEnd}
        />
    );
};

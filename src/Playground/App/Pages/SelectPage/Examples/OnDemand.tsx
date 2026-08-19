import { Show } from "solid-js";

import { Select } from "../../../../../Lib/Fundamentals/Input/Select/Select";
import { PagePopoverSurface } from "../../../StyledComponents/PopoverSurface/PopoverSurface";
import { PageSelectContent } from "../../../StyledComponents/SelectContent/SelectContent";
import { PageSelectOptionContent } from "../../../StyledComponents/SelectOptionContent/SelectOptionContent";
import { PLACEHOLDER } from "../SelectPage.const";
import type { SelectRoutesExampleProps } from "../SelectPage.types";

import * as popupStyles from "../../../StyledComponents/PopoverSurface/PopoverSurface.css";

type Props = SelectRoutesExampleProps;

export const OnDemandExample = (props: Props) => (
    <Select
        valueSignal={props.valueSignal}
        getOptions={props.getOptions}
        getHasMoreOptions={props.getHasMore}
        getAriaLabel={() => "Route"}
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

                <Show when={props.getIsFetching()}>
                    <div class={popupStyles.popoverSurfaceEmpty}>Fetching more routes…</div>
                </Show>
            </PagePopoverSurface>
        )}
        onReachEnd={props.onReachEnd}
    />
);

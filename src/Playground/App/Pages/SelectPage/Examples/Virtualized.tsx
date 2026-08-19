import type { JSX, Signal } from "solid-js";

import { Select } from "../../../../../Lib/Fundamentals/Input/Select/Select";
import type { SelectOption } from "../../../../../Lib/Fundamentals/Input/Select/Select.types";
import { PageProp } from "../../../PageComponents/Prop/Prop";
import { PagePropsPanel } from "../../../PageComponents/PropsPanel/PropsPanel";
import { PageNumberField } from "../../../StyledComponents/Field/Field";
import { PageSelectContent } from "../../../StyledComponents/SelectContent/SelectContent";
import { PageSelectOptionContent } from "../../../StyledComponents/SelectOptionContent/SelectOptionContent";
import { PLACEHOLDER, renderSelectPopup } from "../SelectPage.const";
import type { Delivery } from "../SelectPage.types";

import * as styles from "../SelectPage.css";

const MIN_STRESS_COUNT = 0;
const MAX_STRESS_COUNT = 200000;
const STRESS_COUNT_STEP = 1000;
const STRESS_COUNT_FIELD_WIDTH = 120;
const STRESS_OPTION_HEIGHT = 100;

type Props = {
    valueSignal: Signal<Delivery | undefined>;
    visibilitySignal: Signal<boolean>;
    getOptions: () => SelectOption<Delivery>[];
    getCount: () => number;
    onCountChange: (count: number) => void;
    measureOpen: (renderOptions: () => JSX.Element) => JSX.Element;
};

export const VirtualizedExample = (props: Props) => (
    <div class={styles.column}>
        <Select
            valueSignal={props.valueSignal}
            visibilitySignal={props.visibilitySignal}
            getOptions={props.getOptions}
            getAriaLabel={() => "Route"}
            computeEstimatedOptionHeight={() => STRESS_OPTION_HEIGHT}
            renderContent={(getSelectedOption, getFlags) => (
                <PageSelectContent getFlags={getFlags}>
                    {getSelectedOption()?.value.name ?? PLACEHOLDER}
                </PageSelectContent>
            )}
            renderOption={(getOption, getFlags) => (
                <PageSelectOptionContent getFlags={getFlags} getDescription={() => getOption().value.description}>
                    {getOption().value.name}
                </PageSelectOptionContent>
            )}
            renderPopup={(renderOptions, getVisibilityTarget, getTransitionDurationMs, getPlacement) =>
                renderSelectPopup(
                    () => props.measureOpen(renderOptions),
                    getVisibilityTarget,
                    getTransitionDurationMs,
                    getPlacement,
                )
            }
        />

        <PagePropsPanel getScope={() => "local"}>
            <PageProp getKey={() => "stressCount"} getLabel={() => "Option count"}>
                <PageNumberField
                    getValue={props.getCount}
                    getMin={() => MIN_STRESS_COUNT}
                    getMax={() => MAX_STRESS_COUNT}
                    getStep={() => STRESS_COUNT_STEP}
                    getWidth={() => STRESS_COUNT_FIELD_WIDTH}
                    getAriaLabel={() => "Option count"}
                    onInput={props.onCountChange}
                />
            </PageProp>
        </PagePropsPanel>
    </div>
);

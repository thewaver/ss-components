import type { JSX, Signal } from "solid-js";

import { Select } from "../../../../../Lib/Fundamentals/Input/Select/Select";
import type { SelectOption } from "../../../../../Lib/Fundamentals/Input/Select/Select.types";
import type { MaybeAccessor } from "../../../../../Lib/Utils/typeUtils";
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
    options: MaybeAccessor<SelectOption<Delivery>[]>;
    count: MaybeAccessor<number>;
    onCountChange: (count: number) => void;
    measureOpen: (renderOptions: () => JSX.Element) => JSX.Element;
};

export const VirtualizedExample = (props: Props) => {
    return (
        <div class={styles.column}>
            <Select
                valueSignal={props.valueSignal}
                visibilitySignal={props.visibilitySignal}
                options={props.options}
                ariaLabel={"Route"}
                computeEstimatedOptionHeight={() => STRESS_OPTION_HEIGHT}
                computeCustomText={(option) => option.value.name}
                renderContent={(getSelectedOption, getFlags) => (
                    <PageSelectContent flags={getFlags}>
                        {getSelectedOption()?.value.name ?? PLACEHOLDER}
                    </PageSelectContent>
                )}
                renderOption={(getOption, getFlags) => (
                    <PageSelectOptionContent flags={getFlags} description={() => getOption().value.description}>
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

            <PagePropsPanel scope={"local"}>
                <PageProp key={"stressCount"} label={"Option count"}>
                    <PageNumberField
                        value={props.count}
                        min={() => MIN_STRESS_COUNT}
                        max={() => MAX_STRESS_COUNT}
                        step={() => STRESS_COUNT_STEP}
                        width={() => STRESS_COUNT_FIELD_WIDTH}
                        ariaLabel={"Option count"}
                        onInput={props.onCountChange}
                    />
                </PageProp>
            </PagePropsPanel>
        </div>
    );
};

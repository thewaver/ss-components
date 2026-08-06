import { createMemo, createSignal, createUniqueId, onCleanup } from "solid-js";

import { NavigationUtils } from "../../../Abstracts/Navigation/Navigation.utils";
import { RadioGroupContextProvider } from "./RadioGroup.context";
import type { RadioGroupContextType, RadioGroupEntry } from "./RadioGroup.context.types";
import type { RadioGroupDir, RadioGroupProps } from "./RadioGroup.types";

import * as styles from "./RadioGroup.css";

const DEFAULT_RADIO_GROUP_DIR: RadioGroupDir = "row";
const DEFAULT_RADIO_GROUP_GAP = 0;

export const RadioGroup = <T,>(props: RadioGroupProps<T>) => {
    const fallbackName = createUniqueId();

    const [getEntries, setEntries] = createSignal<RadioGroupEntry[]>([]);

    const getDir = createMemo(() => props.getDir?.() ?? DEFAULT_RADIO_GROUP_DIR);

    const getOrderedEntries = createMemo(() =>
        [...getEntries()].sort((a, b) => {
            const first = a.getElementRef();
            const second = b.getElementRef();

            if (!first || !second) return 0;

            return first.compareDocumentPosition(second) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
        }),
    );

    const getNavigableEntries = createMemo(() =>
        getOrderedEntries().filter((entry) => !entry.getIsDisabled() || entry.getIsReachable()),
    );

    const getRovingEntry = createMemo(() => {
        const navigable = getNavigableEntries();
        const value = props.valueSignal[0]();

        return navigable.find((entry) => entry.getValue() === value) ?? navigable[0];
    });

    const context: RadioGroupContextType = {
        getName: () => props.getName?.() ?? fallbackName,
        getValue: () => props.valueSignal[0](),
        setValue: (value) => props.valueSignal[1](() => value as T),
        computeIsTabbable: (value) => getRovingEntry()?.getValue() === value,
        register: (entry) => {
            setEntries((prev) => [...prev, entry]);

            onCleanup(() => {
                setEntries((prev) => prev.filter((item) => item !== entry));
            });
        },
    };

    const handleKeyDown = (e: KeyboardEvent) => {
        const navigable = getNavigableEntries();

        if (navigable.length < 1) return;

        const focused = navigable.find((entry) => entry.getElementRef() === document.activeElement);
        const from = focused ?? getRovingEntry();
        const position = NavigationUtils.computeNextPosition(
            e.key,
            from ? navigable.indexOf(from) : 0,
            navigable.length,
            { orientation: "both" },
        );

        if (position === undefined) return;

        e.preventDefault();

        const next = navigable[position];

        next.getElementRef()?.focus();

        if (!next.getIsDisabled()) context.setValue(next.getValue());
    };

    return (
        <div
            class={styles.radioGroupRoot}
            style={{
                "flex-direction": getDir(),
                "gap": `${props.getGap?.() ?? DEFAULT_RADIO_GROUP_GAP}px`,
            }}
            role="radiogroup"
            aria-label={props.getAriaLabel?.()}
            aria-invalid={props.getHasError?.() || undefined}
            onKeyDown={handleKeyDown}
        >
            <RadioGroupContextProvider value={context}>{props.children}</RadioGroupContextProvider>
        </div>
    );
};

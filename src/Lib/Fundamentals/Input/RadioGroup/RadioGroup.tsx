import { createEffect, createMemo, createSignal, createUniqueId, onCleanup } from "solid-js";

import { ElementFader } from "../../../Abstracts/ElementFader/ElementFader";
import { NavigationUtils } from "../../../Abstracts/Navigation/Navigation.utils";
import { access } from "../../../Utils/propUtils";
import { RadioGroupContextProvider } from "./RadioGroup.context";
import type { RadioGroupContextType, RadioGroupEntry } from "./RadioGroup.context.types";
import type { RadioGroupDir, RadioGroupProps } from "./RadioGroup.types";

import * as styles from "./RadioGroup.css";

const DEFAULT_RADIO_GROUP_DIR: RadioGroupDir = "row";
const DEFAULT_RADIO_GROUP_GAP = 0;
const DEFAULT_RADIO_GROUP_TRANSITION_DURATION_MS = 200;

export const RadioGroup = <T,>(props: RadioGroupProps<T>) => {
    const fallbackName = createUniqueId();

    const [getEntries, setEntries] = createSignal<RadioGroupEntry[]>([]);
    const [getRootRef, setRootRef] = createSignal<HTMLElement>();
    const [getFloaterBounds, setFloaterBounds] = createSignal<
        { [k in "top" | "left" | "width" | "height"]: string } | undefined
    >();

    const getDir = createMemo(() => access(props.dir) ?? DEFAULT_RADIO_GROUP_DIR);

    const getTransitionDurationMs = createMemo(
        () => access(props.transitionDurationMs) ?? DEFAULT_RADIO_GROUP_TRANSITION_DURATION_MS,
    );

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

    const getSelectedEntry = createMemo(() =>
        getOrderedEntries().find((entry) => entry.getValue() === props.valueSignal[0]()),
    );

    const getIsFloaterShown = createMemo(() => getSelectedEntry() !== undefined && getFloaterBounds() !== undefined);

    const floaterFader = ElementFader.createFader(getIsFloaterShown, { getTransitionDurationMs });

    createEffect(() => {
        if (floaterFader.getIsVisible()) return;

        setFloaterBounds(undefined);
    });

    createEffect(() => {
        let selectedItemObserver: ResizeObserver | undefined;

        onCleanup(() => {
            selectedItemObserver?.disconnect();
        });

        if (!props.renderFloater) return;

        const rootRef = getRootRef();
        const selectedItem = getSelectedEntry()?.getElementRef();
        const selectedWrapper = selectedItem?.offsetParent as HTMLElement | null;

        if (!rootRef || !selectedWrapper) return;

        selectedItemObserver = new ResizeObserver(() => {
            setFloaterBounds({
                top: `${selectedWrapper.offsetTop}px`,
                left: `${selectedWrapper.offsetLeft}px`,
                width: `${selectedWrapper.offsetWidth}px`,
                height: `${selectedWrapper.offsetHeight}px`,
            });
        });
        selectedItemObserver.observe(rootRef);
        selectedItemObserver.observe(selectedWrapper);
    });

    const context: RadioGroupContextType = {
        getName: () => access(props.name) ?? fallbackName,
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
            ref={setRootRef}
            class={styles.radioGroupRoot}
            style={{
                "flex-direction": getDir(),
                "gap": `${access(props.gap) ?? DEFAULT_RADIO_GROUP_GAP}px`,
            }}
            role="radiogroup"
            aria-label={access(props.ariaLabel)}
            aria-invalid={access(props.hasError) || undefined}
            onKeyDown={handleKeyDown}
        >
            {props.renderFloater && floaterFader.getIsVisible() && getFloaterBounds() && (
                <div
                    class={styles.radioGroupFloater}
                    style={{ ...getFloaterBounds(), "transition-duration": `${getTransitionDurationMs()}ms` }}
                >
                    {props.renderFloater(floaterFader.getTransitionTarget, getTransitionDurationMs)}
                </div>
            )}

            <RadioGroupContextProvider value={context}>{props.children}</RadioGroupContextProvider>
        </div>
    );
};

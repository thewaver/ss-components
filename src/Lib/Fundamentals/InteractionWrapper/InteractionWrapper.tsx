import { createMemo, createSignal } from "solid-js";

import type { InteractionFlags } from "../../Abstracts/Interaction/Interaction.types";
import { InteractionUtils } from "../../Abstracts/Interaction/Interaction.utils";
import { Tooltip } from "../Tooltip/Tooltip";
import type { InteractionSizing, InteractionWrapperProps } from "./InteractionWrapper.types";

import * as styles from "./InteractionWrapper.css";

const DEFAULT_INTERACTION_SIZING: InteractionSizing = "fit-content";

export const InteractionWrapper = (props: InteractionWrapperProps) => {
    const [getElementRef, setElementRef] = createSignal<HTMLElement>();

    const getSizing = createMemo(() => props.getSizing?.() ?? DEFAULT_INTERACTION_SIZING);

    const getIsDisabled = createMemo(() => props.getIsDisabled?.() ?? false);

    const getIsReachable = createMemo(() =>
        InteractionUtils.computeIsReachable(
            getIsDisabled(),
            props.getIsReachableWhenDisabled?.() ?? false,
            props.getTooltipDefs !== undefined,
        ),
    );

    const { getFlags: getInternalFlags } = InteractionUtils.wrapElement(getElementRef, getIsDisabled, {
        getIsReachable,
        getIsTabbable: props.getIsTabbable,
    });

    const getFlags = createMemo((): InteractionFlags => ({
        ...getInternalFlags(),
        isDisabled: getIsDisabled(),
        isReadOnly: props.getIsReadOnly?.(),
        isPressed: props.getIsPressed?.(),
        hasError: props.getHasError?.(),
        checkedState: props.getCheckedState?.(),
        isEmpty: props.getIsEmpty?.(),
    }));

    if (props.getIsReachableWhenDisabled && !props.getTooltipDefs) {
        console.warn(
            "InteractionWrapper: getIsReachableWhenDisabled has no effect without getTooltipDefs — a focusable disabled control with nothing to reveal is worse than one skipped by the tab order.",
        );
    }

    return (
        <div
            class={[styles.interactionRoot, styles.interactionSizingVariants[getSizing()]].join(" ")}
            style={{ "min-width": props.getMinWidth ? `${props.getMinWidth()}px` : undefined }}
            classList={{
                [styles.interactionDisabled]: getIsDisabled(),
                [styles.interactionError]: props.getHasError?.(),
                [styles.interactionPressed]: props.getIsPressed?.(),
            }}
        >
            {props.renderControl((element) => {
                setElementRef(element);
                props.ref?.(element);
            }, getFlags)}

            {props.renderDecoration && (
                <div class={styles.interactionDecorationWrapper}>{props.renderDecoration(getFlags)}</div>
            )}

            {props.getTooltipDefs && (
                <Tooltip
                    {...props.getTooltipDefs()}
                    renderContent={(getVisibilityTarget, getTransitionDurationMs, getPlacement) =>
                        props.getTooltipDefs!().renderContent(
                            getVisibilityTarget,
                            getTransitionDurationMs,
                            getPlacement,
                            getFlags,
                        )
                    }
                    getAnchorRef={getElementRef}
                />
            )}
        </div>
    );
};

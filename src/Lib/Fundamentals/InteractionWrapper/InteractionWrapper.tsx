import { Show, createMemo, createSignal } from "solid-js";

import type { InteractionFlags } from "../../Abstracts/Interaction/Interaction.types";
import { InteractionUtils } from "../../Abstracts/Interaction/Interaction.utils";
import { Tooltip } from "../Tooltip/Tooltip";
import type { InteractionSizing, InteractionWrapperProps } from "./InteractionWrapper.types";

import * as styles from "./InteractionWrapper.css";

const DEFAULT_INTERACTION_SIZING: InteractionSizing = "fit-content";

export const InteractionWrapper = <TExtra extends object = {}>(props: InteractionWrapperProps<TExtra>) => {
    const [getElementRef, setElementRef] = createSignal<HTMLElement>();

    const getSizing = createMemo(() => props.getSizing?.() ?? DEFAULT_INTERACTION_SIZING);

    const getIsDisabled = createMemo(() => props.getIsDisabled?.() ?? false);

    const getTooltipDefs = createMemo(() => props.getTooltipDefs?.());

    const getIsReachable = createMemo(() =>
        InteractionUtils.computeIsReachable(
            getIsDisabled(),
            props.getIsReachableWhenDisabled?.() ?? false,
            getTooltipDefs() !== undefined,
        ),
    );

    const { getFlags: getInternalFlags } = InteractionUtils.wrapElement(getElementRef, getIsDisabled, {
        getIsReachable,
        getIsTabbable: props.getIsTabbable,
    });

    const getFlags = createMemo((): InteractionFlags<TExtra> => ({
        ...getInternalFlags(),
        isDisabled: getIsDisabled(),
        isPressed: props.getIsPressed?.(),
        hasError: props.getHasError?.(),
        ...(props.getExtraFlags?.() ?? ({} as TExtra)),
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

            <Show when={getTooltipDefs()}>
                {(getDefs) => (
                    <Tooltip
                        {...getDefs()}
                        renderContent={(getVisibilityTarget, getTransitionDurationMs, getPlacement) =>
                            getDefs().renderContent(
                                getVisibilityTarget,
                                getTransitionDurationMs,
                                getPlacement,
                                getFlags,
                            )
                        }
                        getAnchorRef={getElementRef}
                    />
                )}
            </Show>
        </div>
    );
};

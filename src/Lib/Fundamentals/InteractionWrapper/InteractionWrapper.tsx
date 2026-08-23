import { Show, createMemo, createSignal } from "solid-js";

import type { InteractionFlags } from "../../Abstracts/Interaction/Interaction.types";
import { InteractionUtils } from "../../Abstracts/Interaction/Interaction.utils";
import { access } from "../../Utils/propUtils";
import { Tooltip } from "../Tooltip/Tooltip";
import type { InteractionSizing, InteractionWrapperProps } from "./InteractionWrapper.types";

import * as styles from "./InteractionWrapper.css";

const DEFAULT_INTERACTION_SIZING: InteractionSizing = "fit-content";
const DEFAULT_INTERACTION_ROLE = "presentation";

export const InteractionWrapper = <TExtra extends object = {}>(props: InteractionWrapperProps<TExtra>) => {
    const [getElementRef, setElementRef] = createSignal<HTMLElement>();

    const getSizing = createMemo(() => access(props.sizing) ?? DEFAULT_INTERACTION_SIZING);

    const getIsDisabled = createMemo(() => access(props.isDisabled) ?? false);

    const getTooltipDefs = createMemo(() => access(props.tooltipDefs));

    const getIsReachable = createMemo(() =>
        InteractionUtils.computeIsReachable(
            getIsDisabled(),
            access(props.isReachableWhenDisabled) ?? false,
            getTooltipDefs() !== undefined,
        ),
    );

    const { getFlags: getInternalFlags } = InteractionUtils.wrapElement(getElementRef, getIsDisabled, {
        getIsReachable,
        getIsTabbable: props.isTabbable === undefined ? undefined : () => access(props.isTabbable)!,
    });

    const getFlags = createMemo((): InteractionFlags<TExtra> => ({
        ...getInternalFlags(),
        isDisabled: getIsDisabled(),
        isPressed: access(props.isPressed),
        hasError: access(props.hasError),
        ...(access(props.extraFlags) ?? ({} as TExtra)),
    }));

    if (props.isReachableWhenDisabled && !props.tooltipDefs) {
        console.warn(
            "InteractionWrapper: getIsReachableWhenDisabled has no effect without getTooltipDefs — a focusable disabled control with nothing to reveal is worse than one skipped by the tab order.",
        );
    }

    return (
        <div
            class={[styles.interactionRoot, styles.interactionSizingVariants[getSizing()]].join(" ")}
            role={access(props.role) ?? DEFAULT_INTERACTION_ROLE}
            style={{
                "min-width": props.minWidth ? `${access(props.minWidth)}px` : undefined,
                "min-height": access(props.minHeight) ? `${access(props.minHeight)}px` : undefined,
            }}
            classList={{
                [styles.interactionDisabled]: getIsDisabled(),
                [styles.interactionError]: access(props.hasError),
                [styles.interactionPressed]: access(props.isPressed),
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
                        anchorRef={getElementRef}
                    />
                )}
            </Show>
        </div>
    );
};

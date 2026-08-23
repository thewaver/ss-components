import type { Accessor } from "solid-js";
import { Index, Show, createMemo, onMount } from "solid-js";

import type { Size2d } from "@thewaver/ss-utils";

import { Rotation } from "../../Abstracts/Rotation/Rotation";
import { access } from "../../Utils/propUtils";
import type { WheelAxis, WheelController, WheelFace, WheelProps, WheelWedgeState } from "./Wheel.types";
import { DRUM_PERSPECTIVE_PX, WheelUtils } from "./Wheel.utils";

import * as styles from "./Wheel.css";

const DEFAULT_WHEEL_AXIS: WheelAxis = "row";
const DEFAULT_WHEEL_WEDGE_SIZE: Size2d = { width: 0, height: 0 };

const WHEEL_ROLE_DESCRIPTION = "wheel";
const WEDGE_ROLE_DESCRIPTION = "wedge";

export const Wheel = <T,>(props: WheelProps<T>) => {
    const getWedgeCount = createMemo(() => access(props.wedges).length);

    const getIsDisabled = createMemo(() => access(props.isDisabled) ?? false);

    const getAxis = createMemo(() => access(props.axis) ?? DEFAULT_WHEEL_AXIS);

    const getWedgeSize = createMemo(() => access(props.wedgeSize) ?? DEFAULT_WHEEL_WEDGE_SIZE);

    const rotation = Rotation.createRotation(getIsDisabled, {
        stepCount: getWedgeCount,
        spinDurationMs: props.spinDurationMs,
        settleDurationMs: props.settleDurationMs,
        restDurationMs: props.restDurationMs,
        idleDelayMs: props.idleDelayMs,
        computeSpinTarget: props.computeSpinTarget,
        computeSpinDefs: props.computeSpinDefs,
        computeStepLabel: props.computeWedgeLabel,
        onStepChange: props.onSelectedWedgeChange,
        indexSignal: props.indexSignal,
        autoSpinSignal: props.autoSpinSignal,
        onSpinEnd: props.onSpinEnd,
    });

    const getWedgeLabel = (index: number) =>
        props.computeWedgeLabel?.(index, getWedgeCount()) ?? `${index + 1} of ${getWedgeCount()}`;

    const getApothem = createMemo(() =>
        WheelUtils.getApothem(WheelUtils.getWedgeExtent(getWedgeSize(), getAxis()), getWedgeCount()),
    );

    const getGirth = createMemo(() =>
        WheelUtils.getGirth(WheelUtils.getWedgeExtent(getWedgeSize(), getAxis()), getWedgeCount()),
    );

    const getSelectedIndex = createMemo(() =>
        rotation.getPhase() === "idling" ? undefined : rotation.getSelectedIndex(),
    );

    const getWedgeState = (index: number, face: WheelFace): WheelWedgeState => ({
        index,
        wedgeCount: getWedgeCount(),
        face,
        isSelected: index === getSelectedIndex(),
    });

    const controller: WheelController = {
        getIndex: rotation.getIndex,
        getPhase: rotation.getPhase,
        getIsSpinnable: rotation.getIsSpinnable,
        getIsAutoSpinning: () => rotation.getPhase() === "idling",
        getIsUserSpinning: () =>
            rotation.getIsAwaitingTarget() || rotation.getPhase() === "spinning" || rotation.getPhase() === "settling",
        spin: rotation.spin,
    };

    const renderWedgeFace = (getWedge: Accessor<T>, index: number, face: WheelFace) => {
        const getState = () => getWedgeState(index, face);
        const isHidden = face === "back" || (access(props.variant) === "drum" && index !== rotation.getIndex());

        return (
            <div
                class={access(props.variant) === "flat" ? styles.flatWheelWedge : styles.drumWheelWedge}
                style={{
                    transform:
                        access(props.variant) === "flat"
                            ? `rotate(${index * rotation.getStepAngle() + rotation.getAngle()}deg)`
                            : `${getAxis() === "row" ? "rotateY" : "rotateX"}(${-rotation.getAngle() - rotation.getStepAngle() * index}deg) translateZ(${getApothem()}px)${face === "back" ? (getAxis() === "row" ? " rotateY(180deg)" : " rotateX(180deg)") : ""}`,
                }}
                role="group"
                aria-roledescription={WEDGE_ROLE_DESCRIPTION}
                aria-label={getWedgeLabel(index)}
                aria-hidden={isHidden || undefined}
                inert={isHidden}
            >
                {face === "back" ? props.renderWedgeBack?.(getWedge, getState) : props.renderWedge(getWedge, getState)}
            </div>
        );
    };

    onMount(() => {
        props.onMount?.(controller);
    });

    return (
        <Show
            when={access(props.variant) === "flat"}
            fallback={
                <div
                    class={styles.drumWheelRoot}
                    role="group"
                    aria-roledescription={WHEEL_ROLE_DESCRIPTION}
                    aria-label={access(props.ariaLabel)}
                >
                    <div
                        class={styles.drumWheelGirth}
                        style={{
                            width: `${getAxis() === "row" ? getGirth() : getWedgeSize().width}px`,
                            height: `${getAxis() === "row" ? getWedgeSize().height : getGirth()}px`,
                        }}
                    >
                        <div
                            class={styles.drumWheelPerspective}
                            style={{
                                width: `${getWedgeSize().width}px`,
                                height: `${getWedgeSize().height}px`,
                                perspective: `${DRUM_PERSPECTIVE_PX}px`,
                            }}
                        >
                            <div class={styles.drumWheelBarrel} style={{ transform: `translateZ(${-getApothem()}px)` }}>
                                <Index each={access(props.wedges)}>
                                    {(getWedge, index) => (
                                        <>
                                            {renderWedgeFace(getWedge, index, "front")}

                                            <Show when={WheelUtils.getHasWedgeBacks(getWedgeCount())}>
                                                {renderWedgeFace(getWedge, index, "back")}
                                            </Show>
                                        </>
                                    )}
                                </Index>
                            </div>
                        </div>
                    </div>
                </div>
            }
        >
            <div
                class={styles.flatWheelRoot}
                role="group"
                aria-roledescription={WHEEL_ROLE_DESCRIPTION}
                aria-label={access(props.ariaLabel)}
            >
                <Index each={access(props.wedges)}>
                    {(getWedge, index) => renderWedgeFace(getWedge, index, "front")}
                </Index>
            </div>
        </Show>
    );
};

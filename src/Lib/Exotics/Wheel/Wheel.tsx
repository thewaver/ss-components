import type { Accessor } from "solid-js";
import { Index, Show, createMemo, onMount } from "solid-js";

import type { Size2d } from "@thewaver/ss-utils";

import { Rotation } from "../../Abstracts/Rotation/Rotation";
import type { WheelAxis, WheelController, WheelFace, WheelProps, WheelWedgeState } from "./Wheel.types";
import { DRUM_PERSPECTIVE_PX, WheelUtils } from "./Wheel.utils";

import * as styles from "./Wheel.css";

const DEFAULT_WHEEL_AXIS: WheelAxis = "row";
const DEFAULT_WHEEL_WEDGE_SIZE: Size2d = { width: 0, height: 0 };

const WHEEL_ROLE_DESCRIPTION = "wheel";
const WEDGE_ROLE_DESCRIPTION = "wedge";

export const Wheel = <T,>(props: WheelProps<T>) => {
    const getWedgeCount = createMemo(() => props.getWedges().length);

    const getIsDisabled = createMemo(() => props.getIsDisabled?.() ?? false);

    const getAxis = createMemo(() => props.getAxis?.() ?? DEFAULT_WHEEL_AXIS);

    const getWedgeSize = createMemo(() => props.getWedgeSize?.() ?? DEFAULT_WHEEL_WEDGE_SIZE);

    const rotation = Rotation.createRotation(getIsDisabled, {
        getStepCount: getWedgeCount,
        getSpinDurationMs: props.getSpinDurationMs,
        getSettleDurationMs: props.getSettleDurationMs,
        getRestDurationMs: props.getRestDurationMs,
        getIdleDelayMs: props.getIdleDelayMs,
        computeSpinTarget: props.computeSpinTarget,
        computeSpinDefs: props.computeSpinDefs,
        computeStepLabel: props.computeWedgeLabel,
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

    const getTransitionStyle = () => ({
        "transition-duration": `${rotation.getTransitionDurationMs()}ms`,
        "transition-timing-function": rotation.getTimingFunction(),
    });

    const getWedgeState = (index: number, face: WheelFace): WheelWedgeState => ({
        index,
        wedgeCount: getWedgeCount(),
        face,
        isSelected: index === rotation.getIndex(),
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
        const isHidden = face === "back" || (props.getVariant() === "drum" && index !== rotation.getIndex());

        return (
            <div
                class={props.getVariant() === "flat" ? styles.flatWheelWedge : styles.drumWheelWedge}
                style={{
                    ...getTransitionStyle(),
                    transform:
                        props.getVariant() === "flat"
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
            when={props.getVariant() === "flat"}
            fallback={
                <div
                    class={styles.drumWheelRoot}
                    role="group"
                    aria-roledescription={WHEEL_ROLE_DESCRIPTION}
                    aria-label={props.getAriaLabel()}
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
                                <Index each={props.getWedges()}>
                                    {(getWedge, index) => (
                                        <>
                                            {renderWedgeFace(getWedge, index, "front")}
                                            {renderWedgeFace(getWedge, index, "back")}
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
                aria-label={props.getAriaLabel()}
            >
                <Index each={props.getWedges()}>{(getWedge, index) => renderWedgeFace(getWedge, index, "front")}</Index>
            </div>
        </Show>
    );
};

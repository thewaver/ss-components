import type { Accessor, JSX } from "solid-js";
import { Index, Show, createMemo, createSignal, onMount } from "solid-js";

import type { Size2d } from "@thewaver/ss-utils";

import { Rotation } from "../../Abstracts/Rotation/Rotation";
import { InteractionWrapper } from "../../Fundamentals/InteractionWrapper/InteractionWrapper";
import type {
    WheelAxis,
    WheelControlProps,
    WheelControls,
    WheelFace,
    WheelProps,
    WheelSpinFlags,
    WheelWedgeState,
} from "./Wheel.types";
import { DRUM_PERSPECTIVE_PX, WheelUtils } from "./Wheel.utils";

import * as styles from "./Wheel.css";

const DEFAULT_WHEEL_AXIS: WheelAxis = "row";
const DEFAULT_WHEEL_WEDGE_SIZE: Size2d = { width: 0, height: 0 };

const WHEEL_ROLE_DESCRIPTION = "wheel";
const WEDGE_ROLE_DESCRIPTION = "wedge";

const SPIN_LABEL = "Spin the wheel";

const WheelControl = (props: WheelControlProps) => {
    const getIsDisabled = () => props.getFlags().isDisabled ?? false;

    return (
        <button
            ref={(element) => props.ref?.(element)}
            type="button"
            class={styles.wheelControl}
            aria-label={props.getAriaLabel()}
            aria-disabled={getIsDisabled() || undefined}
            onClick={() => {
                if (getIsDisabled()) return;

                props.onActivate();
            }}
        >
            {props.renderContent(props.getFlags)}
        </button>
    );
};

export const Wheel = <T,>(props: WheelProps<T>) => {
    const [getRootRef, setRootRef] = createSignal<HTMLElement>();

    const getWedgeCount = createMemo(() => props.getWedges().length);

    const getIsDisabled = createMemo(() => props.getIsDisabled?.() ?? false);

    const getAxis = createMemo(() => props.getAxis?.() ?? DEFAULT_WHEEL_AXIS);

    const getWedgeSize = createMemo(() => props.getWedgeSize?.() ?? DEFAULT_WHEEL_WEDGE_SIZE);

    const rotation = Rotation.createRotation(getRootRef, getIsDisabled, {
        getStepCount: getWedgeCount,
        getSpinDurationMs: props.getSpinDurationMs,
        getSettleDurationMs: props.getSettleDurationMs,
        getIdleDelayMs: props.getIdleDelayMs,
        computeSpinTarget: props.computeSpinTarget,
        computeSpinDefs: props.computeSpinDefs,
        computeStepLabel: props.computeWedgeLabel,
        indexSignal: props.indexSignal,
        playingSignal: props.playingSignal,
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

    const renderSpinControl = (): JSX.Element => (
        <InteractionWrapper<WheelSpinFlags>
            getIsDisabled={() => !rotation.getIsSpinnable()}
            getExtraFlags={() => ({ phase: rotation.getPhase(), isSpinnable: rotation.getIsSpinnable() })}
            renderControl={(setElementRef, getFlags) => (
                <WheelControl
                    ref={setElementRef}
                    getAriaLabel={() => props.computeSpinLabel?.() ?? SPIN_LABEL}
                    getFlags={getFlags}
                    renderContent={() => props.renderSpin?.(getFlags)}
                    onActivate={rotation.spin}
                />
            )}
        />
    );

    const controls: WheelControls = {
        getIndex: rotation.getIndex,
        getWedgeCount,
        getPhase: rotation.getPhase,
        getIsPlaying: rotation.getIsPlaying,
        getIsHeld: rotation.getIsHeld,
        renderSpin: renderSpinControl,
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
        props.onMount?.({ spin: rotation.spin });
    });

    return (
        <Show
            when={props.getVariant() === "flat"}
            fallback={
                <div
                    ref={setRootRef}
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

                    <div class={styles.drumWheelControls}>{props.renderControls?.(controls)}</div>
                </div>
            }
        >
            <div
                ref={setRootRef}
                class={styles.flatWheelRoot}
                role="group"
                aria-roledescription={WHEEL_ROLE_DESCRIPTION}
                aria-label={props.getAriaLabel()}
            >
                <Index each={props.getWedges()}>{(getWedge, index) => renderWedgeFace(getWedge, index, "front")}</Index>

                <div class={styles.flatWheelHub}>{props.renderControls?.(controls)}</div>
            </div>
        </Show>
    );
};

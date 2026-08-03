import { For, Show, createEffect, createMemo, createSignal, untrack } from "solid-js";
import { Portal } from "solid-js/web";

import { MathUtils } from "@thewaver/ss-utils";

import type { AnimDirection } from "../../Abstracts/Anim/Anim.types";
import { useViewportContext } from "../Viewport/Viewport.context";
import type { ScreenWiperProps, ScreenWiperShape } from "./ScreenWiper.types";

import * as styles from "./ScreenWiper.css";

const DEFAULT_SCREENWIPER_SHAPE: ScreenWiperShape = "lozenge";
const DEFAULT_SCREENWIPER_TRANSITION_DURATION_MS = 200;
const DEFAULT_SCREENWIPER_CELL_SIZE: number = 120;

const getTargetFromDirection = (direction: AnimDirection) => (direction === "in" ? 1 : 0);

export const ScreenWiper = (props: ScreenWiperProps) => {
    const viewportContext = useViewportContext();

    const [getTarget, setTarget] = createSignal(getTargetFromDirection(props.getInitialWipeDirection()));
    const [getHasFinished, setHasFinished] = createSignal(true);

    const getCellSize = createMemo(() => props.getCellSize?.() ?? DEFAULT_SCREENWIPER_CELL_SIZE);

    const getTransitionDurationMs = createMemo(
        () => props.getTransitionDurationMs?.() ?? DEFAULT_SCREENWIPER_TRANSITION_DURATION_MS,
    );

    const getCols = createMemo(() => ({
        odd: Array.from({ length: viewportContext.getSize().width / getCellSize() }).map((_, index) => index),
        even: Array.from({ length: viewportContext.getSize().width / getCellSize() + 1 }).map((_, index) => index),
    }));

    const getRows = createMemo(() =>
        Array.from({ length: (viewportContext.getSize().height * 2) / getCellSize() + 1 }).map((_, index) => index),
    );

    const renderCell = (shape: ScreenWiperShape, _row: number, _col: number) => (
        <svg
            width={getCellSize()}
            height={getCellSize()}
            viewBox={`0 0 ${getCellSize()} ${getCellSize()}`}
            overflow="visible"
            aria-hidden="true"
        >
            {shape === "lozenge" ? (
                <polygon
                    points={`${getCellSize() * 0.5},0 ${getCellSize()},${getCellSize() * 0.5} ${getCellSize() * 0.5},${getCellSize()} 0,${getCellSize() * 0.5}`}
                    fill="black"
                />
            ) : (
                <circle cx={getCellSize() * 0.5} cy={getCellSize() * 0.5} r={getCellSize() * 0.5} fill="black" />
            )}
        </svg>
    );

    createEffect(() => {
        const direction = props.getWipeDirection();

        untrack(() => {
            const newTarget = getTargetFromDirection(direction);

            if (newTarget === getTarget()) return;

            setHasFinished(false);
            setTimeout(() => {
                setTarget(newTarget);
            }, 0);
        });
    });

    return (
        <Show when={getTarget() === 1 || !getHasFinished()}>
            <Portal mount={viewportContext.getPortalRef()}>
                <div class={styles.screenWiperRoot}>
                    <For each={getRows()}>
                        {(row) => {
                            const isRowEven = MathUtils.isEven(row);
                            const getRowCols = () => (isRowEven ? getCols().even : getCols().odd);

                            return (
                                <div
                                    class={styles.screenWiperRow}
                                    style={{
                                        transform: `translate(${isRowEven ? getCellSize() * -0.5 : 0}px, ${(row + 1) * getCellSize() * -0.5}px)`,
                                    }}
                                >
                                    <For each={getRowCols()}>
                                        {(col) => (
                                            <div
                                                class={styles.screenWiperCell}
                                                style={{
                                                    width: `${getCellSize()}px`,
                                                    height: `${getCellSize()}px`,
                                                    transition: `transform ${getTransitionDurationMs()}ms ease ${getTransitionDurationMs() * 0.05 * (col + row)}ms`,
                                                    transform: `scale(${getTarget()})`,
                                                }}
                                                onTransitionEnd={
                                                    row === getRows().length - 1 && col === getRowCols().length - 1
                                                        ? () => {
                                                              const direction = props.getWipeDirection();

                                                              setHasFinished(true);
                                                              setTimeout(() => {
                                                                  props.onTransitionEnd?.(direction);
                                                              }, 0);
                                                          }
                                                        : undefined
                                                }
                                            >
                                                {renderCell(props.getShape?.() ?? DEFAULT_SCREENWIPER_SHAPE, row, col)}
                                            </div>
                                        )}
                                    </For>
                                </div>
                            );
                        }}
                    </For>
                </div>
            </Portal>
        </Show>
    );
};

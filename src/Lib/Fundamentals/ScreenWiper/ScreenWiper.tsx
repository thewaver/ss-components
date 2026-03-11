import { For, Show, createEffect, createMemo, createSignal, untrack } from "solid-js";

import { MathUtils, Size2d } from "@thewaver/ss-utils";

import { AnimDirection } from "../../Abstracts/Anim/Anim.types";
import { useViewportContext } from "../Viewport/Viewpoer.context";
import { ScreenWiperProps, ScreenWiperShape } from "./ScreenWiper.types";

import * as styles from "./ScreenWiper.css";

const DEFAULT_SCREENWIPER_SHAPE: ScreenWiperShape = "lozenge";
const DEFAULT_SCREENWIPER_TRANSITION_DURATION_MS = 1000;
const DEFAULT_SCREENWIPER_CELL_SIZE: Size2d = { width: 120, height: 120 };

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
        odd: Array.from({ length: (viewportContext.getSize().width ?? 0) / getCellSize().width }).map(
            (_, index) => index,
        ),
        even: Array.from({ length: (viewportContext.getSize().width ?? 0) / getCellSize().width + 1 }).map(
            (_, index) => index,
        ),
    }));

    const getRows = createMemo(() =>
        Array.from({ length: ((viewportContext.getSize().height ?? 0) * 2) / getCellSize().width + 1 }).map(
            (_, index) => index,
        ),
    );

    const renderCell = (shape: ScreenWiperShape, _row: number, _col: number) => (
        <svg
            width={getCellSize().width}
            height={getCellSize().height}
            viewBox={`0 0 ${getCellSize().width} ${getCellSize().height}`}
            overflow="visible"
        >
            {shape === "lozenge" ? (
                <polygon
                    points={`${getCellSize().width * 0.5},0 ${getCellSize().width},${getCellSize().height * 0.5} ${getCellSize().width * 0.5},${getCellSize().height} 0,${getCellSize().height * 0.5}`}
                    fill="black"
                />
            ) : (
                <circle
                    cx={getCellSize().width * 0.5}
                    cy={getCellSize().width * 0.5}
                    r={getCellSize().width * 0.5}
                    fill="black"
                />
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
            <div class={styles.screenWiperRoot}>
                <For each={getRows()}>
                    {(row) => {
                        const isRowEven = MathUtils.isEven(row);
                        const getRowCols = () => (isRowEven ? getCols().even : getCols().odd);

                        return (
                            <div
                                class={styles.screenWiperRow}
                                style={{
                                    transform: `translate(${isRowEven ? getCellSize().width * -0.5 : 0}px, ${(row + 1) * getCellSize().height * -0.5}px)`,
                                }}
                            >
                                <For each={getRowCols()}>
                                    {(col) => (
                                        <div
                                            class={styles.screenWiperCell}
                                            style={{
                                                width: `${getCellSize().width}px`,
                                                height: `${getCellSize().height}px`,
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
        </Show>
    );
};

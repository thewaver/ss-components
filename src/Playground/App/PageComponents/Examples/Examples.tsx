import { For, createMemo, createSignal } from "solid-js";

import { CSSUtils } from "@thewaver/ss-utils";

import { Button } from "../../../../Lib/Fundamentals/Button/Button";
import { Modal } from "../../../../Lib/Fundamentals/Modal/Modal";
import { PageModalOverlay } from "../../StyledComponents/ModalOverlay/ModalOverlay";
import { PageModalPanel } from "../../StyledComponents/ModalPanel/ModalPanel";
import { PageTooltipContent } from "../../StyledComponents/TooltipContent/TooltipContent";
import { PageSourceView } from "../SourceView/SourceView";
import type { ExamplesProps } from "./Examples.types";

import * as styles from "./Examples.css";

const DEFAULT_MIN_COLUMN_WIDTH = 320;
const SINGLE_SPAN = 1;
const PERCENT = 100;

export const PageExamples = (props: ExamplesProps) => {
    const [getActiveIndex, setActiveIndex] = createSignal(0);
    const modalVisibility = createSignal(false);
    const [, setIsModalOpen] = modalVisibility;

    const getWidestSpan = createMemo(() =>
        props.getItems().reduce((widest, example) => Math.max(widest, example.span ?? SINGLE_SPAN), SINGLE_SPAN),
    );

    const getMinColumnWidth = () => props.getMinColumnWidth?.() ?? DEFAULT_MIN_COLUMN_WIDTH;

    const getColumns = () =>
        `repeat(auto-fill, minmax(min(${PERCENT / getWidestSpan()}%, ${getMinColumnWidth()}px), 1fr))`;

    return (
        <>
            <div class={styles.examplesRoot} style={{ "grid-template-columns": getColumns() }}>
                <For each={props.getItems()}>
                    {(example, getExampleIndex) => (
                        <div
                            class={styles.exampleContainer}
                            style={{ "grid-column": `span ${example.span ?? SINGLE_SPAN}` }}
                            data-example
                            data-testid={example.key}
                        >
                            <div class={styles.exampleTitle}>
                                {`${example.name}:`}
                                {example.path && (
                                    <Button
                                        getId={() => `${example.key}Source`}
                                        getTooltipDefs={() => ({
                                            getPlacement: () => ({ x: "center", y: "top-out" }),
                                            getOffset: () => ({ x: 0, y: 5 }),
                                            renderContent: (getVisibilityTarget, getTransitionDurationMs) => (
                                                <PageTooltipContent
                                                    getVisibilityTarget={getVisibilityTarget}
                                                    getTransitionDurationMs={getTransitionDurationMs}
                                                >
                                                    View source code
                                                </PageTooltipContent>
                                            ),
                                        })}
                                        onClick={async () => {
                                            setActiveIndex(getExampleIndex());
                                            setIsModalOpen(true);
                                        }}
                                        renderContent={() => "</>"}
                                    />
                                )}
                            </div>

                            <div class={styles.exampleDemo} data-demo>
                                {example.component()}
                            </div>

                            {example.readout && (
                                <div class={styles.exampleReadout} data-readout>
                                    {example.readout()}
                                </div>
                            )}
                        </div>
                    )}
                </For>
            </div>

            <Modal
                getMargins={() => CSSUtils.spreadMargin(40)}
                visibilitySignal={modalVisibility}
                getAriaLabel={() => `${props.getItems()[getActiveIndex()].name} source code`}
                renderOverlay={(getVisibilityTarget, getTransitionDurationMs) => (
                    <PageModalOverlay
                        getVisibilityTarget={getVisibilityTarget}
                        getTransitionDurationMs={getTransitionDurationMs}
                    />
                )}
                renderContent={(getVisibilityTarget, getTransitionDurationMs) => (
                    <PageModalPanel
                        getVisibilityTarget={getVisibilityTarget}
                        getTransitionDurationMs={getTransitionDurationMs}
                        getPadding={() => "0"}
                    >
                        <PageSourceView
                            getPath={() => props.getItems()[getActiveIndex()].path!}
                            getSampleKeys={() => props.getItems()[getActiveIndex()].sampleKeys?.() ?? []}
                        />
                    </PageModalPanel>
                )}
            />
        </>
    );
};

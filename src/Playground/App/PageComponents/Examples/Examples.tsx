import { For, createMemo, createSignal } from "solid-js";

import { CSSUtils } from "@thewaver/ss-utils";

import { Button } from "../../../../Lib/Fundamentals/Button/Button";
import { Modal } from "../../../../Lib/Fundamentals/Modal/Modal";
import { access } from "../../../../Lib/Utils/propUtils";
import { PageModalOverlay } from "../../StyledComponents/ModalOverlay/ModalOverlay";
import { PageModalPanel } from "../../StyledComponents/ModalPanel/ModalPanel";
import { PageTooltipContent } from "../../StyledComponents/TooltipContent/TooltipContent";
import { PageSourceView } from "../SourceView/SourceView";
import type { ExamplesProps } from "./Examples.types";

import * as styles from "./Examples.css";

const DEFAULT_LAYOUT = "grid" as const;
const DEFAULT_MIN_COLUMN_WIDTH = 320;
const SINGLE_SPAN = 1;
const PERCENT = 100;

export const PageExamples = (props: ExamplesProps) => {
    const [getActiveIndex, setActiveIndex] = createSignal(0);
    const modalVisibility = createSignal(false);
    const [, setIsModalOpen] = modalVisibility;

    const getWidestSpan = createMemo(() =>
        access(props.items).reduce((widest, example) => Math.max(widest, example.span ?? SINGLE_SPAN), SINGLE_SPAN),
    );

    const getLayout = () => access(props.layout) ?? DEFAULT_LAYOUT;

    const getMinColumnWidth = () => access(props.minColumnWidth) ?? DEFAULT_MIN_COLUMN_WIDTH;

    const getColumns = () =>
        getLayout() === "grid"
            ? `repeat(auto-fill, minmax(min(${PERCENT / getWidestSpan()}%, ${getMinColumnWidth()}px), 1fr))`
            : undefined;

    return (
        <>
            <div class={styles.examplesRootVariants[getLayout()]} style={{ "grid-template-columns": getColumns() }}>
                <For each={access(props.items)}>
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
                                        id={() => `${example.key}Source`}
                                        tooltipDefs={() => ({
                                            placement: () => ({ x: "center", y: "top-out" }),
                                            offset: () => ({ x: 0, y: 5 }),
                                            renderContent: (getVisibilityTarget, getTransitionDurationMs) => (
                                                <PageTooltipContent
                                                    visibilityTarget={getVisibilityTarget}
                                                    transitionDurationMs={getTransitionDurationMs}
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
                margins={() => CSSUtils.spreadMargin(40)}
                visibilitySignal={modalVisibility}
                ariaLabel={() => `${access(props.items)[getActiveIndex()].name} source code`}
                renderOverlay={(getVisibilityTarget, getTransitionDurationMs) => (
                    <PageModalOverlay
                        visibilityTarget={getVisibilityTarget}
                        transitionDurationMs={getTransitionDurationMs}
                    />
                )}
                renderContent={(getVisibilityTarget, getTransitionDurationMs) => (
                    <PageModalPanel
                        visibilityTarget={getVisibilityTarget}
                        transitionDurationMs={getTransitionDurationMs}
                        padding={"0"}
                    >
                        <PageSourceView
                            path={() => access(props.items)[getActiveIndex()].path!}
                            sampleKeys={() => access(props.items)[getActiveIndex()].sampleKeys?.() ?? []}
                        />
                    </PageModalPanel>
                )}
            />
        </>
    );
};

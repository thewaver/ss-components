import { For } from "solid-js";

import { Button } from "../../../../../Lib/Fundamentals/Button/Button";
import { Drawer } from "../../../../../Lib/Fundamentals/Drawer/Drawer";
import { PageButtonContent } from "../../../StyledComponents/ButtonContent/ButtonContent";
import { PageDrawerPanel } from "../../../StyledComponents/DrawerPanel/DrawerPanel";
import { PageModalOverlay } from "../../../StyledComponents/ModalOverlay/ModalOverlay";
import type { DrawerExampleProps } from "../DrawerPage.types";

type Props = DrawerExampleProps;

export const DefaultExample = (props: Props) => (
    <>
        <Button
            renderContent={(getFlags) => (
                <PageButtonContent getFlags={getFlags}>Open {props.getEdge()}</PageButtonContent>
            )}
            onClick={() => {
                props.visibilitySignal[1](true);
            }}
        />

        <Drawer
            visibilitySignal={props.visibilitySignal}
            getEdge={props.getEdge}
            getAriaLabel={() => `${props.getEdge()} drawer`}
            renderOverlay={(getVisibilityTarget, getTransitionDurationMs) => (
                <PageModalOverlay
                    getVisibilityTarget={getVisibilityTarget}
                    getTransitionDurationMs={getTransitionDurationMs}
                />
            )}
            renderContent={(getVisibilityTarget, getTransitionDurationMs) => (
                <PageDrawerPanel
                    getEdge={props.getEdge}
                    getVisibilityTarget={getVisibilityTarget}
                    getTransitionDurationMs={getTransitionDurationMs}
                >
                    <div>Attached to the {props.getEdge()} edge.</div>

                    <For each={["First", "Second"]}>
                        {(caption) => (
                            <Button
                                renderContent={(getFlags) => (
                                    <PageButtonContent getFlags={getFlags}>{caption}</PageButtonContent>
                                )}
                            />
                        )}
                    </For>

                    <Button
                        renderContent={(getFlags) => <PageButtonContent getFlags={getFlags}>Close</PageButtonContent>}
                        onClick={() => {
                            props.visibilitySignal[1](false);
                        }}
                    />

                    <For each={props.getFillers()}>{(caption) => <div>{caption}</div>}</For>
                </PageDrawerPanel>
            )}
        />
    </>
);

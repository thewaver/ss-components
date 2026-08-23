import { For } from "solid-js";

import { Button } from "../../../../../Lib/Fundamentals/Button/Button";
import { Drawer } from "../../../../../Lib/Fundamentals/Drawer/Drawer";
import { access } from "../../../../../Lib/Utils/propUtils";
import { PageButtonContent } from "../../../StyledComponents/ButtonContent/ButtonContent";
import { PageDrawerPanel } from "../../../StyledComponents/DrawerPanel/DrawerPanel";
import { PageModalOverlay } from "../../../StyledComponents/ModalOverlay/ModalOverlay";
import type { DrawerExampleProps } from "../DrawerPage.types";

type Props = DrawerExampleProps;

export const DefaultExample = (props: Props) => {
    return (
        <>
            <Button
                renderContent={(getFlags) => (
                    <PageButtonContent flags={getFlags}>Open {access(props.edge)}</PageButtonContent>
                )}
                onClick={() => {
                    props.visibilitySignal[1](true);
                }}
            />

            <Drawer
                visibilitySignal={props.visibilitySignal}
                edge={props.edge}
                ariaLabel={() => `${access(props.edge)} drawer`}
                renderOverlay={(getVisibilityTarget, getTransitionDurationMs) => (
                    <PageModalOverlay
                        visibilityTarget={getVisibilityTarget}
                        transitionDurationMs={getTransitionDurationMs}
                    />
                )}
                renderContent={(getVisibilityTarget, getTransitionDurationMs) => (
                    <PageDrawerPanel
                        edge={props.edge}
                        visibilityTarget={getVisibilityTarget}
                        transitionDurationMs={getTransitionDurationMs}
                    >
                        <div>Attached to the {access(props.edge)} edge.</div>

                        <For each={["First", "Second"]}>
                            {(caption) => (
                                <Button
                                    renderContent={(getFlags) => (
                                        <PageButtonContent flags={getFlags}>{caption}</PageButtonContent>
                                    )}
                                />
                            )}
                        </For>

                        <Button
                            renderContent={(getFlags) => <PageButtonContent flags={getFlags}>Close</PageButtonContent>}
                            onClick={() => {
                                props.visibilitySignal[1](false);
                            }}
                        />

                        <For each={access(props.fillers)}>{(caption) => <div>{caption}</div>}</For>
                    </PageDrawerPanel>
                )}
            />
        </>
    );
};

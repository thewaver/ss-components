import { For, createMemo, createSignal } from "solid-js";

import { Button } from "../../../../Lib/Fundamentals/Button/Button";
import { Drawer } from "../../../../Lib/Fundamentals/Drawer/Drawer";
import type { DrawerEdge } from "../../../../Lib/Fundamentals/Drawer/Drawer.types";
import { PageVariants } from "../../PageComponents/Variants/Variants";
import { PageButtonContent } from "../../StyledComponents/ButtonContent/ButtonContent";
import { PageDrawerPanel } from "../../StyledComponents/DrawerPanel/DrawerPanel";
import { PageModalOverlay } from "../../StyledComponents/ModalOverlay/ModalOverlay";

const EDGES: DrawerEdge[] = ["left", "right", "top", "bottom"];

export const DrawerPage = () => {
    const visibilityByEdge = new Map(EDGES.map((edge) => [edge, createSignal(false)]));

    const getVariants = createMemo(() =>
        EDGES.map((edge) => ({
            name: `Edge: ${edge}`,
            readout: () => `open: ${visibilityByEdge.get(edge)![0]()} — the edge is geometry, the slide is paint`,
            component: () => (
                <>
                    <Button
                        renderContent={(getFlags) => (
                            <PageButtonContent getFlags={getFlags}>Open {edge}</PageButtonContent>
                        )}
                        onClick={() => {
                            visibilityByEdge.get(edge)![1](true);
                        }}
                    />

                    <Drawer
                        visibilitySignal={visibilityByEdge.get(edge)!}
                        getEdge={() => edge}
                        getAriaLabel={() => `${edge} drawer`}
                        renderOverlay={(getVisibilityTarget, getTransitionDurationMs) => (
                            <PageModalOverlay
                                getVisibilityTarget={getVisibilityTarget}
                                getTransitionDurationMs={getTransitionDurationMs}
                            />
                        )}
                        renderContent={(getVisibilityTarget, getTransitionDurationMs) => (
                            <PageDrawerPanel
                                getEdge={() => edge}
                                getVisibilityTarget={getVisibilityTarget}
                                getTransitionDurationMs={getTransitionDurationMs}
                            >
                                <div>Attached to the {edge} edge.</div>

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
                                    renderContent={(getFlags) => (
                                        <PageButtonContent getFlags={getFlags}>Close</PageButtonContent>
                                    )}
                                    onClick={() => {
                                        visibilityByEdge.get(edge)![1](false);
                                    }}
                                />
                            </PageDrawerPanel>
                        )}
                    />
                </>
            ),
        })),
    );

    return <PageVariants getItems={getVariants} />;
};

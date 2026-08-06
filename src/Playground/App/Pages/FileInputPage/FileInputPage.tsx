import { createMemo, createSignal } from "solid-js";

import { FileInput } from "../../../../Lib/Fundamentals/Input/FileInput/FileInput";
import { Label } from "../../../../Lib/Fundamentals/Input/Label/Label";
import { PageVariants } from "../../PageComponents/Variants/Variants";
import { PageFileInputContent } from "../../StyledComponents/FileInputContent/FileInputContent";
import { PageTooltipContent } from "../../StyledComponents/TooltipContent/TooltipContent";

import * as pageStyles from "../Pages.css";

const MAX_ATTACHMENT_BYTES = 1024;

const describe = (files: File[]) => (files.length ? files.map((file) => file.name).join(", ") : "none");

export const FileInputPage = () => {
    const defaultSignal = createSignal<File[]>([]);
    const multipleSignal = createSignal<File[]>([]);
    const imagesSignal = createSignal<File[]>([]);
    const rejectingSignal = createSignal<File[]>([]);
    const disabledSignal = createSignal<File[]>([]);
    const reachableSignal = createSignal<File[]>([]);
    const erroredSignal = createSignal<File[]>([]);
    const labelledSignal = createSignal<File[]>([]);

    const [getRejection, setRejection] = createSignal("");

    const getVariants = createMemo(() => {
        return [
            {
                name: "Default",
                readout: () => `files: ${describe(defaultSignal[0]())}`,
                component: () => (
                    <FileInput
                        filesSignal={defaultSignal}
                        getAriaLabel={() => "Attachment"}
                        renderContent={(getFlags) => (
                            <PageFileInputContent getFlags={getFlags} getPrompt={() => "Pick a file"} />
                        )}
                    />
                ),
            },
            {
                name: "Multiple",
                readout: () => `files: ${describe(multipleSignal[0]())}`,
                component: () => (
                    <FileInput
                        filesSignal={multipleSignal}
                        getIsMultiple={() => true}
                        getAriaLabel={() => "Attachments"}
                        renderContent={(getFlags) => (
                            <PageFileInputContent getFlags={getFlags} getPrompt={() => "Pick several files"} />
                        )}
                    />
                ),
            },
            {
                name: "Accepting images only",
                readout: () => `files: ${describe(imagesSignal[0]())} — accept is a filter, never a guarantee`,
                component: () => (
                    <FileInput
                        filesSignal={imagesSignal}
                        getAccept={() => "image/*"}
                        getAriaLabel={() => "Avatar"}
                        renderContent={(getFlags) => (
                            <PageFileInputContent getFlags={getFlags} getPrompt={() => "Pick an image"} />
                        )}
                    />
                ),
            },
            {
                name: "Rejecting setter",
                readout: () =>
                    `files: ${describe(rejectingSignal[0]())}${getRejection() ? ` — ${getRejection()}` : ` — anything over ${MAX_ATTACHMENT_BYTES} bytes is refused`}`,
                component: () => (
                    <FileInput
                        filesSignal={rejectingSignal}
                        getHasError={() => getRejection() !== ""}
                        getAriaLabel={() => "Small attachment"}
                        renderContent={(getFlags) => (
                            <PageFileInputContent getFlags={getFlags} getPrompt={() => "Pick a tiny file"} />
                        )}
                        onChange={(files) => {
                            const tooBig = files.filter((file) => file.size > MAX_ATTACHMENT_BYTES);

                            setRejection(tooBig.length ? `${tooBig[0].name} is too big, pick again` : "");

                            if (tooBig.length) rejectingSignal[1]([]);
                        }}
                    />
                ),
            },
            {
                name: "Disabled",
                readout: () => `files: ${describe(disabledSignal[0]())}`,
                component: () => (
                    <FileInput
                        filesSignal={disabledSignal}
                        getIsDisabled={() => true}
                        getAriaLabel={() => "Disabled attachment"}
                        renderContent={(getFlags) => (
                            <PageFileInputContent getFlags={getFlags} getPrompt={() => "Cannot be picked"} />
                        )}
                    />
                ),
            },
            {
                name: "Disabled + reachable",
                readout: () => `files: ${describe(reachableSignal[0]())}`,
                component: () => (
                    <FileInput
                        filesSignal={reachableSignal}
                        getIsDisabled={() => true}
                        getIsReachableWhenDisabled={() => true}
                        getAriaLabel={() => "Disabled but reachable attachment"}
                        renderContent={(getFlags) => (
                            <PageFileInputContent getFlags={getFlags} getPrompt={() => "Ask why instead"} />
                        )}
                        getTooltipDefs={() => ({
                            getPlacement: () => ({ x: "center", y: "top-out" }),
                            getOffset: () => ({ x: 0, y: 5 }),
                            renderContent: (getVisibilityTarget, getTransitionDurationMs) => (
                                <PageTooltipContent
                                    getVisibilityTarget={getVisibilityTarget}
                                    getTransitionDurationMs={getTransitionDurationMs}
                                >
                                    Focusable so this tooltip can be read, but the file dialog must not open.
                                </PageTooltipContent>
                            ),
                        })}
                    />
                ),
            },
            {
                name: "Error",
                readout: () => `files: ${describe(erroredSignal[0]())} — required, nothing picked yet`,
                component: () => (
                    <FileInput
                        filesSignal={erroredSignal}
                        getHasError={() => erroredSignal[0]().length < 1}
                        getAriaLabel={() => "Required attachment"}
                        renderContent={(getFlags) => (
                            <PageFileInputContent getFlags={getFlags} getPrompt={() => "This one is required"} />
                        )}
                    />
                ),
            },
            {
                name: "In a Label",
                readout: () => `files: ${describe(labelledSignal[0]())} — the caption opens the dialog`,
                component: () => (
                    <Label getDir={() => "column"} getGap={() => 5}>
                        <div class={pageStyles.labelCaption}>Contract</div>

                        <FileInput
                            filesSignal={labelledSignal}
                            renderContent={(getFlags) => (
                                <PageFileInputContent getFlags={getFlags} getPrompt={() => "Pick a PDF"} />
                            )}
                        />
                    </Label>
                ),
            },
        ];
    });

    return <PageVariants getItems={getVariants} />;
};

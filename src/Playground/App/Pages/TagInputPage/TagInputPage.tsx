import { createMemo, createSignal } from "solid-js";

import { TagInput } from "../../../../Lib/Fundamentals/Input/TagInput/TagInput";
import { PageProp } from "../../PageComponents/Prop/Prop";
import { PagePropsPanel } from "../../PageComponents/PropsPanel/PropsPanel";
import { PageVariants } from "../../PageComponents/Variants/Variants";
import { PageCheckField } from "../../StyledComponents/Field/Field";
import {
    PageTagContent,
    PageTagInputContent,
    PageTagInputPlaceholder,
} from "../../StyledComponents/TagInputContent/TagInputContent";

const STARTING_TAGS = ["solid", "vanilla-extract"];
const CROWDED_TAGS = [
    "solid",
    "vanilla-extract",
    "playwright",
    "typescript",
    "vite",
    "eslint",
    "prettier",
    "vitest",
    "aria",
    "tokens",
    "signals",
    "stores",
];

const TAG_INPUT_PADDING = 8;
const TAG_INPUT_GAP = 5;
const NARROW_WIDTH = 240;

export const TagInputPage = () => {
    const [getIsDisabled, setIsDisabled] = createSignal(false);
    const [getHasError, setHasError] = createSignal(false);

    const defaultSignal = createSignal(STARTING_TAGS);
    const uniqueSignal = createSignal(STARTING_TAGS);
    const crowdedSignal = createSignal(CROWDED_TAGS);
    const emptySignal = createSignal<string[]>([]);

    const getVariants = createMemo(() => {
        return [
            {
                name: "Default",
                readout: () => `tags: ${defaultSignal[0]().join(", ") || "none"}`,
                component: () => (
                    <TagInput
                        valueSignal={defaultSignal}
                        getAriaLabel={() => "Topics"}
                        getGap={() => TAG_INPUT_GAP}
                        getPadding={() => TAG_INPUT_PADDING}
                        getIsDisabled={getIsDisabled}
                        getHasError={getHasError}
                        renderContent={(getFlags) => <PageTagInputContent getFlags={getFlags} />}
                        renderTag={(getTag, getFlags) => (
                            <PageTagContent getFlags={getFlags}>{getTag()}</PageTagContent>
                        )}
                    />
                ),
            },
            {
                name: "Empty",
                readout: () => `tags: ${emptySignal[0]().join(", ") || "none"}`,
                component: () => (
                    <TagInput
                        valueSignal={emptySignal}
                        getAriaLabel={() => "Empty topics"}
                        getGap={() => TAG_INPUT_GAP}
                        getPadding={() => TAG_INPUT_PADDING}
                        getIsDisabled={getIsDisabled}
                        getHasError={getHasError}
                        renderContent={(getFlags) => <PageTagInputContent getFlags={getFlags} />}
                        renderPlaceholder={() => (
                            <PageTagInputPlaceholder>Type and press Enter</PageTagInputPlaceholder>
                        )}
                        renderTag={(getTag, getFlags) => (
                            <PageTagContent getFlags={getFlags}>{getTag()}</PageTagContent>
                        )}
                    />
                ),
            },
            {
                name: "Refusing duplicates",
                readout: () => `tags: ${uniqueSignal[0]().join(", ") || "none"} — the same word twice is refused`,
                component: () => (
                    <TagInput
                        valueSignal={uniqueSignal}
                        getAriaLabel={() => "Unique topics"}
                        getGap={() => TAG_INPUT_GAP}
                        getPadding={() => TAG_INPUT_PADDING}
                        getIsDisabled={getIsDisabled}
                        getHasError={getHasError}
                        computeTag={(text) => {
                            const tag = text.trim().toLowerCase();

                            return tag && !uniqueSignal[0]().includes(tag) ? tag : undefined;
                        }}
                        renderContent={(getFlags) => <PageTagInputContent getFlags={getFlags} />}
                        renderTag={(getTag, getFlags) => (
                            <PageTagContent getFlags={getFlags}>{getTag()}</PageTagContent>
                        )}
                    />
                ),
            },
            {
                name: "Crowded and narrow",
                readout: () =>
                    `${crowdedSignal[0]().length} tags in ${NARROW_WIDTH}px — they wrap and the box grows with them`,
                component: () => (
                    <div style={{ width: `${NARROW_WIDTH}px` }}>
                        <TagInput
                            valueSignal={crowdedSignal}
                            getAriaLabel={() => "Crowded topics"}
                            getGap={() => TAG_INPUT_GAP}
                            getPadding={() => TAG_INPUT_PADDING}
                            getIsDisabled={getIsDisabled}
                            getHasError={getHasError}
                            renderContent={(getFlags) => <PageTagInputContent getFlags={getFlags} />}
                            renderTag={(getTag, getFlags) => (
                                <PageTagContent getFlags={getFlags}>{getTag()}</PageTagContent>
                            )}
                        />
                    </div>
                ),
            },
        ];
    });

    return (
        <>
            <PagePropsPanel getScope={() => "global"}>
                <PageProp getLabel={() => "Disabled"}>
                    <PageCheckField getValue={getIsDisabled} getAriaLabel={() => "Disabled"} onChange={setIsDisabled} />
                </PageProp>

                <PageProp getLabel={() => "Error"}>
                    <PageCheckField getValue={getHasError} getAriaLabel={() => "Error"} onChange={setHasError} />
                </PageProp>
            </PagePropsPanel>

            <PageVariants getItems={getVariants} />
        </>
    );
};

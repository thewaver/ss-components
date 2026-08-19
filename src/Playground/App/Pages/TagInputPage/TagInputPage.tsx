import { createMemo, createSignal } from "solid-js";

import { Button } from "../../../../Lib/Fundamentals/Button/Button";
import { TagInput } from "../../../../Lib/Fundamentals/Input/TagInput/TagInput";
import { PageProp } from "../../PageComponents/Prop/Prop";
import { PagePropsPanel } from "../../PageComponents/PropsPanel/PropsPanel";
import { PageVariants } from "../../PageComponents/Variants/Variants";
import { PageButtonContent } from "../../StyledComponents/ButtonContent/ButtonContent";
import { PageCheckField } from "../../StyledComponents/Field/Field";
import {
    PageTagContent,
    PageTagInputContent,
    PageTagInputPlaceholder,
} from "../../StyledComponents/TagInputContent/TagInputContent";
import { computePageTextFieldTextStyle } from "../../StyledComponents/TextFieldContent/TextFieldContent";

import { FIELD_GAP, FIELD_HEIGHT, FIELD_PADDING } from "../../StyledComponents/TextFieldContent/TextFieldContent.css";

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

const NARROW_WIDTH = 240;

export const TagInputPage = () => {
    const [getIsDisabled, setIsDisabled] = createSignal(false);
    const [getHasError, setHasError] = createSignal(false);

    const defaultSignal = createSignal(STARTING_TAGS);
    const uniqueSignal = createSignal(STARTING_TAGS);
    const crowdedSignal = createSignal(CROWDED_TAGS);
    const emptySignal = createSignal<string[]>([]);

    const reset = () => {
        defaultSignal[1](STARTING_TAGS);
        uniqueSignal[1](STARTING_TAGS);
        crowdedSignal[1](CROWDED_TAGS);
        emptySignal[1]([]);
    };

    const getVariants = createMemo(() => {
        return [
            {
                key: "default",
                name: "Default",
                readout: () => `tags: ${defaultSignal[0]().join(", ") || "none"}`,
                component: () => (
                    <TagInput
                        valueSignal={defaultSignal}
                        getAriaLabel={() => "Topics"}
                        getGap={() => FIELD_GAP}
                        getPadding={() => FIELD_PADDING}
                        getMinHeight={() => FIELD_HEIGHT}
                        getIsDisabled={getIsDisabled}
                        getHasError={getHasError}
                        computeTextStyle={computePageTextFieldTextStyle}
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
                key: "empty",
                name: "Empty",
                readout: () => `tags: ${emptySignal[0]().join(", ") || "none"}`,
                component: () => (
                    <TagInput
                        valueSignal={emptySignal}
                        getAriaLabel={() => "Empty topics"}
                        getGap={() => FIELD_GAP}
                        getPadding={() => FIELD_PADDING}
                        getMinHeight={() => FIELD_HEIGHT}
                        getIsDisabled={getIsDisabled}
                        getHasError={getHasError}
                        computeTextStyle={computePageTextFieldTextStyle}
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
                key: "unique",
                name: "Refusing duplicates",
                readout: () => `tags: ${uniqueSignal[0]().join(", ") || "none"} — the same word twice is refused`,
                component: () => (
                    <TagInput
                        valueSignal={uniqueSignal}
                        getAriaLabel={() => "Unique topics"}
                        getGap={() => FIELD_GAP}
                        getPadding={() => FIELD_PADDING}
                        getMinHeight={() => FIELD_HEIGHT}
                        getIsDisabled={getIsDisabled}
                        getHasError={getHasError}
                        computeTextStyle={computePageTextFieldTextStyle}
                        computeTag={(text) => {
                            const tag = text.trim().toLowerCase();

                            return tag && !uniqueSignal[0]().includes(tag) ? tag : undefined;
                        }}
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
                key: "crowded",
                name: "Crowded and narrow",
                readout: () =>
                    `${crowdedSignal[0]().length} tags in ${NARROW_WIDTH}px — they wrap and the box grows with them`,
                component: () => (
                    <div style={{ width: `${NARROW_WIDTH}px` }}>
                        <TagInput
                            valueSignal={crowdedSignal}
                            getAriaLabel={() => "Crowded topics"}
                            getGap={() => FIELD_GAP}
                            getPadding={() => FIELD_PADDING}
                            getMinHeight={() => FIELD_HEIGHT}
                            getIsDisabled={getIsDisabled}
                            getHasError={getHasError}
                            computeTextStyle={computePageTextFieldTextStyle}
                            renderContent={(getFlags) => <PageTagInputContent getFlags={getFlags} />}
                            renderPlaceholder={() => (
                                <PageTagInputPlaceholder>Type and press Enter</PageTagInputPlaceholder>
                            )}
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
                <PageProp getKey={() => "isDisabled"} getLabel={() => "Disabled"}>
                    <PageCheckField getValue={getIsDisabled} getAriaLabel={() => "Disabled"} onChange={setIsDisabled} />
                </PageProp>

                <PageProp getKey={() => "hasError"} getLabel={() => "Error"}>
                    <PageCheckField getValue={getHasError} getAriaLabel={() => "Error"} onChange={setHasError} />
                </PageProp>

                <PageProp getKey={() => "tags"} getLabel={() => "Tags"}>
                    <Button
                        renderContent={(getFlags) => <PageButtonContent getFlags={getFlags}>Reset</PageButtonContent>}
                        onClick={async () => {
                            reset();
                        }}
                    />
                </PageProp>
            </PagePropsPanel>

            <PageVariants getItems={getVariants} />
        </>
    );
};

import { createMemo, createSignal } from "solid-js";

import { Button } from "../../../../Lib/Fundamentals/Button/Button";
import { PageExamples } from "../../PageComponents/Examples/Examples";
import { PageProp } from "../../PageComponents/Prop/Prop";
import { PagePropsPanel } from "../../PageComponents/PropsPanel/PropsPanel";
import { PageButtonContent } from "../../StyledComponents/ButtonContent/ButtonContent";
import { PageCheckField } from "../../StyledComponents/Field/Field";
import { CrowdedExample } from "./Examples/Crowded";
import { DefaultExample } from "./Examples/Default";
import { UniqueExample } from "./Examples/Unique";
import type { TagInputExampleProps } from "./TagInputPage.types";

const NARROW_WIDTH = 240;
const EXAMPLES_ROOT = "/src/Playground/App/Pages/TagInputPage/Examples";

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

    const getExamples = createMemo(() => {
        const commonProps: Omit<TagInputExampleProps, "valueSignal"> = { getIsDisabled, getHasError };

        return [
            {
                key: "default",
                name: "Default",
                readout: () => `tags: ${defaultSignal[0]().join(", ") || "none"}`,
                component: () => <DefaultExample {...commonProps} valueSignal={defaultSignal} />,
                path: `${EXAMPLES_ROOT}/Default.tsx`,
            },
            {
                key: "empty",
                name: "Empty",
                readout: () => `tags: ${emptySignal[0]().join(", ") || "none"}`,
                component: () => (
                    <DefaultExample {...commonProps} valueSignal={emptySignal} getAriaLabel={() => "Empty topics"} />
                ),
                path: `${EXAMPLES_ROOT}/Default.tsx`,
            },
            {
                key: "unique",
                name: "Refusing duplicates",
                readout: () => `tags: ${uniqueSignal[0]().join(", ") || "none"} — the same word twice is refused`,
                component: () => <UniqueExample {...commonProps} valueSignal={uniqueSignal} />,
                path: `${EXAMPLES_ROOT}/Unique.tsx`,
            },
            {
                key: "crowded",
                name: "Crowded and narrow",
                readout: () =>
                    `${crowdedSignal[0]().length} tags in ${NARROW_WIDTH}px — they wrap and the box grows with them`,
                component: () => <CrowdedExample {...commonProps} valueSignal={crowdedSignal} />,
                path: `${EXAMPLES_ROOT}/Crowded.tsx`,
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

            <PageExamples getItems={getExamples} />
        </>
    );
};

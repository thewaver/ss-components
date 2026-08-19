import { createMemo, createSignal } from "solid-js";

import type { Breadcrumb } from "../../../../Lib/Fundamentals/Breadcrumbs/Breadcrumbs.types";
import { Button } from "../../../../Lib/Fundamentals/Button/Button";
import { PageExamples } from "../../PageComponents/Examples/Examples";
import { PageProp } from "../../PageComponents/Prop/Prop";
import { PagePropsPanel } from "../../PageComponents/PropsPanel/PropsPanel";
import { PageButtonContent } from "../../StyledComponents/ButtonContent/ButtonContent";
import { PageCheckField, PageNumberField } from "../../StyledComponents/Field/Field";
import { TRAIL } from "./BreadcrumbsPage.const";
import type { BreadcrumbsExampleProps, CrumbValue } from "./BreadcrumbsPage.types";
import { BareExample } from "./Examples/Bare";
import { LinkComponentExample } from "./Examples/LinkComponent";
import { LinkedExample } from "./Examples/Linked";
import { TrailExample } from "./Examples/Trail";

const MIN_DEPTH = 1;
const MAX_DEPTH = 5;
const DEPTH_STEP = 1;
const STARTING_DEPTH = 4;
const DEPTH_FIELD_WIDTH = 90;
const EXAMPLES_ROOT = "/src/Playground/App/Pages/BreadcrumbsPage/Examples";

export const BreadcrumbsPage = () => {
    const [getDepth, setDepth] = createSignal(STARTING_DEPTH);
    const [getIsDisabled, setIsDisabled] = createSignal(false);

    const [getPressed, setPressed] = createSignal<CrumbValue | undefined>(undefined);
    const [getLinkPressed, setLinkPressed] = createSignal<CrumbValue | undefined>(undefined);

    const getCrumbs = createMemo<Breadcrumb<CrumbValue>[]>(() =>
        TRAIL.slice(0, getDepth()).map((entry) => ({ value: entry.value, isDisabled: getIsDisabled() })),
    );

    const getLinkCrumbs = createMemo<Breadcrumb<CrumbValue>[]>(() =>
        TRAIL.slice(0, getDepth()).map((entry) => ({
            value: entry.value,
            href: `#breadcrumb-${entry.value}`,
            isDisabled: getIsDisabled(),
        })),
    );

    const navigate = (value: CrumbValue) => {
        setDepth(TRAIL.findIndex((entry) => entry.value === value) + 1);
    };

    const reset = () => {
        setDepth(STARTING_DEPTH);
        setPressed(undefined);
        setLinkPressed(undefined);
    };

    const getExamples = createMemo(() => {
        const commonProps: BreadcrumbsExampleProps = { getCrumbs };

        return [
            {
                key: "default",
                name: "Default",
                readout: () =>
                    `pressed: ${getPressed() ?? "nothing yet"} — pressing a crumb moves the page there, so the trail behind it is the whole trail; Reset puts it back`,
                component: () => (
                    <TrailExample
                        {...commonProps}
                        onSelect={(value) => {
                            setPressed(value);
                            navigate(value);
                        }}
                    />
                ),
                path: `${EXAMPLES_ROOT}/Trail.tsx`,
            },
            {
                key: "bare",
                name: "No separator",
                readout: () => "a trail with nothing between the crumbs, since the separator slot is optional",
                component: () => <BareExample {...commonProps} />,
                path: `${EXAMPLES_ROOT}/Bare.tsx`,
            },
            {
                key: "linked",
                name: "Crumbs that are links",
                readout: () => `pressed: ${getLinkPressed() ?? "nothing yet"} — an href makes a crumb an anchor`,
                component: () => (
                    <LinkedExample
                        getCrumbs={getLinkCrumbs}
                        onSelect={(value) => {
                            setLinkPressed(value);
                            navigate(value);
                        }}
                    />
                ),
                path: `${EXAMPLES_ROOT}/Linked.tsx`,
            },
            {
                key: "linkComponent",
                name: "Links through a component",
                readout: () => "the same links rendered by a consumer's own link component",
                component: () => <LinkComponentExample getCrumbs={getLinkCrumbs} />,
                path: `${EXAMPLES_ROOT}/LinkComponent.tsx`,
            },
        ];
    });

    return (
        <>
            <PagePropsPanel getScope={() => "global"}>
                <PageProp getKey={() => "depth"} getLabel={() => "Depth"}>
                    <PageNumberField
                        getValue={getDepth}
                        getMin={() => MIN_DEPTH}
                        getMax={() => MAX_DEPTH}
                        getStep={() => DEPTH_STEP}
                        getWidth={() => DEPTH_FIELD_WIDTH}
                        getAriaLabel={() => "Depth"}
                        onInput={setDepth}
                    />
                </PageProp>

                <PageProp getKey={() => "isDisabled"} getLabel={() => "Disabled"}>
                    <PageCheckField getValue={getIsDisabled} getAriaLabel={() => "Disabled"} onChange={setIsDisabled} />
                </PageProp>

                <PageProp getKey={() => "trail"} getLabel={() => "Trail"}>
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

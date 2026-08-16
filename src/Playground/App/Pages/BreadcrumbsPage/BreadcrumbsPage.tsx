import { createMemo, createSignal } from "solid-js";

import { Breadcrumbs } from "../../../../Lib/Fundamentals/Breadcrumbs/Breadcrumbs";
import type { Breadcrumb } from "../../../../Lib/Fundamentals/Breadcrumbs/Breadcrumbs.types";
import { Button } from "../../../../Lib/Fundamentals/Button/Button";
import type { TabLinkProps } from "../../../../Lib/Fundamentals/Tabs/Tabs.types";
import { PageProp } from "../../PageComponents/Prop/Prop";
import { PagePropsPanel } from "../../PageComponents/PropsPanel/PropsPanel";
import { PageVariants } from "../../PageComponents/Variants/Variants";
import {
    PageBreadcrumbContent,
    PageBreadcrumbSeparator,
} from "../../StyledComponents/BreadcrumbContent/BreadcrumbContent";
import { PageButtonContent } from "../../StyledComponents/ButtonContent/ButtonContent";
import { PageCheckField, PageNumberField } from "../../StyledComponents/Field/Field";

type CrumbValue = "home" | "library" | "inputs" | "text" | "field";

const TRAIL: { value: CrumbValue; label: string }[] = [
    { value: "home", label: "Home" },
    { value: "library", label: "Library" },
    { value: "inputs", label: "Inputs" },
    { value: "text", label: "Text" },
    { value: "field", label: "Field" },
];

const MIN_DEPTH = 1;
const MAX_DEPTH = 5;
const DEPTH_STEP = 1;
const STARTING_DEPTH = 4;
const BREADCRUMBS_GAP = 0;
const DEPTH_FIELD_WIDTH = 90;

const PageBreadcrumbLink = (props: TabLinkProps) => <a {...props} data-link-component />;

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

    const labelOf = (value: CrumbValue) => TRAIL.find((entry) => entry.value === value)!.label;

    const navigate = (value: CrumbValue) => {
        setDepth(TRAIL.findIndex((entry) => entry.value === value) + 1);
    };

    const reset = () => {
        setDepth(STARTING_DEPTH);
        setPressed(undefined);
        setLinkPressed(undefined);
    };

    const getVariants = createMemo(() => {
        return [
            {
                name: "Default",
                readout: () =>
                    `pressed: ${getPressed() ?? "nothing yet"} — pressing a crumb moves the page there, so the trail behind it is the whole trail; Reset puts it back`,
                component: () => (
                    <Breadcrumbs
                        getCrumbs={getCrumbs}
                        getGap={() => BREADCRUMBS_GAP}
                        getAriaLabel={() => "Trail"}
                        onSelect={(value) => {
                            setPressed(value);
                            navigate(value);
                        }}
                        renderCrumb={(getCrumb, getFlags) => (
                            <PageBreadcrumbContent getFlags={getFlags}>
                                {labelOf(getCrumb().value)}
                            </PageBreadcrumbContent>
                        )}
                        renderSeparator={() => <PageBreadcrumbSeparator />}
                    />
                ),
            },
            {
                name: "No separator",
                readout: () => "a trail with nothing between the crumbs, since the separator slot is optional",
                component: () => (
                    <Breadcrumbs
                        getCrumbs={getCrumbs}
                        getGap={() => BREADCRUMBS_GAP}
                        getAriaLabel={() => "Trail without separators"}
                        renderCrumb={(getCrumb, getFlags) => (
                            <PageBreadcrumbContent getFlags={getFlags}>
                                {labelOf(getCrumb().value)}
                            </PageBreadcrumbContent>
                        )}
                    />
                ),
            },
            {
                name: "Crumbs that are links",
                readout: () => `pressed: ${getLinkPressed() ?? "nothing yet"} — an href makes a crumb an anchor`,
                component: () => (
                    <Breadcrumbs
                        getCrumbs={getLinkCrumbs}
                        getGap={() => BREADCRUMBS_GAP}
                        getAriaLabel={() => "Linked trail"}
                        onSelect={(value) => {
                            setLinkPressed(value);
                            navigate(value);
                        }}
                        renderCrumb={(getCrumb, getFlags) => (
                            <PageBreadcrumbContent getFlags={getFlags}>
                                {labelOf(getCrumb().value)}
                            </PageBreadcrumbContent>
                        )}
                        renderSeparator={() => <PageBreadcrumbSeparator />}
                    />
                ),
            },
            {
                name: "Links through a component",
                readout: () => "the same links rendered by a consumer's own link component",
                component: () => (
                    <Breadcrumbs
                        getCrumbs={getLinkCrumbs}
                        getGap={() => BREADCRUMBS_GAP}
                        getAriaLabel={() => "Routed trail"}
                        linkComponent={PageBreadcrumbLink}
                        renderCrumb={(getCrumb, getFlags) => (
                            <PageBreadcrumbContent getFlags={getFlags}>
                                {labelOf(getCrumb().value)}
                            </PageBreadcrumbContent>
                        )}
                        renderSeparator={() => <PageBreadcrumbSeparator />}
                    />
                ),
            },
        ];
    });

    return (
        <>
            <PagePropsPanel getScope={() => "global"}>
                <PageProp getLabel={() => "Depth"}>
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

                <PageProp getLabel={() => "Disabled"}>
                    <PageCheckField getValue={getIsDisabled} getAriaLabel={() => "Disabled"} onChange={setIsDisabled} />
                </PageProp>

                <PageProp getLabel={() => "Trail"}>
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

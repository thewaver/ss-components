import { createMemo, createSignal } from "solid-js";

import { PageExamples } from "../../PageComponents/Examples/Examples";
import { FilesExample } from "./Examples/Files";
import { LinkComponentExample } from "./Examples/LinkComponent";
import { LinksExample } from "./Examples/Links";
import { OutsideExample } from "./Examples/Outside";
import { RecordValuesExample } from "./Examples/RecordValues";
import { FILES_WITH_DISABLED, FILES_WITH_REACHABLE } from "./TreePage.const";
import type { Asset } from "./TreePage.types";

const EXAMPLES_ROOT = "/src/Playground/App/Pages/TreePage/Examples";

export const TreePage = () => {
    const defaultSignal = createSignal<string | undefined>();
    const defaultExpandedSignal = createSignal<string[]>(["src"]);

    const collapsedSignal = createSignal<string | undefined>();
    const collapsedExpandedSignal = createSignal<string[]>([]);

    const disabledSignal = createSignal<string | undefined>();
    const disabledExpandedSignal = createSignal<string[]>(["src", "Lib"]);

    const reachableSignal = createSignal<string | undefined>();
    const reachableExpandedSignal = createSignal<string[]>(["src"]);

    const outsideSignal = createSignal<string | undefined>();
    const outsideExpandedSignal = createSignal<string[]>(["src", "Lib"]);

    const linkSignal = createSignal<string | undefined>();
    const linkExpandedSignal = createSignal<string[]>(["Guides"]);

    const customLinkSignal = createSignal<string | undefined>();
    const customLinkExpandedSignal = createSignal<string[]>(["Guides"]);

    const recordSignal = createSignal<Asset | undefined>();
    const recordExpandedSignal = createSignal<Asset[]>([]);

    const getExamples = createMemo(() => [
        {
            key: "default",
            name: "Default",
            readout: () =>
                `value: ${defaultSignal[0]() ?? "undefined"} | expanded: ${JSON.stringify(defaultExpandedSignal[0]())} — right opens a branch, left closes it or climbs to the parent`,
            component: () => <FilesExample valueSignal={defaultSignal} expandedSignal={defaultExpandedSignal} />,
            path: `${EXAMPLES_ROOT}/Files.tsx`,
        },
        {
            key: "collapsed",
            name: "Everything collapsed",
            readout: () =>
                `value: ${collapsedSignal[0]() ?? "undefined"} | expanded: ${JSON.stringify(collapsedExpandedSignal[0]())} — asterisk opens every branch at the level focus is on`,
            component: () => <FilesExample valueSignal={collapsedSignal} expandedSignal={collapsedExpandedSignal} />,
            path: `${EXAMPLES_ROOT}/Files.tsx`,
        },
        {
            key: "disabled",
            name: "Disabled nodes",
            readout: () =>
                `value: ${disabledSignal[0]() ?? "undefined"} — arrows skip index.ts and Lib, while what is inside Lib stays reachable`,
            component: () => (
                <FilesExample
                    valueSignal={disabledSignal}
                    expandedSignal={disabledExpandedSignal}
                    getNodes={() => FILES_WITH_DISABLED}
                />
            ),
            path: `${EXAMPLES_ROOT}/Files.tsx`,
        },
        {
            key: "reachable",
            name: "Disabled nodes + reachable",
            readout: () =>
                `value: ${reachableSignal[0]() ?? "undefined"} — arrows stop on node_modules, hover explains why, and nothing opens it`,
            component: () => (
                <FilesExample
                    valueSignal={reachableSignal}
                    expandedSignal={reachableExpandedSignal}
                    getNodes={() => FILES_WITH_REACHABLE}
                />
            ),
            path: `${EXAMPLES_ROOT}/Files.tsx`,
        },
        {
            key: "outside",
            name: "Collapsed from outside",
            readout: () =>
                `expanded: ${JSON.stringify(outsideExpandedSignal[0]())} — press the button, then focus a row inside Lib before the delay elapses; focus must land on Lib rather than on the page body`,
            component: () => <OutsideExample valueSignal={outsideSignal} expandedSignal={outsideExpandedSignal} />,
            path: `${EXAMPLES_ROOT}/Outside.tsx`,
        },
        {
            key: "links",
            name: "Nodes that are links",
            readout: () =>
                `value: ${linkSignal[0]() ?? "undefined"} — every leaf carries an href, so each one is an anchor and the branches stay plain`,
            component: () => <LinksExample valueSignal={linkSignal} expandedSignal={linkExpandedSignal} />,
            path: `${EXAMPLES_ROOT}/Links.tsx`,
        },
        {
            key: "linkComponent",
            name: "Links through a component",
            readout: () =>
                `value: ${customLinkSignal[0]() ?? "undefined"} — the same nodes rendered by a consumer's own link component`,
            component: () => (
                <LinkComponentExample valueSignal={customLinkSignal} expandedSignal={customLinkExpandedSignal} />
            ),
            path: `${EXAMPLES_ROOT}/LinkComponent.tsx`,
        },
        {
            key: "recordValues",
            name: "Record values",
            readout: () =>
                `value: ${recordSignal[0]()?.name ?? "undefined"} | expanded: ${recordExpandedSignal[0]().length} branch(es) — the value is the record itself, not a name`,
            component: () => <RecordValuesExample valueSignal={recordSignal} expandedSignal={recordExpandedSignal} />,
            path: `${EXAMPLES_ROOT}/RecordValues.tsx`,
        },
    ]);

    return <PageExamples getItems={getExamples} />;
};

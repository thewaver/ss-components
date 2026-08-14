import { createMemo } from "solid-js";

import { PageExamples } from "../../PageComponents/Examples/Examples";
import { AvatarExample } from "./Examples/Avatar/Avatar";
import { BannerExample } from "./Examples/Banner/Banner";
import { CardExample } from "./Examples/Card/Card";

import * as styles from "./SurfacePage.css";

const EXAMPLES_ROOT = "/src/Playground/App/Pages/SurfacePage/Examples";

export const SurfacePage = () => {
    const getExamples = createMemo(() => {
        return [
            {
                name: "Avatar",
                component: () => <AvatarExample />,
                path: `${EXAMPLES_ROOT}/Avatar/Avatar.tsx`,
            },
            {
                name: "Banner",
                component: () => <BannerExample />,
                path: `${EXAMPLES_ROOT}/Banner/Banner.tsx`,
            },
            {
                name: "Card",
                component: () => <CardExample />,
                path: `${EXAMPLES_ROOT}/Card/Card.tsx`,
            },
        ];
    });

    return (
        <div class={styles.root}>
            <PageExamples getItems={getExamples} />
        </div>
    );
};

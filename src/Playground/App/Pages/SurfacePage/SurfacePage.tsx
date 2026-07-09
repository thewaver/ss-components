import { createMemo } from "solid-js";

import { getDefaultHighlighterConfig, highlighter } from "../../../shiki";
import { PageExamples } from "../../PageComponents/Examples/Examples";
import { AvatarExample } from "./Examples/Avatar/Avatar";
import AvatarExampleRaw from "./Examples/Avatar/Avatar.tsx?raw";
import { BannerExample } from "./Examples/Banner/Banner";
import BannerExampleRaw from "./Examples/Banner/Banner.tsx?raw";
import { CardExample } from "./Examples/Card/Card";
import CardExampleRaw from "./Examples/Card/Card.tsx?raw";

import * as styles from "./SurfacePage.css";

const AVATAR_SOURCE = highlighter.codeToHtml(AvatarExampleRaw, getDefaultHighlighterConfig());
const BANNER_SOURCE = highlighter.codeToHtml(BannerExampleRaw, getDefaultHighlighterConfig());
const CARD_SOURCE = highlighter.codeToHtml(CardExampleRaw, getDefaultHighlighterConfig());

export const SurfacePage = () => {
    const getExamples = createMemo(() => {
        return [
            {
                name: "Avatar",
                component: () => <AvatarExample />,
                src: AVATAR_SOURCE,
            },
            {
                name: "Banner",
                component: () => <BannerExample />,
                src: BANNER_SOURCE,
            },
            {
                name: "Card",
                component: () => <CardExample />,
                src: CARD_SOURCE,
            },
        ];
    });

    return (
        <div class={styles.root}>
            <PageExamples getItems={getExamples} />
        </div>
    );
};

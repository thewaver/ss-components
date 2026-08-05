import { styleVariants } from "@vanilla-extract/css";

import * as pageStyles from "../../Pages/Pages.css";

export const propsPanelScopeVariants = styleVariants({
    global: [
        pageStyles.panel,
        {
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(400px, 1fr))",
            gap: 10,
            width: "100%",
        },
    ],
    local: [
        {
            display: "flex",
            flexDirection: "column",
            alignItems: "stretch",
            gap: 10,
            width: "100%",
        },
    ],
});

import type { JSX } from "solid-js";

export type SVGDefs = {
    clipPath?: {
        id: string;
        getDefsElement: () => JSX.Element;
    };
    filter?: {
        id: string;
        getDefsElement: () => JSX.Element;
    };
    blend?: boolean;
    opacity?: number;
} & (
    | {
          color?: never;
          gradientOrPattern: {
              id: string;
              getDefsElement: () => JSX.Element;
          };
      }
    | {
          color: string;
          gradientOrPattern?: never;
      }
);

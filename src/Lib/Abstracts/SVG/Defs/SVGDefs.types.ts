import type { JSX } from "solid-js";

export type SVGDefs = {
    clipPath?: {
        id: string;
        renderDefsElement: () => JSX.Element;
    };
    filter?: {
        id: string;
        renderDefsElement: () => JSX.Element;
    };
    blend?: boolean;
    opacity?: number;
} & (
    | {
          color?: never;
          gradientOrPattern: {
              id: string;
              renderDefsElement: () => JSX.Element;
          };
      }
    | {
          color: string;
          gradientOrPattern?: never;
      }
);

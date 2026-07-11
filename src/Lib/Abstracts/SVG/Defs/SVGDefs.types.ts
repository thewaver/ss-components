import type { JSX } from "solid-js";

export type SVGDefs = {
    clipPath?: {
        id: string;
        defsElement: JSX.Element;
    };
    filter?: {
        id: string;
        defsElement: JSX.Element;
    };
    blend?: boolean;
    opacity?: number;
} & (
    | {
          color?: never;
          gradientOrPattern: {
              id: string;
              defsElement: JSX.Element;
          };
      }
    | {
          color: string;
          gradientOrPattern?: never;
      }
);

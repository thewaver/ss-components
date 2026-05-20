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
} & (
    | {
          color?: never;
          gradient: {
              defsElement: JSX.Element;
              id: string;
          };
      }
    | {
          color: string;
          gradient?: never;
      }
);

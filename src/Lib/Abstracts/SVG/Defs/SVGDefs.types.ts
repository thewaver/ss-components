import type { JSX } from "solid-js";

export type SVGDefs = {
    filter?: {
        id: string;
        defsElement: JSX.Element;
    };
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

import { AccessorProps } from "../../Utils/typeUtils";

export type RichTextProps = AccessorProps<{
    content: string;
    removeOtherTags?: boolean;
    getClassNames?: (defaultClasses: Record<string, string>) => Record<string, string>;
}>;

export type RichTextNode =
    | {
          type: "text";
          content: string;
      }
    | {
          type: "tag";
          tag: string;
          children: RichTextNode[];
      };

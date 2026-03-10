import { AccessorProps } from "../../Utils/typeUtils";

export type RichTextProps = AccessorProps<{
    content: string;
    classNames?: Record<string, string>;
    removeOtherTags?: boolean;
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

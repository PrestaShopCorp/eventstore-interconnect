import { FormattedEvent } from "../../formatter";

export const WRITER_HOOK = Symbol();

export interface WriterHook {
  hook(event: FormattedEvent): Promise<void>;
}

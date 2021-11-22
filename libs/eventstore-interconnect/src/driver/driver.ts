import { FormattedEvent } from '../formatter';

export const DRIVER = Symbol();

export interface Driver {
  writeEvent(event: FormattedEvent): Promise<any>;
}

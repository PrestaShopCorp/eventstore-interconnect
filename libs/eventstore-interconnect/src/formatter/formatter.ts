import { FormattedEvent } from './formatted-event';

export const FORMATTER = Symbol();

export interface Formatter {
  format(event: any): FormattedEvent;
}

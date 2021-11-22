export const EVENT_HANDLER = Symbol();

export interface EventHandler {
  handle(event: any): Promise<void>;
}

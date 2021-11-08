export const CREDENTIALS = Symbol();
export const ALLOWED_EVENTS = Symbol();
export const EVENT_WRITER_TIMEOUT_IN_MS =
  +process.env.EVENTSTORE_INTERCO_EVENT_WRITER_TIMEOUT_IN_MS || 5000;

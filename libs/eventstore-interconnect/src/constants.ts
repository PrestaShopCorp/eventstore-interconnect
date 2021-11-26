export const CREDENTIALS = Symbol();
export const ALLOWED_EVENTS = Symbol();
export const EVENT_WRITER_TIMEOUT_IN_MS =
  +process.env.EVENTSTORE_INTERCO_EVENT_WRITER_TIMEOUT_IN_MS || 5000;
export const INTERCONNECTION_CONNECTION_DEFAULT_NAME =
  'interco-module-connection';
export const INTERCONNECT_CONFIGURATION = Symbol();
